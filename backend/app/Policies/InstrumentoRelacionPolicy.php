<?php

namespace App\Policies;

use App\Models\InstrumentoRelacion;
use App\Models\User;

class InstrumentoRelacionPolicy
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

    public function view(User $user, InstrumentoRelacion $relacion): bool
    {
        return $user->esAdmin()
            || (
                $this->viewAny($user)
                && $user->puedeAccederAInstrumento($relacion->instrumentoOrigen)
                && $user->puedeAccederAInstrumento($relacion->instrumentoDestino)
            );
    }

    public function create(User $user): bool
    {
        return $user->esAdmin() || $user->esGestion();
    }

    public function update(User $user, InstrumentoRelacion $relacion): bool
    {
        return $user->esAdmin()
            || (
                $user->esGestion()
                && $user->puedeAccederAInstrumento($relacion->instrumentoOrigen)
                && $user->puedeAccederAInstrumento($relacion->instrumentoDestino)
            );
    }

    public function delete(User $user, InstrumentoRelacion $relacion): bool
    {
        return $user->esAdmin();
    }
}
