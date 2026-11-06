<?php

namespace App\Models;

class Notificacion extends BaseModel
{
    protected $table = 'notificaciones';
    protected $primaryKey = 'id_notificacion';

    protected $fillable = [
        'id_usuario',
        'id_instrumento',
        'tipo',
        'mensaje',
        'leida_en',
    ];

    protected function casts(): array
    {
        return [
            'leida_en' => 'datetime',
        ];
    }

    public function usuario()
    {
        return $this->belongsTo(
            User::class,
            'id_usuario',
            'id_usuario'
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
