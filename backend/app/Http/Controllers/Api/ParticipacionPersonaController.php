<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ParticipacionPersona;
use App\Services\AuditoriaService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ParticipacionPersonaController extends Controller
{
    // Listar participaciones
    public function index(Request $request)
    {
        $consulta = ParticipacionPersona::with([
            'persona',
            'instrumento'
        ]);

        if ($request->filled('id_persona')) {
            $consulta->where('id_persona', $request->id_persona);
        }

        if ($request->filled('id_instrumento')) {
            $consulta->where('id_instrumento', $request->id_instrumento);
        }

        $participaciones = $consulta->get();

        return response()->json([
            'mensaje' => 'Participaciones obtenidas correctamente',
            'datos' => $participaciones
        ], 200);
    }

    // Consultar una participación
    public function show($id)
    {
        $participacion = ParticipacionPersona::with([
            'persona',
            'instrumento'
        ])->findOrFail($id);

        return response()->json([
            'mensaje' => 'Participación obtenida correctamente',
            'datos' => $participacion
        ], 200);
    }

    // Registrar una participación
    public function store(Request $request)
    {
        $datos = $request->validate([
            'id_persona' => 'required|exists:personas,id_persona',
            'id_instrumento' => 'required|exists:instrumentos,id_instrumento',
            'rol' => 'required|string|max:100',
            'fecha_inicio' => 'nullable|date',
            'fecha_fin' => 'nullable|date|after_or_equal:fecha_inicio',
            'descripcion' => 'nullable|string'
        ]);

        $participacion = DB::transaction(function () use ($datos) {

            $participacion = ParticipacionPersona::create($datos);

            AuditoriaService::registrar(
                'crear',
                'participaciones_personas',
                $participacion->id_participacion_persona,
                [
                    'id_persona' => $participacion->id_persona,
                    'id_instrumento' => $participacion->id_instrumento,
                    'rol' => $participacion->rol
                ]
            );

            return $participacion;
        });

        return response()->json([
            'mensaje' => 'Participación registrada correctamente',
            'datos' => $participacion->load([
                'persona',
                'instrumento'
            ])
        ], 201);
    }

    // Actualizar una participación
    public function update(Request $request, $id)
    {
        $participacion = ParticipacionPersona::findOrFail($id);

        $datos = $request->validate([
            'id_persona' => 'sometimes|required|exists:personas,id_persona',
            'id_instrumento' => 'sometimes|required|exists:instrumentos,id_instrumento',
            'rol' => 'sometimes|required|string|max:100',
            'fecha_inicio' => 'sometimes|nullable|date',
            'fecha_fin' => 'sometimes|nullable|date|after_or_equal:fecha_inicio',
            'descripcion' => 'sometimes|nullable|string'
        ]);

        $camposModificados = array_keys($datos);

        DB::transaction(function () use ($participacion, $datos, $camposModificados) {

            $participacion->update($datos);

            AuditoriaService::registrar(
                'actualizar',
                'participaciones_personas',
                $participacion->id_participacion_persona,
                [
                    'campos_modificados' => $camposModificados,
                    'id_persona' => $participacion->id_persona,
                    'id_instrumento' => $participacion->id_instrumento,
                    'rol' => $participacion->rol
                ]
            );
        });

        return response()->json([
            'mensaje' => 'Participación actualizada correctamente',
            'datos' => $participacion->fresh()->load([
                'persona',
                'instrumento'
            ])
        ], 200);
    }
}
