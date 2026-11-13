<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Instrumento;
use App\Models\Pasantia;
use App\Services\AuditoriaService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class PasantiaController extends Controller
{
    // Listar pasantías
    public function index(Request $request)
    {
        $this->authorize('viewAny', Pasantia::class);

        $consulta = Pasantia::with([
            'instrumento',
            'estudiante',
            'tutor',
            'institucionReceptora',
            'responsableReceptor'
        ])->whereHas('instrumento', function ($query) {
            $query->visiblesPara(auth()->user());
        });

        if ($request->filled('id_instrumento')) {
            $consulta->where('id_instrumento', $request->id_instrumento);
        }

        if ($request->filled('id_persona_estudiante')) {
            $consulta->where(
                'id_persona_estudiante',
                $request->id_persona_estudiante
            );
        }

        if ($request->filled('id_institucion_receptora')) {
            $consulta->where(
                'id_institucion_receptora',
                $request->id_institucion_receptora
            );
        }

        $pasantias = $consulta->get();

        return response()->json([
            'mensaje' => 'Pasantías obtenidas correctamente',
            'datos' => $pasantias
        ], 200);
    }

    // Consultar una pasantía
    public function show($id)
    {
        $pasantia = Pasantia::with([
            'instrumento',
            'estudiante',
            'tutor',
            'institucionReceptora',
            'responsableReceptor'
        ])->whereHas('instrumento', function ($query) {
            $query->visiblesPara(auth()->user());
        })->findOrFail($id);

        $this->authorize('view', $pasantia);

        return response()->json([
            'mensaje' => 'Pasantía obtenida correctamente',
            'datos' => $pasantia
        ], 200);
    }

    // Registrar una pasantía
    public function store(Request $request)
    {
        $this->authorize('create', Pasantia::class);

        $datos = $request->validate([
            'id_instrumento' =>
                'required|exists:instrumentos,id_instrumento',

            'id_persona_estudiante' =>
                'required|exists:personas,id_persona',

            'id_persona_tutor' =>
                'required|exists:personas,id_persona',

            'id_institucion_receptora' =>
                'required|exists:instituciones,id_institucion',

            'id_persona_responsable_receptor' =>
                'nullable|exists:personas,id_persona',

            'carrera' => 'required|string|max:150',

            'fecha_inicio' => 'required|date',

            'fecha_fin' => 'required|date|after_or_equal:fecha_inicio',

            'horas_semanales' => 'required|integer|min:1',

            'actividades' => 'required|string',

            'asignacion' => 'nullable|string|max:255',

            'seguro' => 'nullable|string|max:255',

            'estado' => [
                'required',
                Rule::in([
                    'planificada',
                    'en_curso',
                    'finalizada',
                    'cancelada'
                ])
            ]
        ]);

        Instrumento::visiblesPara(auth()->user())
            ->findOrFail($datos['id_instrumento']);

        $pasantia = DB::transaction(function () use ($datos) {

            $nuevaPasantia = Pasantia::create($datos);

            AuditoriaService::registrar(
                'crear',
                'pasantias',
                $nuevaPasantia->id_pasantia,
                [
                    'id_instrumento' => $nuevaPasantia->id_instrumento,
                    'id_persona_estudiante' => $nuevaPasantia->id_persona_estudiante,
                    'id_persona_tutor' => $nuevaPasantia->id_persona_tutor,
                    'id_institucion_receptora' => $nuevaPasantia->id_institucion_receptora,
                    'carrera' => $nuevaPasantia->carrera,
                    'estado' => $nuevaPasantia->estado
                ]
            );

            return $nuevaPasantia;
        });

        return response()->json([
            'mensaje' => 'Pasantía registrada correctamente',
            'datos' => $pasantia->load([
                'instrumento',
                'estudiante',
                'tutor',
                'institucionReceptora',
                'responsableReceptor'
            ])
        ], 201);
    }

    // Actualizar una pasantía
    public function update(Request $request, $id)
    {
        $pasantia = Pasantia::with('instrumento')->findOrFail($id);

        $this->authorize('update', $pasantia);

        $datos = $request->validate([
            'id_instrumento' =>
                'sometimes|required|exists:instrumentos,id_instrumento',

            'id_persona_estudiante' =>
                'sometimes|required|exists:personas,id_persona',

            'id_persona_tutor' =>
                'sometimes|required|exists:personas,id_persona',

            'id_institucion_receptora' =>
                'sometimes|required|exists:instituciones,id_institucion',

            'id_persona_responsable_receptor' =>
                'sometimes|nullable|exists:personas,id_persona',

            'carrera' => 'sometimes|required|string|max:150',

            'fecha_inicio' => 'sometimes|required|date',

            'fecha_fin' => 'sometimes|required|date',

            'horas_semanales' => 'sometimes|required|integer|min:1',

            'actividades' => 'sometimes|required|string',

            'asignacion' => 'sometimes|nullable|string|max:255',

            'seguro' => 'sometimes|nullable|string|max:255',

            'estado' => [
                'sometimes',
                'required',
                Rule::in([
                    'planificada',
                    'en_curso',
                    'finalizada',
                    'cancelada'
                ])
            ]
        ]);

        $idInstrumento = $datos['id_instrumento']
            ?? $pasantia->id_instrumento;

        Instrumento::visiblesPara(auth()->user())
            ->findOrFail($idInstrumento);

        $fechaInicio = $datos['fecha_inicio']
            ?? $pasantia->fecha_inicio;

        $fechaFin = $datos['fecha_fin']
            ?? $pasantia->fecha_fin;

        if ($fechaFin < $fechaInicio) {
            return response()->json([
                'mensaje' => 'La fecha de finalización no puede ser anterior a la fecha de inicio.'
            ], 422);
        }

        $camposModificados = array_keys($datos);

        DB::transaction(function () use (
            $pasantia,
            $datos,
            $camposModificados
        ) {

            $pasantia->update($datos);

            AuditoriaService::registrar(
                'actualizar',
                'pasantias',
                $pasantia->id_pasantia,
                [
                    'campos_modificados' => $camposModificados,
                    'id_instrumento' => $pasantia->id_instrumento,
                    'id_persona_estudiante' => $pasantia->id_persona_estudiante,
                    'carrera' => $pasantia->carrera,
                    'estado' => $pasantia->estado
                ]
            );
        });

        return response()->json([
            'mensaje' => 'Pasantía actualizada correctamente',
            'datos' => $pasantia->fresh()->load([
                'instrumento',
                'estudiante',
                'tutor',
                'institucionReceptora',
                'responsableReceptor'
            ])
        ], 200);
    }
}
