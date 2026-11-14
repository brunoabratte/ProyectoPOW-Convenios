<?php

namespace App\Services;

use App\Models\Auditoria;
use Illuminate\Support\Facades\Auth;
use LogicException;

class AuditoriaService
{
    public static function registrar(
        string $accion,
        string $entidad,
        ?int $entidadId = null,
        array $detalle = [],
        ?int $usuarioId = null
    ): Auditoria {

        $usuarioId = $usuarioId ?? Auth::id();

        if ($usuarioId === null) {
            throw new LogicException(
                'No se puede registrar una auditoría sin un usuario identificado.'
            );
        }

        return Auditoria::create([
            'id_usuario' => $usuarioId,
            'accion' => $accion,
            'entidad' => $entidad,
            'entidad_id' => $entidadId,
            'detalle' => $detalle,
            'ip' => request()->ip(),
        ]);
    }
}
