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
use Illuminate\Support\Carbon;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\StreamedResponse;

class InstrumentoController extends Controller
{
    // Listar instrumentos
    public function index()
    {
        $this->authorize('viewAny', Instrumento::class);

        $instrumentos = Instrumento::visiblesPara(Auth::user())
            ->with([
                'tipoInstrumento',
                'unidad',
                'estado'
            ])
            ->get();

        return response()->json([
            'status' => 200,
            'mensaje' => 'Instrumentos obtenidos correctamente',
            'data' => $instrumentos
        ]);
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
    // Actualizar un instrumento con control de concurrencia optimista
    public function update(Request $request, $id)
    {
        $instrumento = Instrumento::visiblesPara(Auth::user())
            ->findOrFail($id);

        $this->authorize('update', $instrumento);

        // La versión es obligatoria para poder actualizar.
        $datos = $request->validate([
            'version' => 'required|integer|min:1',

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

        // Guardamos la versión enviada por el cliente.
        $versionEnviada = (int) $datos['version'];

        // La versión no se actualiza directamente desde los datos recibidos.
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

        // No permitir mover el instrumento a una unidad inaccesible.
        if (
            array_key_exists('id_unidad', $datos)
            && !Auth::user()->puedeAccederAUnidad((int) $datos['id_unidad'])
        ) {
            throw ValidationException::withMessages([
                'id_unidad' => [
                    'No tenés permisos para asignar el instrumento a esa unidad.'
                ]
            ]);
        }

        $usuarioId = Auth::id();

        $instrumentoActualizado = DB::transaction(function () use (
            $id,
            $versionEnviada,
            $datos,
            $usuarioId
        ) {
            // Bloquear la fila mientras se realiza la actualización.
            $instrumentoBloqueado = Instrumento::visiblesPara(Auth::user())
                ->where('id_instrumento', $id)
                ->lockForUpdate()
                ->firstOrFail();

            // Verificar nuevamente los permisos y el estado.
            $this->authorize('update', $instrumentoBloqueado);

            if ($instrumentoBloqueado->estado->nombre !== 'borrador') {
                abort(403, 'Solo se pueden modificar instrumentos en estado borrador.');
            }

            // Comparar la versión enviada con la versión actual.
            if ((int) $instrumentoBloqueado->version !== $versionEnviada) {
                return null;
            }

            // Actualizar los campos y aumentar la versión.
            $instrumentoBloqueado->update([
                ...$datos,
                'version' => $instrumentoBloqueado->version + 1,
            ]);

            AuditoriaService::registrar(
                'actualizar',
                'instrumentos',
                $instrumentoBloqueado->id_instrumento,
                [
                    'campos_modificados' => array_keys($datos),
                    'version_anterior' => $versionEnviada,
                    'version_nueva' => $instrumentoBloqueado->version,
                    'codigo' => $instrumentoBloqueado->codigo,
                    'titulo' => $instrumentoBloqueado->titulo,
                ],
                $usuarioId
            );

            return $instrumentoBloqueado->fresh()->load([
                'tipoInstrumento',
                'unidad',
                'estado'
            ]);
        });

        // Si la versión no coincide, no se guardó ningún cambio.
        if ($instrumentoActualizado === null) {
            return response()->json([
                'status' => 409,
                'mensaje' => 'El instrumento fue modificado por otro usuario. Actualizá los datos antes de volver a guardar.',
            ], 409);
        }

        return response()->json([
            'status' => 200,
            'mensaje' => 'Instrumento actualizado correctamente',
            'data' => $instrumentoActualizado
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
        $datos = $request->validate([
            'id_estado_nuevo' => 'required|integer|exists:estados,id_estado',
            'fundamento' => 'required|string|max:1000',
            'fecha_firma' => 'nullable|date',
        ]);

        $usuario = Auth::user();

        $resultado = DB::transaction(function () use (
            $id,
            $datos,
            $usuario
        ) {
            // Buscar y bloquear el instrumento.
            $instrumento = Instrumento::visiblesPara($usuario)
                ->where('id_instrumento', $id)
                ->lockForUpdate()
                ->firstOrFail();

            $estadoActual = $instrumento->estado->nombre;

            $estadoNuevo = Estado::findOrFail(
                $datos['id_estado_nuevo']
            );

            $nombreEstadoNuevo = $estadoNuevo->nombre;

            // Definir las transiciones permitidas.
            $transicionesPermitidas = [
                'borrador' => ['revision'],
                'revision' => ['borrador', 'aprobado'],
                'aprobado' => ['firmado', 'archivado'],
                'firmado' => ['rescindido', 'archivado'],
                'rescindido' => ['archivado'],
                'archivado' => [],
            ];

            if (!in_array(
                $nombreEstadoNuevo,
                $transicionesPermitidas[$estadoActual] ?? []
            )) {
                return [
                    'error' => true,
                    'status' => 422,
                    'mensaje' => "No está permitido pasar de {$estadoActual} a {$nombreEstadoNuevo}."
                ];
            }

            // BORRADOR -> REVISION: requiere Gestión.
            if (
                $estadoActual === 'borrador' &&
                $nombreEstadoNuevo === 'revision'
            ) {
                if (!$usuario->esGestion()) {
                    abort(403, 'Solo Gestión puede enviar instrumentos a revisión.');
                }
            }

            // REVISION -> BORRADOR o APROBADO: requiere Revisión.
            elseif (
                $estadoActual === 'revision' &&
                in_array($nombreEstadoNuevo, ['borrador', 'aprobado'])
            ) {
                if (!$usuario->esRevision()) {
                    abort(403, 'Solo Revisión puede aprobar o devolver instrumentos.');
                }

                // Para aprobar deben existir al menos dos partes.
                if (
                    $nombreEstadoNuevo === 'aprobado' &&
                    $instrumento->partes()->count() < 2
                ) {
                    throw ValidationException::withMessages([
                        'partes' => [
                            'No se puede aprobar el instrumento porque debe tener al menos dos partes registradas.'
                        ]
                    ]);
                }
            }

            // APROBADO -> FIRMADO: requiere Gestión y fecha de firma.
            elseif (
                $estadoActual === 'aprobado' &&
                $nombreEstadoNuevo === 'firmado'
            ) {
                if (!$usuario->esGestion()) {
                    abort(403, 'Solo Gestión puede registrar la firma.');
                }

                if (empty($datos['fecha_firma'])) {
                    throw ValidationException::withMessages([
                        'fecha_firma' => [
                            'La fecha de firma es obligatoria para pasar a firmado.'
                        ]
                    ]);
                }
            }

            // FIRMADO -> RESCINDIDO: Gestión o Administración.
            elseif (
                $estadoActual === 'firmado' &&
                $nombreEstadoNuevo === 'rescindido'
            ) {
                if (
                    !$usuario->esGestion() &&
                    !$usuario->esAdministracion()
                ) {
                    abort(403, 'Solo Gestión o Administración pueden rescindir instrumentos.');
                }
            }

            // APROBADO/FIRMADO/RESCINDIDO -> ARCHIVADO:
            // requiere Administración.
            elseif ($nombreEstadoNuevo === 'archivado') {
                if (!$usuario->esAdministracion()) {
                    abort(403, 'Solo Administración puede archivar instrumentos.');
                }
            }

            $estadoAnteriorId = $instrumento->id_estado;

            // Actualizar el estado y aumentar la versión.
            $actualizacion = [
                'id_estado' => $estadoNuevo->id_estado,
                'version' => $instrumento->version + 1,
            ];

            // Registrar fecha de firma cuando corresponda.
            if (
                $estadoActual === 'aprobado' &&
                $nombreEstadoNuevo === 'firmado'
            ) {
                $actualizacion['fecha_firma'] = $datos['fecha_firma'];
            }

            $instrumento->update($actualizacion);

            // Registrar el historial del cambio.
            HistorialEstado::create([
                'id_instrumento' => $instrumento->id_instrumento,
                'id_estado_anterior' => $estadoAnteriorId,
                'id_estado_nuevo' => $estadoNuevo->id_estado,
                'id_usuario' => $usuario->id_usuario,
                'fundamento' => $datos['fundamento'],
            ]);

            // Registrar auditoría.
            AuditoriaService::registrar(
                'cambiar_estado',
                'instrumentos',
                $instrumento->id_instrumento,
                [
                    'estado_anterior' => $estadoActual,
                    'estado_nuevo' => $nombreEstadoNuevo,
                    'fundamento' => $datos['fundamento'],
                    'version_nueva' => $instrumento->version,
                ],
                $usuario->id_usuario
            );

            return [
                'error' => false,
                'instrumento' => $instrumento->fresh()->load([
                    'tipoInstrumento',
                    'unidad',
                    'estado'
                ]),
                'historial' => $instrumento->historialEstados()
                    ->latest()
                    ->first()
            ];
        });

        if ($resultado['error']) {
            return response()->json([
                'status' => $resultado['status'],
                'mensaje' => $resultado['mensaje'],
            ], $resultado['status']);
        }

        return response()->json([
            'status' => 200,
            'mensaje' => 'Estado actualizado correctamente.',
            'data' => $resultado['instrumento'],
            'historial' => $resultado['historial'],
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


    /**
     * Exportar instrumentos a un archivo CSV.
     */
    public function exportar(Request $request): StreamedResponse
    {
        $this->authorize('viewAny', Instrumento::class);

        $filtros = $request->validate([
            'q' => 'nullable|string|max:255',
            'tipo_instrumento_id' => 'nullable|integer|exists:tipos_instrumento,id_tipo_instrumento',
            'estado_id' => 'nullable|integer|exists:estados,id_estado',
            'id_unidad' => 'nullable|integer|exists:unidades,id_unidad',
            'fecha_desde' => 'nullable|date',
            'fecha_hasta' => 'nullable|date|after_or_equal:fecha_desde',
        ]);

        // Se respeta el alcance de unidades del usuario.
        $consulta = Instrumento::visiblesPara(Auth::user())
            ->with([
                'tipoInstrumento',
                'unidad',
                'estado'
            ]);

        if (!empty($filtros['q'])) {
            $termino = $filtros['q'];

            $consulta->where(function ($query) use ($termino) {
                $query->where('codigo', 'like', "%{$termino}%")
                    ->orWhere('titulo', 'like', "%{$termino}%");
            });
        }

        if (!empty($filtros['tipo_instrumento_id'])) {
            $consulta->where(
                'id_tipo_instrumento',
                $filtros['tipo_instrumento_id']
            );
        }

        if (!empty($filtros['estado_id'])) {
            $consulta->where('id_estado', $filtros['estado_id']);
        }

        if (!empty($filtros['id_unidad'])) {
            $consulta->where('id_unidad', $filtros['id_unidad']);
        }

        if (!empty($filtros['fecha_desde'])) {
            $consulta->whereDate(
                'fecha_firma',
                '>=',
                $filtros['fecha_desde']
            );
        }

        if (!empty($filtros['fecha_hasta'])) {
            $consulta->whereDate(
                'fecha_firma',
                '<=',
                $filtros['fecha_hasta']
            );
        }

        $usuarioId = Auth::id();

        return response()->streamDownload(function () use ($consulta, $filtros, $usuarioId) {

            $archivo = fopen('php://output', 'w');

            // BOM para que Excel interprete correctamente UTF-8.
            fwrite($archivo, "\xEF\xBB\xBF");

            // Encabezados.
            fputcsv($archivo, [
                'ID',
                'Código',
                'Título',
                'Tipo de instrumento',
                'Unidad',
                'Estado',
                'Fecha de firma',
                'Fecha de inicio',
                'Fecha de vencimiento',
                'Vigencia'
            ], ';');

            $cantidad = 0;

            $consulta->orderBy('id_instrumento')
                ->chunk(500, function ($instrumentos) use ($archivo, &$cantidad) {

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
                                ?? 'sin vencimiento registrado'
                        ];

                        // Evitar fórmulas maliciosas en archivos CSV.
                        $fila = array_map(
                            fn ($valor) => $this->protegerCeldaCsv($valor),
                            $fila
                        );

                        fputcsv($archivo, $fila, ';');

                        $cantidad++;
                    }
                });

            fclose($archivo);

            AuditoriaService::registrar(
                'exportar',
                'instrumentos',
                null,
                [
                    'filtros' => $filtros,
                    'cantidad_exportada' => $cantidad
                ],
                $usuarioId
            );

        }, 'instrumentos.csv', [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    /**
     * Evitar inyección de fórmulas en celdas CSV.
     */
    private function protegerCeldaCsv($valor): string
    {
        $valor = (string) ($valor ?? '');

        if (preg_match('/^[=+\-@\t\r]/', $valor)) {
            return "'" . $valor;
        }

        return $valor;
    }


}
