<?php

namespace App\Models;

class Persona extends BaseModel
{
    protected $table = 'personas';
    protected $primaryKey = 'id_persona';

    protected $fillable = [
        'nombre',
        'apellido',
        'dni',
        'correo',
        'telefono',
        'id_institucion',
    ];

    public function institucion()
    {
        return $this->belongsTo(Institucion::class, 'id_institucion', 'id_institucion');
    }

    public function participaciones()
    {
        return $this->hasMany(ParticipacionPersona::class, 'id_persona', 'id_persona');
    }

    public function partesRepresentadas()
    {
        return $this->hasMany(Parte::class, 'id_persona_representante', 'id_persona');
    }

    public function pasantiasComoEstudiante()
    {
        return $this->hasMany(Pasantia::class, 'id_persona_estudiante', 'id_persona');
    }

    public function pasantiasComoTutor()
    {
        return $this->hasMany(Pasantia::class, 'id_persona_tutor', 'id_persona');
    }

    public function pasantiasComoResponsable()
    {
        return $this->hasMany(Pasantia::class, 'id_persona_responsable_receptor', 'id_persona');
    }
}
