<?php

namespace App\Policies;

use App\Models\Persona;
use App\Models\User;

class PersonaPolicy
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

    public function view(User $user, Persona $persona): bool
    {
        return $this->viewAny($user);
    }

    public function create(User $user): bool
    {
        return $user->esAdmin() || $user->esAdministracion();
    }

    public function update(User $user, Persona $persona): bool
    {
        return $user->esAdmin() || $user->esAdministracion();
    }

    public function delete(User $user, Persona $persona): bool
    {
        return $user->esAdmin();
    }
}
