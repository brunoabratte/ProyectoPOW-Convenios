<?php

namespace App\Models;

class Observacion extends BaseModel
{
    protected $table = 'observaciones';
    protected $primaryKey = 'id_observacion';

    protected $fillable = [
        'id_instrumento',
        'id_usuario',
        'id_estado_instrumento',
        'contenido',
        'estado',
        'respuesta',
        'id_usuario_respondio',
        'respondida_en',
        'id_usuario_resolvio',
        'resuelta_en',
    ];

    public function instrumento()
    {
        return $this->belongsTo(
            Instrumento::class,
            'id_instrumento',
            'id_instrumento'
        );
    }

    public function autor()
    {
        return $this->belongsTo(
            User::class,
            'id_usuario',
            'id_usuario'
        );
    }

    public function estadoInstrumento()
    {
        return $this->belongsTo(
            Estado::class,
            'id_estado_instrumento',
            'id_estado'
        );
    }

    public function usuarioRespondio()
    {
        return $this->belongsTo(
            User::class,
            'id_usuario_respondio',
            'id_usuario'
        );
    }

    public function usuarioResolvio()
    {
        return $this->belongsTo(
            User::class,
            'id_usuario_resolvio',
            'id_usuario'
        );
    }
}
