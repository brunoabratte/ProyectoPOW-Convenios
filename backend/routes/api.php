<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\InstrumentoController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Rutas de instrumentos
Route::get('/instrumentos', [InstrumentoController::class, 'index']);
Route::post('/instrumentos', [InstrumentoController::class, 'store']);
Route::get('/instrumentos/{id}', [InstrumentoController::class, 'show']);
Route::put('/instrumentos/{id}', [InstrumentoController::class, 'update']);
Route::patch('/instrumentos/{id}/estado', [InstrumentoController::class, 'cambiarEstado']);
Route::get('/instrumentos/{id}/historial', [InstrumentoController::class, 'historial']);