"use client"

import { verificarSesion } from "@/services/authService";
import { obtenerAuditorias, obtenerUsuarioActual } from "@/services/administracionService";
import { useEffect } from "react";

export default function AdministracionPage(){
    useEffect(() => {
        verificarSesion();
        iniciar();
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

    function mensajeError(datos: any) {
        if (datos.errors)
            return Object.values(datos.errors).join(" ");

        let mensaje = datos.mensaje ?? datos.message ?? "Ocurrió un error.";

        if (mensaje === "This action is unauthorized.")
            return "Tu rol no tiene permisos para ver la auditoría.";

        return mensaje;
    }

    function valor(id: string) {
        let elemento = document.getElementById(id) as HTMLInputElement | null;
        return elemento == null ? "" : elemento.value.trim();
    }

    // Solo el rol de administración ve la sección
    async function iniciar() {
        let contenido = document.getElementById("contenido-auditoria");
        let aviso = document.getElementById("mensaje-permiso");

        if (contenido == null || aviso == null)
            return;

        let respuesta = await obtenerUsuarioActual();

        if (respuesta.usuario?.rol !== "administracion") {
            aviso.hidden = false;
            return;
        }

        contenido.hidden = false;
        listarAuditorias(1);
    }

    function limpiarFiltros() {
        (document.getElementById("fecha-desde") as HTMLInputElement).value = "";
        (document.getElementById("fecha-hasta") as HTMLInputElement).value = "";
        (document.getElementById("filtro-accion") as HTMLSelectElement).value = "";
        (document.getElementById("filtro-entidad") as HTMLSelectElement).value = "";

        listarAuditorias(1);
    }

    async function listarAuditorias(pagina: number) {
        let resultados = document.getElementById("resultados-auditoria");

        if (resultados == null)
            return;

        let desde = valor("fecha-desde");
        let hasta = valor("fecha-hasta");

        if (desde !== "" && hasta !== "" && hasta < desde) {
            alert("La fecha \"hasta\" no puede ser anterior a la fecha \"desde\".");
            return;
        }

        // Solo se envían los filtros que tienen valor
        let filtros = new URLSearchParams();
        filtros.append("page", String(pagina));

        if (desde !== "")
            filtros.append("fecha_desde", desde);
        if (hasta !== "")
            filtros.append("fecha_hasta", hasta);
        if (valor("filtro-accion") !== "")
            filtros.append("accion", valor("filtro-accion"));
        if (valor("filtro-entidad") !== "")
            filtros.append("entidad", valor("filtro-entidad"));

        let datos = await obtenerAuditorias(filtros.toString());

        // Si no vino "data", la API devolvió un error
        if (datos.data == null) {
            resultados.innerHTML = `<p>${escapar(mensajeError(datos))}</p>`;
            return;
        }

        if (datos.data.length == 0) {
            resultados.innerHTML = `<p class="text-muted">No hay registros para los filtros elegidos.</p>`;
            return;
        }

        let filas = "";

        for (let i = 0; i < datos.data.length; i++) {
            let a = datos.data[i];

            // El detalle es un objeto con datos de la acción
            let detalle = JSON.stringify(a.detalle ?? {}, null, 2);
            let htmlDetalle = (detalle === "{}" || detalle === "[]")
                ? "-"
                : `<details><summary>Ver</summary><pre class="mb-0">${escapar(detalle)}</pre></details>`;

            filas += `
            <tr>
                <td>${new Date(a.created_at).toLocaleString("es-AR")}</td>
                <td>${escapar(a.usuario?.name)}</td>
                <td>${escapar(String(a.accion).replace(/_/g, " "))}</td>
                <td>${escapar(String(a.entidad).replace(/_/g, " "))}</td>
                <td>${escapar(a.entidad_id)}</td>
                <td>${escapar(a.ip)}</td>
                <td>${htmlDetalle}</td>
            </tr>
            `;
        }

        resultados.innerHTML = `
        <table class="table table-striped table-bordered rounded">
            <thead>
                <tr>
                    <th>Fecha y hora</th>
                    <th>Usuario</th>
                    <th>Acci&oacute;n</th>
                    <th>Entidad</th>
                    <th>ID</th>
                    <th>IP</th>
                    <th>Detalle</th>
                </tr>
            </thead>
            <tbody>${filas}</tbody>
        </table>
        <div class="d-flex justify-content-between align-items-center">
            <button type="button" class="btn btn-outline-secondary btn-pagina" data-pagina="${datos.current_page - 1}"
                ${datos.current_page <= 1 ? "disabled" : ""}>Anterior</button>
            <span>P&aacute;gina ${datos.current_page} de ${datos.last_page} (${datos.total} registros)</span>
            <button type="button" class="btn btn-outline-secondary btn-pagina" data-pagina="${datos.current_page + 1}"
                ${datos.current_page >= datos.last_page ? "disabled" : ""}>Siguiente</button>
        </div>
        `;

        resultados.querySelectorAll(".btn-pagina").forEach((boton) => {
            boton.addEventListener("click", () => {
                let numero = boton.getAttribute("data-pagina");

                if (numero != null)
                    listarAuditorias(Number(numero));
            });
        });
    }

    return (
        <section className="border rounded p-4 d-flex flex-column gap-3">
            <div className="mb-3">
                <h2 className="titulo h2">Administraci&oacute;n</h2>
                <small className="form-text text-muted">
                    Auditor&iacute;a: registro de las acciones realizadas en el sistema
                </small>
            </div>

            <p id="mensaje-permiso" hidden role="alert">
                Esta secci&oacute;n es solo para el rol de administraci&oacute;n.
            </p>

            <div id="contenido-auditoria" hidden>
                <form className="row g-3 mb-3" onSubmit={(e) => e.preventDefault()}>
                    <div className="col-12 col-md-3">
                        <label htmlFor="fecha-desde" className="form-label">Desde</label>
                        <input type="date" id="fecha-desde" className="form-control" />
                    </div>
                    <div className="col-12 col-md-3">
                        <label htmlFor="fecha-hasta" className="form-label">Hasta</label>
                        <input type="date" id="fecha-hasta" className="form-control" />
                    </div>
                    <div className="col-12 col-md-3">
                        <label htmlFor="filtro-accion" className="form-label">Acci&oacute;n</label>
                        <select id="filtro-accion" className="form-select" defaultValue="">
                            <option value="">Todas</option>
                            <option value="crear">Crear</option>
                            <option value="actualizar">Actualizar</option>
                            <option value="cambiar_estado">Cambiar estado</option>
                            <option value="crear_version">Crear versi&oacute;n</option>
                            <option value="descargar">Descargar</option>
                            <option value="responder">Responder</option>
                            <option value="resolver">Resolver</option>
                        </select>
                    </div>
                    <div className="col-12 col-md-3">
                        <label htmlFor="filtro-entidad" className="form-label">Entidad</label>
                        <select id="filtro-entidad" className="form-select" defaultValue="">
                            <option value="">Todas</option>
                            <option value="instrumentos">Instrumentos</option>
                            <option value="instituciones">Instituciones</option>
                            <option value="personas">Personas</option>
                            <option value="partes">Partes</option>
                            <option value="instrumentos_relaciones">Relaciones</option>
                            <option value="participaciones_personas">Participaciones</option>
                            <option value="pasantias">Pasant&iacute;as</option>
                            <option value="documentos">Documentos</option>
                            <option value="observaciones">Observaciones</option>
                        </select>
                    </div>
                    <div className="col-12 d-flex gap-2">
                        <button type="button" className="btn btn-secondary" onClick={() => listarAuditorias(1)}>Filtrar</button>
                        <button type="button" className="btn btn-outline-secondary" onClick={limpiarFiltros}>Limpiar</button>
                    </div>
                </form>

                <div id="resultados-auditoria"></div>
            </div>
        </section>
    );
}