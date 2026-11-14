<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Instrumento;
use App\Models\Pasantia;
use App\Services\AuditoriaService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class PasantiaController extends Controller
{
    // Listar pasantías
    public function index(Request $request)
    {
        $this->authorize('viewAny', Pasantia::class);

        $datos = $request->validate([
            'id_instrumento' => [
                'sometimes',
                'integer',
                'exists:instrumentos,id_instrumento'
            ],
            'id_persona_estudiante' => [
                'sometimes',
                'integer',
                'exists:personas,id_persona'
            ],
            'id_institucion_receptora' => [
                'sometimes',
                'integer',
                'exists:instituciones,id_institucion'
            ]
        ]);

        $usuario = auth()->user();

        $consulta = Pasantia::with([
            'instrumento',
            'estudiante',
            'tutor',
            'institucionReceptora',
            'responsableReceptor'
        ])->whereHas('instrumento', function ($query) use ($usuario) {
            $query->visiblesPara($usuario);
        });

        if (isset($datos['id_instrumento'])) {
            $consulta->where(
                'id_instrumento',
                $datos['id_instrumento']
            );
        }

        if (isset($datos['id_persona_estudiante'])) {
            $consulta->where(
                'id_persona_estudiante',
                $datos['id_persona_estudiante']
            );
        }

        if (isset($datos['id_institucion_receptora'])) {
            $consulta->where(
                'id_institucion_receptora',
                $datos['id_institucion_receptora']
            );
        }

        $pasantias = $consulta
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'mensaje' => 'Pasantías obtenidas correctamente',
            'datos' => $pasantias
        ], 200);
    }

    // Consultar una pasantía
    public function show($id)
    {
        $usuario = auth()->user();

        $pasantia = Pasantia::with([
            'instrumento',
            'estudiante',
            'tutor',
            'institucionReceptora',
            'responsableReceptor'
        ])
            ->whereHas('instrumento', function ($query) use ($usuario) {
                $query->visiblesPara($usuario);
            })
            ->findOrFail($id);

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

        // Verificar que el instrumento pertenezca al alcance del usuario.
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
        $usuario = auth()->user();

        // Buscar únicamente pasantías pertenecientes al alcance del usuario.
        $pasantia = Pasantia::with('instrumento')
            ->whereHas('instrumento', function ($query) use ($usuario) {
                $query->visiblesPara($usuario);
            })
            ->findOrFail($id);

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

        // Verificar el alcance del instrumento nuevo, si se modifica.
        $idInstrumento = $datos['id_instrumento']
            ?? $pasantia->id_instrumento;

        Instrumento::visiblesPara($usuario)
            ->findOrFail($idInstrumento);

        // Validar las fechas considerando los valores existentes.
        $fechaInicio = $datos['fecha_inicio']
            ?? $pasantia->fecha_inicio;

        $fechaFin = $datos['fecha_fin']
            ?? $pasantia->fecha_fin;

        if (
            $fechaInicio &&
            $fechaFin &&
            Carbon::parse($fechaFin)->lt(Carbon::parse($fechaInicio))
        ) {
            throw ValidationException::withMessages([
                'fecha_fin' => [
                    'La fecha de finalización no puede ser anterior a la fecha de inicio.'
                ]
            ]);
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
