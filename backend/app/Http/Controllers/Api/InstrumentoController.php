<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Instrumento;
use App\Models\Estado;
use App\Models\HistorialEstado;
use App\Services\AuditoriaService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;
use Illuminate\Validation\ValidationException;

class InstrumentoController extends Controller
{
    // Listar instrumentos
    public function index()
    {
        $this->authorize('viewAny', Instrumento::class);

        $instrumentos = Instrumento::visiblesPara(Auth::user())
            ->with([
                'tipoInstrumento',
                'unidad',
                'estado'
            ])
            ->get();

        return response()->json([
            'status' => 200,
            'mensaje' => 'Instrumentos obtenidos correctamente',
            'data' => $instrumentos
        ]);
    }

    // Consultar un instrumento específico
    public function show($id)
    {
        $instrumento = Instrumento::visiblesPara(Auth::user())
            ->with([
                'tipoInstrumento',
                'unidad',
                'estado',
                'creador',
                'partes',
                'documentos'
            ])
            ->findOrFail($id);

        $this->authorize('view', $instrumento);

        return response()->json([
            'status' => 200,
            'mensaje' => 'Instrumento obtenido correctamente',
            'data' => $instrumento
        ]);
    }

    // Actualizar un instrumento
    public function update(Request $request, $id)
    {
        $instrumento = Instrumento::visiblesPara(Auth::user())
            ->findOrFail($id);

        $this->authorize('update', $instrumento);

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
            'fecha_vencimiento' => 'nullable|date',

            'plazo_preaviso' => 'nullable|integer|min:0',
        ]);

        // Validar que el vencimiento no sea anterior al inicio.
        $fechaInicio = $datos['fecha_inicio'] ?? $instrumento->fecha_inicio;
        $fechaVencimiento = $datos['fecha_vencimiento'] ?? $instrumento->fecha_vencimiento;

        if (
            $fechaInicio &&
            $fechaVencimiento &&
            Carbon::parse($fechaVencimiento)->lt(Carbon::parse($fechaInicio))
        ) {
            throw ValidationException::withMessages([
                'fecha_vencimiento' => [
                    'La fecha de vencimiento no puede ser anterior a la fecha de inicio.'
                ]
            ]);
        }

        // Un usuario con unidad asignada no puede mover
        // instrumentos a otra unidad.
        if (
            array_key_exists('id_unidad', $datos)
            && !Auth::user()->puedeAccederAUnidad((int) $datos['id_unidad'])
        ) {
            throw ValidationException::withMessages([
                'id_unidad' => 'No tenés permisos para asignar el instrumento a esa unidad.'
            ]);
        }

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
        $this->authorize('create', Instrumento::class);

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

        // Gestión solo puede crear instrumentos en su propia unidad.
        if (!Auth::user()->puedeAccederAUnidad((int) $datos['id_unidad'])) {
            throw ValidationException::withMessages([
                'id_unidad' => 'No tenés permisos para crear instrumentos en esa unidad.'
            ]);
        }

        $estadoBorrador = Estado::where('nombre', 'borrador')->firstOrFail();

        $instrumento = DB::transaction(function () use ($datos, $estadoBorrador) {
            $nuevoInstrumento = Instrumento::create([
                ...$datos,
                'id_estado' => $estadoBorrador->id_estado,
                'version' => 1,
                'id_usuario_creador' => Auth::id(),
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
        $instrumento = Instrumento::visiblesPara(Auth::user())
            ->findOrFail($id);

        $datos = $request->validate([
            'id_estado_nuevo' => 'required|exists:estados,id_estado',
            'fundamento' => 'required|string|max:1000',
        ]);

        $estadoActual = $instrumento->estado->nombre;
        $estadoNuevo = Estado::findOrFail($datos['id_estado_nuevo']);

        $transicionesPermitidas = [
            'borrador' => ['revision'],
            'revision' => ['borrador', 'aprobado'],
            'aprobado' => ['firmado'],
            'firmado' => ['rescindido', 'archivado'],
            'rescindido' => ['archivado'],
            'archivado' => [],
        ];

        if (!in_array(
            $estadoNuevo->nombre,
            $transicionesPermitidas[$estadoActual] ?? []
        )) {
            return response()->json([
                'status' => 422,
                'mensaje' => "No está permitido pasar de {$estadoActual} a {$estadoNuevo->nombre}."
            ], 422);
        }

        // Gestión puede enviar un borrador a revisión.
        if ($estadoActual === 'borrador' && $estadoNuevo->nombre === 'revision') {
            $this->authorize('update', $instrumento);
        }
        // Revisión puede aprobar o devolver para corrección.
        elseif (
            $estadoActual === 'revision'
            && in_array($estadoNuevo->nombre, ['borrador', 'aprobado'])
        ) {
            $this->authorize('gestionarRevision', $instrumento);

            // Para aprobar, el instrumento debe tener al menos dos partes.
            if ($estadoNuevo->nombre === 'aprobado') {
                $cantidadPartes = $instrumento->partes()->count();

                if ($cantidadPartes < 2) {
                    throw ValidationException::withMessages([
                        'partes' => [
                            'No se puede aprobar el instrumento porque debe tener al menos dos partes registradas.'
                        ]
                    ]);
                }
            }
        }
        // Las demás transiciones todavía no tienen un permiso
        // definido en la matriz de roles.
        else {
            abort(403, 'Tu rol no tiene permisos definidos para realizar este cambio de estado.');
        }

        $estadoAnterior = $instrumento->id_estado;
        $usuarioId = Auth::id();

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
        $instrumento = Instrumento::visiblesPara(Auth::user())
            ->findOrFail($id);

        $this->authorize('view', $instrumento);

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
