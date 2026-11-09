<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class AuthController extends Controller
{
    // Iniciar sesión
    public function login(Request $request)
    {
        $datos = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string']
        ]);

        $usuario = User::where('email', $datos['email'])->first();

        if (!$usuario || !Hash::check($datos['password'], $usuario->password)) {
            return response()->json([
                'mensaje' => 'Las credenciales ingresadas son incorrectas.'
            ], 401);
        }

        $token = $usuario->createToken('token-api')->plainTextToken;

        return response()->json([
            'mensaje' => 'Inicio de sesión exitoso.',
            'token' => $token,
            'usuario' => [
                'id_usuario' => $usuario->id_usuario,
                'name' => $usuario->name,
                'email' => $usuario->email,
                'rol' => $usuario->rol,
                'id_unidad' => $usuario->id_unidad
            ]
        ], 200);
    }

    // Consultar usuario autenticado
    public function me(Request $request)
    {
        return response()->json([
            'usuario' => $request->user()
        ], 200);
    }

    // Cerrar sesión
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'mensaje' => 'Sesión cerrada correctamente.'
        ], 200);
    }
}
