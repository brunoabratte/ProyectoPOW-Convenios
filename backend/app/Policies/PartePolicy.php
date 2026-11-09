<?php

namespace App\Policies;

use App\Models\Parte;
use App\Models\User;

class PartePolicy
{
    public function viewAny(User $user): bool
    {
        return in_array($user->rol, [
            'administracion',
            'gestion',
            'revision',
            'consulta'
        ]);
    }

    public function view(User $user, Parte $parte): bool
    {
        return $this->viewAny($user)
            && $user->puedeAccederAInstrumento($parte->instrumento);
    }

    public function create(User $user): bool
    {
        return $user->esGestion();
    }

    public function update(User $user, Parte $parte): bool
    {
        return $user->esGestion()
            && $user->puedeAccederAInstrumento($parte->instrumento);
    }

    public function delete(User $user, Parte $parte): bool
    {
        return false;
    }
}
