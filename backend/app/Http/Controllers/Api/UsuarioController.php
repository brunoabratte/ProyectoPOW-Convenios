<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Unidad;
use App\Services\AuditoriaService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class UsuarioController extends Controller
{
    private function verificarAdministracion()
    {
        if (!Auth::user()->esAdministracion()) {
            return response()->json([
                'status' => false,
                'mensaje' => 'No tenés permisos para realizar esta operación.',
                'data' => null,
            ], 403);
        }

        return null;
    }

    // GET /usuarios
    public function index()
    {
        if ($respuesta = $this->verificarAdministracion()) {
            return $respuesta;
        }

        $usuarios = User::with('unidad')
            ->orderBy('id_usuario')
            ->get();

        return response()->json([
            'status' => true,
            'mensaje' => 'Usuarios obtenidos correctamente.',
            'data' => $usuarios,
        ]);
    }

    // POST /usuarios
    public function store(Request $request)
    {
        if ($respuesta = $this->verificarAdministracion()) {
            return $respuesta;
        }

        $datos = $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'email' => ['required', 'email', 'max:150', 'unique:usuarios,email'],
            'password' => ['required', 'string', 'min:8'],
            'rol' => ['required', Rule::in([
                'administracion',
                'gestion',
                'revision',
                'consulta',
            ])],
            'id_unidad' => ['nullable', 'integer', 'exists:unidades,id_unidad'],
        ]);

        $usuario = User::create([
            ...$datos,
            'activo' => true,
        ]);

        AuditoriaService::registrar(
        'crear_usuario',
        'usuarios',
        $usuario->id_usuario
        );

        return response()->json([
            'status' => true,
            'mensaje' => 'Usuario creado correctamente.',
            'data' => $usuario->load('unidad'),
        ], 201);
    }

    // PUT /usuarios/{id}
    public function update(Request $request, int $id)
    {
        if ($respuesta = $this->verificarAdministracion()) {
            return $respuesta;
        }

        $usuario = User::findOrFail($id);

        $datos = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:150'],
            'email' => [
                'sometimes',
                'required',
                'email',
                'max:150',
                Rule::unique('usuarios', 'email')->ignore(
                    $usuario->id_usuario,
                    'id_usuario'
                ),
            ],
            'password' => ['sometimes', 'nullable', 'string', 'min:8'],
            'rol' => ['sometimes', 'required', Rule::in([
                'administracion',
                'gestion',
                'revision',
                'consulta',
            ])],
            'id_unidad' => [
                'sometimes',
                'nullable',
                'integer',
                'exists:unidades,id_unidad',
            ],
        ]);

        if (empty($datos['password'])) {
            unset($datos['password']);
        }

        $usuario->update($datos);

        AuditoriaService::registrar(
            'modificar_usuario',
            'usuarios',
            $usuario->id_usuario
        );

        return response()->json([
            'status' => true,
            'mensaje' => 'Usuario actualizado correctamente.',
            'data' => $usuario->fresh()->load('unidad'),
        ]);
    }

    // PATCH /usuarios/{id}/activo
    public function cambiarActivo(Request $request, int $id)
    {
        if ($respuesta = $this->verificarAdministracion()) {
            return $respuesta;
        }

        $datos = $request->validate([
            'activo' => ['required', 'boolean'],
        ]);

        $usuario = User::findOrFail($id);

        if ((int) $usuario->id_usuario === (int) Auth::id() && !$datos['activo']) {
            return response()->json([
                'status' => false,
                'mensaje' => 'No podés desactivar tu propio usuario.',
                'data' => null,
            ], 422);
        }

        // Actualizar el estado del usuario
        $usuario->update([
            'activo' => $datos['activo'],
        ]);

        // Revocar todos sus tokens si se desactiva
        if (!$datos['activo']) {
            $usuario->tokens()->delete();
        }

        AuditoriaService::registrar(
            $datos['activo'] ? 'activar_usuario' : 'desactivar_usuario',
            'usuarios',
            $usuario->id_usuario
        );

        return response()->json([
            'status' => true,
            'mensaje' => 'Estado del usuario actualizado correctamente.',
            'data' => $usuario->fresh()->load('unidad'),
        ]);
    }
}
