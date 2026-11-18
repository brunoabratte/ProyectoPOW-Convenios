"use client"

import { verificarSesion } from "@/services/authService";
import { obtenerConvenios, obtenerParticipaciones } from "@/services/conveniosService";
import { obtenerInstituciones } from "@/services/institucionesService";
import { useEffect, useState } from "react";

// Mismo valor que en la pantalla de Alertas: si cambiás uno, cambiá el otro
const DIAS_ALERTA = 30;

export default function PanelPage(){
    const [cargando, setCargando] = useState(true);
    useEffect(() => {
        verificarSesion();
        cargarPanel();
    }, []);

    // Evita que un texto con etiquetas HTML se ejecute al mostrarlo con innerHTML.
    // Si el dato viene vacío devuelve "-".
    function escapar(texto: any) {
        if (texto === null || texto === undefined || texto === "")
            return "-";

        return String(texto)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    }

    // Se agrega la hora para que la fecha no se corra un día por la zona horaria
    function crearFecha(texto: string) {
        return new Date(String(texto).substring(0, 10) + "T00:00:00");
    }

    function poner(id: string, valor: any) {
        let elemento = document.getElementById(id);

        if (elemento != null)
            elemento.textContent = String(valor);
    }

    // Suma 1 al contador de una categoría (por ejemplo, "firmado": 3)
    function sumar(conteo: any, nombre: string) {
        conteo[nombre] = (conteo[nombre] ?? 0) + 1;
    }

    function textoVigencia(convenio: any) {
        if (convenio.fecha_vencimiento == null)
            return "sin vencimiento registrado";

        return "vence el " + crearFecha(convenio.fecha_vencimiento).toLocaleDateString("es-AR");
    }

    
    function armarTabla(columna: string, conteo: any) {
        let claves = Object.keys(conteo).sort();
        let filas = "";
        let maximo = 0;

        for (let i = 0; i < claves.length; i++) {
            if (Number(conteo[claves[i]]) > maximo)
                maximo = Number(conteo[claves[i]]);
        }

        for (let i = 0; i < claves.length; i++) {
            let nombre = claves[i].replace(/_/g, " ");
            let cantidad = Number(conteo[claves[i]]);
            let porcentaje = maximo > 0 ? (cantidad / maximo) * 100 : 0;

            filas += `
                <div class="estadisticaFila">
                    <div class="estadisticaDatos">
                        <span>${escapar(nombre)}</span>
                        <strong>${cantidad}</strong>
                    </div>
                    <div class="estadisticaBarraFondo">
                        <div class="estadisticaBarra" style="width: ${porcentaje}%"></div>
                    </div>
                </div>
            `;
        }

        if (filas === "") {
            filas = `<p class="estadisticaSinDatos">Sin datos registrados</p>`;
        }

        return `
            <div class="estadisticaGrupo">
                <h3 class="titulo estadisticaTitulo">
                    Convenios por ${escapar(columna.toLowerCase())}
                </h3>
                <div class="estadisticaLista">${filas}</div>
            </div>
        `;
    }


    
    async function cargarPanel() {
        try {
            let datos = await obtenerConvenios();

            if (datos.status != 200) {
                let contenedor = document.getElementById("estadisticas");
                if (contenedor != null)
                    contenedor.innerHTML = "<p>No se pudieron obtener los convenios.</p>";
                return;
            }

            let convenios = datos.data;

            let hoy = new Date();
            hoy.setHours(0, 0, 0, 0);

            let firmados = 0;
            let vigentes = 0;
            let enRevision = 0;
            let porVencer = 0;
            let vencidos = 0;

            let porEstado: any = {};
            let porTipo: any = {};
            let porUnidad: any = {};
            let porAnio: any = {};

            for (let i = 0; i < convenios.length; i++) {
                let c = convenios[i];
                let estado = c.estado?.nombre ?? "sin estado";

                sumar(porEstado, estado);
                sumar(porTipo, c.tipo_instrumento?.nombre ?? "sin tipo");
                sumar(porUnidad, c.unidad?.nombre ?? "sin unidad");
                sumar(porAnio, c.fecha_firma ? String(c.fecha_firma).substring(0, 4) : "Sin firma");

                if (estado === "revision")
                    enRevision++;

                // Días que faltan para el vencimiento (negativo = ya venció)
                let dias: number | null = null;
                if (c.fecha_vencimiento != null)
                    dias = Math.round((crearFecha(c.fecha_vencimiento).getTime() - hoy.getTime()) / 86400000);

                // Vigente = firmado y sin vencimiento registrado o que todavía no venció
                if (estado === "firmado") {
                    firmados++;

                    if (dias == null || dias >= 0)
                        vigentes++;
                }

                // Mismas reglas que la pantalla de Alertas
                if ((estado === "firmado" || estado === "aprobado") && dias != null) {
                    let preaviso = Number(c.plazo_preaviso ?? 0);

                    if (dias < 0)
                        vencidos++;
                    else if (dias <= Math.max(preaviso, DIAS_ALERTA))
                        porVencer++;
                }
            }

            poner("numero-firmados", firmados);
            poner("numero-vigentes", vigentes);
            poner("numero-revision", enRevision);
            poner("numero-por-vencer", porVencer);
            poner("numero-vencidos", vencidos);

            // Estadísticas
            let estadisticas = document.getElementById("estadisticas");
            if (estadisticas != null) {
                estadisticas.innerHTML =
                    armarTabla("Estado", porEstado) +
                    armarTabla("Tipo", porTipo) +
                    armarTabla("Unidad", porUnidad) +
                    armarTabla("Año de firma", porAnio);
            }

            // Convenios recientes: los 5 últimos registrados
            let recientes = convenios
                .slice()
                .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .slice(0, 5);

            let contenedorRecientes = document.getElementById("convenios-recientes");
            if (contenedorRecientes != null) {
                if (recientes.length == 0) {
                    contenedorRecientes.innerHTML = `<p class="text-muted">Todavía no hay convenios registrados.</p>`;
                }
                else {
                    let lista = "";

                    for (let i = 0; i < recientes.length; i++) {
                        let c = recientes[i];

                        let estado = String(c.estado?.nombre ?? "sin estado")
                            .toLowerCase();

                        let claseEstado = "estadoNeutral";
                        let textoEstado = estado.replace(/_/g, " ");

                        if (estado === "aprobado" || estado === "firmado") {
                            claseEstado = "estadoAprobado";
                            textoEstado = estado.charAt(0).toUpperCase() + estado.slice(1);
                        }
                        else if (estado === "revision") {
                            claseEstado = "estadoRevision";
                            textoEstado = "En revisión";
                        }
                        else if (estado === "borrador") {
                            claseEstado = "estadoBorrador";
                            textoEstado = "Borrador";
                        }
                        else if (estado === "rechazado") {
                            claseEstado = "estadoRechazado";
                            textoEstado = "Rechazado";
                        }

                        lista += `
                            <div class="convenioReciente">

                                <div class="convenioRecienteSuperior">
                                    <strong class="convenioRecienteCodigo">
                                        ${escapar(c.codigo)}
                                    </strong>

                                    <span class="etiquetaEstado ${claseEstado}">
                                        ${escapar(textoEstado)}
                                    </span>
                                </div>

                                <h4 class="convenioRecienteTitulo">
                                    ${escapar(c.titulo)}
                                </h4>

                                <p class="convenioRecienteDatos">
                                    ${escapar(String(c.tipo_instrumento?.nombre ?? "").replace(/_/g, " "))}
                                    <span>·</span>
                                    ${escapar(c.unidad?.nombre)}
                                </p>

                                <div class="convenioRecienteInferior">
                                    <small>${escapar(textoVigencia(c))}</small>

                                    <a href="/panel/convenios?abrir=${encodeURIComponent(c.id_instrumento)}">
                                        Ver convenio →
                                    </a>
                                </div>

                            </div>
                        `;
                    }

                    contenedorRecientes.innerHTML = lista;
                }
            }

            // Personas únicas dentro del alcance del usuario
            let participaciones = await obtenerParticipaciones();
            if (participaciones.datos != null) {
                let personas: any = {};

                for (let i = 0; i < participaciones.datos.length; i++)
                    personas[String(participaciones.datos[i].id_persona)] = true;

                poner("numero-personas", Object.keys(personas).length);
            }

            // Instituciones
            let instituciones = await obtenerInstituciones();
            if (instituciones.data != null)
                poner("numero-instituciones", instituciones.data.length);

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

            <div className="dashboardEncabezado">
                <div>
                    <h2 className="titulo">Panel principal</h2>
                    <p>Resumen general de la gestión de convenios</p>
                </div>
            </div>

            <section className="dashboardIndicadores">

                <div className="campoPanel">
                    <p className="tituloCampo">Convenios firmados</p>
                    <p className="numero" id="numero-firmados">-</p>
                </div>

                <div className="campoPanel">
                    <p className="tituloCampo">Convenios vigentes</p>
                    <p className="numero" id="numero-vigentes">-</p>
                </div>

                <div className="campoPanel">
                    <p className="tituloCampo">En revisión</p>
                    <p className="numero" id="numero-revision">-</p>
                </div>

                <div className="campoPanel">
                    <p className="tituloCampo">Por vencer</p>
                    <p className="numero" id="numero-por-vencer">-</p>
                </div>

                <div className="campoPanel">
                    <p className="tituloCampo">Vencidos</p>
                    <p className="numero" id="numero-vencidos">-</p>
                </div>

                <div className="campoPanel">
                    <p className="tituloCampo">Personas únicas</p>
                    <p className="numero" id="numero-personas">-</p>
                </div>

                <div className="campoPanel">
                    <p className="tituloCampo">Instituciones</p>
                    <p className="numero" id="numero-instituciones">-</p>
                </div>

            </section>

            <section className="dashboardSecciones">

                <div className="campoConveniosRecientes">
                    <h3 className="tituloSeccion">Convenios recientes</h3>
                    <p className="descripcionSeccion">
                        Últimos convenios incorporados al sistema
                    </p>

                    <div id="convenios-recientes"></div>
                </div>

                <div className="campoConveniosRecientes">
                    <h3 className="tituloSeccion">Estadísticas</h3>
                    <p className="descripcionSeccion">
                        Distribución de los convenios registrados
                    </p>

                    <div id="estadisticas"></div>
                </div>

            </section>

        </div>
    );

}