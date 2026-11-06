<?php

namespace App\Models;

class ParticipacionPersona extends BaseModel
{
    protected $table = 'participaciones_personas';
    protected $primaryKey = 'id_participacion_persona';

    protected $fillable = [
        'id_persona',
        'id_instrumento',
        'rol',
        'fecha_inicio',
        'fecha_fin',
        'descripcion',
    ];

    public function persona()
    {
        return $this->belongsTo(
            Persona::class,
            'id_persona',
            'id_persona'
        );
    }

    public function instrumento()
    {
        return $this->belongsTo(
            Instrumento::class,
            'id_instrumento',
            'id_instrumento'
        );
    }
}
