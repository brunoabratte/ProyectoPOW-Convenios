<?php

namespace App\Models;

class Parte extends BaseModel
{
    protected $table = 'partes';
    protected $primaryKey = 'id_parte';

    protected $fillable = [
        'id_instrumento',
        'id_institucion',
        'caracter_parte',
        'id_persona_representante',
        'representante_cargo',
        'firmado_en',
    ];

    public function instrumento()
    {
        return $this->belongsTo(Instrumento::class, 'id_instrumento', 'id_instrumento');
    }

    public function institucion()
    {
        return $this->belongsTo(Institucion::class, 'id_institucion', 'id_institucion');
    }

    public function representante()
    {
        return $this->belongsTo(Persona::class, 'id_persona_representante', 'id_persona');
    }
}
