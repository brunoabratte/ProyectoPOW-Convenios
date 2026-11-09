<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 'usuarios';

    protected $primaryKey = 'id_usuario';

    protected $fillable = [
        'name',
        'email',
        'password',
        'rol',
        'id_unidad',
    ];

    protected $hidden = [
        'password',
    ];

    protected function casts(): array
    {
        return [
            'password' => 'hashed',
        ];
    }

    // Relación con la unidad del usuario
    public function unidad()
    {
        return $this->belongsTo(
            Unidad::class,
            'id_unidad',
            'id_unidad'
        );
    }

    // Relación con los instrumentos que creó
    public function instrumentosCreados()
    {
        return $this->hasMany(
            Instrumento::class,
            'id_usuario_creador',
            'id_usuario'
        );
    }

    // Métodos para identificar roles
    public function esAdministracion(): bool
    {
        return $this->rol === 'administracion';
    }

    public function esGestion(): bool
    {
        return $this->rol === 'gestion';
    }

    public function esRevision(): bool
    {
        return $this->rol === 'revision';
    }

    public function esConsulta(): bool
    {
        return $this->rol === 'consulta';
    }

    // Alcance global si no tiene unidad asignada
    public function tieneAlcanceGlobal(): bool
    {
        return $this->id_unidad === null;
    }

    // Comprueba si puede acceder a una unidad
    public function puedeAccederAUnidad(int $idUnidad): bool
    {
        return $this->tieneAlcanceGlobal()
            || (int) $this->id_unidad === $idUnidad;
    }

    // Comprueba si puede acceder a un instrumento
    public function puedeAccederAInstrumento(Instrumento $instrumento): bool
    {
        return $this->puedeAccederAUnidad(
            (int) $instrumento->id_unidad
        );
    }
}
