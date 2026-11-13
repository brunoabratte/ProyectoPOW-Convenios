"use client";

import { verificarSesion } from "@/services/authService";
import {
    obtenerConvenios,
    obtenerConvenioEspecifico,
    obtenerObservaciones,
    crearObservacion,
    resolverObservacion,
    cambiarEstado,
    descargarDocumento
} from "@/services/conveniosService";
import { useEffect } from "react";

// IDs de la tabla "estados" de tu base de datos (ajustalos si son otros)
const ID_ESTADO_BORRADOR = 1;
const ID_ESTADO_APROBADO = 3;

export default function RevisionesPage(){
    useEffect(() => {
        verificarSesion();
        listarEnRevision();
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

    function formatearFecha(fecha: string) {
        return new Date(fecha).toLocaleDateString("es-AR");
    }

    function mensajeError(datos: any) {
        if (datos.errors)
            return Object.values(datos.errors).join("\n");

        let mensaje = datos.mensaje ?? datos.message ?? "Ocurrió un error.";

        if (mensaje === "This action is unauthorized.")
            return "Tu rol no tiene permisos para realizar esta acción.";

        return mensaje;
    }

    function cerrarRevision() {
        const modal = document.getElementById("ventanaRevision") as HTMLDialogElement;
        modal.close();
    }

    async function listarEnRevision() {
        let resultados = document.getElementById("resultados-revision");

        if (resultados == null)
            return;

        let datos = await obtenerConvenios();

        if (datos.status != 200) {
            resultados.innerHTML = "<p>No se pudieron obtener los convenios.</p>";
            return;
        }

        let enRevision = datos.data.filter((convenio: any) => convenio.estado?.nombre === "revision");

        if (enRevision.length === 0) {
            resultados.innerHTML = `<p class="text-muted">No hay convenios pendientes de revisión.</p>`;
            return;
        }

        let tabla = document.createElement("table");
        tabla.className = "table table-striped table-bordered rounded";
        tabla.innerHTML = `
        <thead>
            <tr>
                <th>C&oacute;digo</th>
                <th>T&iacute;tulo</th>
                <th>Tipo</th>
                <th>Unidad</th>
                <th></th>
            </tr>
        </thead>
        `;

        for (let i = 0; i < enRevision.length; i++) {
            tabla.innerHTML += `
            <tbody>
                <tr>
                    <td>${escapar(enRevision[i].codigo)}</td>
                    <td>${escapar(enRevision[i].titulo)}</td>
                    <td>${escapar(enRevision[i].tipo_instrumento?.nombre)}</td>
                    <td>${escapar(enRevision[i].unidad?.nombre)}</td>
                    <td>
                        <button type="button" class="btn btn-info btn-revisar" data-id="${enRevision[i].id_instrumento}">
                            REVISAR
                        </button>
                    </td>
                </tr>
            </tbody>
            `;
        }

        tabla.querySelectorAll(".btn-revisar").forEach((boton) => {
            boton.addEventListener("click", () => {
                let id = boton.getAttribute("data-id");

                if (id != null)
                    abrirRevision(id);
            });
        });

        resultados.innerHTML = "";
        resultados.appendChild(tabla);
    }

    async function abrirRevision(id: string) {
        const modal = document.getElementById("ventanaRevision") as HTMLDialogElement;

        let convenio = await obtenerConvenioEspecifico(id);
        let observaciones = await obtenerObservaciones(id);

        if (convenio.data == null) {
            alert(mensajeError(convenio));
            return;
        }

        if (!Array.isArray(observaciones))
            observaciones = [];

        let c = convenio.data;
        let partes = c.partes ?? [];
        let documentos = c.documentos ?? [];

        // Observaciones que todavía no están resueltas
        let pendientes = observaciones.filter((o: any) => o.estado === "pendiente").length;
        let sinResolver = observaciones.filter((o: any) => o.estado !== "resuelta").length;

        let htmlPartes = "";
        for (let i = 0; i < partes.length; i++)
            htmlPartes += `<li>${escapar(partes[i].caracter_parte)}</li>`;

        let avisoPartes = partes.length < 2
            ? `<p class="text-danger">Se necesitan al menos dos partes para aprobar.</p>`
            : "";

        let htmlDocumentos = "";
        for (let i = 0; i < documentos.length; i++) {
            htmlDocumentos += `
            <li>
                ${escapar(documentos[i].nombre)} (${escapar(documentos[i].tipo_documento)}, versi&oacute;n ${escapar(documentos[i].version)})
                <button type="button" class="btn btn-sm btn-outline-secondary btn-descargar"
                    data-id="${documentos[i].id_documento}" data-nombre="${escapar(documentos[i].nombre)}">
                    Descargar
                </button>
            </li>
            `;
        }

        if (htmlDocumentos === "")
            htmlDocumentos = `<li class="text-muted">Sin documentos adjuntos.</li>`;

        let htmlObservaciones = "";
        for (let i = 0; i < observaciones.length; i++) {
            let o = observaciones[i];
            let colorEstado = o.estado === "pendiente"
                ? "bg-warning text-dark"
                : (o.estado === "respondida" ? "bg-info text-dark" : "bg-success");

            htmlObservaciones += `
            <div class="border rounded p-2 mb-2">
                <div class="d-flex justify-content-between">
                    <small><strong>${escapar(o.autor?.name)}</strong> - ${formatearFecha(o.created_at)}</small>
                    <span class="badge ${colorEstado}">${escapar(o.estado)}</span>
                </div>
                <p class="mb-1">${escapar(o.contenido)}</p>
                ${o.respuesta ? `<p class="mb-1"><em>Respuesta del equipo gestor:</em> ${escapar(o.respuesta)}</p>` : ""}
                ${o.estado === "respondida"
                    ? `<button type="button" class="btn btn-sm btn-success btn-resolver" data-id="${o.id_observacion}">Marcar como resuelta</button>`
                    : ""}
            </div>
            `;
        }

        if (htmlObservaciones === "")
            htmlObservaciones = `<p class="text-muted">Este convenio todavía no tiene observaciones.</p>`;

        modal.innerHTML = `
        <div class="d-flex flex-column">
            <h5 class="titulo h5">Revisión del convenio</h5>
            <small>${escapar(c.codigo)}</small>
            <h1 class="titulo h1">${escapar(c.titulo)}</h1>
            <p>Estado del trámite: <span class="badge bg-primary">${escapar(c.estado?.nombre)}</span></p>
        </div>
        <div class="d-flex flex-column border-bottom border-top">
            <div>
                <h5 class="titulo h5">1. Ficha</h5>
                <ul>
                    <li><strong>Tipo de instrumento: </strong>${escapar(c.tipo_instrumento?.nombre)}</li>
                    <li><strong>Unidad: </strong>${escapar(c.unidad?.nombre)}</li>
                    <li><strong>Objeto: </strong>${escapar(c.objeto)}</li>
                    <li><strong>Alcance: </strong>${escapar(c.alcance)}</li>
                    <li><strong>Obligaciones: </strong>${escapar(c.obligaciones)}</li>
                    <li><strong>Condiciones de rescisi&oacute;n: </strong>${escapar(c.rescision)}</li>
                    <li><strong>Fecha de firma: </strong>${escapar(c.fecha_firma)}</li>
                    <li><strong>Fecha de inicio: </strong>${escapar(c.fecha_inicio)}</li>
                    <li><strong>Fecha de vencimiento: </strong>${c.fecha_vencimiento ? escapar(c.fecha_vencimiento) : "sin vencimiento registrado"}</li>
                </ul>
            </div>
            <div>
                <h5 class="titulo h5">2. Partes</h5>
                <ul>${htmlPartes === "" ? `<li class="text-muted">Sin partes registradas.</li>` : htmlPartes}</ul>
                ${avisoPartes}
            </div>
            <div>
                <h5 class="titulo h5">3. Documentos</h5>
                <ul>${htmlDocumentos}</ul>
            </div>
            <div>
                <h5 class="titulo h5">4. Observaciones (${sinResolver} sin resolver)</h5>
                ${htmlObservaciones}
            </div>
            <div class="mb-3">
                <h5 class="titulo h5">5. Resolución de la revisión</h5>

                <label for="nueva-observacion" class="form-label">Nueva observación</label>
                <textarea id="nueva-observacion" class="form-control mb-2" rows="3"></textarea>
                <button type="button" class="btn btn-warning mb-4" id="agregar-observacion">Agregar observación</button>

                <label for="fundamento-estado" class="form-label">Fundamento de la decisión</label>
                <textarea id="fundamento-estado" class="form-control mb-2" rows="3" maxlength="1000"></textarea>
                <small class="d-block mb-2 text-muted">
                    La aprobación es administrativa y no equivale a firma digital ni a certificación de legalidad.
                </small>
                <button type="button" class="btn btn-success" id="aprobar">Aprobar</button>
                <button type="button" class="btn btn-danger" id="devolver">Devolver para corrección</button>
            </div>
        </div>
        <button type="button" class="btn btn-secondary mt-3" id="cerrar-revision">Cerrar</button>
        `;

        modal.querySelector("#cerrar-revision")?.addEventListener("click", cerrarRevision);

        // Descargar documentos
        modal.querySelectorAll(".btn-descargar").forEach((boton) => {
            boton.addEventListener("click", async () => {
                let idDocumento = boton.getAttribute("data-id");
                let nombre = boton.getAttribute("data-nombre") ?? "documento.pdf";

                if (idDocumento == null)
                    return;

                let ok = await descargarDocumento(idDocumento, nombre);
                if (!ok)
                    alert("No se pudo descargar el documento.");
            });
        });

        // Resolver observaciones respondidas
        modal.querySelectorAll(".btn-resolver").forEach((boton) => {
            boton.addEventListener("click", async () => {
                let idObservacion = boton.getAttribute("data-id");

                if (idObservacion == null)
                    return;

                let respuesta = await resolverObservacion(idObservacion);

                if (respuesta.observacion == null) {
                    alert(mensajeError(respuesta));
                    return;
                }

                abrirRevision(id);
            });
        });

        // Agregar una observación
        modal.querySelector("#agregar-observacion")?.addEventListener("click", async () => {
            let contenido = (document.getElementById("nueva-observacion") as HTMLTextAreaElement).value.trim();

            if (contenido === "") {
                alert("Escribí la observación.");
                return;
            }

            let datos = new FormData();
            datos.append("id_instrumento", id);
            datos.append("id_estado_instrumento", String(c.id_estado));
            datos.append("contenido", contenido);

            let respuesta = await crearObservacion(datos);

            if (respuesta.observacion == null) {
                alert(mensajeError(respuesta));
                return;
            }

            abrirRevision(id);
        });

        // Aprobar
        modal.querySelector("#aprobar")?.addEventListener("click", () => {
            if (sinResolver > 0) {
                alert("Hay observaciones sin resolver. Resolvelas antes de aprobar.");
                return;
            }

            cambiarEstadoConvenio(id, ID_ESTADO_APROBADO);
        });

        // Devolver para corrección
        modal.querySelector("#devolver")?.addEventListener("click", () => {
            if (pendientes === 0) {
                alert("Para devolver el convenio agregá al menos una observación.");
                return;
            }

            cambiarEstadoConvenio(id, ID_ESTADO_BORRADOR);
        });

        if (!modal.open)
            modal.showModal();
    }

    async function cambiarEstadoConvenio(id: string, idEstadoNuevo: number) {
        let fundamento = (document.getElementById("fundamento-estado") as HTMLTextAreaElement).value.trim();

        if (fundamento === "") {
            alert("Escribí el fundamento de la decisión.");
            return;
        }

        let respuesta = await cambiarEstado(id, {
            id_estado_nuevo: idEstadoNuevo,
            fundamento: fundamento
        });

        if (respuesta.data == null) {
            alert(mensajeError(respuesta));
            return;
        }

        alert("Estado actualizado correctamente.");
        cerrarRevision();
        listarEnRevision();
    }

    return(
        <section className="listadoConvenios border rounded p-3 d-flex flex-column">
            <div className="mb-3">
                <h4 className="titulo h4">Revisiones</h4>
                <small className="form-text text-muted">
                    Convenios en revisión pendientes de aprobación o devolución
                </small>
            </div>
            <div id="resultados-revision"></div>
            <dialog className="ventanaRegistro" id="ventanaRevision"></dialog>
        </section>
    );
}