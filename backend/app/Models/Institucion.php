<?php

namespace App\Models;

class Institucion extends BaseModel
{
    protected $table = 'instituciones';
    protected $primaryKey = 'id_institucion';

    protected $fillable = [
        'nombre',
        'tipo_institucion',
        'cuit',
        'domicilio',
        'localidad',
        'provincia',
        'correo',
        'telefono'
    ];

    public function personas()
    {
        return $this->hasMany(
            Persona::class,
            'id_institucion',
            'id_institucion'
        );
    }

    public function partes()
    {
        return $this->hasMany(
            Parte::class,
            'id_institucion',
            'id_institucion'
        );
    }

    public function pasantias()
    {
        return $this->hasMany(
            Pasantia::class,
            'id_institucion_receptora',
            'id_institucion'
        );
    }
}