<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Instrumento;
use App\Models\Estado;
use App\Models\HistorialEstado;
use App\Services\AuditoriaService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class InstrumentoController extends Controller
{
    // Listar instrumentos
    public function index()
    {
        $instrumentos = Instrumento::with([
            'tipoInstrumento',
            'unidad',
            'estado'
        ])->get();

        return response()->json([
            'status' => 200,
            'mensaje' => 'Instrumentos obtenidos correctamente',
            'data' => $instrumentos
        ]);
    }

    // Consultar un instrumento específico
    public function show($id)
    {
        $instrumento = Instrumento::with([
            'tipoInstrumento',
            'unidad',
            'estado',
            'creador',
            'partes',
            'documentos'
        ])->findOrFail($id);

        return response()->json([
            'status' => 200,
            'mensaje' => 'Instrumento obtenido correctamente',
            'data' => $instrumento
        ]);
    }

    // Actualizar un instrumento
    public function update(Request $request, $id)
    {
        $instrumento = Instrumento::findOrFail($id);

        if ($instrumento->estado->nombre !== 'borrador') {
            return response()->json([
                'status' => 403,
                'mensaje' => 'Solo se pueden modificar instrumentos en estado borrador.'
            ], 403);
        }

        $datos = $request->validate([
            'codigo' => 'sometimes|required|string|max:50|unique:instrumentos,codigo,' . $id . ',id_instrumento',
            'titulo' => 'sometimes|required|string|max:255',
            'id_tipo_instrumento' => 'sometimes|required|exists:tipos_instrumento,id_tipo_instrumento',
            'id_unidad' => 'sometimes|required|exists:unidades,id_unidad',

            'objeto' => 'nullable|string',
            'alcance' => 'nullable|string',
            'obligaciones' => 'nullable|string',
            'rescision' => 'nullable|string',
            'marco_legal' => 'nullable|string',
            'resolucion' => 'nullable|string',
            'expediente_referencia' => 'nullable|string',
            'condiciones_renovacion' => 'nullable|string',
            'confidencialidad' => 'nullable|string',
            'notas' => 'nullable|string',

            'fecha_firma' => 'nullable|date',
            'fecha_inicio' => 'nullable|date',
            'fecha_vencimiento' => 'nullable|date|after_or_equal:fecha_inicio',

            'plazo_preaviso' => 'nullable|integer|min:0',
        ]);

        DB::transaction(function () use ($instrumento, $datos) {
            $instrumento->update($datos);

            AuditoriaService::registrar(
                'actualizar',
                'instrumentos',
                $instrumento->id_instrumento,
                [
                    'campos_modificados' => array_keys($datos),
                    'codigo' => $instrumento->codigo,
                    'titulo' => $instrumento->titulo
                ]
            );
        });

        return response()->json([
            'status' => 200,
            'mensaje' => 'Instrumento actualizado correctamente',
            'data' => $instrumento->fresh()->load([
                'tipoInstrumento',
                'unidad',
                'estado'
            ])
        ]);
    }

    // Registrar un instrumento
    public function store(Request $request)
    {
        $datos = $request->validate([
            'codigo' => 'required|string|max:50|unique:instrumentos,codigo',
            'titulo' => 'required|string|max:255',
            'id_tipo_instrumento' => 'required|exists:tipos_instrumento,id_tipo_instrumento',
            'id_unidad' => 'required|exists:unidades,id_unidad',

            'objeto' => 'nullable|string',
            'alcance' => 'nullable|string',
            'obligaciones' => 'nullable|string',
            'rescision' => 'nullable|string',
            'marco_legal' => 'nullable|string',
            'resolucion' => 'nullable|string',
            'expediente_referencia' => 'nullable|string',
            'condiciones_renovacion' => 'nullable|string',
            'confidencialidad' => 'nullable|string',
            'notas' => 'nullable|string',

            'fecha_firma' => 'nullable|date',
            'fecha_inicio' => 'nullable|date',
            'fecha_vencimiento' => 'nullable|date|after_or_equal:fecha_inicio',

            'plazo_preaviso' => 'nullable|integer|min:0',
        ]);

        $estadoBorrador = Estado::where('nombre', 'borrador')->firstOrFail();

        $instrumento = DB::transaction(function () use ($datos, $estadoBorrador) {

            $nuevoInstrumento = Instrumento::create([
                ...$datos,
                'id_estado' => $estadoBorrador->id_estado,
                'version' => 1,
                'id_usuario_creador' => 2,
            ]);

            AuditoriaService::registrar(
                'crear',
                'instrumentos',
                $nuevoInstrumento->id_instrumento,
                [
                    'codigo' => $nuevoInstrumento->codigo,
                    'titulo' => $nuevoInstrumento->titulo,
                    'estado_inicial' => 'borrador'
                ]
            );

            return $nuevoInstrumento;
        });

        return response()->json([
            'status' => 201,
            'mensaje' => 'Instrumento creado correctamente',
            'data' => $instrumento->load([
                'tipoInstrumento',
                'unidad',
                'estado'
            ])
        ], 201);
    }

    // Cambiar el estado de un instrumento
    public function cambiarEstado(Request $request, $id)
    {
        $datos = $request->validate([
            'id_estado_nuevo' => 'required|exists:estados,id_estado',
            'fundamento' => 'required|string|max:1000',
        ]);

        $instrumento = Instrumento::findOrFail($id);

        $estadoAnterior = $instrumento->id_estado;

        $transicionesPermitidas = [
            'borrador' => ['revision'],
            'revision' => ['borrador', 'aprobado'],
            'aprobado' => ['firmado'],
            'firmado' => ['rescindido', 'archivado'],
            'rescindido' => ['archivado'],
            'archivado' => [],
        ];

        $estadoActual = $instrumento->estado->nombre;

        $estadoNuevo = Estado::findOrFail($datos['id_estado_nuevo']);

        if (!in_array(
            $estadoNuevo->nombre,
            $transicionesPermitidas[$estadoActual] ?? []
        )) {
            return response()->json([
                'status' => 422,
                'mensaje' => "No está permitido pasar de {$estadoActual} a {$estadoNuevo->nombre}."
            ], 422);
        }

        if ($estadoAnterior == $datos['id_estado_nuevo']) {
            return response()->json([
                'status' => 422,
                'mensaje' => 'El instrumento ya se encuentra en ese estado.'
            ], 422);
        }

        $usuarioId = 2;

        DB::transaction(function () use (
            $instrumento,
            $datos,
            $estadoAnterior,
            $estadoNuevo,
            $estadoActual,
            $usuarioId
        ) {
            $instrumento->update([
                'id_estado' => $datos['id_estado_nuevo']
            ]);

            HistorialEstado::create([
                'id_instrumento' => $instrumento->id_instrumento,
                'id_estado_anterior' => $estadoAnterior,
                'id_estado_nuevo' => $datos['id_estado_nuevo'],
                'id_usuario' => $usuarioId,
                'fundamento' => $datos['fundamento'],
            ]);

            AuditoriaService::registrar(
                'cambiar_estado',
                'instrumentos',
                $instrumento->id_instrumento,
                [
                    'estado_anterior' => $estadoActual,
                    'estado_nuevo' => $estadoNuevo->nombre,
                    'fundamento' => $datos['fundamento']
                ],
                $usuarioId
            );
        });

        return response()->json([
            'status' => 200,
            'mensaje' => 'Estado actualizado correctamente.',
            'data' => $instrumento->fresh()->load('estado'),
            'historial' => $instrumento->historialEstados()->latest()->first()
        ]);
    }

    // Consultar historial de estados de un instrumento
    public function historial($id)
    {
        $instrumento = Instrumento::findOrFail($id);

        $historial = $instrumento->historialEstados()
            ->with([
                'estadoAnterior',
                'estadoNuevo',
                'usuario'
            ])
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json([
            'status' => 200,
            'mensaje' => 'Historial obtenido correctamente',
            'data' => $historial
        ]);
    }
}