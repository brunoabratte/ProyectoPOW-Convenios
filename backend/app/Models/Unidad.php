<?php

namespace App\Models;

class Unidad extends BaseModel
{
    protected $table = 'unidades';
    protected $primaryKey = 'id_unidad';

    protected $fillable = [
        'nombre',
        'tipo_unidad',
        'descripcion',
        'id_unidad_padre',
    ];

    public function instrumentos()
    {
        return $this->hasMany(
            Instrumento::class,
            'id_unidad',
            'id_unidad'
        );
    }

    public function usuarios()
    {
        return $this->hasMany(
            User::class,
            'id_unidad',
            'id_unidad'
        );
    }

    public function unidadPadre()
    {
        return $this->belongsTo(
            Unidad::class,
            'id_unidad_padre',
            'id_unidad'
        );
    }

    public function unidadesHijas()
    {
        return $this->hasMany(
            Unidad::class,
            'id_unidad_padre',
            'id_unidad'
        );
    }
}
