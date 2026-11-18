<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Instrumento;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Carbon;

class AlertaController extends Controller
{
    public function index(Request $request)
    {
        $filtros = $request->validate([
            'dias' => 'sometimes|integer|min:1|max:365',
        ]);

        $dias = $filtros['dias'] ?? 30;

        $hoy = Carbon::today();

        $limite = $hoy->copy()->addDays($dias);

        // Obtener solamente instrumentos visibles para el usuario
        // que tengan fecha de vencimiento registrada.
        $instrumentos = Instrumento::visiblesPara(Auth::user())
            ->with(['tipoInstrumento', 'estado'])
            ->whereNotNull('fecha_vencimiento')
            ->get();

        $vencidos = [];
        $proximosAVencer = [];
        $enPreaviso = [];

        foreach ($instrumentos as $instrumento) {
            $vencimiento = Carbon::parse(
                $instrumento->fecha_vencimiento
            )->startOfDay();

            $plazoPreaviso = (int) ($instrumento->plazo_preaviso ?? 0);

            $fechaPreaviso = $vencimiento
                ->copy()
                ->subDays($plazoPreaviso);

            $item = [
                'id' => $instrumento->id_instrumento,
                'codigo' => $instrumento->codigo,
                'titulo' => $instrumento->titulo,
                'tipo' => $instrumento->tipoInstrumento,
                'estado' => $instrumento->estado,
                'fecha_vencimiento' => $vencimiento->toDateString(),
                'fecha_preaviso' => $fechaPreaviso->toDateString(),
                'link' => '/panel/convenios/' . $instrumento->id_instrumento,
            ];

            // 1. Instrumentos vencidos.
            if ($vencimiento->lt($hoy)) {
                $vencidos[] = $item;
                continue;
            }

            // 2. Instrumentos próximos a vencer.
            if ($vencimiento->lte($limite)) {
                $proximosAVencer[] = $item;
            }

            // 3. Instrumentos cuya fecha de preaviso ya llegó.
            if (
                $plazoPreaviso > 0 &&
                $fechaPreaviso->lte($hoy)
            ) {
                $enPreaviso[] = $item;
            }
        }

        return response()->json([
            'status' => 200,
            'mensaje' => 'Alertas obtenidas correctamente',
            'data' => [
                'dias_considerados' => $dias,
                'vencidos' => $vencidos,
                'proximos_a_vencer' => $proximosAVencer,
                'en_preaviso' => $enPreaviso,
                'totales' => [
                    'vencidos' => count($vencidos),
                    'proximos_a_vencer' => count($proximosAVencer),
                    'en_preaviso' => count($enPreaviso),
                ],
            ],
        ]);
    }
}
