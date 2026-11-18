<?php

namespace App\Models;
use App\Models\InstrumentoRelacion;

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


    // GET /instrumentos/{id}/relaciones
    public function relaciones(int $id)
    {
        $usuario = Auth::user();

        // Buscar el instrumento respetando el alcance del usuario
        $instrumento = Instrumento::visiblesPara($usuario)
            ->findOrFail($id);

        // Relaciones donde el instrumento es el origen
        $comoOrigen = InstrumentoRelacion::with([
            'instrumentoDestino.tipoInstrumento',
            'instrumentoDestino.estado',
        ])
            ->where('id_instrumento_origen', $id)
            ->whereHas('instrumentoDestino', function ($query) use ($usuario) {
                $query->visiblesPara($usuario);
            })
            ->get()
            ->map(function ($relacion) {
                return [
                    'id_relacion' => $relacion->id_instrumento_relacion,
                    'tipo_relacion' => $relacion->tipo_relacion,
                    'descripcion' => $relacion->descripcion,
                    'direccion' => 'origen',
                    'instrumento' => [
                        'id' => $relacion->instrumentoDestino->id_instrumento,
                        'codigo' => $relacion->instrumentoDestino->codigo,
                        'titulo' => $relacion->instrumentoDestino->titulo,
                        'tipo' => $relacion->instrumentoDestino->tipoInstrumento?->nombre,
                        'estado' => $relacion->instrumentoDestino->estado?->nombre,
                    ],
                ];
            });

        // Relaciones donde el instrumento es el destino
        $comoDestino = InstrumentoRelacion::with([
            'instrumentoOrigen.tipoInstrumento',
            'instrumentoOrigen.estado',
        ])
            ->where('id_instrumento_destino', $id)
            ->whereHas('instrumentoOrigen', function ($query) use ($usuario) {
                $query->visiblesPara($usuario);
            })
            ->get()
            ->map(function ($relacion) {
                return [
                    'id_relacion' => $relacion->id_instrumento_relacion,
                    'tipo_relacion' => $relacion->tipo_relacion,
                    'descripcion' => $relacion->descripcion,
                    'direccion' => 'destino',
                    'instrumento' => [
                        'id' => $relacion->instrumentoOrigen->id_instrumento,
                        'codigo' => $relacion->instrumentoOrigen->codigo,
                        'titulo' => $relacion->instrumentoOrigen->titulo,
                        'tipo' => $relacion->instrumentoOrigen->tipoInstrumento?->nombre,
                        'estado' => $relacion->instrumentoOrigen->estado?->nombre,
                    ],
                ];
            });

        return response()->json([
            'status' => true,
            'mensaje' => 'Relaciones del instrumento obtenidas correctamente.',
            'data' => [
                'instrumento' => [
                    'id' => $instrumento->id_instrumento,
                    'codigo' => $instrumento->codigo,
                    'titulo' => $instrumento->titulo,
                ],
                'relaciones' => $comoOrigen
                    ->concat($comoDestino)
                    ->values(),
            ],
        ]);
    }

}
