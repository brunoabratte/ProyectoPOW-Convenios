"use client";

import { obtenerRolActual, verificarSesion } from "@/services/authService";
import { useEffect, useRef, useState } from "react";
import { registrarParticipacion, registrarPasantia, registrarRelacion } from "@/services/conveniosService";
import { obtenerPersonas } from "@/services/personasService";
import { obtenerInstituciones } from "@/services/institucionesService";
import {
    obtenerConvenioEspecifico,
    obtenerConvenios,
    obtenerTiposInstrumento,
    obtenerUnidades,
    registrar,
    registrarParte,
    subirDocumento,
    descargarDocumento,
    actualizarConvenio,
    cambiarEstado
} from "@/services/conveniosService";

const CONVENIOS_POR_PAGINA = 10;

export default function ConveniosPage(){
    const [idConvenioEditando, setIdConvenioEditando] = useState<string | null>(null);
    const [versionConvenioEditando, setVersionConvenioEditando] = useState<number | null>(null);
    const [rolUsuario, setRolUsuario] = useState<string | null>(null);
    const rolUsuarioRef = useRef<string | null>(null);

    useEffect(() => {
        verificarSesion();
        obtenerRolActual().then((rol) => {
            rolUsuarioRef.current = rol;
            setRolUsuario(rol);
            if (rol === "consulta") {
                listarConvenios(1);
                return;
            }
            listarInstrumentos();
            listarUnidades();
            listarInstitucionesSelect();
            listarConvenios(1);

            let parametros = new URLSearchParams(window.location.search);
            let abrir = parametros.get("abrir");
            if (abrir != null)
                abrirDetalles(abrir);
        });
    }, []);

    async function abrirModal() {
        if (!puedeCrearOEditarConvenios(rolUsuarioRef.current)) return;
        const modal = document.getElementById("ventanaRegistro") as HTMLDialogElement;
        await listarPersonas();
        modal.showModal();
    }

    async function editarConvenio(id: string) {
        if (!puedeCrearOEditarConvenios(rolUsuarioRef.current)) return;
        let respuesta = await obtenerConvenioEspecifico(id);

        if (!respuesta.data) {
            alert("No se pudieron obtener los datos del convenio.");
            return;
        }

        let convenio = respuesta.data;

        if (convenio.estado?.nombre !== "borrador") {
            alert("Solo se pueden editar convenios en estado Borrador.");
            return;
        }

        setIdConvenioEditando(String(convenio.id_instrumento));
        setVersionConvenioEditando(Number(convenio.version));

        // Cargar los catálogos antes de seleccionar sus valores.
        await listarInstrumentos();
        await listarUnidades();
        await listarPersonas();

        // Completar los campos del formulario.
        const campos: [string, any][] = [
            ["codigo", convenio.codigo],
            ["titulo", convenio.titulo],
            ["tipo", convenio.id_tipo_instrumento],
            ["unidad-responsable", convenio.id_unidad],
            ["objeto", convenio.objeto],
            ["alcance", convenio.alcance],
            ["obligaciones", convenio.obligaciones],
            ["condiciones-rescision", convenio.rescision],
            ["marco-legal", convenio.marco_legal],
            ["resolucion", convenio.resolucion],
            ["expediente", convenio.expediente_referencia],
            ["condiciones-renovacion", convenio.condiciones_renovacion],
            ["confidencialidad", convenio.confidencialidad],
            ["notas-adicionales", convenio.notas],
            ["fecha-firma", convenio.fecha_firma],
            ["fecha-inicio", convenio.fecha_inicio],
            ["fecha-vencimiento", convenio.fecha_vencimiento],
            ["plazo-preaviso", convenio.plazo_preaviso]
        ];

        for (let i = 0; i < campos.length; i++) {
            let elemento = document.getElementById(campos[i][0]) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null;

            if (elemento) {
                elemento.value = campos[i][1] == null
                    ? ""
                    : String(campos[i][1]).substring(0, campos[i][0].startsWith("fecha-") ? 10 : undefined);
            }
        }

        const modal = document.getElementById("ventanaRegistro") as HTMLDialogElement;
        modal.showModal();
    }

    function cerrarModal() {
        const modal = document.getElementById("ventanaRegistro") as HTMLDialogElement;
        modal.close();
    }

    function normalizar(texto: string) {
        return texto
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[-\s]/g, "_");
    }

    function escaparHtml(texto: string) {
        const entidades: Record<string, string> = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };
        return texto.replace(/[&<>"']/g, (caracter) => entidades[caracter] ?? caracter);
    }

    function puedeCrearOEditarConvenios(rol: string | null) {
        return rol === "admin" || rol === "administracion" || rol === "gestion";
    }

    let listaInstituciones: any[] = [];

function armarOpcionesInstituciones(textoPlaceholder: string) {
    let html = `<option value="">${textoPlaceholder}</option>`;
    for (let i = 0; i < listaInstituciones.length; i++) {
        let inst = listaInstituciones[i];
        html += `<option value="${inst.id_institucion}">${inst.nombre}</option>`;
    }
    return html;
}

async function listarInstitucionesSelect() {
    let datos = await obtenerInstituciones();

    if (!datos || !Array.isArray(datos.data))
        return;

    listaInstituciones = datos.data;

    let selects = document.querySelectorAll<HTMLSelectElement>("#contenedor-instituciones .institucion-select");
    selects.forEach((select, indice) => {
        let valorPrevio = select.value;
        select.innerHTML = armarOpcionesInstituciones(`Seleccione institución (Parte ${indice + 1})...`);
        if (valorPrevio !== "")
            select.value = valorPrevio;
    });
}

async function agregarParteFirmante() {
    let contenedor = document.getElementById("contenedor-instituciones");
    if (!contenedor)
        return;

    if (listaInstituciones.length === 0)
        await listarInstitucionesSelect();

    let cantidadActual = contenedor.querySelectorAll(".institucion-select").length;

    let fila = document.createElement("div");
    fila.className = "d-flex gap-2 align-items-center fila-institucion-extra";

    let nuevoSelect = document.createElement("select");
    nuevoSelect.className = "form-select border rounded institucion-select";
    nuevoSelect.innerHTML = armarOpcionesInstituciones(`Seleccione institución (Parte ${cantidadActual + 1})...`);

    let btnQuitar = document.createElement("button");
    btnQuitar.type = "button";
    btnQuitar.className = "btn btn-outline-danger btn-sm";
    btnQuitar.textContent = "Quitar";
    btnQuitar.addEventListener("click", () => {
        fila.remove();
    });

    fila.appendChild(nuevoSelect);
    fila.appendChild(btnQuitar);
    contenedor.appendChild(fila);
}

    let listaPersonas: any[] = [];

function armarOpcionesPersonas(textoPlaceholder: string) {
    let html = `<option value="">${textoPlaceholder}</option>`;
    for (let i = 0; i < listaPersonas.length; i++) {
        let p = listaPersonas[i];
        html += `<option value="${p.id_persona}">${p.apellido}, ${p.nombre} (DNI: ${p.dni})</option>`;
    }
    return html;
}

async function listarPersonas() {
    let datosPersonas = await obtenerPersonas();

    if (!datosPersonas || !Array.isArray(datosPersonas.datos))
        return;

    listaPersonas = datosPersonas.datos;

    let selects = document.querySelectorAll<HTMLSelectElement>("#contenedor-personas .persona-select");
    selects.forEach((select) => {
        let valorPrevio = select.value;
        select.innerHTML = armarOpcionesPersonas("Seleccione una persona...");
        if (valorPrevio !== "")
            select.value = valorPrevio;
    });
}

async function agregarPersonaConvenio() {
    let contenedor = document.getElementById("contenedor-personas");
    if (!contenedor)
        return;

    if (listaPersonas.length === 0)
        await listarPersonas();

    let fila = document.createElement("div");
    fila.className = "border rounded p-3 d-flex flex-column gap-2 fila-persona-extra";

    fila.innerHTML = `
        <div class="d-flex justify-content-between align-items-center">
            <strong>Persona vinculada adicional</strong>
            <button type="button" class="btn btn-outline-danger btn-sm btn-quitar-persona">Quitar</button>
        </div>
        <select class="form-select persona-select">
            ${armarOpcionesPersonas("Seleccione una persona...")}
        </select>
        <input type="text" class="form-control persona-rol" placeholder="Rol en el convenio (ej: Coordinador, Pasante, Tutor)" />
        <div class="row g-2">
            <div class="col-12 col-md-6">
                <label class="form-label">Fecha de inicio</label>
                <input type="date" class="form-control persona-fecha-inicio" />
            </div>
            <div class="col-12 col-md-6">
                <label class="form-label">Fecha de fin (opcional)</label>
                <input type="date" class="form-control persona-fecha-fin" />
            </div>
        </div>
    `;

    fila.querySelector(".btn-quitar-persona")?.addEventListener("click", () => {
        fila.remove();
    });

    contenedor.appendChild(fila);
}

// Detecta si el tipo de instrumento elegido corresponde a pasantía y despliega los campos de la consigna
function esTipoPasantia(): boolean {
    const selectTipo = document.getElementById("tipo") as HTMLSelectElement | null;
    if (!selectTipo || selectTipo.selectedIndex < 0)
        return false;

    const textoTipo = selectTipo.options[selectTipo.selectedIndex]?.text ?? "";
    return normalizar(textoTipo).includes("pasantia");
}

function actualizarSeccionPasantias() {
    const seccion = document.getElementById("seccion-pasantias");
    if (!seccion)
        return;

    if (!esTipoPasantia()) {
        seccion.innerHTML = "";
        return;
    }

    seccion.innerHTML = `
        <div class="border rounded p-3 mt-2 d-flex flex-column gap-3 bg-light">
            <h5 class="titulo h5 mb-0">Datos complementarios de pasantía</h5>
            <input type="text" id="pasantia-carrera" class="form-control" placeholder="Carrera (ej: Ingeniería en Sistemas / Analista Programador)" />
            <div class="row g-2">
                <div class="col-12 col-md-6">
                    <input type="text" id="pasantia-tutor-academico" class="form-control" placeholder="Tutor académico (UNLPam)" />
                </div>
                <div class="col-12 col-md-6">
                    <input type="text" id="pasantia-tutor-externo" class="form-control" placeholder="Tutor externo (Empresa / Institución)" />
                </div>
            </div>
            <div class="row g-2">
                <div class="col-12 col-md-4">
                    <input type="number" min="1" max="40" id="pasantia-carga-horaria" class="form-control" placeholder="Carga horaria semanal (hs)" />
                </div>
                <div class="col-12 col-md-4">
                    <input type="number" min="0" step="0.01" id="pasantia-asignacion" class="form-control" placeholder="Asignación estímulo ($)" />
                </div>
                <div class="col-12 col-md-4">
                    <input type="text" id="pasantia-seguro" class="form-control" placeholder="Seguro / Póliza ART" />
                </div>
            </div>
        </div>
    `;
}

    async function listarInstrumentos() {
        let selectTipo = document.getElementById("tipo") as HTMLSelectElement | null;
        let selectFiltroTipo = document.getElementById("filtro-tipo") as HTMLSelectElement | null;

        if (selectTipo == null || selectFiltroTipo == null)
            return;

        let instrumentos = await obtenerTiposInstrumento();

        if (!instrumentos || !Array.isArray(instrumentos.data))
            return;

        let opcionesForm = `<option value="">Seleccione un tipo de instrumento</option>`;
        let opcionesFiltro = `<option value="">Tipo de instrumento</option>`;

        for (let i = 0; i < instrumentos.data.length; i++) {
            let instrumento = instrumentos.data[i];
            opcionesForm += `<option value="${instrumento.id_tipo_instrumento}">${instrumento.nombre}</option>`;
            opcionesFiltro += `<option value="${instrumento.nombre}">${instrumento.nombre}</option>`;
        }

        selectTipo.innerHTML = opcionesForm;
        selectFiltroTipo.innerHTML = opcionesFiltro;
    }

    async function listarUnidades() {
        let selectUnidad = document.getElementById("unidad-responsable") as HTMLSelectElement | null;
        let selectFiltroUnidad = document.getElementById("filtro-unidad-academica") as HTMLSelectElement | null;

        if (selectUnidad == null || selectFiltroUnidad == null)
            return;

        let unidades = await obtenerUnidades();

        if (!unidades || !Array.isArray(unidades.data))
            return;

        let opcionesForm = `<option value="">Seleccione una unidad academica</option>`;
        let opcionesFiltro = `<option value="">Unidad academica</option>`;

        for (let i = 0; i < unidades.data.length; i++) {
            let unidad = unidades.data[i];
            opcionesForm += `<option value="${unidad.id_unidad}">${unidad.nombre}</option>`;
            opcionesFiltro += `<option value="${unidad.nombre}">${unidad.nombre}</option>`;
        }

        selectUnidad.innerHTML = opcionesForm;
        selectFiltroUnidad.innerHTML = opcionesFiltro;
    }
    
    async function listarRelaciones() {
        const opciones = document.getElementById("tipo") as HTMLSelectElement | null;
        const formulario = document.getElementById("relaciones-convenios") as HTMLFormElement | null;
        if (!opciones || !formulario) return;

        formulario.innerHTML = "";
        const tipo = opciones.value;

        if (tipo === "") {
            formulario.innerHTML = `<p class="text-warning">Seleccione un tipo de convenio</p>`;
            return;
        }

        const resp = await obtenerConvenios();
        const convenios: any[] = resp.status === 200 ? resp.data : [];

        // 1. Específicos (8 = Colaboración, 10 = Pasantía) -> tipo_relacion: "especifico_de"
        if (tipo === "2") {
            const idMarcoCompatible = 1;
            const marcos = convenios.filter(c => Number(c.id_tipo_instrumento) === idMarcoCompatible);

            const opcionesHtml = marcos.length > 0
                ? marcos.map(m => `<option value="${m.id_instrumento}">${m.codigo} - ${m.titulo}</option>`).join("")
                : `<option value="">No hay convenios marco compatibles registrados</option>`;

            formulario.innerHTML = `
                <label class="form-label">Convenio(s) Marco compatible(s)</label>
                <select class="form-select relacion-select" data-tipo-relacion="especifico_de">
                    <option value="">Seleccione un convenio marco...</option>
                    ${opcionesHtml}
                </select>
                <button type="button" id="agregar-compatible" class="btn btn-secondary">
                    + Agregar otro marco compatible
                </button>
            `;

            formulario.querySelector("#agregar-compatible")?.addEventListener("click", () => {
                const boton = formulario.querySelector("#agregar-compatible");
                const nuevoSelect = document.createElement("select");
                nuevoSelect.className = "form-select relacion-select";
                nuevoSelect.dataset.tipoRelacion = "especifico_de";
                nuevoSelect.innerHTML = `<option value="">Seleccione otro convenio marco...</option>${opcionesHtml}`;
                boton?.insertAdjacentElement("beforebegin", nuevoSelect);
            });
        }

        // 2. Adenda (4) -> tipo_relacion: "modifica"
        if (tipo === "4") {
            const opcionesHtml = convenios
                .map(c => `<option value="${c.id_instrumento}">${c.codigo} - ${c.titulo}</option>`)
                .join("");

            formulario.innerHTML = `
                <label class="form-label">Instrumento que modifica esta adenda</label>
                <select class="form-select relacion-select" data-tipo-relacion="modifica">
                    <option value="">Seleccione el convenio a modificar...</option>
                    ${opcionesHtml}
                </select>
            `;
        }

        // 3. Antecedente opcional -> tipo_relacion: "renueva" o "sustituye"
        const todosHtml = convenios
            .map(c => `<option value="${c.id_instrumento}">${c.codigo} - ${c.titulo}</option>`)
            .join("");

        formulario.insertAdjacentHTML("beforeend", `
            <div class="mt-2 border-top pt-2 d-flex flex-column gap-2">
                <label class="form-label">¿Es renovación o sustitución de un convenio anterior? (Opcional)</label>
                <div class="d-flex gap-2">
                    <select id="tipo-antecedente" class="form-select">
                        <option value="">No aplica</option>
                        <option value="renueva">Renueva a...</option>
                        <option value="sustituye">Sustituye a...</option>
                    </select>
                    <select id="id-antecedente" class="form-select">
                        <option value="">Seleccione antecedente...</option>
                        ${todosHtml}
                    </select>
                </div>
                <input type="text" id="descripcion-relacion" class="form-control" placeholder="Descripción o motivo del vínculo (opcional)">
            </div>
        `);
    }

    async function abrirDetalles(id : string){
        const modal = document.getElementById("ventanaDetalles") as HTMLDialogElement;

        let datos = await obtenerConvenioEspecifico(id);

        if (datos.data == null) {
            alert(datos.mensaje ?? datos.message ?? "No se pudieron obtener los detalles del convenio.");
            return;
        }

        let documentos = datos.data.documentos ?? [];
        let htmlDocumentos = documentos.length === 0
            ? `<p class="text-muted">No hay documentos PDF adjuntos.</p>`
            : `<ul class="list-unstyled">${documentos.map((documento: any) => `
                <li class="d-flex flex-wrap align-items-center gap-2 mb-2">
                    <span>${documento.tipo_documento === "principal" ? "Convenio PDF" : escaparHtml(String(documento.nombre ?? "Documento PDF"))} (versión ${escaparHtml(String(documento.version ?? "1"))})</span>
                    <button type="button" class="btn btn-sm btn-outline-primary btn-descargar-detalle"
                        data-id="${escaparHtml(String(documento.id_documento))}" data-nombre="${escaparHtml(String(documento.nombre ?? "convenio.pdf"))}">
                        ${documento.tipo_documento === "principal" ? "Descargar Convenio PDF" : "Descargar PDF"}
                    </button>
                </li>
            `).join("")}</ul>`;

        modal.innerHTML = "";

        console.log(datos);

        modal.innerHTML += `
        <div class="d-flex flex-column">
            <h5 class="titulo h5">Detalles del convenio</h5>
            <small>${datos.data.codigo}</small>
            <h1 class="titulo h1">${datos.data.titulo}</h1>
        </div>
        <div class="d-flex flex-column border-bottom border-top">
            <div>
                <h5 class="titulo h5">1. Informacion general</h5>
                <ul>
                    <li><strong>Tipo de instrumento: </strong>${datos.data.tipo_instrumento.nombre}</li>
                    <li><strong>Unidad: </strong>${datos.data.unidad.nombre}</li>
                    <li><strong>Objeto del convenio: </strong>${datos.data.objeto}</li>
                    <li><strong>Alcance del convenio: </strong>${datos.data.alcance}</li>
                </ul>
            </div>
            <div>
                <h5 class="titulo h5">2. Informacion administrativa</h5>
                <ul>
                    <li><strong>Expediente de referencia: </strong>${datos.data.expediente_referencia}</li>
                    <li><strong>Resolucion: </strong>${datos.data.resolucion}</li>
                    <li><strong>Obligaciones: </strong>${datos.data.obligaciones}</li>
                    <li><strong>Condiciones de rescision: </strong>${datos.data.rescision}</li>
                </ul>
            </div>
            <div>
                <h5 class="titulo h5">3. Fechas</h5>
                <ul>
                    <li><strong>Fecha de firma: </strong>${datos.data.fecha_firma}</li>
                    <li><strong>Fecha de inicio: </strong>${datos.data.fecha_inicio}</li>
                    <li><strong>Fecha de vencimiento: </strong>${datos.data.fecha_vencimiento}</li>
                    <li><strong>Plazo de preaviso: </strong>${datos.data.plazo_preaviso} DIAS</li>
                </ul>
            </div>
        </div>
        <section class="mt-3">
            <h5 class="titulo h5">Documentos</h5>
            ${htmlDocumentos}
        </section>
        ${normalizar(String(datos.data.estado?.nombre ?? "")) === "borrador" ? `
            <button type="button" class="btn btn-primary mt-3" id="enviar-revision">
                Enviar a revisión
            </button>
        ` : ""}

        ${datos.data.estado?.nombre === "aprobado" ? `
            <button type="button" class="btn btn-success mt-3" id="marcar-firmado">
                Marcar como firmado
            </button>
        ` : ""}

        ${datos.data.estado?.nombre === "firmado" ? `
            <button type="button" class="btn btn-danger mt-3" id="marcar-rescindido">
                Rescindir convenio
            </button>
        ` : ""}

        ${datos.data.estado?.nombre === "rescindido" ? `
            <button type="button" class="btn btn-secondary mt-3" id="marcar-archivado">
                Archivar convenio
            </button>
        ` : ""}

        <button type="button" class="btn btn-danger mt-3" id="cerrar-detalles">
            Cerrar
        </button>
        
        `;
        
        

        modal.querySelector("#cerrar-detalles")?.addEventListener("click", cerrarDetalles);
        modal.querySelectorAll(".btn-descargar-detalle").forEach((boton) => {
            boton.addEventListener("click", async () => {
                let idDocumento = boton.getAttribute("data-id");
                let nombre = boton.getAttribute("data-nombre") ?? "convenio.pdf";
                if (idDocumento == null) return;

                let ok = await descargarDocumento(idDocumento, nombre);
                if (!ok) alert("No se pudo descargar el PDF del convenio.");
            });
        });
        modal.querySelector("#enviar-revision")?.addEventListener("click", async () => {
        let fundamento = prompt("Ingresá el fundamento del envío a revisión:");

        if (fundamento == null || fundamento.trim() === "") {
            alert("Tenés que ingresar un fundamento.");
            return;
        }

        let respuesta = await cambiarEstado(id, {
            id_estado_nuevo: 2,
            fundamento: fundamento.trim()
        });

        if (respuesta.data == null) {
            alert(respuesta.mensaje ?? respuesta.message ?? "No se pudo cambiar el estado.");
            return;
        }

        alert("El convenio fue enviado a revisión correctamente.");
        cerrarDetalles();
        listarConvenios(1);
    });

        
    modal.querySelector("#marcar-firmado")?.addEventListener("click", async () => {
        let fundamento = prompt("Ingresá el fundamento de la firma:");

        if (fundamento == null || fundamento.trim() === "") {
            alert("Tenés que ingresar un fundamento.");
            return;
        }

        let fechaFirma = prompt("Ingresá la fecha de firma (AAAA-MM-DD):");

        if (fechaFirma == null || fechaFirma.trim() === "") {
            alert("Tenés que ingresar una fecha de firma.");
            return;
        }

        if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaFirma)) {
            alert("La fecha debe tener el formato AAAA-MM-DD.");
            return;
        }

        let respuesta = await cambiarEstado(id, {
            id_estado_nuevo: 4,
            fundamento: fundamento.trim(),
            fecha_firma: fechaFirma.trim()
        });

        if (respuesta.data == null) {
            alert(respuesta.mensaje ?? respuesta.message ?? "No se pudo cambiar el estado.");
            return;
        }

        alert("El convenio fue marcado como firmado correctamente.");
        cerrarDetalles();
        listarConvenios(1);
    });


        modal.querySelector("#marcar-rescindido")?.addEventListener("click", async () => {
            let fundamento = prompt("Ingresá el fundamento de la rescisión:");

            if (fundamento == null || fundamento.trim() === "") {
                alert("Tenés que ingresar un fundamento.");
                return;
            }

            let respuesta = await cambiarEstado(id, {
                id_estado_nuevo: 5,
                fundamento: fundamento.trim()
            });

            if (respuesta.data == null) {
                alert(respuesta.mensaje ?? respuesta.message ?? "No se pudo rescindir el convenio.");
                return;
            }

            alert("El convenio fue rescindido correctamente.");
            cerrarDetalles();
            listarConvenios(1);
        });

        modal.querySelector("#marcar-archivado")?.addEventListener("click", async () => {
            let fundamento = prompt("Ingresá el fundamento del archivo:");

            if (fundamento == null || fundamento.trim() === "") {
                alert("Tenés que ingresar un fundamento.");
                return;
            }

            let respuesta = await cambiarEstado(id, {
                id_estado_nuevo: 6,
                fundamento: fundamento.trim()
            });

            if (respuesta.data == null) {
                alert(respuesta.mensaje ?? respuesta.message ?? "No se pudo archivar el convenio.");
                return;
            }

            alert("El convenio fue archivado correctamente.");
            cerrarDetalles();
            listarConvenios(1);
        });

        modal.showModal();
    }

    function cerrarDetalles(){
        const modal = document.getElementById("ventanaDetalles") as HTMLDialogElement;
        modal.close();
    }

    function valor(id: string) {
    let elemento = document.getElementById(id) as HTMLInputElement | null;
    return elemento == null ? "" : elemento.value.trim();
}

    async function registrarConvenio(){
    // 1. Validaciones antes de enviar nada
    // 1. Validación (reemplaza la comparación entre primera-institucion y segunda-institucion)
        let selectsInstituciones = Array.from(
            document.querySelectorAll<HTMLSelectElement>("#contenedor-instituciones .institucion-select")
        );
        let institucionesSeleccionadas = selectsInstituciones
            .map((s) => s.value)
            .filter((v) => v !== "");

        if (new Set(institucionesSeleccionadas).size !== institucionesSeleccionadas.length) {
            alert("Las instituciones firmantes deben ser distintas entre sí.");
            return;
        }

        let filasPersonas = Array.from(document.querySelectorAll<HTMLElement>("#contenedor-personas .fila-persona"));
        let personasSeleccionadas: { id_persona: string; rol: string; fecha_inicio: string; fecha_fin: string }[] = [];

    for (let i = 0; i < filasPersonas.length; i++) {
        let fila = filasPersonas[i];
        let idPersona = (fila.querySelector(".persona-select") as HTMLSelectElement | null)?.value ?? "";
        let rol = (fila.querySelector(".persona-rol") as HTMLInputElement | null)?.value.trim() ?? "";
        let fechaInicio = (fila.querySelector(".persona-fecha-inicio") as HTMLInputElement | null)?.value ?? "";
        let fechaFin = (fila.querySelector(".persona-fecha-fin") as HTMLInputElement | null)?.value ?? "";

        if (idPersona === "" && rol === "" && fechaInicio === "")
            continue;

        if (idPersona === "" || rol === "" || fechaInicio === "") {
            alert("Para cada persona vinculada completá persona, rol y fecha de inicio.");
            return;
        }

        personasSeleccionadas.push({ id_persona: idPersona, rol, fecha_inicio: fechaInicio, fecha_fin: fechaFin });
    }   

    if (new Set(personasSeleccionadas.map((p) => p.id_persona)).size !== personasSeleccionadas.length) {
        alert("No podés vincular dos veces a la misma persona en el convenio.");
        return;
    }

    if (esTipoPasantia()) {
        if (personasSeleccionadas.length === 0) {
            alert("Para un convenio de pasantía debés vincular al menos al pasante.");
            return;
        }
        if (valor("pasantia-carrera") === "" || valor("pasantia-tutor-academico") === "" || valor("pasantia-carga-horaria") === "") {
            alert("Completá al menos carrera, tutor académico y carga horaria de la pasantía.");
            return;
        }
    }

    let inputArchivo = document.getElementById("archivo") as HTMLInputElement;
    let archivo = inputArchivo.files?.[0];

    if (archivo){
        if (archivo.size > 20 * 1024 * 1024){
            alert("El archivo no puede superar los 20 MB.");
            return;
        }
        if (valor("tipo_documento") === "tipo-documento"){
            alert("Seleccioná el tipo de documento.");
            return;
        }
    }

    // 2. Datos del convenio
    let datos = new FormData();
    datos.append("codigo", valor("codigo"));
    datos.append("titulo", valor("titulo"));
    datos.append("id_tipo_instrumento", valor("tipo"));
    datos.append("id_unidad", valor("unidad-responsable"));
    
    let opcionales = [
        ["objeto", "objeto"],
        ["alcance", "alcance"],
        ["obligaciones", "obligaciones"],
        ["rescision", "condiciones-rescision"],
        ["marco_legal", "marco-legal"],
        ["resolucion", "resolucion"],
        ["expediente_referencia", "expediente"],
        ["condiciones_renovacion", "condiciones-renovacion"],
        ["confidencialidad", "confidencialidad"],
        ["notas", "notas-adicionales"],
        ["fecha_firma", "fecha-firma"],
        ["fecha_inicio", "fecha-inicio"],
        ["fecha_vencimiento", "fecha-vencimiento"],
        ["plazo_preaviso", "plazo-preaviso"]
    ];

    for (let i = 0; i < opcionales.length; i++){
        let texto = valor(opcionales[i][1]);
        if (texto !== "")
            datos.append(opcionales[i][0], texto);
    }

    // Si estamos editando un convenio existente
    if (idConvenioEditando !== null) {

        let datosActualizados = {
            version: versionConvenioEditando,
            codigo: valor("codigo"),
            titulo: valor("titulo"),
            id_tipo_instrumento: Number(valor("tipo")),
            id_unidad: Number(valor("unidad-responsable")),
            objeto: valor("objeto"),
            alcance: valor("alcance"),
            obligaciones: valor("obligaciones"),
            rescision: valor("condiciones-rescision"),
            marco_legal: valor("marco-legal"),
            resolucion: valor("resolucion"),
            expediente_referencia: valor("expediente"),
            condiciones_renovacion: valor("condiciones-renovacion"),
            confidencialidad: valor("confidencialidad"),
            notas: valor("notas-adicionales"),
            fecha_firma: valor("fecha-firma") || null,
            fecha_inicio: valor("fecha-inicio") || null,
            fecha_vencimiento: valor("fecha-vencimiento") || null,
            plazo_preaviso: valor("plazo-preaviso") === ""
                ? null
                : Number(valor("plazo-preaviso"))
        };

        let respuesta = await actualizarConvenio(
            idConvenioEditando,
            datosActualizados
        );

        if (respuesta.data == null) {
            let mensaje = respuesta.errors
                ? Object.values(respuesta.errors).join("\n")
                : (respuesta.mensaje ?? respuesta.message ?? "No se pudo actualizar el convenio.");

            alert(mensaje);
            return;
        }

        alert("Convenio actualizado correctamente.");

        setIdConvenioEditando(null);
        setVersionConvenioEditando(null);

        cerrarModal();
        listarConvenios(1);
        return;
    }

    // Si no estamos editando, continúa el registro normal
    let respuesta = await registrar(datos);

    if (respuesta.data == null){
        let mensaje = respuesta.errors
            ? Object.values(respuesta.errors).join("\n")
            : (respuesta.mensaje ?? respuesta.message ?? "No se pudo registrar el convenio.");
        alert(mensaje);
        return;
    }

    let idInstrumento = String(respuesta.data.id_instrumento);
    let avisos = "";

    let selectsRelacion = document.querySelectorAll<HTMLSelectElement>("#relaciones-convenios .relacion-select");
    let relacionadosEnviados = new Set<string>();
    let descripcionRelacion = valor("descripcion-relacion");

    for (let i = 0; i < selectsRelacion.length; i++) {
       let idDestino = selectsRelacion[i].value;
       if (idDestino === "" || relacionadosEnviados.has(idDestino))
           continue;
       
        relacionadosEnviados.add(idDestino);

        let relacion = new FormData();
        relacion.append("id_instrumento_origen", idInstrumento);
        relacion.append("id_instrumento_destino", idDestino);
        relacion.append("tipo_relacion", selectsRelacion[i].dataset.tipoRelacion ?? "especifico_de");
        if (descripcionRelacion !== "")
            relacion.append("descripcion", descripcionRelacion);

        let resRelacion = await registrarRelacion(relacion);
        if (resRelacion.datos == null)
            avisos += "\n- No se pudo registrar una de las relaciones con convenio marco/modificado";
    }

// Antecedente (renueva / sustituye)
    let tipoAntecedente = valor("tipo-antecedente");
    let idAntecedente = valor("id-antecedente");

    if (tipoAntecedente !== "" && idAntecedente !== "") {
        let antecedente = new FormData();
        antecedente.append("id_instrumento_origen", idInstrumento);
        antecedente.append("id_instrumento_destino", idAntecedente);
        antecedente.append("tipo_relacion", tipoAntecedente);
        if (descripcionRelacion !== "")
            antecedente.append("descripcion", descripcionRelacion);

        let resAntecedente = await registrarRelacion(antecedente);
        if (resAntecedente.datos == null)
            avisos += "\n- No se pudo registrar el antecedente (" + tipoAntecedente + ")";
    }

    // 3. Partes (instituciones firmantes)
    const nombresCaracter = ["Primera parte", "Segunda parte", "Tercera parte", "Cuarta parte", "Quinta parte"];

    for (let i = 0; i < institucionesSeleccionadas.length; i++) {
        let parte = new FormData();
        parte.append("id_instrumento", idInstrumento);
        parte.append("id_institucion", institucionesSeleccionadas[i]);
        parte.append("caracter_parte", nombresCaracter[i] ?? `Parte ${i + 1}`);

        let resParte = await registrarParte(parte);
        console.log("Respuesta al registrar parte:", resParte);
        if (resParte.datos == null)
            avisos += "\n- No se pudo registrar la parte " + (i + 1);
    }

    // 4. Personas y pasantías
    let primeraParticipacionId: string | null = null;

    for (let i = 0; i < personasSeleccionadas.length; i++) {
        let p = personasSeleccionadas[i];
        let participacion = new FormData();
        participacion.append("id_instrumento", idInstrumento);
       participacion.append("id_persona", p.id_persona);
        participacion.append("rol", p.rol);
        participacion.append("fecha_inicio", p.fecha_inicio);
        if (p.fecha_fin !== "")
           participacion.append("fecha_fin", p.fecha_fin);

        let resParticipacion = await registrarParticipacion(participacion);
        if (resParticipacion.datos == null && resParticipacion.data == null) {
            avisos += "\n- No se pudo vincular a una de las personas";
        } else if (i === 0) {
            let creado = resParticipacion.datos ?? resParticipacion.data;
            primeraParticipacionId = String(creado.id_participacion ?? creado.id ?? "");
        }
    }
    
        if (esTipoPasantia() && personasSeleccionadas.length > 0) {
        let pasantia = new FormData();
        pasantia.append("id_instrumento", idInstrumento);
        pasantia.append("id_persona", personasSeleccionadas[0].id_persona);
        if (primeraParticipacionId)
            pasantia.append("id_participacion", primeraParticipacionId);
        pasantia.append("carrera", valor("pasantia-carrera"));
        pasantia.append("tutor_academico", valor("pasantia-tutor-academico"));
        if (valor("pasantia-tutor-externo") !== "")
            pasantia.append("tutor_externo", valor("pasantia-tutor-externo"));
        pasantia.append("carga_horaria", valor("pasantia-carga-horaria"));
        if (valor("pasantia-asignacion") !== "")
            pasantia.append("asignacion_estimulo", valor("pasantia-asignacion"));
        if (valor("pasantia-seguro") !== "")
            pasantia.append("seguro", valor("pasantia-seguro"));

        let resPasantia = await registrarPasantia(pasantia);
        if (resPasantia.datos == null && resPasantia.data == null)
            avisos += "\n- No se pudieron guardar los datos complementarios de la pasantía";
    }

    // 5. Documento
    if (archivo){
        let documento = new FormData();
        documento.append("id_instrumento", idInstrumento);
        documento.append("tipo_documento", valor("tipo_documento"));
        documento.append("archivo", archivo);

        let resDocumento = await subirDocumento(documento);
        if (resDocumento.documento == null)
            avisos += "\n- No se pudo subir el documento";
    }

    if (avisos === "")
        alert("Convenio registrado correctamente como borrador.");
    else
        alert("El convenio se registró como borrador, pero:" + avisos);

    cerrarModal();
    listarConvenios(1);
    }

    async function listarConvenios(pagina: number = 1) {
    let resultados = document.getElementById("resultados");
    let buscador = document.getElementById("buscador") as HTMLInputElement | null;
    let filtroTipo = document.getElementById("filtro-tipo") as HTMLSelectElement | null;
    let filtroEstado = document.getElementById("filtro-estado") as HTMLSelectElement | null;
    let filtroUnidad = document.getElementById("filtro-unidad-academica") as HTMLSelectElement | null;
    let filtroFechas = document.getElementById("filtro-fechas") as HTMLSelectElement | null;

    if (filtroTipo == null || filtroEstado == null || filtroUnidad == null || filtroFechas == null || buscador == null || resultados == null)
        return;

    resultados.innerHTML = `
        <div class="d-flex flex-column justify-content-center align-items-center py-4">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Cargando...</span>
            </div>
            <p class="mt-3 text-secondary">Cargando convenios...</p>
        </div>
    `;

    let datos;
    try {
        datos = await obtenerConvenios();
    } catch {
        resultados.innerHTML = `<p class="text-danger">No se pudieron obtener los convenios.</p>`;
        return;
    }

    if (datos.status != 200) {
        resultados.innerHTML = `<p class="text-danger">No se pudieron obtener los convenios.</p>`;
        return;
    }

    let tipoSeleccionado = filtroTipo.value;
    let estadoSeleccionado = filtroEstado.value;
    let unidadSeleccionada = filtroUnidad.value;
    let fechasSeleccionadas = filtroFechas.value;
    let textoBuscado = buscador.value.trim().toLowerCase();

    let conveniosFiltrados = datos.data.filter((convenio: any) => {
        let coincideTipo =
            tipoSeleccionado === "" ||
            normalizar(String(convenio.tipo_instrumento?.nombre)) === normalizar(tipoSeleccionado);

        let coincideEstado =
            estadoSeleccionado === "" ||
            normalizar(String(convenio.estado?.nombre)) === normalizar(estadoSeleccionado);

        let coincideUnidad =
            unidadSeleccionada === "" ||
            normalizar(String(convenio.unidad?.nombre)) === normalizar(unidadSeleccionada);

        let coincideFecha = true;

        if (fechasSeleccionadas !== "") {
            if (!convenio.fecha_firma) {
                coincideFecha = false;
            } else {
                let fechaFirma = new Date(convenio.fecha_firma);
                let hoy = new Date();

                hoy.setHours(0, 0, 0, 0);
                fechaFirma.setHours(0, 0, 0, 0);

                let dias = Number(fechasSeleccionadas);
                let fechaLimite = new Date(hoy);
                fechaLimite.setDate(fechaLimite.getDate() - dias);

                if (fechasSeleccionadas === "antiguos") {
                    fechaLimite = new Date(hoy);
                    fechaLimite.setFullYear(fechaLimite.getFullYear() - 1);
                    coincideFecha = fechaFirma < fechaLimite;
                } else {
                    coincideFecha = fechaFirma >= fechaLimite && fechaFirma <= hoy;
                }
            }
        }

        let coincideBusqueda =
            textoBuscado === "" ||
            normalizar(convenio.codigo ?? "").includes(normalizar(textoBuscado)) ||
            normalizar(convenio.titulo ?? "").includes(normalizar(textoBuscado)) ||
            normalizar(convenio.tipo_instrumento?.nombre ?? "").includes(normalizar(textoBuscado)) ||
            normalizar(convenio.unidad?.nombre ?? "").includes(normalizar(textoBuscado)) ||
            normalizar(convenio.estado?.nombre ?? "").includes(normalizar(textoBuscado));

        return coincideTipo && coincideEstado && coincideUnidad && coincideBusqueda && coincideFecha;
    });

    if (conveniosFiltrados.length === 0) {
        resultados.innerHTML = `<p class="text-muted">No hay convenios que coincidan con la búsqueda.</p>`;
        return;
    }

    // Cálculo de paginación
    let totalRegistros = conveniosFiltrados.length;
    let totalPaginas = Math.ceil(totalRegistros / CONVENIOS_POR_PAGINA);
    let paginaValida = Math.min(Math.max(1, pagina), totalPaginas);
    let inicio = (paginaValida - 1) * CONVENIOS_POR_PAGINA;
    let conveniosPagina = conveniosFiltrados.slice(inicio, inicio + CONVENIOS_POR_PAGINA);

    let filas = "";
    for (let i = 0; i < conveniosPagina.length; i++) {
        filas += `
        <tr>
            <td>${conveniosPagina[i].codigo}</td>
            <td>${conveniosPagina[i].titulo}</td>
            <td>${conveniosPagina[i].tipo_instrumento?.nombre ?? "Sin tipo"}</td>
            <td>${conveniosPagina[i].unidad?.nombre ?? "Sin unidad"}</td>
            <td>${conveniosPagina[i].estado?.nombre ?? "Sin estado"}</td>
            <td class="d-flex gap-2">
                <button
                    type="button"
                    class="btn btn-info btn-detalles"
                    data-id="${conveniosPagina[i].id_instrumento}">
                    VER DETALLES
                </button>

                ${puedeCrearOEditarConvenios(rolUsuarioRef.current) && normalizar(String(conveniosPagina[i].estado?.nombre ?? "")) === "borrador" ? `
                    <button
                        type="button"
                        class="btn btn-warning btn-editar"
                        data-id="${conveniosPagina[i].id_instrumento}">
                        EDITAR
                    </button>
                ` : ""}
            </td>
        </tr>
        `;
    }

    resultados.innerHTML = `
    <table class="table table-striped table-bordered rounded">
        <thead>
            <tr>
                <th>Código</th>
                <th>Título</th>
                <th>Tipo</th>
                <th>Unidad</th>
                <th>Estado</th>
                <th></th>
            </tr>
        </thead>
        <tbody>${filas}</tbody>
    </table>
    <div class="d-flex justify-content-between align-items-center mt-3">
        <button type="button" class="btn btn-outline-secondary btn-pagina" data-pagina="${paginaValida - 1}"
            ${paginaValida <= 1 ? "disabled" : ""}>Anterior</button>
        <span>Página ${paginaValida} de ${totalPaginas} (${totalRegistros} registros)</span>
        <button type="button" class="btn btn-outline-secondary btn-pagina" data-pagina="${paginaValida + 1}"
            ${paginaValida >= totalPaginas ? "disabled" : ""}>Siguiente</button>
    </div>
    `;

    resultados.querySelectorAll(".btn-editar").forEach((boton) => {
        boton.addEventListener("click", () => {
            let id = boton.getAttribute("data-id");

            if (id != null)
                editarConvenio(id);
        });
    });

    resultados.querySelectorAll(".btn-detalles").forEach((boton) => {
        boton.addEventListener("click", () => {
            let id = boton.getAttribute("data-id");
            if (id != null)
                abrirDetalles(id);
        });
    });

    resultados.querySelectorAll(".btn-pagina").forEach((boton) => {
        boton.addEventListener("click", () => {
            let numero = boton.getAttribute("data-pagina");
            if (numero != null)
                listarConvenios(Number(numero));
        });
    });
}
    return(
        <div>
            <section className="listadoConvenios border rounded p-3 d-flex flex-column">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                        <h4 className="titulo h4">Gestión de convenios</h4>
                        <small className="form-text text-muted">
                        Consulta y administración de instrumentos
                        </small>
                    </div>
                    {puedeCrearOEditarConvenios(rolUsuario) && <button className="btn btn-secondary" onClick={abrirModal}>
                        + Nuevo convenio
                    </button>}
                </div>
                <dialog id="ventanaRegistro" className="ventanaRegistro">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h3 className="titulo h3">Formulario de registro de un nuevo convenio</h3>
                            <button type="button" className="btn btn-danger" onClick={cerrarModal}>Cerrar</button>
                        </div>
                        
                        <h4 className="titulo h4">1. Informacion general</h4>

                        <form className="d-flex flex-column gap-3 mb-5">
                            <input type="text" name="codigo" id="codigo" className="form-control" placeholder="Código único"/>
                            <input type="text" name="titulo" id="titulo" className="form-control" placeholder="Título"/>
                            <select id="tipo" className="form-select" defaultValue="" onChange={() => {
                                listarRelaciones();
                                actualizarSeccionPasantias();
                            }}>
                            </select>
                            <select id="unidad-responsable" name="unidad" className="form-select" defaultValue="">
                            </select>
                            <textarea id="objeto" name="objeto" className="form-control" rows={4} placeholder="Ingrese el objeto del convenio..."></textarea>
                            <textarea id="alcance" name="alcance" className="form-control" rows={4} placeholder="Ingrese el alcance del convenio..."/>
                        </form>

                        <h4 className="titulo h4">2. Informacion administrativa y legal</h4>

                        <form className="d-flex flex-column gap-3 mb-5">
                            <textarea className="form-control" name="obligaciones" id="obligaciones" placeholder="Obligaciones..." rows={4}></textarea>
                            <textarea className="form-control" name="rescision" id="condiciones-rescision" placeholder="Condiciones de rescision..." rows={4}></textarea>
                            <textarea className="form-control" name="marco_legal" id="marco-legal" placeholder="Ingrese marco legal..." rows={4}></textarea>
                            <input type="text" id="resolucion" name="resolucion" className="form-control" placeholder="Ingrese la resolucion"/>
                            <input type="text" id="expediente" name="expediente_referencia" className="form-control" placeholder="Ingrese un expediente o referencia"/>
                            <textarea className="form-control" name="condiciones_renovacion" id="condiciones-renovacion" placeholder="Ingrese las condiciones de renovacion..." rows={4}></textarea>
                            <textarea className="form-control" name="confidencialidad" id="confidencialidad" placeholder="Ingrese la confidencialidad..." rows={4}></textarea>
                            <textarea className="form-control" name="notas" id="notas-adicionales" placeholder="Notas adicionales..." rows={4}></textarea>
                        </form>

                        <h4 className="titulo h4">3. Fechas del convenio</h4>

                        <form className="d-flex flex-column gap-3 mb-5">
                            <label htmlFor="fecha-firma" className="form-label">Fecha de firma</label>
                            <input type="date" name="fecha_firma" id="fecha-firma"/>
                            <label htmlFor="fecha-inicio" className="form-label">Fecha de inicio</label>
                            <input type="date" name="fecha_inicio" id="fecha-inicio"/>
                            <label htmlFor="fecha-vencimiento" className="form-label">Fecha de vencimiento</label>
                            <input type="date" name="fecha_vencimiento" id="fecha-vencimiento"/>
                            <label htmlFor="plazo-preaviso" className="form-label">Plazo de preaviso (en días)</label>
                            <input type="number" min={0} name="plazo_preaviso" id="plazo-preaviso"/>
                        </form>

                        <h4 className="titulo h4">4. Partes e instituciones</h4>

                        <form className="d-flex flex-column gap-3 mb-5" onSubmit={(e) => e.preventDefault()}>
                            <h5 className="titulo h5">Instituciones firmantes</h5>

                            <div id="contenedor-instituciones" className="d-flex flex-column gap-2">
                                <select id="primera-institucion" name="primera_institucion" className="form-select border rounded institucion-select" defaultValue="">
                                    <option value="">Seleccione institución (Parte 1)...</option>
                                </select>
                                <select id="segunda-institucion" name="segunda_institucion" className="form-select border rounded institucion-select" defaultValue="">
                                    <option value="">Seleccione institución (Parte 2)...</option>
                                </select>
                            </div>

                            <button type="button" className="btn btn-secondary" onClick={agregarParteFirmante}>
                                Agregar nueva institucion
                            </button>
                        </form>

                        <h4 className="titulo h4">5. Relaciones</h4>

                        <form id="relaciones-convenios" className="d-flex flex-column gap-3 mb-5">
                            <p className="text-warning">Seleccione un tipo de convenio</p>
                        </form>

                        <h4 className="titulo h4">6. Personas y pasantías</h4>

                        <form className="d-flex flex-column gap-3 mb-5" onSubmit={(e) => e.preventDefault()}>
                            <div id="contenedor-personas" className="d-flex flex-column gap-3">
                                <div className="border rounded p-3 d-flex flex-column gap-2 fila-persona">
                                    <select id="personas" className="form-select persona-select" defaultValue="">
                                        <option value="">Seleccione una persona...</option>
                                    </select>
                                    <input
                                        type="text"
                                        id="rol"
                                        className="form-control persona-rol"
                                        placeholder="Ingrese el rol de la persona en el convenio (ej: Pasante, Coordinador)"
                                    />
                                    <div className="row g-2">
                                        <div className="col-12 col-md-6">
                                            <label htmlFor="persona-fecha-inicio" className="form-label">Fecha de inicio</label>
                                            <input type="date" id="persona-fecha-inicio" className="form-control persona-fecha-inicio" />
                                        </div>
                                        <div className="col-12 col-md-6">
                                            <label htmlFor="persona-fecha-fin" className="form-label">Fecha de fin (opcional)</label>
                                            <input type="date" id="persona-fecha-fin" className="form-control persona-fecha-fin" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button type="button" className="btn btn-secondary" onClick={agregarPersonaConvenio}>
                                + Agregar otra persona
                            </button>

                            <div id="seccion-pasantias" className="d-flex flex-column"></div>
                        </form>

                        <h4 className="titulo h4">7. Documentacion</h4>

                        <form className="d-flex flex-column gap-3 mb-5">
                            <label htmlFor="archivo" className="form-label">Archivo PDF</label>
                            <input type="file" name="archivo" id="archivo" accept="application/pdf" className="form-control"/>
                            <select className="form-select border rounded" name="tipo_documento" id="tipo_documento" defaultValue="tipo-documento">
                                <option value="tipo-documento">Tipo de documento</option>
                                <option value="principal">Principal</option>
                                <option value="anexo">Anexo</option>
                                <option value="dictamen">Dictamen</option>
                                <option value="resolucion">Resolucion</option>
                                <option value="otro">Otro</option>
                            </select>
                        </form>
                        <button className="btn btn-secondary" type="button" onClick={registrarConvenio}>
                            {idConvenioEditando !== null ? "Guardar cambios" : "Registrar convenio"}
                        </button>
                </dialog>
                <div className="d-flex flex-column gap-3">
                    <form className="d-flex flex-column border rounded">
                        <input type="text" className="form-control border-0 border-bottom rounded-0 mb-4" id="buscador" placeholder="Buscar por código, título o palabra clave..."/>
                        <div className="opcionesFormulario">
                            <select className="form-select border-0" id="filtro-tipo" defaultValue="">
                                <option value="">Tipo de instrumento</option>
                            </select>
                            <select className="form-select border-0" id="filtro-estado" defaultValue="">
                                <option value="">Estado</option>
                                <option value="borrador">Borrador</option>
                                <option value="revision">Revisión</option>
                                <option value="aprobado">Aprobado</option>
                                <option value="firmado">Firmado</option>
                                <option value="rescindido">Rescindido</option>
                                <option value="archivado">Archivado</option>
                            </select>
                            <select className="form-select border-0" id="filtro-unidad-academica" defaultValue="">
                                <option value="">Unidad academica</option>
                            </select>
                            <select className="form-select border-0" id="filtro-fechas" defaultValue="">
                                <option value="">Todos los períodos</option>
                                <option value="30">Últimos 30 días</option>
                                <option value="90">Últimos 3 meses</option>
                                <option value="180">Últimos 6 meses</option>
                                <option value="365">Último año</option>
                                <option value="antiguos">Más de un año</option>
                            </select>
                        </div>
                    </form>
                    <button className="btn btn-secondary" onClick={() => listarConvenios(1)}>Buscar</button>
                    <dialog className="ventanaRegistro" id="ventanaDetalles"></dialog>
                </div>
                <div className="resultados pt-5" id="resultados">
                </div>
            </section>
        </div>
    );
}
