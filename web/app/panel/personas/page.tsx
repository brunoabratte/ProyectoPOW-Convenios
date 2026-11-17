"use client"

import { verificarSesion } from "@/services/authService";
import { obtenerPersonas, obtenerPersona, registrar } from "@/services/personasService";
import { obtenerInstituciones } from "@/services/institucionesService";
import { useEffect } from "react";

export default function PersonasPage(){
    useEffect(() => {
        verificarSesion();
        listarPersonas();
        llenarInstituciones();
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

        if (datos.data == null)
            return;

        for (let i = 0; i < datos.data.length; i++)
            select.add(new Option(datos.data[i].nombre, String(datos.data[i].id_institucion)));
    }

    async function listarPersonas() {
        let resultados = document.getElementById("resultados-personas");

        if (resultados == null)
            return;

        let datos = await obtenerPersonas();

        if (datos.datos == null) {
            resultados.innerHTML = "<p>No se pudieron obtener las personas.</p>";
            return;
        }

        if (datos.datos.length == 0) {
            resultados.innerHTML = `<p class="text-muted">Todavía no hay personas registradas.</p>`;
            return;
        }

        let tabla = document.createElement("table");
        tabla.className = "table table-striped table-bordered rounded";
        tabla.innerHTML = `
        <thead>
            <tr>
                <th>Nombre</th>
                <th>Instituci&oacute;n</th>
                <th>Correo</th>
                <th></th>
            </tr>
        </thead>
        `;

        for (let i = 0; i < datos.datos.length; i++) {
            let persona = datos.datos[i];

            tabla.innerHTML += `
            <tbody>
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
            </tbody>
            `;
        }

        tabla.querySelectorAll(".btn-detalles").forEach((boton) => {
            boton.addEventListener("click", () => {
                let id = boton.getAttribute("data-id");

                if (id != null)
                    abrirDetalles(id);
            });
        });

        resultados.innerHTML = "";
        resultados.appendChild(tabla);
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
                        <th>Per&iacute;odo</th>
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
                <li><strong>Tel&eacute;fono: </strong>${escapar(persona.telefono)}</li>
                <li><strong>Instituci&oacute;n: </strong>${persona.institucion ? escapar(persona.institucion.nombre) : "Sin institución"}</li>
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
            listarPersonas();
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

            <div id="resultados-personas"></div>

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