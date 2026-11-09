<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Persona;
use App\Services\AuditoriaService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class PersonaController extends Controller
{
    // Listar personas
    public function index()
    {
        $this->authorize('viewAny', Persona::class);

        $personas = Persona::with('institucion')->get();

        return response()->json([
            'mensaje' => 'Personas obtenidas correctamente',
            'datos' => $personas
        ], 200);
    }

    // Consultar una persona
    public function show($id)
    {
        $persona = Persona::with([
            'institucion',
            'participaciones.instrumento',
            'pasantiasComoEstudiante'
        ])->findOrFail($id);

        $this->authorize('view', $persona);

        return response()->json([
            'mensaje' => 'Persona obtenida correctamente',
            'datos' => $persona
        ], 200);
    }

    // Registrar una persona
    public function store(Request $request)
    {
        $this->authorize('create', Persona::class);

        $datos = $request->validate([
            'nombre' => 'required|string|max:100',
            'apellido' => 'required|string|max:100',
            'dni' => 'required|string|max:20|unique:personas,dni',
            'correo' => 'nullable|email|max:150',
            'telefono' => 'nullable|string|max:30',
            'id_institucion' => 'nullable|exists:instituciones,id_institucion'
        ]);

        $persona = DB::transaction(function () use ($datos) {

            $nuevaPersona = Persona::create($datos);

            AuditoriaService::registrar(
                'crear',
                'personas',
                $nuevaPersona->id_persona,
                [
                    'nombre' => $nuevaPersona->nombre,
                    'apellido' => $nuevaPersona->apellido
                ]
            );

            return $nuevaPersona;
        });

        return response()->json([
            'mensaje' => 'Persona registrada correctamente',
            'datos' => $persona->load('institucion')
        ], 201);
    }

    // Actualizar una persona
    public function update(Request $request, $id)
    {
        $persona = Persona::findOrFail($id);

        $this->authorize('update', $persona);

        $datos = $request->validate([
            'nombre' => 'sometimes|required|string|max:100',
            'apellido' => 'sometimes|required|string|max:100',
            'dni' => [
                'sometimes',
                'required',
                'string',
                'max:20',
                Rule::unique('personas', 'dni')->ignore(
                    $persona->id_persona,
                    'id_persona'
                )
            ],
            'correo' => 'sometimes|nullable|email|max:150',
            'telefono' => 'sometimes|nullable|string|max:30',
            'id_institucion' => 'sometimes|nullable|exists:instituciones,id_institucion'
        ]);

        DB::transaction(function () use ($persona, $datos) {

            $persona->update($datos);

            AuditoriaService::registrar(
                'actualizar',
                'personas',
                $persona->id_persona,
                [
                    'campos_modificados' => array_keys($datos),
                    'nombre' => $persona->nombre,
                    'apellido' => $persona->apellido
                ]
            );
        });

        return response()->json([
            'mensaje' => 'Persona actualizada correctamente',
            'datos' => $persona->fresh()->load('institucion')
        ], 200);
    }
}
