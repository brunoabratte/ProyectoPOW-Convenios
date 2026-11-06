<?php

namespace App\Models;

class InstrumentoRelacion extends BaseModel
{
    protected $table = 'instrumentos_relaciones';
    protected $primaryKey = 'id_instrumento_relacion';

    protected $fillable = [
        'id_instrumento_origen',
        'id_instrumento_destino',
        'tipo_relacion',
        'descripcion',
    ];

    public function instrumentoOrigen()
    {
        return $this->belongsTo(
            Instrumento::class,
            'id_instrumento_origen',
            'id_instrumento'
        );
    }

    public function instrumentoDestino()
    {
        return $this->belongsTo(
            Instrumento::class,
            'id_instrumento_destino',
            'id_instrumento'
        );
    }
}
