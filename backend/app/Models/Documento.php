<?php

namespace App\Models;

class Documento extends BaseModel
{
    protected $table = 'documentos';
    protected $primaryKey = 'id_documento';

    protected $fillable = [
        'id_instrumento',
        'id_usuario_subio',
        'id_documento_anterior',
        'nombre',
        'tipo_documento',
        'formato',
        'ruta_archivo',
        'tamanio',
        'hash_sha256',
        'version',
    ];

    public function instrumento()
    {
        return $this->belongsTo(
            Instrumento::class,
            'id_instrumento',
            'id_instrumento'
        );
    }

    public function usuarioSubio()
    {
        return $this->belongsTo(
            User::class,
            'id_usuario_subio',
            'id_usuario'
        );
    }

    public function documentoAnterior()
    {
        return $this->belongsTo(
            Documento::class,
            'id_documento_anterior',
            'id_documento'
        );
    }

    public function versionSiguiente()
    {
        return $this->hasOne(
            Documento::class,
            'id_documento_anterior',
            'id_documento'
        );
    }
}
