<?php

namespace App\Services;

use App\Models\Auditoria;
use Illuminate\Support\Facades\Auth;

class AuditoriaService
{
    public static function registrar(
        string $accion,
        string $entidad,
        ?int $entidadId = null,
        array $detalle = [],
        ?int $usuarioId = null
    ): Auditoria {
        return Auditoria::create([
            'id_usuario' => $usuarioId ?? Auth::id() ?? 2,
            'accion' => $accion,
            'entidad' => $entidad,
            'entidad_id' => $entidadId,
            'detalle' => $detalle,
            'ip' => request()->ip(),
        ]);
    }
}