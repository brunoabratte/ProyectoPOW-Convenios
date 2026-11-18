<?php

namespace App\Policies;

use App\Models\ParticipacionPersona;
use App\Models\User;

class ParticipacionPersonaPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->esAdmin() || in_array($user->rol, [
            'administracion',
            'gestion',
            'revision',
            'consulta'
        ]);
    }

    public function view(User $user, ParticipacionPersona $participacion): bool
    {
        return $user->esAdmin()
            || (
                $this->viewAny($user)
                && $user->puedeAccederAInstrumento($participacion->instrumento)
            );
    }

    public function create(User $user): bool
    {
        return $user->esAdmin() || $user->esGestion();
    }

    public function update(User $user, ParticipacionPersona $participacion): bool
    {
        return $user->esAdmin()
            || (
                $user->esGestion()
                && $user->puedeAccederAInstrumento($participacion->instrumento)
            );
    }

    public function delete(User $user, ParticipacionPersona $participacion): bool
    {
        return $user->esAdmin();
    }
}
