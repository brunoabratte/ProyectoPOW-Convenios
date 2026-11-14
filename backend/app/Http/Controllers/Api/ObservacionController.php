<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Instrumento;
use App\Models\Observacion;
use App\Services\AuditoriaService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class ObservacionController extends Controller
{
    // Listar observaciones
    public function index(Request $request)
    {
        $this->authorize('viewAny', Observacion::class);

        $usuario = Auth::user();

        $datos = $request->validate([
            'id_instrumento' => [
                'sometimes',
                'integer',
                'exists:instrumentos,id_instrumento'
            ],
            'estado' => [
                'sometimes',
                Rule::in(['pendiente', 'respondida', 'resuelta'])
            ],
            'id_usuario' => [
                'sometimes',
                'integer',
                'exists:usuarios,id_usuario'
            ],
        ]);

        $query = Observacion::with([
            'instrumento',
            'autor',
            'estadoInstrumento',
            'usuarioRespondio',
            'usuarioResolvio'
        ])->whereHas('instrumento', function ($q) use ($usuario) {
            $q->visiblesPara($usuario);
        });

        if (isset($datos['id_instrumento'])) {
            $query->where('id_instrumento', $datos['id_instrumento']);
        }

        if (isset($datos['estado'])) {
            $query->where('estado', $datos['estado']);
        }

        if (isset($datos['id_usuario'])) {
            $query->where('id_usuario', $datos['id_usuario']);
        }

        return response()->json(
            $query->orderBy('created_at', 'desc')->get(),
            200
        );
    }

    // Consultar una observación
    public function show($id)
    {
        $usuario = Auth::user();

        $observacion = Observacion::with([
            'instrumento',
            'autor',
            'estadoInstrumento',
            'usuarioRespondio',
            'usuarioResolvio'
        ])
            ->whereHas('instrumento', function ($q) use ($usuario) {
                $q->visiblesPara($usuario);
            })
            ->findOrFail($id);

        $this->authorize('view', $observacion);

        return response()->json($observacion, 200);
    }

    // Crear una observación
    public function store(Request $request)
    {
        $this->authorize('create', Observacion::class);

        $datos = $request->validate([
            'id_instrumento' => [
                'required',
                'integer',
                'exists:instrumentos,id_instrumento'
            ],
            'id_estado_instrumento' => [
                'required',
                'integer',
                'exists:estados,id_estado'
            ],
            'contenido' => [
                'required',
                'string'
            ]
        ]);

        // Verificar que el instrumento pertenezca al alcance del usuario.
        $instrumento = Instrumento::visiblesPara(Auth::user())
            ->findOrFail($datos['id_instrumento']);

        // Verificar que el estado indicado sea el actual del instrumento.
        if ((int) $datos['id_estado_instrumento'] !== (int) $instrumento->id_estado) {
            throw ValidationException::withMessages([
                'id_estado_instrumento' => [
                    'El estado indicado no coincide con el estado actual del instrumento.'
                ]
            ]);
        }

        $observacion = DB::transaction(function () use ($datos) {

            $observacion = Observacion::create([
                'id_instrumento' => $datos['id_instrumento'],
                'id_usuario' => Auth::id(),
                'id_estado_instrumento' => $datos['id_estado_instrumento'],
                'contenido' => $datos['contenido'],
                'estado' => 'pendiente'
            ]);

            AuditoriaService::registrar(
                'crear',
                'observaciones',
                $observacion->id_observacion,
                [
                    'id_instrumento' => $observacion->id_instrumento,
                    'id_estado_instrumento' => $observacion->id_estado_instrumento,
                    'estado' => $observacion->estado
                ]
            );

            return $observacion;
        });

        $observacion->load([
            'instrumento',
            'autor',
            'estadoInstrumento'
        ]);

        return response()->json([
            'mensaje' => 'Observación creada correctamente.',
            'observacion' => $observacion
        ], 201);
    }

    // Responder una observación
    public function responder(Request $request, $id)
    {
        $usuario = Auth::user();

        $observacion = Observacion::with('instrumento')
            ->whereHas('instrumento', function ($q) use ($usuario) {
                $q->visiblesPara($usuario);
            })
            ->findOrFail($id);

        $this->authorize('respond', $observacion);

        $datos = $request->validate([
            'respuesta' => [
                'required',
                'string'
            ]
        ]);

        if ($observacion->estado !== 'pendiente') {
            return response()->json([
                'mensaje' => 'Solo se pueden responder observaciones pendientes.'
            ], 422);
        }

        DB::transaction(function () use ($observacion, $datos) {

            $observacion->update([
                'respuesta' => $datos['respuesta'],
                'estado' => 'respondida',
                'id_usuario_respondio' => Auth::id(),
                'respondida_en' => now()
            ]);

            AuditoriaService::registrar(
                'responder',
                'observaciones',
                $observacion->id_observacion,
                [
                    'estado_anterior' => 'pendiente',
                    'estado_nuevo' => 'respondida'
                ]
            );
        });

        $observacion->load([
            'instrumento',
            'autor',
            'estadoInstrumento',
            'usuarioRespondio'
        ]);

        return response()->json([
            'mensaje' => 'Observación respondida correctamente.',
            'observacion' => $observacion
        ], 200);
    }

    // Resolver una observación
    public function resolver($id)
    {
        $usuario = Auth::user();

        $observacion = Observacion::with('instrumento')
            ->whereHas('instrumento', function ($q) use ($usuario) {
                $q->visiblesPara($usuario);
            })
            ->findOrFail($id);

        $this->authorize('resolve', $observacion);

        // Solo se pueden resolver observaciones respondidas.
        if ($observacion->estado !== 'respondida') {
            return response()->json([
                'mensaje' => 'Solo se pueden resolver observaciones que hayan sido respondidas.'
            ], 422);
        }

        $estadoAnterior = $observacion->estado;

        DB::transaction(function () use ($observacion, $estadoAnterior) {

            $observacion->update([
                'estado' => 'resuelta',
                'id_usuario_resolvio' => Auth::id(),
                'resuelta_en' => now()
            ]);

            AuditoriaService::registrar(
                'resolver',
                'observaciones',
                $observacion->id_observacion,
                [
                    'estado_anterior' => $estadoAnterior,
                    'estado_nuevo' => 'resuelta'
                ]
            );
        });

        $observacion->load([
            'instrumento',
            'autor',
            'estadoInstrumento',
            'usuarioRespondio',
            'usuarioResolvio'
        ]);

        return response()->json([
            'mensaje' => 'Observación resuelta correctamente.',
            'observacion' => $observacion
        ], 200);
    }
}
