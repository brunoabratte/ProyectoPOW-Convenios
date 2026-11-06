<?php

namespace App\Models;

class Instrumento extends BaseModel
{
    protected $table = 'instrumentos';
    protected $primaryKey = 'id_instrumento';

    protected $fillable = [
        'codigo',
        'titulo',
        'id_tipo_instrumento',
        'id_unidad',
        'id_estado',
        'objeto',
        'alcance',
        'obligaciones',
        'rescision',
        'marco_legal',
        'resolucion',
        'expediente_referencia',
        'condiciones_renovacion',
        'confidencialidad',
        'notas',
        'fecha_firma',
        'fecha_inicio',
        'fecha_vencimiento',
        'plazo_preaviso',
        'version',
        'id_usuario_creador',
    ];

    public function tipoInstrumento()
    {
        return $this->belongsTo(
            TipoInstrumento::class,
            'id_tipo_instrumento',
            'id_tipo_instrumento'
        );
    }

    public function unidad()
    {
        return $this->belongsTo(
            Unidad::class,
            'id_unidad',
            'id_unidad'
        );
    }

    public function estado()
    {
        return $this->belongsTo(
            Estado::class,
            'id_estado',
            'id_estado'
        );
    }

    public function creador()
    {
        return $this->belongsTo(
            User::class,
            'id_usuario_creador',
            'id_usuario'
        );
    }

    public function partes()
    {
        return $this->hasMany(
            Parte::class,
            'id_instrumento',
            'id_instrumento'
        );
    }

    public function documentos()
    {
        return $this->hasMany(
            Documento::class,
            'id_instrumento',
            'id_instrumento'
        );
    }

    public function participaciones()
    {
        return $this->hasMany(
            ParticipacionPersona::class,
            'id_instrumento',
            'id_instrumento'
        );
    }

    public function pasantias()
    {
        return $this->hasMany(
            Pasantia::class,
            'id_instrumento',
            'id_instrumento'
        );
    }

    public function historialEstados()
    {
        return $this->hasMany(
            HistorialEstado::class,
            'id_instrumento',
            'id_instrumento'
        );
    }

    public function observaciones()
    {
        return $this->hasMany(
            Observacion::class,
            'id_instrumento',
            'id_instrumento'
        );
    }

    public function notificaciones()
    {
        return $this->hasMany(
            Notificacion::class,
            'id_instrumento',
            'id_instrumento'
        );
    }

    public function relacionesOrigen()
    {
        return $this->hasMany(
            InstrumentoRelacion::class,
            'id_instrumento_origen',
            'id_instrumento'
        );
    }

    public function relacionesDestino()
    {
        return $this->hasMany(
            InstrumentoRelacion::class,
            'id_instrumento_destino',
            'id_instrumento'
        );
    }
}
