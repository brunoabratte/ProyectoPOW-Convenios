<?php

namespace App\Policies;

use App\Models\Documento;
use App\Models\User;

class DocumentoPolicy
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

    public function view(User $user, Documento $documento): bool
    {
        return $this->viewAny($user)
            && $user->puedeAccederAInstrumento($documento->instrumento);
    }

    public function create(User $user): bool
    {
        return $user->esGestion();
    }

    public function createVersion(User $user, Documento $documento): bool
    {
        return $user->esGestion()
            && $user->puedeAccederAInstrumento($documento->instrumento);
    }

    public function download(User $user, Documento $documento): bool
    {
        return $this->view($user, $documento);
    }

    public function delete(User $user, Documento $documento): bool
    {
        return false;
    }
}
