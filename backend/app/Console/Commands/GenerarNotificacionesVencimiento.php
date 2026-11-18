<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Carbon;
use App\Models\Instrumento;
use App\Models\Notificacion;

class GenerarNotificacionesVencimiento extends Command
{
    protected $signature = 'notificaciones:generar-vencimientos';

    protected $description = 'Generar notificaciones de preaviso y vencimiento de convenios';

    public function handle()
    {
        $hoy = Carbon::today();

        // Obtener instrumentos firmados que tienen fecha de vencimiento.
        $instrumentos = Instrumento::whereNotNull('fecha_vencimiento')
            ->whereHas('estado', function ($query) {
                $query->where('nombre', 'firmado');
            })
            ->get();

        $generadas = 0;

        foreach ($instrumentos as $instrumento) {

            // Solo notificar si existe un usuario creador.
            if (!$instrumento->id_usuario_creador) {
                continue;
            }

            $idUsuario = $instrumento->id_usuario_creador;

            // Calcular la fecha del preaviso.
            if (
                $instrumento->plazo_preaviso !== null &&
                Carbon::parse($instrumento->fecha_vencimiento)
                    ->subDays((int) $instrumento->plazo_preaviso)
                    ->isSameDay($hoy)
            ) {
                $existePreaviso = Notificacion::where('id_usuario', $idUsuario)
                    ->where('id_instrumento', $instrumento->id_instrumento)
                    ->where('tipo', 'preaviso')
                    ->whereDate('created_at', $hoy)
                    ->exists();

                if (!$existePreaviso) {
                    Notificacion::create([
                        'id_usuario' => $idUsuario,
                        'id_instrumento' => $instrumento->id_instrumento,
                        'tipo' => 'preaviso',
                        'mensaje' => "El convenio {$instrumento->codigo} está próximo a vencer.",
                    ]);

                    $generadas++;
                }
            }

            // Comprobar si el convenio vence hoy.
            if (Carbon::parse($instrumento->fecha_vencimiento)->isSameDay($hoy)) {

                $existeVencimiento = Notificacion::where('id_usuario', $idUsuario)
                    ->where('id_instrumento', $instrumento->id_instrumento)
                    ->where('tipo', 'vencimiento')
                    ->whereDate('created_at', $hoy)
                    ->exists();

                if (!$existeVencimiento) {
                    Notificacion::create([
                        'id_usuario' => $idUsuario,
                        'id_instrumento' => $instrumento->id_instrumento,
                        'tipo' => 'vencimiento',
                        'mensaje' => "El convenio {$instrumento->codigo} vence hoy.",
                    ]);

                    $generadas++;
                }
            }
        }

        $this->info("Proceso finalizado. Notificaciones generadas: {$generadas}");

        return Command::SUCCESS;
    }
}
