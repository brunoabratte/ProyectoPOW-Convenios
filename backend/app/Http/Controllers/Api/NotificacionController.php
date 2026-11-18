<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notificacion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NotificacionController extends Controller
{
    // GET /notificaciones
    public function index()
    {
        $usuario = Auth::user();

        $notificaciones = Notificacion::with([
            'instrumento:id_instrumento,codigo,titulo'
        ])
            ->where('id_usuario', $usuario->id_usuario)
            ->orderByRaw('leida_en IS NULL DESC')
            ->orderByDesc('created_at')
            ->paginate(15);

        return response()->json([
            'status' => true,
            'mensaje' => 'Notificaciones obtenidas correctamente.',
            'data' => $notificaciones,
        ]);
    }

    // PATCH /notificaciones/{id}/leer
    public function marcarLeida(int $id)
    {
        $notificacion = Notificacion::where(
            'id_usuario',
            Auth::id()
        )->findOrFail($id);

        if ($notificacion->leida_en === null) {
            $notificacion->update([
                'leida_en' => now(),
            ]);
        }

        return response()->json([
            'status' => true,
            'mensaje' => 'Notificación marcada como leída.',
            'data' => $notificacion->fresh(),
        ]);
    }
}
