<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Instrumento;
use App\Models\InstrumentoRelacion;
use App\Services\AuditoriaService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class InstrumentoRelacionController extends Controller
{
    // Listar relaciones
    public function index(Request $request)
    {
        $this->authorize('viewAny', InstrumentoRelacion::class);

        $consulta = InstrumentoRelacion::with([
            'instrumentoOrigen',
            'instrumentoDestino'
        ])->whereHas('instrumentoOrigen', function ($query) {
            $query->visiblesPara(auth()->user());
        })->whereHas('instrumentoDestino', function ($query) {
            $query->visiblesPara(auth()->user());
        });

        if ($request->filled('id_instrumento')) {
            $id = $request->id_instrumento;

            $consulta->where(function ($query) use ($id) {
                $query->where('id_instrumento_origen', $id)
                    ->orWhere('id_instrumento_destino', $id);
            });
        }

        $relaciones = $consulta->get();

        return response()->json([
            'mensaje' => 'Relaciones obtenidas correctamente',
            'datos' => $relaciones
        ], 200);
    }

    // Consultar una relación
    public function show($id)
    {
        $relacion = InstrumentoRelacion::with([
            'instrumentoOrigen',
            'instrumentoDestino'
        ])->whereHas('instrumentoOrigen', function ($query) {
            $query->visiblesPara(auth()->user());
        })->whereHas('instrumentoDestino', function ($query) {
            $query->visiblesPara(auth()->user());
        })->findOrFail($id);

        $this->authorize('view', $relacion);

        return response()->json([
            'mensaje' => 'Relación obtenida correctamente',
            'datos' => $relacion
        ], 200);
    }

    // Registrar una relación
    public function store(Request $request)
    {
        $this->authorize('create', InstrumentoRelacion::class);

        $datos = $request->validate([
            'id_instrumento_origen' =>
                'required|exists:instrumentos,id_instrumento',

            'id_instrumento_destino' =>
                'required|different:id_instrumento_origen|exists:instrumentos,id_instrumento',

            'tipo_relacion' => [
                'required',
                Rule::in([
                    'especifico_de',
                    'modifica',
                    'renueva',
                    'sustituye'
                ])
            ],

            'descripcion' => 'nullable|string'
        ]);

        Instrumento::visiblesPara(auth()->user())
            ->findOrFail($datos['id_instrumento_origen']);

        Instrumento::visiblesPara(auth()->user())
            ->findOrFail($datos['id_instrumento_destino']);

        $relacion = DB::transaction(function () use ($datos) {

            $nuevaRelacion = InstrumentoRelacion::create($datos);

            AuditoriaService::registrar(
                'crear',
                'instrumentos_relaciones',
                $nuevaRelacion->id_instrumento_relacion,
                [
                    'id_instrumento_origen' => $nuevaRelacion->id_instrumento_origen,
                    'id_instrumento_destino' => $nuevaRelacion->id_instrumento_destino,
                    'tipo_relacion' => $nuevaRelacion->tipo_relacion
                ]
            );

            return $nuevaRelacion;
        });

        return response()->json([
            'mensaje' => 'Relación registrada correctamente',
            'datos' => $relacion->load([
                'instrumentoOrigen',
                'instrumentoDestino'
            ])
        ], 201);
    }

    // Actualizar una relación
    public function update(Request $request, $id)
    {
        $relacion = InstrumentoRelacion::with([
            'instrumentoOrigen',
            'instrumentoDestino'
        ])->findOrFail($id);

        $this->authorize('update', $relacion);

        $datos = $request->validate([
            'id_instrumento_origen' =>
                'sometimes|required|exists:instrumentos,id_instrumento',

            'id_instrumento_destino' =>
                'sometimes|required|exists:instrumentos,id_instrumento',

            'tipo_relacion' => [
                'sometimes',
                'required',
                Rule::in([
                    'especifico_de',
                    'modifica',
                    'renueva',
                    'sustituye'
                ])
            ],

            'descripcion' => 'sometimes|nullable|string'
        ]);

        $origen = $datos['id_instrumento_origen']
            ?? $relacion->id_instrumento_origen;

        $destino = $datos['id_instrumento_destino']
            ?? $relacion->id_instrumento_destino;

        if ($origen == $destino) {
            return response()->json([
                'mensaje' => 'Un instrumento no puede relacionarse consigo mismo.'
            ], 422);
        }

        Instrumento::visiblesPara(auth()->user())->findOrFail($origen);
        Instrumento::visiblesPara(auth()->user())->findOrFail($destino);

        DB::transaction(function () use ($relacion, $datos) {

            $relacion->update($datos);

            AuditoriaService::registrar(
                'actualizar',
                'instrumentos_relaciones',
                $relacion->id_instrumento_relacion,
                [
                    'campos_modificados' => array_keys($datos),
                    'id_instrumento_origen' => $relacion->id_instrumento_origen,
                    'id_instrumento_destino' => $relacion->id_instrumento_destino,
                    'tipo_relacion' => $relacion->tipo_relacion
                ]
            );
        });

        return response()->json([
            'mensaje' => 'Relación actualizada correctamente',
            'datos' => $relacion->fresh()->load([
                'instrumentoOrigen',
                'instrumentoDestino'
            ])
        ], 200);
    }
}
