<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Institucion;
use App\Services\AuditoriaService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class InstitucionController extends Controller
{
    // Listar instituciones
    public function index()
    {
        $instituciones = Institucion::withCount([
            'personas',
            'partes'
        ])->get();

        return response()->json([
            'status' => 200,
            'mensaje' => 'Instituciones obtenidas correctamente',
            'data' => $instituciones
        ]);
    }

    // Consultar una institución
    public function show($id)
    {
        $institucion = Institucion::with([
            'personas',
            'partes.instrumento'
        ])->findOrFail($id);

        return response()->json([
            'status' => 200,
            'mensaje' => 'Institución obtenida correctamente',
            'data' => $institucion
        ]);
    }

    // Registrar una institución
    public function store(Request $request)
    {
        $datos = $request->validate([
            'nombre' => 'required|string|max:255',
            'tipo_institucion' => 'required|string|max:100',
            'cuit' => 'nullable|string|max:20|unique:instituciones,cuit',
            'domicilio' => 'nullable|string|max:255',
            'localidad' => 'nullable|string|max:100',
            'provincia' => 'nullable|string|max:100',
            'correo' => 'nullable|email|max:255',
            'telefono' => 'nullable|string|max:30',
        ]);

        $institucion = DB::transaction(function () use ($datos) {

            $nuevaInstitucion = Institucion::create($datos);

            AuditoriaService::registrar(
                'crear',
                'instituciones',
                $nuevaInstitucion->id_institucion,
                [
                    'nombre' => $nuevaInstitucion->nombre,
                    'tipo_institucion' => $nuevaInstitucion->tipo_institucion
                ]
            );

            return $nuevaInstitucion;
        });

        return response()->json([
            'status' => 201,
            'mensaje' => 'Institución registrada correctamente',
            'data' => $institucion
        ], 201);
    }

    // Actualizar una institución
    public function update(Request $request, $id)
    {
        $institucion = Institucion::findOrFail($id);

        $datos = $request->validate([
            'nombre' => 'sometimes|required|string|max:255',
            'tipo_institucion' => 'sometimes|required|string|max:100',
            'cuit' => 'sometimes|nullable|string|max:20|unique:instituciones,cuit,' . $id . ',id_institucion',
            'domicilio' => 'sometimes|nullable|string|max:255',
            'localidad' => 'sometimes|nullable|string|max:100',
            'provincia' => 'sometimes|nullable|string|max:100',
            'correo' => 'sometimes|nullable|email|max:255',
            'telefono' => 'sometimes|nullable|string|max:30',
        ]);

        DB::transaction(function () use ($institucion, $datos) {

            $institucion->update($datos);

            AuditoriaService::registrar(
                'actualizar',
                'instituciones',
                $institucion->id_institucion,
                [
                    'campos_modificados' => array_keys($datos),
                    'nombre' => $institucion->nombre,
                    'tipo_institucion' => $institucion->tipo_institucion
                ]
            );
        });

        return response()->json([
            'status' => 200,
            'mensaje' => 'Institución actualizada correctamente',
            'data' => $institucion->fresh()
        ]);
    }
}