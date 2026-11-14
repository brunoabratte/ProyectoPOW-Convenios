<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Parte;
use App\Models\Instrumento;
use App\Models\Persona;
use App\Services\AuditoriaService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ParteController extends Controller
{
    // Listar partes
    public function index(Request $request)
    {
        $this->authorize('viewAny', Parte::class);

        $datos = $request->validate([
            'id_instrumento' => [
                'sometimes',
                'integer',
                'exists:instrumentos,id_instrumento'
            ]
        ]);

        $usuario = auth()->user();

        $consulta = Parte::with([
            'instrumento',
            'institucion',
            'representante'
        ])->whereHas('instrumento', function ($query) use ($usuario) {
            $query->visiblesPara($usuario);
        });

        if (isset($datos['id_instrumento'])) {
            $consulta->where('id_instrumento', $datos['id_instrumento']);
        }

        $partes = $consulta
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'mensaje' => 'Partes obtenidas correctamente',
            'datos' => $partes
        ], 200);
    }

    // Consultar una parte
    public function show($id)
    {
        $usuario = auth()->user();

        $parte = Parte::with([
            'instrumento',
            'institucion',
            'representante'
        ])
            ->whereHas('instrumento', function ($query) use ($usuario) {
                $query->visiblesPara($usuario);
            })
            ->findOrFail($id);

        $this->authorize('view', $parte);

        return response()->json([
            'mensaje' => 'Parte obtenida correctamente',
            'datos' => $parte
        ], 200);
    }

    // Registrar una parte
    public function store(Request $request)
    {
        $this->authorize('create', Parte::class);

        $datos = $request->validate([
            'id_instrumento' => [
                'required',
                'exists:instrumentos,id_instrumento'
            ],

            'id_institucion' => [
                'required',
                'exists:instituciones,id_institucion'
            ],

            'caracter_parte' => 'required|string|max:100',

            'id_persona_representante' =>
                'nullable|exists:personas,id_persona',

            'representante_cargo' =>
                'nullable|string|max:150',

            'firmado_en' => 'nullable|date'
        ]);

        // Verificar que el instrumento pertenezca al alcance del usuario.
        Instrumento::visiblesPara(auth()->user())
            ->findOrFail($datos['id_instrumento']);

        // Verificar que la institución no esté asociada previamente.
        $existeParte = Parte::where(
            'id_instrumento',
            $datos['id_instrumento']
        )
            ->where('id_institucion', $datos['id_institucion'])
            ->exists();

        if ($existeParte) {
            return response()->json([
                'mensaje' => 'Esta institución ya está asociada al convenio.'
            ], 422);
        }

        // Verificar que el representante pertenezca a la institución.
        if (!empty($datos['id_persona_representante'])) {

            $representante = Persona::findOrFail(
                $datos['id_persona_representante']
            );

            if ($representante->id_institucion != $datos['id_institucion']) {
                return response()->json([
                    'mensaje' => 'El representante debe pertenecer a la institución que representa.'
                ], 422);
            }
        }

        $parte = DB::transaction(function () use ($datos) {

            $nuevaParte = Parte::create($datos);

            AuditoriaService::registrar(
                'crear',
                'partes',
                $nuevaParte->id_parte,
                [
                    'id_instrumento' => $nuevaParte->id_instrumento,
                    'id_institucion' => $nuevaParte->id_institucion,
                    'caracter_parte' => $nuevaParte->caracter_parte
                ]
            );

            return $nuevaParte;
        });

        return response()->json([
            'mensaje' => 'Parte registrada correctamente',
            'datos' => $parte->load([
                'instrumento',
                'institucion',
                'representante'
            ])
        ], 201);
    }

    // Actualizar una parte
    public function update(Request $request, $id)
    {
        $usuario = auth()->user();

        // Buscar únicamente partes de instrumentos visibles para el usuario.
        $parte = Parte::with('instrumento')
            ->whereHas('instrumento', function ($query) use ($usuario) {
                $query->visiblesPara($usuario);
            })
            ->findOrFail($id);

        $this->authorize('update', $parte);

        $datos = $request->validate([
            'id_instrumento' =>
                'sometimes|required|exists:instrumentos,id_instrumento',

            'id_institucion' =>
                'sometimes|required|exists:instituciones,id_institucion',

            'caracter_parte' =>
                'sometimes|required|string|max:100',

            'id_persona_representante' =>
                'sometimes|nullable|exists:personas,id_persona',

            'representante_cargo' =>
                'sometimes|nullable|string|max:150',

            'firmado_en' =>
                'sometimes|nullable|date'
        ]);

        $idInstrumento = $datos['id_instrumento']
            ?? $parte->id_instrumento;

        $idInstitucion = $datos['id_institucion']
            ?? $parte->id_institucion;

        // Verificar que el instrumento de destino esté dentro del alcance.
        Instrumento::visiblesPara($usuario)
            ->findOrFail($idInstrumento);

        // Evitar instituciones duplicadas en el mismo instrumento.
        $existeOtraParte = Parte::where('id_instrumento', $idInstrumento)
            ->where('id_institucion', $idInstitucion)
            ->where('id_parte', '!=', $parte->id_parte)
            ->exists();

        if ($existeOtraParte) {
            return response()->json([
                'mensaje' => 'Esta institución ya está asociada al convenio.'
            ], 422);
        }

        // Determinar si se envió un representante nuevo,
        // si se quiere quitar el existente o si se conserva.
        $idRepresentante = array_key_exists(
            'id_persona_representante',
            $datos
        )
            ? $datos['id_persona_representante']
            : $parte->id_persona_representante;

        if ($idRepresentante !== null) {

            $representante = Persona::findOrFail($idRepresentante);

            if ($representante->id_institucion != $idInstitucion) {
                return response()->json([
                    'mensaje' => 'El representante debe pertenecer a la institución que representa.'
                ], 422);
            }
        }

        DB::transaction(function () use ($parte, $datos) {

            $parte->update($datos);

            AuditoriaService::registrar(
                'actualizar',
                'partes',
                $parte->id_parte,
                [
                    'campos_modificados' => array_keys($datos),
                    'id_instrumento' => $parte->id_instrumento,
                    'id_institucion' => $parte->id_institucion
                ]
            );
        });

        return response()->json([
            'mensaje' => 'Parte actualizada correctamente',
            'datos' => $parte->fresh()->load([
                'instrumento',
                'institucion',
                'representante'
            ])
        ], 200);
    }
}
