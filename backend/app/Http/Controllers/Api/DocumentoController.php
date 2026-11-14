<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Documento;
use App\Models\Instrumento;
use App\Services\AuditoriaService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Throwable;

class DocumentoController extends Controller
{
    // Listar documentos
    public function index(Request $request)
    {
        $this->authorize('viewAny', Documento::class);

        $datos = $request->validate([
            'id_instrumento' => [
                'sometimes',
                'integer',
                'exists:instrumentos,id_instrumento'
            ],
            'tipo_documento' => [
                'sometimes',
                Rule::in([
                    'principal',
                    'anexo',
                    'dictamen',
                    'resolucion',
                    'otro'
                ])
            ]
        ]);

        $usuario = auth()->user();

        $query = Documento::with([
            'instrumento',
            'usuarioSubio',
            'documentoAnterior',
            'versionSiguiente'
        ])->whereHas('instrumento', function ($q) use ($usuario) {
            $q->visiblesPara($usuario);
        });

        if (isset($datos['id_instrumento'])) {
            $query->where('id_instrumento', $datos['id_instrumento']);
        }

        if (isset($datos['tipo_documento'])) {
            $query->where('tipo_documento', $datos['tipo_documento']);
        }

        $documentos = $query
            ->orderBy('created_at', 'desc')
            ->get();

        // Ocultar las rutas de almacenamiento.
        $documentos->each(function ($documento) {
            $documento->makeHidden(['ruta_archivo']);

            $documento->documentoAnterior?->makeHidden(['ruta_archivo']);
            $documento->versionSiguiente?->makeHidden(['ruta_archivo']);
        });

        return response()->json($documentos, 200);
    }

    // Consultar un documento
    public function show($id)
    {
        $usuario = auth()->user();

        $documento = Documento::with([
            'instrumento',
            'usuarioSubio',
            'documentoAnterior',
            'versionSiguiente'
        ])
            ->whereHas('instrumento', function ($q) use ($usuario) {
                $q->visiblesPara($usuario);
            })
            ->findOrFail($id);

        $this->authorize('view', $documento);

        // Ocultar las rutas del documento y sus versiones relacionadas.
        $documento->makeHidden(['ruta_archivo']);

        $documento->documentoAnterior?->makeHidden(['ruta_archivo']);
        $documento->versionSiguiente?->makeHidden(['ruta_archivo']);

        return response()->json($documento, 200);
    }

    // Subir un documento nuevo
    public function store(Request $request)
    {
        $this->authorize('create', Documento::class);

        $datos = $request->validate([
            'id_instrumento' => [
                'required',
                'integer',
                'exists:instrumentos,id_instrumento'
            ],
            'tipo_documento' => [
                'required',
                Rule::in([
                    'principal',
                    'anexo',
                    'dictamen',
                    'resolucion',
                    'otro'
                ])
            ],
            'archivo' => [
                'required',
                'file',
                'mimes:pdf',
                'max:20480'
            ]
        ]);

        // Verificar que el instrumento pertenezca al alcance del usuario.
        $instrumento = Instrumento::visiblesPara(auth()->user())
            ->findOrFail($datos['id_instrumento']);

        $archivo = $request->file('archivo');

        // Guardar el archivo en almacenamiento privado.
        $ruta = $archivo->store(
            'documentos/' . $instrumento->id_instrumento,
            'local'
        );

        if (!$ruta) {
            return response()->json([
                'mensaje' => 'No se pudo guardar el archivo.'
            ], 500);
        }

        try {
            $documento = DB::transaction(function () use (
                $datos,
                $archivo,
                $ruta
            ) {

                $documento = Documento::create([
                    'id_instrumento' => $datos['id_instrumento'],
                    'id_usuario_subio' => auth()->id(),
                    'id_documento_anterior' => null,
                    'nombre' => $archivo->getClientOriginalName(),
                    'tipo_documento' => $datos['tipo_documento'],
                    'formato' => 'PDF',
                    'ruta_archivo' => $ruta,
                    'tamanio' => $archivo->getSize(),
                    'hash_sha256' => hash_file(
                        'sha256',
                        $archivo->getRealPath()
                    ),
                    'version' => 1
                ]);

                AuditoriaService::registrar(
                    'crear',
                    'documentos',
                    $documento->id_documento,
                    [
                        'id_instrumento' => $documento->id_instrumento,
                        'nombre' => $documento->nombre,
                        'tipo_documento' => $documento->tipo_documento,
                        'version' => $documento->version
                    ]
                );

                return $documento;
            });

            $documento->load([
                'instrumento',
                'usuarioSubio'
            ]);

            $documento->makeHidden(['ruta_archivo']);

            return response()->json([
                'mensaje' => 'Documento subido correctamente.',
                'documento' => $documento
            ], 201);

        } catch (Throwable $e) {

            // Si falla el registro, eliminar el archivo guardado.
            Storage::disk('local')->delete($ruta);

            report($e);

            return response()->json([
                'mensaje' => 'Ocurrió un error al registrar el documento.'
            ], 500);
        }
    }

    // Subir una nueva versión
    public function nuevaVersion(Request $request, $id)
    {
        $usuario = auth()->user();

        $documentoAnterior = Documento::with('instrumento')
            ->whereHas('instrumento', function ($q) use ($usuario) {
                $q->visiblesPara($usuario);
            })
            ->findOrFail($id);

        $this->authorize('createVersion', $documentoAnterior);

        $datos = $request->validate([
            'archivo' => [
                'required',
                'file',
                'mimes:pdf',
                'max:20480'
            ]
        ]);

        // Evitar crear una versión desde un documento que ya tiene
        // una versión posterior.
        if ($documentoAnterior->versionSiguiente()->exists()) {
            return response()->json([
                'mensaje' => 'Este documento ya tiene una versión posterior. Debés subir la nueva versión desde la última.'
            ], 422);
        }

        $archivo = $request->file('archivo');

        $ruta = $archivo->store(
            'documentos/' . $documentoAnterior->id_instrumento,
            'local'
        );

        if (!$ruta) {
            return response()->json([
                'mensaje' => 'No se pudo guardar el archivo.'
            ], 500);
        }

        try {
            $documento = DB::transaction(function () use (
                $documentoAnterior,
                $archivo,
                $ruta
            ) {

                $documento = Documento::create([
                    'id_instrumento' => $documentoAnterior->id_instrumento,
                    'id_usuario_subio' => auth()->id(),
                    'id_documento_anterior' => $documentoAnterior->id_documento,
                    'nombre' => $archivo->getClientOriginalName(),
                    'tipo_documento' => $documentoAnterior->tipo_documento,
                    'formato' => 'PDF',
                    'ruta_archivo' => $ruta,
                    'tamanio' => $archivo->getSize(),
                    'hash_sha256' => hash_file(
                        'sha256',
                        $archivo->getRealPath()
                    ),
                    'version' => $documentoAnterior->version + 1
                ]);

                AuditoriaService::registrar(
                    'crear_version',
                    'documentos',
                    $documento->id_documento,
                    [
                        'id_instrumento' => $documento->id_instrumento,
                        'id_documento_anterior' => $documentoAnterior->id_documento,
                        'nombre' => $documento->nombre,
                        'tipo_documento' => $documento->tipo_documento,
                        'version_anterior' => $documentoAnterior->version,
                        'version_nueva' => $documento->version
                    ]
                );

                return $documento;
            });

            $documento->load([
                'instrumento',
                'usuarioSubio',
                'documentoAnterior'
            ]);

            $documento->makeHidden(['ruta_archivo']);

            $documento->documentoAnterior?->makeHidden(['ruta_archivo']);
            $documento->versionSiguiente?->makeHidden(['ruta_archivo']);

            return response()->json([
                'mensaje' => 'Nueva versión subida correctamente.',
                'documento' => $documento
            ], 201);

        } catch (Throwable $e) {

            Storage::disk('local')->delete($ruta);

            report($e);

            return response()->json([
                'mensaje' => 'Ocurrió un error al registrar la nueva versión.'
            ], 500);
        }
    }

    // Descargar un documento
    public function descargar($id)
    {
        $usuario = auth()->user();

        $documento = Documento::with('instrumento')
            ->whereHas('instrumento', function ($q) use ($usuario) {
                $q->visiblesPara($usuario);
            })
            ->findOrFail($id);

        $this->authorize('download', $documento);

        if (!Storage::disk('local')->exists($documento->ruta_archivo)) {
            return response()->json([
                'mensaje' => 'El archivo solicitado no existe en el almacenamiento.'
            ], 404);
        }

        AuditoriaService::registrar(
            'descargar',
            'documentos',
            $documento->id_documento,
            [
                'id_instrumento' => $documento->id_instrumento,
                'nombre' => $documento->nombre
            ]
        );

        return Storage::disk('local')->download(
            $documento->ruta_archivo,
            $documento->nombre,
            ['Content-Type' => 'application/pdf']
        );
    }
}
