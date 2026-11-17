<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Instrumento;
use App\Models\Estado;
use App\Models\HistorialEstado;
use App\Services\AuditoriaService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Illuminate\Support\Carbon;
use Illuminate\Validation\ValidationException;

class InstrumentoController extends Controller
{
    // Listar instrumentos con filtros y paginación.
    public function index(Request $request)
    {
        $this->authorize('viewAny', Instrumento::class);

        $filtros = $this->validarFiltros($request);

        $instrumentos = $this->consultaFiltrada($filtros)
            ->with(['tipoInstrumento', 'unidad', 'estado'])
            ->orderBy('id_instrumento')
            ->paginate($filtros['per_page'] ?? 15);

        $instrumentos->getCollection()->transform(function ($instrumento) {
            $instrumento->setAttribute(
                'vigencia',
                $instrumento->fecha_vencimiento
                    ? $instrumento->fecha_vencimiento
                    : 'sin vencimiento registrado'
            );

            return $instrumento;
        });

        return response()->json([
            'status' => 200,
            'mensaje' => 'Instrumentos obtenidos correctamente',
            'data' => $instrumentos->items(),
            'paginacion' => [
                'pagina_actual' => $instrumentos->currentPage(),
                'por_pagina' => $instrumentos->perPage(),
                'total' => $instrumentos->total(),
                'ultima_pagina' => $instrumentos->lastPage(),
            ],
        ]);
    }

    // Exportar instrumentos visibles para el usuario en formato CSV.
    public function exportar(Request $request): StreamedResponse
    {
        $this->authorize('viewAny', Instrumento::class);

        $filtros = $this->validarFiltros($request);
        $query = $this->consultaFiltrada($filtros)
            ->with(['tipoInstrumento', 'unidad', 'estado'])
            ->orderBy('id_instrumento');

        AuditoriaService::registrar(
            'exportar',
            'instrumentos',
            null,
            [
                'formato' => 'CSV',
                'filtros' => $filtros,
                'cantidad' => (clone $query)->count(),
            ]
        );

        $nombreArchivo = 'instrumentos_' . now()->format('Ymd_His') . '.csv';

        return response()->streamDownload(function () use ($query) {
            $salida = fopen('php://output', 'w');

            // BOM para que Excel interprete correctamente UTF-8.
            fwrite($salida, "\xEF\xBB\xBF");

            fputcsv($salida, [
                'ID',
                'Código',
                'Título',
                'Tipo de instrumento',
                'Unidad',
                'Estado',
                'Fecha de firma',
                'Fecha de inicio',
                'Fecha de vencimiento',
                'Vigencia',
            ], ',', '"', '\\');

            $query->chunkById(500, function ($instrumentos) use ($salida) {
                foreach ($instrumentos as $instrumento) {
                    $fila = [
                        $instrumento->id_instrumento,
                        $instrumento->codigo,
                        $instrumento->titulo,
                        $instrumento->tipoInstrumento?->nombre,
                        $instrumento->unidad?->nombre,
                        $instrumento->estado?->nombre,
                        $instrumento->fecha_firma,
                        $instrumento->fecha_inicio,
                        $instrumento->fecha_vencimiento,
                        $instrumento->fecha_vencimiento
                            ? $instrumento->fecha_vencimiento
                            : 'sin vencimiento registrado',
                    ];

                    $fila = array_map(
                        fn ($valor) => $this->neutralizarCeldaCsv($valor),
                        $fila
                    );

                    fputcsv($salida, $fila, ',', '"', '\\');
                }
            }, 'id_instrumento', 'id_instrumento');

            fclose($salida);
        }, $nombreArchivo, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Cache-Control' => 'no-store, no-cache, must-revalidate',
        ]);
    }

    // Valida los filtros compartidos por el listado y la exportación.
    private function validarFiltros(Request $request): array
    {
        return $request->validate([
            'q' => ['sometimes', 'nullable', 'string', 'max:255'],
            'tipo_instrumento_id' => [
                'sometimes', 'nullable', 'integer',
                'exists:tipos_instrumento,id_tipo_instrumento',
            ],
            'estado_id' => [
                'sometimes', 'nullable', 'integer',
                'exists:estados,id_estado',
            ],
            'id_unidad' => [
                'sometimes', 'nullable', 'integer',
                'exists:unidades,id_unidad',
            ],
            'fecha_desde' => ['sometimes', 'nullable', 'date'],
            'fecha_hasta' => [
                'sometimes', 'nullable', 'date',
                'after_or_equal:fecha_desde',
            ],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:100'],
        ]);
    }

    // Construye una consulta respetando siempre el alcance del usuario.
    private function consultaFiltrada(array $filtros)
    {
        $query = Instrumento::visiblesPara(Auth::user());

        if (!empty($filtros['q'])) {
            $termino = trim($filtros['q']);

            $query->where(function ($subconsulta) use ($termino) {
                $subconsulta
                    ->where('codigo', 'like', '%' . $termino . '%')
                    ->orWhere('titulo', 'like', '%' . $termino . '%');
            });
        }

        if (!empty($filtros['tipo_instrumento_id'])) {
            $query->where(
                'id_tipo_instrumento',
                $filtros['tipo_instrumento_id']
            );
        }

        if (!empty($filtros['estado_id'])) {
            $query->where('id_estado', $filtros['estado_id']);
        }

        if (!empty($filtros['id_unidad'])) {
            $query->where('id_unidad', $filtros['id_unidad']);
        }

        if (!empty($filtros['fecha_desde'])) {
            $query->whereDate('fecha_firma', '>=', $filtros['fecha_desde']);
        }

        if (!empty($filtros['fecha_hasta'])) {
            $query->whereDate('fecha_firma', '<=', $filtros['fecha_hasta']);
        }

        return $query;
    }

    // Evita que una celda CSV sea interpretada como fórmula por una planilla.
    private function neutralizarCeldaCsv($valor): string
    {
        $valor = (string) ($valor ?? '');

        if ($valor !== '' && preg_match('/^[=+@\\-\\t\\r]/', $valor)) {
            return "'" . $valor;
        }

        return $valor;
    }

    // Consultar un instrumento específico
    public function show($id)
    {
        $instrumento = Instrumento::visiblesPara(Auth::user())
            ->with([
                'tipoInstrumento',
                'unidad',
                'estado',
                'creador',
                'partes',
                'documentos'
            ])
            ->findOrFail($id);

        $this->authorize('view', $instrumento);

        return response()->json([
            'status' => 200,
            'mensaje' => 'Instrumento obtenido correctamente',
            'data' => $instrumento
        ]);
    }

    // Actualizar un instrumento
    public function update(Request $request, $id)
    {
        $instrumento = Instrumento::visiblesPara(Auth::user())
            ->findOrFail($id);

        $this->authorize('update', $instrumento);

        if ($instrumento->estado->nombre !== 'borrador') {
            return response()->json([
                'status' => 403,
                'mensaje' => 'Solo se pueden modificar instrumentos en estado borrador.'
            ], 403);
        }

        $datos = $request->validate([
            'version' => ['required', 'integer', 'min:1'],
            'codigo' => 'sometimes|required|string|max:50|unique:instrumentos,codigo,' . $id . ',id_instrumento',
            'titulo' => 'sometimes|required|string|max:255',
            'id_tipo_instrumento' => 'sometimes|required|exists:tipos_instrumento,id_tipo_instrumento',
            'id_unidad' => 'sometimes|required|exists:unidades,id_unidad',

            'objeto' => 'nullable|string',
            'alcance' => 'nullable|string',
            'obligaciones' => 'nullable|string',
            'rescision' => 'nullable|string',
            'marco_legal' => 'nullable|string',
            'resolucion' => 'nullable|string',
            'expediente_referencia' => 'nullable|string',
            'condiciones_renovacion' => 'nullable|string',
            'confidencialidad' => 'nullable|string',
            'notas' => 'nullable|string',

            'fecha_firma' => 'nullable|date',
            'fecha_inicio' => 'nullable|date',
            'fecha_vencimiento' => 'nullable|date',

            'plazo_preaviso' => 'nullable|integer|min:0',
        ]);

        // Control optimista: rechazar cambios basados en una versión vieja.
        if ((int) $datos['version'] !== (int) $instrumento->version) {
            return response()->json([
                'status' => 409,
                'mensaje' => 'El instrumento fue modificado por otra persona. Actualizá los datos e intentá nuevamente.',
                'version_actual' => $instrumento->version,
            ], 409);
        }

        unset($datos['version']);

        // Validar que el vencimiento no sea anterior al inicio.
        $fechaInicio = $datos['fecha_inicio'] ?? $instrumento->fecha_inicio;
        $fechaVencimiento = $datos['fecha_vencimiento'] ?? $instrumento->fecha_vencimiento;

        if (
            $fechaInicio &&
            $fechaVencimiento &&
            Carbon::parse($fechaVencimiento)->lt(Carbon::parse($fechaInicio))
        ) {
            throw ValidationException::withMessages([
                'fecha_vencimiento' => [
                    'La fecha de vencimiento no puede ser anterior a la fecha de inicio.'
                ]
            ]);
        }

        // Un usuario con unidad asignada no puede mover
        // instrumentos a otra unidad.
        if (
            array_key_exists('id_unidad', $datos)
            && !Auth::user()->puedeAccederAUnidad((int) $datos['id_unidad'])
        ) {
            throw ValidationException::withMessages([
                'id_unidad' => 'No tenés permisos para asignar el instrumento a esa unidad.'
            ]);
        }

        DB::transaction(function () use ($instrumento, $datos) {
            $instrumentoBloqueado = Instrumento::whereKey($instrumento->getKey())
                ->lockForUpdate()
                ->firstOrFail();

            // Revalidar dentro de la transacción para evitar actualizaciones simultáneas.
            if ((int) $instrumentoBloqueado->version !== (int) $instrumento->version) {
                abort(409, 'El instrumento fue modificado por otra persona. Actualizá los datos e intentá nuevamente.');
            }

            $instrumentoBloqueado->update([
                ...$datos,
                'version' => $instrumentoBloqueado->version + 1,
            ]);

            $instrumento->refresh();

            AuditoriaService::registrar(
                'actualizar',
                'instrumentos',
                $instrumento->id_instrumento,
                [
                    'campos_modificados' => array_keys($datos),
                    'codigo' => $instrumento->codigo,
                    'titulo' => $instrumento->titulo
                ]
            );
        });

        return response()->json([
            'status' => 200,
            'mensaje' => 'Instrumento actualizado correctamente',
            'data' => $instrumento->fresh()->load([
                'tipoInstrumento',
                'unidad',
                'estado'
            ])
        ]);
    }

    // Registrar un instrumento
    public function store(Request $request)
    {
        $this->authorize('create', Instrumento::class);

        $datos = $request->validate([
            'codigo' => 'required|string|max:50|unique:instrumentos,codigo',
            'titulo' => 'required|string|max:255',
            'id_tipo_instrumento' => 'required|exists:tipos_instrumento,id_tipo_instrumento',
            'id_unidad' => 'required|exists:unidades,id_unidad',

            'objeto' => 'nullable|string',
            'alcance' => 'nullable|string',
            'obligaciones' => 'nullable|string',
            'rescision' => 'nullable|string',
            'marco_legal' => 'nullable|string',
            'resolucion' => 'nullable|string',
            'expediente_referencia' => 'nullable|string',
            'condiciones_renovacion' => 'nullable|string',
            'confidencialidad' => 'nullable|string',
            'notas' => 'nullable|string',

            'fecha_firma' => 'nullable|date',
            'fecha_inicio' => 'nullable|date',
            'fecha_vencimiento' => 'nullable|date|after_or_equal:fecha_inicio',

            'plazo_preaviso' => 'nullable|integer|min:0',
        ]);

        // Gestión solo puede crear instrumentos en su propia unidad.
        if (!Auth::user()->puedeAccederAUnidad((int) $datos['id_unidad'])) {
            throw ValidationException::withMessages([
                'id_unidad' => 'No tenés permisos para crear instrumentos en esa unidad.'
            ]);
        }

        $estadoBorrador = Estado::where('nombre', 'borrador')->firstOrFail();

        $instrumento = DB::transaction(function () use ($datos, $estadoBorrador) {
            $nuevoInstrumento = Instrumento::create([
                ...$datos,
                'id_estado' => $estadoBorrador->id_estado,
                'version' => 1,
                'id_usuario_creador' => Auth::id(),
            ]);

            AuditoriaService::registrar(
                'crear',
                'instrumentos',
                $nuevoInstrumento->id_instrumento,
                [
                    'codigo' => $nuevoInstrumento->codigo,
                    'titulo' => $nuevoInstrumento->titulo,
                    'estado_inicial' => 'borrador'
                ]
            );

            return $nuevoInstrumento;
        });

        return response()->json([
            'status' => 201,
            'mensaje' => 'Instrumento creado correctamente',
            'data' => $instrumento->load([
                'tipoInstrumento',
                'unidad',
                'estado'
            ])
        ], 201);
    }

    // Cambiar el estado de un instrumento
    public function cambiarEstado(Request $request, $id)
    {
        $instrumento = Instrumento::visiblesPara(Auth::user())
            ->findOrFail($id);

        $datos = $request->validate([
            'id_estado_nuevo' => 'required|exists:estados,id_estado',
            'fundamento' => 'required|string|max:1000',
            'fecha_firma' => 'sometimes|nullable|date',
        ]);

        $estadoActual = $instrumento->estado->nombre;
        $estadoNuevo = Estado::findOrFail($datos['id_estado_nuevo']);

        $transicionesPermitidas = [
            'borrador' => ['revision'],
            'revision' => ['borrador', 'aprobado'],
            'aprobado' => ['firmado'],
            'firmado' => ['rescindido', 'archivado'],
            'rescindido' => ['archivado'],
            'archivado' => [],
        ];

        if (!in_array(
            $estadoNuevo->nombre,
            $transicionesPermitidas[$estadoActual] ?? []
        )) {
            return response()->json([
                'status' => 422,
                'mensaje' => "No está permitido pasar de {$estadoActual} a {$estadoNuevo->nombre}."
            ], 422);
        }

        // Gestión puede enviar un borrador a revisión.
        if ($estadoActual === 'borrador' && $estadoNuevo->nombre === 'revision') {
            $this->authorize('update', $instrumento);
        }
        // Revisión puede aprobar o devolver para corrección.
        elseif (
            $estadoActual === 'revision'
            && in_array($estadoNuevo->nombre, ['borrador', 'aprobado'])
        ) {
            $this->authorize('gestionarRevision', $instrumento);

            // Para aprobar, el instrumento debe tener al menos dos partes.
            if ($estadoNuevo->nombre === 'aprobado') {
                $cantidadPartes = $instrumento->partes()->count();

                if ($cantidadPartes < 2) {
                    throw ValidationException::withMessages([
                        'partes' => [
                            'No se puede aprobar el instrumento porque debe tener al menos dos partes registradas.'
                        ]
                    ]);
                }
            }
        }
        // Gestión registra la firma del instrumento aprobado.
        elseif ($estadoActual === 'aprobado' && $estadoNuevo->nombre === 'firmado') {
            abort_unless(
                Auth::user()->esGestion()
                    && Auth::user()->puedeAccederAInstrumento($instrumento),
                403,
                'Solo Gestión de la unidad correspondiente puede registrar la firma.'
            );

            if (empty($datos['fecha_firma'])) {
                throw ValidationException::withMessages([
                    'fecha_firma' => ['La fecha de firma es obligatoria para pasar a firmado.']
                ]);
            }
        }
        // Gestión o Administración pueden rescindir.
        elseif ($estadoActual === 'firmado' && $estadoNuevo->nombre === 'rescindido') {
            abort_unless(
                (Auth::user()->esGestion() || Auth::user()->esAdministracion())
                    && Auth::user()->puedeAccederAInstrumento($instrumento),
                403,
                'No tenés permisos para rescindir este instrumento.'
            );
        }
        // Solo Administración puede archivar.
        elseif (
            in_array($estadoActual, ['aprobado', 'firmado', 'rescindido'])
            && $estadoNuevo->nombre === 'archivado'
        ) {
            abort_unless(
                Auth::user()->esAdministracion()
                    && Auth::user()->puedeAccederAInstrumento($instrumento),
                403,
                'Solo Administración puede archivar instrumentos.'
            );
        }
        else {
            abort(403, 'Tu rol no tiene permisos para realizar este cambio de estado.');
        }

        $estadoAnterior = $instrumento->id_estado;
        $usuarioId = Auth::id();

        DB::transaction(function () use (
            $instrumento,
            $datos,
            $estadoAnterior,
            $estadoNuevo,
            $estadoActual,
            $usuarioId
        ) {
            $actualizacion = [
                'id_estado' => $datos['id_estado_nuevo'],
                'version' => $instrumento->version + 1,
            ];

            if ($estadoNuevo->nombre === 'firmado') {
                $actualizacion['fecha_firma'] = $datos['fecha_firma'];
            }

            $instrumento->update($actualizacion);

            HistorialEstado::create([
                'id_instrumento' => $instrumento->id_instrumento,
                'id_estado_anterior' => $estadoAnterior,
                'id_estado_nuevo' => $datos['id_estado_nuevo'],
                'id_usuario' => $usuarioId,
                'fundamento' => $datos['fundamento'],
            ]);

            AuditoriaService::registrar(
                'cambiar_estado',
                'instrumentos',
                $instrumento->id_instrumento,
                [
                    'estado_anterior' => $estadoActual,
                    'estado_nuevo' => $estadoNuevo->nombre,
                    'fundamento' => $datos['fundamento']
                ],
                $usuarioId
            );
        });

        return response()->json([
            'status' => 200,
            'mensaje' => 'Estado actualizado correctamente.',
            'data' => $instrumento->fresh()->load('estado'),
            'historial' => $instrumento->historialEstados()->latest()->first()
        ]);
    }

    // Consultar historial de estados de un instrumento
    public function historial($id)
    {
        $instrumento = Instrumento::visiblesPara(Auth::user())
            ->findOrFail($id);

        $this->authorize('view', $instrumento);

        $historial = $instrumento->historialEstados()
            ->with([
                'estadoAnterior',
                'estadoNuevo',
                'usuario'
            ])
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json([
            'status' => 200,
            'mensaje' => 'Historial obtenido correctamente',
            'data' => $historial
        ]);
    }
}
