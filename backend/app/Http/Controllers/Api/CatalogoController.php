<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Unidad;
use App\Models\TipoInstrumento;
use App\Models\Estado;
use Illuminate\Support\Facades\Auth;

class CatalogoController extends Controller
{
    public function unidades()
    {
        $usuario = Auth::user();

        $query = Unidad::query();

        // Si el usuario no tiene alcance global,
        // solamente puede consultar su propia unidad.
        if (!$usuario->tieneAlcanceGlobal()) {
            $query->where('id_unidad', $usuario->id_unidad);
        }

        $unidades = $query->orderBy('nombre')->get();

        return response()->json([
            'status' => 'success',
            'mensaje' => 'Unidades obtenidas correctamente',
            'data' => $unidades
        ]);
    }

    public function tiposInstrumento()
    {
        $tipos = TipoInstrumento::query()
            ->orderBy('nombre')
            ->get();

        return response()->json([
            'status' => 'success',
            'mensaje' => 'Tipos de instrumento obtenidos correctamente',
            'data' => $tipos
        ]);
    }

    public function estados()
    {
        $estados = Estado::query()
            ->orderBy('id_estado')
            ->get();

        return response()->json([
            'status' => 'success',
            'mensaje' => 'Estados obtenidos correctamente',
            'data' => $estados
        ]);
    }
}
