<?php

namespace App\Policies;

use App\Models\Documento;
use App\Models\User;

class DocumentoPolicy
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

    public function view(User $user, Documento $documento): bool
    {
        return $user->esAdmin()
            || (
                $this->viewAny($user)
                && $user->puedeAccederAInstrumento($documento->instrumento)
            );
    }

    public function create(User $user): bool
    {
        return $user->esAdmin()
            || $user->esGestion()
            || $user->esAdministracion();
    }

    public function createVersion(User $user, Documento $documento): bool
    {
        return $user->esAdmin()
            || (
                $user->esGestion()
                && $user->puedeAccederAInstrumento($documento->instrumento)
            );
    }

    public function download(User $user, Documento $documento): bool
    {
        return $this->view($user, $documento);
    }

    public function delete(User $user, Documento $documento): bool
    {
        return $user->esAdmin();
    }
}
