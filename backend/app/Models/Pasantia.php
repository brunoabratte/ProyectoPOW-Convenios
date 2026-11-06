<?php

namespace App\Models;

class Pasantia extends BaseModel
{
    protected $table = 'pasantias';
    protected $primaryKey = 'id_pasantia';

    protected $fillable = [
        'id_instrumento',
        'id_persona_estudiante',
        'id_persona_tutor',
        'id_institucion_receptora',
        'id_persona_responsable_receptor',
        'carrera',
        'fecha_inicio',
        'fecha_fin',
        'horas_semanales',
        'actividades',
        'asignacion',
        'seguro',
        'estado',
    ];

    public function instrumento()
    {
        return $this->belongsTo(
            Instrumento::class,
            'id_instrumento',
            'id_instrumento'
        );
    }

    public function estudiante()
    {
        return $this->belongsTo(
            Persona::class,
            'id_persona_estudiante',
            'id_persona'
        );
    }

    public function tutor()
    {
        return $this->belongsTo(
            Persona::class,
            'id_persona_tutor',
            'id_persona'
        );
    }

    public function institucionReceptora()
    {
        return $this->belongsTo(
            Institucion::class,
            'id_institucion_receptora',
            'id_institucion'
        );
    }

    public function responsableReceptor()
    {
        return $this->belongsTo(
            Persona::class,
            'id_persona_responsable_receptor',
            'id_persona'
        );
    }
}
