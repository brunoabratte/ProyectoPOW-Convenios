<?php

namespace App\Models;

class Auditoria extends BaseModel
{
    protected $table = 'auditorias';
    protected $primaryKey = 'id_auditoria';

    protected $fillable = [
        'id_usuario',
        'accion',
        'entidad',
        'entidad_id',
        'detalle',
        'ip',
    ];

    protected function casts(): array
    {
        return [
            'detalle' => 'array',
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
}
