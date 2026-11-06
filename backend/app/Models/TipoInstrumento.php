<?php

namespace App\Models;

class TipoInstrumento extends BaseModel
{
    protected $table = 'tipos_instrumento';
    protected $primaryKey = 'id_tipo_instrumento';

    protected $fillable = [
        'nombre',
        'descripcion',
    ];

    public function instrumentos()
    {
        return $this->hasMany(
            Instrumento::class,
            'id_tipo_instrumento',
            'id_tipo_instrumento'
        );
    }
}
