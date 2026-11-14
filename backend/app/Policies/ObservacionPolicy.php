<?php

namespace App\Policies;

use App\Models\Observacion;
use App\Models\User;

class ObservacionPolicy
{
    // Todos los roles pueden consultar observaciones.
    public function viewAny(User $user): bool
    {
        return in_array($user->rol, [
            'administracion',
            'gestion',
            'revision',
            'consulta'
        ]);
    }

    // Solo puede consultar observaciones de instrumentos de su alcance.
    public function view(User $user, Observacion $observacion): bool
    {
        return $this->viewAny($user)
            && $user->puedeAccederAInstrumento($observacion->instrumento);
    }

    // Revisión puede crear observaciones.
    public function create(User $user): bool
    {
        return $user->esRevision();
    }

    // Gestión puede responder observaciones de su alcance.
    public function respond(User $user, Observacion $observacion): bool
    {
        return $user->esGestion()
            && $user->puedeAccederAInstrumento($observacion->instrumento);
    }

    // Revisión puede resolver observaciones de su alcance.
    public function resolve(User $user, Observacion $observacion): bool
    {
        return $user->esRevision()
            && $user->puedeAccederAInstrumento($observacion->instrumento);
    }
}
