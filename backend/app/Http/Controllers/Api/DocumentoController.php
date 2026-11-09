<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Documento;
use App\Services\AuditoriaService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Throwable;

// El id_usuario_subio = 2 es temporal.
// Cuando implementemos autenticación, lo reemplazaremos por el usuario autenticado.

// Las nuevas versiones conservan el tipo de documento y quedan vinculadas
// a la versión anterior. No sobrescriben ni eliminan el PDF previo.

class DocumentoController extends Controller
{
    // Listar documentos
    public function index(Request $request)
    {
        $query = Documento::with([
            'instrumento',
            'usuarioSubio',
            'documentoAnterior',
            'versionSiguiente'
        ]);

        if ($request->filled('id_instrumento')) {
            $query->where('id_instrumento', $request->id_instrumento);
        }

        if ($request->filled('tipo_documento')) {
            $query->where('tipo_documento', $request->tipo_documento);
        }

        $documentos = $query->orderBy('created_at', 'desc')->get();

        $documentos->each(function ($documento) {
            $documento->makeHidden(['ruta_archivo']);
        });

        return response()->json($documentos, 200);
    }

    // Consultar un documento
    public function show($id)
    {
        $documento = Documento::with([
            'instrumento',
            'usuarioSubio',
            'documentoAnterior',
            'versionSiguiente'
        ])->findOrFail($id);

        $documento->makeHidden(['ruta_archivo']);

        return response()->json($documento, 200);
    }

    // Subir un documento nuevo
    public function store(Request $request)
    {
        $datos = $request->validate([
            'id_instrumento' => [
                'required',
                'integer',
                'exists:instrumentos,id_instrumento'
            ],
            'tipo_documento' => [
                'required',
                Rule::in(['principal', 'anexo', 'dictamen', 'resolucion', 'otro'])
            ],
            'archivo' => [
                'required',
                'file',
                'mimes:pdf',
                'max:20480'
            ]
        ]);

        $archivo = $request->file('archivo');

        $ruta = $archivo->store(
            'documentos/' . $datos['id_instrumento'],
            'local'
        );

        if (!$ruta) {
            return response()->json([
                'mensaje' => 'No se pudo guardar el archivo.'
            ], 500);
        }

        try {
            $documento = DB::transaction(function () use ($datos, $archivo, $ruta) {

                $documento = Documento::create([
                    'id_instrumento' => $datos['id_instrumento'],
                    'id_usuario_subio' => 2, // Temporal: usuario administrador.
                    'id_documento_anterior' => null,
                    'nombre' => $archivo->getClientOriginalName(),
                    'tipo_documento' => $datos['tipo_documento'],
                    'formato' => 'PDF',
                    'ruta_archivo' => $ruta,
                    'tamanio' => $archivo->getSize(),
                    'hash_sha256' => hash_file('sha256', $archivo->getRealPath()),
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

            $documento->load(['instrumento', 'usuarioSubio']);
            $documento->makeHidden(['ruta_archivo']);

            return response()->json([
                'mensaje' => 'Documento subido correctamente.',
                'documento' => $documento
            ], 201);

        } catch (Throwable $e) {
            Storage::disk('local')->delete($ruta);

            return response()->json([
                'mensaje' => 'Ocurrió un error al registrar el documento.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Subir una nueva versión de un documento
    public function nuevaVersion(Request $request, $id)
    {
        $datos = $request->validate([
            'archivo' => [
                'required',
                'file',
                'mimes:pdf',
                'max:20480'
            ]
        ]);

        $documentoAnterior = Documento::findOrFail($id);

        // Evitar crear versiones a partir de una versión que ya tiene sucesora.
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
            $documento = DB::transaction(function () use ($documentoAnterior, $archivo, $ruta) {

                $documento = Documento::create([
                    'id_instrumento' => $documentoAnterior->id_instrumento,
                    'id_usuario_subio' => 2, // Temporal: usuario administrador.
                    'id_documento_anterior' => $documentoAnterior->id_documento,
                    'nombre' => $archivo->getClientOriginalName(),
                    'tipo_documento' => $documentoAnterior->tipo_documento,
                    'formato' => 'PDF',
                    'ruta_archivo' => $ruta,
                    'tamanio' => $archivo->getSize(),
                    'hash_sha256' => hash_file('sha256', $archivo->getRealPath()),
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

            return response()->json([
                'mensaje' => 'Nueva versión subida correctamente.',
                'documento' => $documento
            ], 201);

        } catch (Throwable $e) {
            Storage::disk('local')->delete($ruta);

            return response()->json([
                'mensaje' => 'Ocurrió un error al registrar la nueva versión.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Descargar un documento
    public function descargar($id)
    {
        $documento = Documento::findOrFail($id);

        if (!Storage::disk('local')->exists($documento->ruta_archivo)) {
            return response()->json([
                'mensaje' => 'El archivo solicitado no existe en el almacenamiento.'
            ], 404);
        }

        return Storage::disk('local')->download(
            $documento->ruta_archivo,
            $documento->nombre,
            ['Content-Type' => 'application/pdf']
        );
    }
}
