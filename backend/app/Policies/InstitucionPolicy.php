<?php

namespace App\Policies;

use App\Models\Institucion;
use App\Models\User;

class InstitucionPolicy
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

    public function view(User $user, Institucion $institucion): bool
    {
        return $this->viewAny($user);
    }

    public function create(User $user): bool
    {
        return $user->esAdministracion();
    }

    public function update(User $user, Institucion $institucion): bool
    {
        return $user->esAdministracion();
    }

    public function delete(User $user, Institucion $institucion): bool
    {
        return false;
    }
}
