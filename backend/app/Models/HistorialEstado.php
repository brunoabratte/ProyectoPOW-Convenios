<?php

namespace App\Models;

class HistorialEstado extends BaseModel
{
    protected $table = 'historial_estados';
    protected $primaryKey = 'id_historial_estado';

    protected $fillable = [
        'id_instrumento',
        'id_estado_anterior',
        'id_estado_nuevo',
        'id_usuario',
        'fundamento',
    ];

    public function instrumento()
    {
        return $this->belongsTo(
            Instrumento::class,
            'id_instrumento',
            'id_instrumento'
        );
    }

    public function estadoAnterior()
    {
        return $this->belongsTo(
            Estado::class,
            'id_estado_anterior',
            'id_estado'
        );
    }

    public function estadoNuevo()
    {
        return $this->belongsTo(
            Estado::class,
            'id_estado_nuevo',
            'id_estado'
        );
    }

    public function usuario()
    {
        return $this->belongsTo(
            User::class,
            'id_usuario',
            'id_usuario'
        );
    }
}
