<?php

namespace App\Policies;

use App\Models\Pasantia;
use App\Models\User;

class PasantiaPolicy
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

    public function view(User $user, Pasantia $pasantia): bool
    {
        return $this->viewAny($user)
            && $user->puedeAccederAInstrumento(
                $pasantia->instrumento
            );
    }

    public function create(User $user): bool
    {
        return $user->esGestion();
    }

    public function update(User $user, Pasantia $pasantia): bool
    {
        return $user->esGestion()
            && $user->puedeAccederAInstrumento(
                $pasantia->instrumento
            );
    }

    public function delete(User $user, Pasantia $pasantia): bool
    {
        return false;
    }
}
