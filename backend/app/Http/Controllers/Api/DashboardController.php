<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Instrumento;
use App\Models\ParticipacionPersona;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        $usuario = Auth::user();

        // Todos los cálculos parten de los instrumentos
        // visibles para el usuario autenticado.
        $instrumentos = Instrumento::visiblesPara($usuario);

        // Cantidad de instrumentos agrupados por estado.
        $porEstado = (clone $instrumentos)
            ->select(
                'id_estado',
                DB::raw('COUNT(*) as cantidad')
            )
            ->groupBy('id_estado')
            ->get();

        // Cantidad de instrumentos agrupados por tipo.
        $porTipo = (clone $instrumentos)
            ->select(
                'id_tipo_instrumento',
                DB::raw('COUNT(*) as cantidad')
            )
            ->groupBy('id_tipo_instrumento')
            ->get();

        // Cantidad de instrumentos agrupados por unidad.
        $porUnidad = (clone $instrumentos)
            ->select(
                'id_unidad',
                DB::raw('COUNT(*) as cantidad')
            )
            ->groupBy('id_unidad')
            ->get();

        // Cantidad de instrumentos agrupados por año de firma.
        $porAnio = (clone $instrumentos)
            ->whereNotNull('fecha_firma')
            ->select(
                DB::raw('YEAR(fecha_firma) as anio'),
                DB::raw('COUNT(*) as cantidad')
            )
            ->groupBy(DB::raw('YEAR(fecha_firma)'))
            ->orderBy('anio')
            ->get();

        // Instrumentos firmados y actualmente vigentes.
        // En este proyecto, el estado 4 corresponde a "firmado".
        $hoy = Carbon::today()->toDateString();

        $firmadosVigentes = (clone $instrumentos)
            ->where('id_estado', 4)
            ->whereNotNull('fecha_firma')
            ->whereNotNull('fecha_inicio')
            ->whereDate('fecha_inicio', '<=', $hoy)
            ->where(function ($query) use ($hoy) {
                $query->whereNull('fecha_vencimiento')
                    ->orWhereDate('fecha_vencimiento', '>=', $hoy);
            })
            ->count();

        // Cantidad total de personas distintas vinculadas
        // a los instrumentos visibles para el usuario.
        $personasVinculadas = ParticipacionPersona::query()
            ->whereIn(
                'id_instrumento',
                (clone $instrumentos)->select('id_instrumento')
            )
            ->distinct()
            ->count('id_persona');

        return response()->json([
            'status' => 200,
            'mensaje' => 'Dashboard obtenido correctamente',
            'data' => [
                'total_instrumentos' => (clone $instrumentos)->count(),

                'por_estado' => $porEstado,

                'por_tipo' => $porTipo,

                'firmados_vigentes' => $firmadosVigentes,

                'por_unidad' => $porUnidad,

                'por_anio_firma' => $porAnio,

                'personas_vinculadas' => $personasVinculadas,
            ]
        ]);
    }
}
