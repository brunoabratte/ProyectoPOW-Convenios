<?php

namespace App\Policies;

use App\Models\Instrumento;
use App\Models\User;

class InstrumentoPolicy
{
    /**
     * Consultar el listado de instrumentos.
     */
    public function viewAny(User $user): bool
    {
        return in_array($user->rol, [
            'administracion',
            'gestion',
            'revision',
            'consulta',
        ]);
    }

    /**
     * Consultar un instrumento específico.
     */
    public function view(User $user, Instrumento $instrumento): bool
    {
        return $user->puedeAccederAInstrumento($instrumento)
            && $this->viewAny($user);
    }

    /**
     * Crear instrumentos.
     */
    public function create(User $user): bool
    {
        return $user->esGestion();
    }

    /**
     * Modificar instrumentos.
     */
    public function update(User $user, Instrumento $instrumento): bool
    {
        return $user->esGestion()
            && $user->puedeAccederAInstrumento($instrumento);
    }

    /**
     * Eliminar instrumentos.
     */
    public function delete(User $user, Instrumento $instrumento): bool
    {
        return false;
    }

    /**
     * Restaurar instrumentos.
     */
    public function restore(User $user, Instrumento $instrumento): bool
    {
        return false;
    }

    /**
     * Eliminar instrumentos permanentemente.
     */
    public function forceDelete(User $user, Instrumento $instrumento): bool
    {
        return false;
    }

    /**
     * Aprobar o devolver instrumentos.
     */
    public function gestionarRevision(User $user, Instrumento $instrumento): bool
    {
        return $user->esRevision()
            && $user->puedeAccederAInstrumento($instrumento);
    }
}
