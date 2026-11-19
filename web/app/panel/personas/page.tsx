"use client"

import { verificarSesion } from "@/services/authService";
import { obtenerPersonas, obtenerPersona, registrar } from "@/services/personasService";
import { obtenerInstituciones } from "@/services/institucionesService";
import { useEffect, useState } from "react";
import SpinnerCarga from "@/components/SpinnerCarga";

const PERSONAS_POR_PAGINA = 10;

export default function PersonasPage(){
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        verificarSesion();
        listarPersonas(1);
        llenarInstituciones();
    }, []);

    // Evita que un texto con etiquetas HTML se ejecute al mostrarlo con innerHTML.
    // Si el dato viene vacío devuelve "-".
    function escapar(texto: any) {
        if (texto === null || texto === undefined || texto === "")
            return "-";

        return String(texto)
            .replace(/&/g, "&")
            .replace(/</g, "<")
            .replace(/>/g, ">")
            .replace(/"/g, "");
    }

    function mensajeError(datos: any) {
        if (datos.errors)
            return Object.values(datos.errors).join("\n");

        let mensaje = datos.mensaje ?? datos.message ?? "Ocurrió un error.";

        if (mensaje === "This action is unauthorized.")
            return "Tu rol no tiene permisos para realizar esta acción.";

        return mensaje;
    }

    function abrirModal() {
        const modal = document.getElementById("ventanaRegistro") as HTMLDialogElement;
        modal.showModal();
    }

    function cerrarModal() {
        const modal = document.getElementById("ventanaRegistro") as HTMLDialogElement;
        modal.close();
    }

    function cerrarDetalles() {
        const modal = document.getElementById("ventanaDetalles") as HTMLDialogElement;
        modal.close();
    }

    // Llena el select de institución del formulario de registro
    async function llenarInstituciones() {
        let select = document.getElementById("institucion") as HTMLSelectElement | null;

        if (select == null)
            return;

        let datos = await obtenerInstituciones();

        if (!datos || !Array.isArray(datos.data))
            return;

        let opciones = `<option value="">Institución (opcional)</option>`;
        for (let i = 0; i < datos.data.length; i++) {
            opciones += `<option value="${datos.data[i].id_institucion}">${escapar(datos.data[i].nombre)}</option>`;
        }

        // Se asigna después del await para evitar opciones duplicadas en React Strict Mode
        select.innerHTML = opciones;
    }

    async function listarPersonas(pagina: number = 1) {
        setCargando(true);

        try {
            let resultados = document.getElementById("resultados-personas");

            if (resultados == null)
                return;

            let datos = await obtenerPersonas();

            if (!datos || !Array.isArray(datos.datos)) {
                resultados.innerHTML = "<p>No se pudieron obtener las personas.</p>";
                return;
            }

            if (datos.datos.length == 0) {
                resultados.innerHTML = `<p class="text-muted">Todavía no hay personas registradas.</p>`;
                return;
            }

            // Cálculo de paginación
            let totalRegistros = datos.datos.length;
            let totalPaginas = Math.ceil(totalRegistros / PERSONAS_POR_PAGINA);
            let paginaValida = Math.min(Math.max(1, pagina), totalPaginas);
            let inicio = (paginaValida - 1) * PERSONAS_POR_PAGINA;
            let personasPagina = datos.datos.slice(inicio, inicio + PERSONAS_POR_PAGINA);

            let filas = "";
            for (let i = 0; i < personasPagina.length; i++) {
                let persona = personasPagina[i];

                filas += `
                <tr>
                    <td>${escapar(persona.apellido)}, ${escapar(persona.nombre)}</td>
                    <td>${persona.institucion ? escapar(persona.institucion.nombre) : "Sin institución"}</td>
                    <td>${escapar(persona.correo)}</td>
                    <td>
                        <button type="button" class="btn btn-info btn-detalles" data-id="${persona.id_persona}">
                            DETALLES
                        </button>
                    </td>
                </tr>
                `;
            }

            resultados.innerHTML = `
            <table class="table table-striped table-bordered rounded">
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Institución</th>
                        <th>Correo</th>
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
                        listarPersonas(Number(numero));
                });
            });
        } finally {
            setCargando(false);
        }
    }

    async function abrirDetalles(id: string) {
        const modal = document.getElementById("ventanaDetalles") as HTMLDialogElement;

        let respuesta = await obtenerPersona(id);

        if (respuesta.datos == null) {
            alert(mensajeError(respuesta));
            return;
        }

        let persona = respuesta.datos;
        let participaciones = persona.participaciones ?? [];

        let filas = "";
        for (let i = 0; i < participaciones.length; i++) {
            let p = participaciones[i];

            filas += `
            <tr>
                <td>${escapar(p.instrumento?.codigo)} - ${escapar(p.instrumento?.titulo)}</td>
                <td>${escapar(p.rol)}</td>
                <td>${escapar(p.fecha_inicio)} a ${p.fecha_fin ? escapar(p.fecha_fin) : "en curso"}</td>
            </tr>
            `;
        }

        let vinculaciones = filas === ""
            ? `<p class="text-muted">Esta persona no está vinculada a ningún convenio.</p>`
            : `
            <table class="table table-striped table-bordered">
                <thead>
                    <tr>
                        <th>Convenio</th>
                        <th>Rol</th>
                        <th>Período</th>
                    </tr>
                </thead>
                <tbody>${filas}</tbody>
            </table>
            `;

        modal.innerHTML = `
        <div class="d-flex flex-column">
            <h1 class="titulo h1">${escapar(persona.apellido)}, ${escapar(persona.nombre)}</h1>
        </div>
        <div class="d-flex flex-column border-bottom border-top">
            <h5 class="titulo h5">Datos personales</h5>
            <ul>
                <li><strong>DNI: </strong>${escapar(persona.dni)}</li>
                <li><strong>Correo: </strong>${escapar(persona.correo)}</li>
                <li><strong>Teléfono: </strong>${escapar(persona.telefono)}</li>
                <li><strong>Institución: </strong>${persona.institucion ? escapar(persona.institucion.nombre) : "Sin institución"}</li>
            </ul>
            <h5 class="titulo h5">Vinculaciones con convenios</h5>
            ${vinculaciones}
        </div>
        <button type="button" class="btn btn-secondary mt-3" id="cerrar-detalles">Cerrar</button>
        `;

        modal.querySelector("#cerrar-detalles")?.addEventListener("click", cerrarDetalles);
        modal.showModal();
    }

    async function registrarPersona() {
        let nombre = document.getElementById("nombre") as HTMLInputElement | null;
        let apellido = document.getElementById("apellido") as HTMLInputElement | null;
        let dni = document.getElementById("dni") as HTMLInputElement | null;
        let correo = document.getElementById("correo") as HTMLInputElement | null;
        let telefono = document.getElementById("telefono") as HTMLInputElement | null;
        let institucion = document.getElementById("institucion") as HTMLSelectElement | null;

        if (nombre == null || apellido == null || dni == null || correo == null ||
            telefono == null || institucion == null
        ) {
            return;
        }

        if (nombre.value.trim() == "" || apellido.value.trim() == "" || dni.value.trim() == "") {
            alert("Nombre, apellido y DNI son obligatorios");
            return;
        }

        let datos = new FormData();

        datos.append("nombre", nombre.value.trim());
        datos.append("apellido", apellido.value.trim());
        datos.append("dni", dni.value.trim());

        // Los campos opcionales solo se envían si tienen contenido
        if (correo.value.trim() != "")
            datos.append("correo", correo.value.trim());
        if (telefono.value.trim() != "")
            datos.append("telefono", telefono.value.trim());
        if (institucion.value != "")
            datos.append("id_institucion", institucion.value);

        let respuesta = await registrar(datos);

        if (respuesta.datos != null) {
            alert(respuesta.mensaje);
            (document.getElementById("formulario-persona") as HTMLFormElement).reset();
            cerrarModal();
            listarPersonas(1);
        }
        else {
            alert(mensajeError(respuesta));
        }
    }

    return (
        <section className="border rounded p-4 d-flex flex-column gap-3">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2 className="titulo h2">Personas</h2>
                <button className="btn btn-secondary" onClick={abrirModal}>+ Nueva persona</button>
            </div>

            {cargando && (
                <SpinnerCarga mensaje="Cargando personas..." />
            )}

            <div
                id="resultados-personas"
                style={{ display: cargando ? "none" : "block" }}
            ></div>

            <dialog id="ventanaRegistro" className="ventanaRegistro">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h3 className="titulo h3">Formulario de registro de una nueva persona</h3>
                    <button type="button" className="btn btn-danger" onClick={cerrarModal}>Cerrar</button>
                </div>

                <form id="formulario-persona" className="d-flex flex-column gap-3 mb-3">
                    <input type="text" id="nombre" className="form-control" placeholder="Nombre" aria-label="Nombre" maxLength={100} />
                    <input type="text" id="apellido" className="form-control" placeholder="Apellido" aria-label="Apellido" maxLength={100} />
                    <input type="text" id="dni" className="form-control" placeholder="DNI" aria-label="DNI" maxLength={20} />
                    <input type="email" id="correo" className="form-control" placeholder="Correo electrónico (opcional)" aria-label="Correo electrónico" />
                    <input type="tel" id="telefono" className="form-control" placeholder="Teléfono (opcional)" aria-label="Teléfono" maxLength={30} />
                    <select id="institucion" className="form-select" defaultValue="" aria-label="Institución">
                        <option value="">Institución (opcional)</option>
                    </select>
                </form>
                <button className="btn btn-secondary" onClick={registrarPersona}>Registrar persona</button>
            </dialog>

            <dialog id="ventanaDetalles" className="ventanaRegistro"></dialog>
        </section>
    );
}