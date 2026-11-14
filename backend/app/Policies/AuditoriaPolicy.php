<?php

namespace App\Policies;

use App\Models\Auditoria;
use App\Models\User;

class AuditoriaPolicy
{
    // Provisionalmente, solo Administración puede consultar auditorías.
    public function viewAny(User $user): bool
    {
        return $user->esAdministracion();
    }

    public function view(User $user, Auditoria $auditoria): bool
    {
        return $user->esAdministracion();
    }

    // Las auditorías no se modifican ni eliminan desde la API.
    public function create(User $user): bool
    {
        return false;
    }

    public function update(User $user, Auditoria $auditoria): bool
    {
        return false;
    }

    public function delete(User $user, Auditoria $auditoria): bool
    {
        return false;
    }
}
