<?php

namespace App\Models;

class Estado extends BaseModel
{
    protected $table = 'estados';
    protected $primaryKey = 'id_estado';

    protected $fillable = [
        'nombre',
        'descripcion',
    ];

    public function instrumentos()
    {
        return $this->hasMany(
            Instrumento::class,
            'id_estado',
            'id_estado'
        );
    }

    public function cambiosAnteriores()
    {
        return $this->hasMany(
            HistorialEstado::class,
            'id_estado_anterior',
            'id_estado'
        );
    }

    public function cambiosNuevos()
    {
        return $this->hasMany(
            HistorialEstado::class,
            'id_estado_nuevo',
            'id_estado'
        );
    }
}
