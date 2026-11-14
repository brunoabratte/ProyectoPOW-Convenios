<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Auditoria;
use Illuminate\Http\Request;

class AuditoriaController extends Controller
{
    // Listar auditorías con filtros opcionales
    public function index(Request $request)
    {
        $this->authorize('viewAny', Auditoria::class);

        $datos = $request->validate([
            'id_usuario' => [
                'sometimes',
                'integer',
                'exists:usuarios,id_usuario'
            ],
            'accion' => [
                'sometimes',
                'string',
                'max:100'
            ],
            'entidad' => [
                'sometimes',
                'string',
                'max:100'
            ],
            'entidad_id' => [
                'sometimes',
                'integer'
            ],
            'fecha_desde' => [
                'sometimes',
                'date'
            ],
            'fecha_hasta' => [
                'sometimes',
                'date',
                'after_or_equal:fecha_desde'
            ],
        ]);

        $query = Auditoria::with('usuario');

        if (isset($datos['id_usuario'])) {
            $query->where('id_usuario', $datos['id_usuario']);
        }

        if (isset($datos['accion'])) {
            $query->where('accion', $datos['accion']);
        }

        if (isset($datos['entidad'])) {
            $query->where('entidad', $datos['entidad']);
        }

        if (isset($datos['entidad_id'])) {
            $query->where('entidad_id', $datos['entidad_id']);
        }

        if (isset($datos['fecha_desde'])) {
            $query->whereDate('created_at', '>=', $datos['fecha_desde']);
        }

        if (isset($datos['fecha_hasta'])) {
            $query->whereDate('created_at', '<=', $datos['fecha_hasta']);
        }

        $auditorias = $query
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($auditorias, 200);
    }

    // Consultar una auditoría específica
    public function show($id)
    {
        $auditoria = Auditoria::with('usuario')
            ->findOrFail($id);

        $this->authorize('view', $auditoria);

        return response()->json($auditoria, 200);
    }
}
