"use client"

import { verificarSesion } from "@/services/authService";
import {
    obtenerConvenios,
    obtenerDashboard,
    obtenerTiposInstrumento,
    obtenerUnidades,
    obtenerEstados
} from "@/services/conveniosService";
import { obtenerInstituciones } from "@/services/institucionesService";
import { useEffect, useState } from "react";

const DIAS_ALERTA = 30;

export default function PanelPage(){
    const [cargando, setCargando] = useState(true);
    const [convenios, setConvenios] = useState<any[]>([]);

    const [indicadores, setIndicadores] = useState({
        firmados: 0,
        vigentes: 0,
        revision: 0,
        porVencer: 0,
        vencidos: 0,
        personas: 0,
        instituciones: 0
    });

const [estadisticas, setEstadisticas] = useState<any[]>([]);
const [recientes, setRecientes] = useState<any[]>([]);
const [error, setError] = useState("");

    useEffect(() => {
        verificarSesion();
        cargarPanel();
    }, []);

    // Evita que un texto con etiquetas HTML se ejecute al mostrarlo con innerHTML.

    function crearFecha(texto: string) {
        return new Date(String(texto).substring(0, 10) + "T00:00:00");
    }


    function textoVigencia(convenio: any) {
        if (convenio.fecha_vencimiento == null)
            return "sin vencimiento registrado";

        return "vence el " + crearFecha(convenio.fecha_vencimiento).toLocaleDateString("es-AR");
    }

    function obtenerClaseEstado(estado: string) {
        switch (estado.toLowerCase()) {
            case "aprobado":
            case "firmado":
                return "estadoAprobado";

            case "revision":
                return "estadoRevision";

            case "borrador":
                return "estadoBorrador";

            case "rechazado":
                return "estadoRechazado";

            default:
                return "estadoNeutral";
        }
    }

    function obtenerTextoEstado(estado: string) {
        switch (estado.toLowerCase()) {
            case "revision":
                return "En revisión";

            default:
                return estado
                    .replace(/_/g, " ")
                    .charAt(0)
                    .toUpperCase() +
                    estado.replace(/_/g, " ").slice(1);
        }
    }

    function sanitizarCeldaCSV(valor: any): string {
        if (valor === null || valor === undefined || valor === "")
            return '""';

        let texto = String(valor).replace(/\r?\n|\r/g, " ").trim();

        if (/^\s*[=+\-@\t\r]/.test(texto)) {
            texto = "'" + texto;
        }

        return `"${texto.replace(/"/g, '""')}"`;
    }

    function exportarConveniosCSV() {
        if (convenios.length === 0) {
            alert("No hay convenios disponibles para exportar.");
            return;
        }

        const encabezados = [
            "Código",
            "Título",
            "Tipo de instrumento",
            "Unidad responsable",
            "Estado",
            "Objeto",
            "Alcance",
            "Expediente",
            "Resolución",
            "Fecha de firma",
            "Fecha de inicio",
            "Fecha de vencimiento",
            "Plazo de preaviso (días)"
        ];

        const filas = [encabezados.map(sanitizarCeldaCSV).join(",")];

        for (let i = 0; i < convenios.length; i++) {
            const c = convenios[i];

            const fila = [
                c.codigo,
                c.titulo,
                c.tipo_instrumento?.nombre ?? "Sin tipo",
                c.unidad?.nombre ?? "Sin unidad",
                c.estado?.nombre ?? "Sin estado",
                c.objeto ?? "",
                c.alcance ?? "",
                c.expediente_referencia ?? "",
                c.resolucion ?? "",
                c.fecha_firma ? String(c.fecha_firma).substring(0, 10) : "",
                c.fecha_inicio ? String(c.fecha_inicio).substring(0, 10) : "",
                c.fecha_vencimiento ? String(c.fecha_vencimiento).substring(0, 10) : "sin vencimiento registrado",
                c.plazo_preaviso ?? ""
            ];

            filas.push(fila.map(sanitizarCeldaCSV).join(","));
        }

        // \uFEFF asegura que Excel reconozca UTF-8 (tildes y ñ)
        const contenidoCSV = "\uFEFF" + filas.join("\r\n");
        const blob = new Blob([contenidoCSV], { type: "text/csv;charset=utf-8;" });
        const enlace = document.createElement("a");
        const fechaHoy = new Date().toISOString().slice(0, 10);

        enlace.href = URL.createObjectURL(blob);
        enlace.download = `convenios_${fechaHoy}.csv`;
        enlace.click();
        setTimeout(() => URL.revokeObjectURL(enlace.href), 1000);
    }

    function convertirEstadisticas(
        registros: any[],
        catalogo: any[],
        campoId: string,
        campoNombre: string
    ) {
        let resultado: any = {};

        for (let i = 0; i < registros.length; i++) {
            let registro = registros[i];

            let elemento = catalogo.find(
                (item: any) =>
                    String(item[campoId]) === String(registro[campoId])
            );

            let nombre = elemento
                ? elemento[campoNombre]
                : "Sin categoría";

            resultado[nombre] = registro.cantidad;
        }

        return resultado;
    }

    async function cargarPanel() {
        try {
            let datos = await obtenerConvenios();

            if (datos.status != 200) {
                setError("No se pudieron obtener los convenios.");
                return;
            }

            let listaConvenios = datos.data;
            setConvenios(listaConvenios);

                        
            // Consultar dashboard y catálogos del backend
            const [dashboard, estados, tipos, unidades] = await Promise.all([
                obtenerDashboard(),
                obtenerEstados(),
                obtenerTiposInstrumento(),
                obtenerUnidades()
            ]);

            if (dashboard.status !== 200) {
                throw new Error("No se pudieron obtener las estadísticas.");
            }

            const estadisticas = dashboard.data;

            // Estadísticas agrupadas, traduciendo los identificadores
            let porEstado = convertirEstadisticas(
                estadisticas.por_estado,
                estados.data,
                "id_estado",
                "nombre"
            );

            let porTipo = convertirEstadisticas(
                estadisticas.por_tipo,
                tipos.data,
                "id_tipo_instrumento",
                "nombre"
            );

            let porUnidad = convertirEstadisticas(
                estadisticas.por_unidad,
                unidades.data,
                "id_unidad",
                "nombre"
            );

            // Distribución por año de firma
            let porAnio: any = {};

            for (let i = 0; i < estadisticas.por_anio_firma.length; i++) {
                let registro = estadisticas.por_anio_firma[i];

                porAnio[registro.anio] = registro.cantidad;
            }

            // Indicadores que ya calcula el backend
            let firmados = Number(
                estadisticas.por_estado.find(
                    (estado: any) => Number(estado.id_estado) === 4
                )?.cantidad ?? 0
            );
            let enRevision = Number(porEstado["revision"] ?? 0);
            let vigentes = Number(estadisticas.firmados_vigentes ?? 0);

            // Vencimientos: por ahora conservamos las reglas actuales
            let hoy = new Date();
            hoy.setHours(0, 0, 0, 0);

            let porVencer = 0;
            let vencidos = 0;

            for (let i = 0; i < listaConvenios.length; i++) {
                let c = listaConvenios[i];
                let estado = c.estado?.nombre ?? "sin estado";

                let dias: number | null = null;

                if (c.fecha_vencimiento != null) {
                    dias = Math.round(
                        (crearFecha(c.fecha_vencimiento).getTime() -
                        hoy.getTime()) / 86400000
                    );
                }

                if ((estado === "firmado" || estado === "aprobado") && dias != null) {
                    let preaviso = Number(c.plazo_preaviso ?? 0);

                    if (dias < 0)
                        vencidos++;
                    else if (dias <= Math.max(preaviso, DIAS_ALERTA))
                        porVencer++;
                }
            }

            setIndicadores(prev => ({
                ...prev,
                firmados,
                vigentes,
                revision: enRevision,
                porVencer,
                vencidos,
                personas: Number(estadisticas.personas_vinculadas ?? 0)
            }));

            // Estadísticas
            setEstadisticas([
            {
                titulo: "Estado",
                datos: Object.entries(porEstado).map(([nombre, cantidad]) => ({
                    nombre,
                    cantidad: Number(cantidad)
                }))
            },
            {
                titulo: "Tipo",
                datos: Object.entries(porTipo).map(([nombre, cantidad]) => ({
                    nombre,
                    cantidad: Number(cantidad)
                }))
            },
            {
                titulo: "Unidad",
                datos: Object.entries(porUnidad).map(([nombre, cantidad]) => ({
                    nombre,
                    cantidad: Number(cantidad)
                }))
            },
            {
                titulo: "Año de firma",
                datos: Object.entries(porAnio).map(([nombre, cantidad]) => ({
                    nombre,
                    cantidad: Number(cantidad)
                }))
            }
        ]);

            // Convenios recientes: los 5 últimos registrados
            let recientes = listaConvenios
                .slice()
                .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .slice(0, 5);

            setRecientes(recientes);

            // Instituciones
            try {
                let instituciones = await obtenerInstituciones();

                if (instituciones.status === 200 && instituciones.data != null) {
                    setIndicadores(prev => ({
                        ...prev,
                        instituciones: instituciones.data.length
                    }));
                }
            } catch (e) {
                console.error("Error al obtener las instituciones:", e);
            }

        } catch (e) {
            console.error("Error al cargar el panel:", e);
            setError("Ocurrió un error al cargar el panel.");
        } finally {
            setCargando(false);
        }
    }

    return (
        <div className="dashboard">

            {cargando && (
                <div className="d-flex flex-column justify-content-center align-items-center py-4">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Cargando...</span>
                    </div>

                    <p className="mt-3 text-secondary">
                        Cargando información...
                    </p>
                </div>
            )}

            <div className="dashboardEncabezado d-flex justify-content-between align-items-center flex-wrap gap-2">
                <div>
                    <h2 className="titulo">Panel principal</h2>
                    <p>Resumen general de la gestión de convenios</p>
                </div>

                <button
                    type="button"
                    className="btn btn-outline-success"
                    onClick={exportarConveniosCSV}
                    disabled={cargando || convenios.length === 0}
                >
                    Exportar convenios Excel
                </button>
            </div>

            {error && (
                <div className="alert alert-danger">
                    {error}
                </div>
            )}
            <section className="dashboardIndicadores">

                <div className="campoPanel">
                    <p className="tituloCampo">Convenios firmados</p>
                    <p className="numero">{indicadores.firmados}</p>
                </div>

                <div className="campoPanel">
                    <p className="tituloCampo">Convenios vigentes</p>
                    <p className="numero">{indicadores.vigentes}</p>
                </div>

                <div className="campoPanel">
                    <p className="tituloCampo">En revisión</p>
                    <p className="numero">{indicadores.revision}</p>
                </div>

                <div className="campoPanel">
                    <p className="tituloCampo">Por vencer</p>
                    <p className="numero">{indicadores.porVencer}</p>
                </div>

                <div className="campoPanel">
                    <p className="tituloCampo">Vencidos</p>
                    <p className="numero">{indicadores.vencidos}</p>
                </div>

                <div className="campoPanel">
                    <p className="tituloCampo">Personas únicas</p>
                    <p className="numero">{indicadores.personas}</p>
                </div>

                <div className="campoPanel">
                    <p className="tituloCampo">Instituciones</p>
                    <p className="numero">{indicadores.instituciones}</p>
                </div>

            </section>


            <section className="dashboardSecciones">

                <div className="campoConveniosRecientes">
                    <h3 className="tituloSeccion">Convenios recientes</h3>
                    <p className="descripcionSeccion">
                        Últimos convenios incorporados al sistema
                    </p>

                    <div>
                        {recientes.length === 0 ? (
                            <p className="text-muted">
                                Todavía no hay convenios registrados.
                            </p>
                        ) : (
                            recientes.map((c: any) => {
                                const estado = String(
                                    c.estado?.nombre ?? "sin estado"
                                ).toLowerCase();

                                return (
                                    <div
                                        className="convenioReciente"
                                        key={c.id_instrumento}
                                    >
                                        <div className="convenioRecienteSuperior">
                                            <strong className="convenioRecienteCodigo">
                                                {c.codigo}
                                            </strong>

                                            <span className={`etiquetaEstado ${obtenerClaseEstado(estado)}`}>
                                                {obtenerTextoEstado(estado)}
                                            </span>
                                        </div>

                                        <h4 className="convenioRecienteTitulo">
                                            {c.titulo}
                                        </h4>

                                        <p className="convenioRecienteDatos">
                                            {String(c.tipo_instrumento?.nombre ?? "")
                                                .replace(/_/g, " ")}

                                            <span>·</span>

                                            {c.unidad?.nombre ?? "Sin unidad"}
                                        </p>

                                        <div className="convenioRecienteInferior">
                                            <small>{textoVigencia(c)}</small>

                                            <a href={`/panel/convenios?abrir=${encodeURIComponent(c.id_instrumento)}`}>
                                                Ver convenio →
                                            </a>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                <div className="campoConveniosRecientes">
                    <h3 className="tituloSeccion">Estadísticas</h3>
                    <p className="descripcionSeccion">
                        Distribución de los convenios registrados
                    </p>

                    
                <div>
                    {estadisticas.length === 0 ? (
                        <p className="estadisticaSinDatos">
                            Sin datos registrados
                        </p>
                    ) : (
                        estadisticas.map((grupo: any) => {
                            const maximo = Math.max(
                                0,
                                ...grupo.datos.map((dato: any) =>
                                    Number(dato.cantidad)
                                )
                            );

                            return (
                                <div
                                    className="estadisticaGrupo"
                                    key={grupo.titulo}
                                >
                                    <h3 className="titulo estadisticaTitulo">
                                        Convenios por {grupo.titulo.toLowerCase()}
                                    </h3>

                                    <div className="estadisticaLista">
                                        {grupo.datos.length === 0 ? (
                                            <p className="estadisticaSinDatos">
                                                Sin datos registrados
                                            </p>
                                        ) : (
                                            grupo.datos.map((dato: any) => {
                                                const porcentaje = maximo > 0
                                                    ? (dato.cantidad / maximo) * 100
                                                    : 0;

                                                return (
                                                    <div
                                                        className="estadisticaFila"
                                                        key={dato.nombre}
                                                    >
                                                        <div className="estadisticaDatos">
                                                            <span>
                                                                {String(dato.nombre).replace(/_/g, " ")}
                                                            </span>

                                                            <strong>
                                                                {dato.cantidad}
                                                            </strong>
                                                        </div>

                                                        <div className="estadisticaBarraFondo">
                                                            <div
                                                                className="estadisticaBarra"
                                                                style={{
                                                                    width: `${porcentaje}%`
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                </div>

            </section>

        </div>
    );
}