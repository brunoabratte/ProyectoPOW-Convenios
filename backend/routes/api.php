
<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\InstrumentoController;
use App\Http\Controllers\Api\InstitucionController;
use App\Http\Controllers\Api\PersonaController;
use App\Http\Controllers\Api\ParteController;
use App\Http\Controllers\Api\InstrumentoRelacionController;
use App\Http\Controllers\Api\ParticipacionPersonaController;
use App\Http\Controllers\Api\PasantiaController;
use App\Http\Controllers\Api\DocumentoController;
use App\Http\Controllers\Api\ObservacionController;
use App\Http\Controllers\Api\AuditoriaController;
use App\Http\Controllers\Api\AuthController;

// Inicio de sesión: única ruta pública
Route::post('/login', [AuthController::class, 'login']);

// Todas las demás rutas requieren autenticación
Route::middleware('auth:sanctum')->group(function () {

    // Usuario autenticado y sesión
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Instrumentos
    Route::get('/instrumentos', [InstrumentoController::class, 'index']);
    Route::post('/instrumentos', [InstrumentoController::class, 'store']);
    Route::get('/instrumentos/{id}', [InstrumentoController::class, 'show']);
    Route::put('/instrumentos/{id}', [InstrumentoController::class, 'update']);
    Route::patch('/instrumentos/{id}/estado', [InstrumentoController::class, 'cambiarEstado']);
    Route::get('/instrumentos/{id}/historial', [InstrumentoController::class, 'historial']);

    // Instituciones
    Route::get('/instituciones', [InstitucionController::class, 'index']);
    Route::get('/instituciones/{id}', [InstitucionController::class, 'show']);
    Route::post('/instituciones', [InstitucionController::class, 'store']);
    Route::put('/instituciones/{id}', [InstitucionController::class, 'update']);

    // Personas
    Route::get('/personas', [PersonaController::class, 'index']);
    Route::get('/personas/{id}', [PersonaController::class, 'show']);
    Route::post('/personas', [PersonaController::class, 'store']);
    Route::put('/personas/{id}', [PersonaController::class, 'update']);

    // Partes
    Route::get('/partes', [ParteController::class, 'index']);
    Route::get('/partes/{id}', [ParteController::class, 'show']);
    Route::post('/partes', [ParteController::class, 'store']);
    Route::put('/partes/{id}', [ParteController::class, 'update']);

    // Relaciones entre instrumentos
    Route::get('/instrumentos-relaciones', [InstrumentoRelacionController::class, 'index']);
    Route::get('/instrumentos-relaciones/{id}', [InstrumentoRelacionController::class, 'show']);
    Route::post('/instrumentos-relaciones', [InstrumentoRelacionController::class, 'store']);
    Route::put('/instrumentos-relaciones/{id}', [InstrumentoRelacionController::class, 'update']);

    // Participaciones de personas
    Route::get('/participaciones-personas', [ParticipacionPersonaController::class, 'index']);
    Route::get('/participaciones-personas/{id}', [ParticipacionPersonaController::class, 'show']);
    Route::post('/participaciones-personas', [ParticipacionPersonaController::class, 'store']);
    Route::put('/participaciones-personas/{id}', [ParticipacionPersonaController::class, 'update']);

    // Pasantías
    Route::get('/pasantias', [PasantiaController::class, 'index']);
    Route::get('/pasantias/{id}', [PasantiaController::class, 'show']);
    Route::post('/pasantias', [PasantiaController::class, 'store']);
    Route::put('/pasantias/{id}', [PasantiaController::class, 'update']);

    // Documentos
    Route::get('/documentos', [DocumentoController::class, 'index']);
    Route::get('/documentos/{id}', [DocumentoController::class, 'show']);
    Route::post('/documentos', [DocumentoController::class, 'store']);
    Route::post('/documentos/{id}/versiones', [DocumentoController::class, 'nuevaVersion']);
    Route::get('/documentos/{id}/descargar', [DocumentoController::class, 'descargar']);

    // Observaciones
    Route::get('/observaciones', [ObservacionController::class, 'index']);
    Route::get('/observaciones/{id}', [ObservacionController::class, 'show']);
    Route::post('/observaciones', [ObservacionController::class, 'store']);
    Route::put('/observaciones/{id}/responder', [ObservacionController::class, 'responder']);
    Route::put('/observaciones/{id}/resolver', [ObservacionController::class, 'resolver']);

    // Auditorías
    Route::get('/auditorias', [AuditoriaController::class, 'index']);
    Route::get('/auditorias/{id}', [AuditoriaController::class, 'show']);

});
