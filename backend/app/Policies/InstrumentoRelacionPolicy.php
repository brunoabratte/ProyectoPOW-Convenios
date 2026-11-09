<?php

namespace App\Policies;

use App\Models\InstrumentoRelacion;
use App\Models\User;

class InstrumentoRelacionPolicy
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

    public function view(User $user, InstrumentoRelacion $relacion): bool
    {
        return $this->viewAny($user)
            && $user->puedeAccederAInstrumento($relacion->instrumentoOrigen)
            && $user->puedeAccederAInstrumento($relacion->instrumentoDestino);
    }

    public function create(User $user): bool
    {
        return $user->esGestion();
    }

    public function update(User $user, InstrumentoRelacion $relacion): bool
    {
        return $user->esGestion()
            && $user->puedeAccederAInstrumento($relacion->instrumentoOrigen)
            && $user->puedeAccederAInstrumento($relacion->instrumentoDestino);
    }

    public function delete(User $user, InstrumentoRelacion $relacion): bool
    {
        return false;
    }
}
