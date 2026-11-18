"use client"

import { verificarSesion } from "@/services/authService";
import { obtenerInstituciones, registrar } from "@/services/institucionesService";
import { useEffect } from "react";

const INSTITUCIONES_POR_PAGINA = 10;

export default function InstitucionesPage(){
    useEffect(() => {
        verificarSesion();
        listarInstituciones(1);
    }, []);

    function escapar(texto: any) {
        if (texto === null || texto === undefined || texto === "")
            return "-";

        return String(texto)
            .replace(/&/g, "&")
            .replace(/</g, "<")
            .replace(/>/g, ">")
            .replace(/"/g, "");
    }

    function normalizar(texto: string) {
        return texto
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[-\s]/g, "_");
    }

    async function listarInstituciones(pagina: number = 1){
        let contenedor = document.getElementById("resultados");
        let buscador = document.getElementById("buscador") as HTMLInputElement | null;

        if (contenedor == null || buscador == null)
            return;

        let datos = await obtenerInstituciones();

        if (datos.status != 200 || !Array.isArray(datos.data)){
            contenedor.innerHTML = `<p class="text-danger">No se pudieron obtener las instituciones.</p>`;
            return;
        }

        let arreglo = datos.data;
        let textoBuscado = buscador.value.trim().toLowerCase();

        let institucionesFiltradas = arreglo.filter((institucion: any) => {
            return textoBuscado === "" ||
                normalizar(institucion.nombre ?? "").includes(normalizar(textoBuscado));
        });

        if (institucionesFiltradas.length === 0){
            contenedor.innerHTML = `<p class="text-muted">No hay instituciones que coincidan con la búsqueda.</p>`;
            return;
        }

        // Cálculo de paginación
        let totalRegistros = institucionesFiltradas.length;
        let totalPaginas = Math.ceil(totalRegistros / INSTITUCIONES_POR_PAGINA);
        let paginaValida = Math.min(Math.max(1, pagina), totalPaginas);
        let inicio = (paginaValida - 1) * INSTITUCIONES_POR_PAGINA;
        let institucionesPagina = institucionesFiltradas.slice(inicio, inicio + INSTITUCIONES_POR_PAGINA);

        let filas = "";
        for (let i = 0; i < institucionesPagina.length; i++){
            let inst = institucionesPagina[i];
            filas += `
            <tr>
                <td>${escapar(inst.nombre)}</td>
                <td>${escapar(inst.tipo_institucion)}</td>
                <td>${inst.correo ? escapar(inst.correo) : "No disponible"}</td>
                <td>${inst.telefono ? escapar(inst.telefono) : "No disponible"}</td>
            </tr>
            `;
        }

        // Se asigna todo después del await para evitar tablas duplicadas en React Strict Mode
        contenedor.innerHTML = `
        <table class="table table-striped table-bordered rounded">
            <thead>
                <tr>
                    <th>Nombre</th>
                    <th>Tipo de institución</th>
                    <th>Correo electrónico</th>
                    <th>Teléfono</th>
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

        contenedor.querySelectorAll(".btn-pagina").forEach((boton) => {
            boton.addEventListener("click", () => {
                let numero = boton.getAttribute("data-pagina");
                if (numero != null)
                    listarInstituciones(Number(numero));
            });
        });
    }

    async function registrarInstitucion(){
        let nombre = document.getElementById("razon-social") as HTMLInputElement | null;
        let tipoInstitucion = document.getElementById("tipo-institucion") as HTMLSelectElement | null;
        let cuit = document.getElementById("cuit") as HTMLInputElement | null;
        let domicilio = document.getElementById("domicilio") as HTMLInputElement | null;
        let localidad = document.getElementById("localidad") as HTMLInputElement | null;
        let provincia = document.getElementById("provincia") as HTMLInputElement | null;
        let correo = document.getElementById("correo") as HTMLInputElement | null;
        let telefono = document.getElementById("telefono") as HTMLInputElement | null;

        if (nombre == null || tipoInstitucion == null || cuit == null || domicilio == null ||
            localidad == null || provincia == null || correo == null || telefono == null
        ){
            return;
        }

        if (nombre.value.trim() == "" || tipoInstitucion.value == ""){
            alert("El nombre y tipo de institucion son obligatorios");
            return;
        }

        let datos = new FormData();

        datos.append("nombre", nombre.value.trim());
        datos.append("tipo_institucion", tipoInstitucion.value);
        datos.append("cuit", cuit.value.trim());
        datos.append("domicilio", domicilio.value.trim());
        datos.append("localidad", localidad.value.trim());
        datos.append("provincia", provincia.value.trim());
        datos.append("correo", correo.value.trim());
        datos.append("telefono", telefono.value.trim());

        let respuesta = await registrar(datos);

        if (respuesta.status == 201){
            alert(respuesta.mensaje);
            (document.getElementById("form-institucion") as HTMLFormElement | null)?.reset();
            listarInstituciones(1);
            cerrarModal();
        }
        else{
            if (respuesta.errors)
                alert(Object.values(respuesta.errors).join("\n"));
            else
                alert("No se ha podido registrar la institucion: " + (respuesta.message ?? ""));
        }
    }

    function abrirModal() {
        const modal = document.getElementById("ventanaRegistro") as HTMLDialogElement;
        modal.showModal();
    }

    function cerrarModal() {
        const modal = document.getElementById("ventanaRegistro") as HTMLDialogElement;
        modal.close();
    }

    return (
        <section className="border rounded p-4 d-flex flex-column gap-3">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2 className="titulo h2">Instituciones</h2>
                <button type="button" className="btn btn-secondary" onClick={abrirModal}>+ Nueva institución</button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); listarInstituciones(1); }}>
                <input type="text" id="buscador" className="form-control" placeholder="Buscar institución... (si no ingresa nada se listaran todas)" />
            </form>
            <button type="button" className="btn btn-secondary" onClick={() => listarInstituciones(1)}>Buscar</button>
            <dialog id="ventanaRegistro" className="ventanaRegistro">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h3 className="titulo h3">Formulario de registro de una nueva institucion</h3>
                    <button type="button" className="btn btn-danger" onClick={cerrarModal}>Cerrar</button>
                </div>

                <form id="form-institucion" className="d-flex flex-column gap-3 mb-3">
                    <input type="text" id="razon-social" className="form-control" placeholder="Nombre/razón social" />
                    <select className="form-select" defaultValue="" id="tipo-institucion">
                        <option value="">Tipo de institución</option>
                        <option value="Universidad" id="universidad">Universidad</option>
                        <option value="Empresa" id="empresa">Empresa</option>
                        <option value="Organismo publico" id="organismo-publico">Organismo público</option>
                        <option value="Organismo no gubernamental (ONG)" id="ong">Organismo no gubernamental (ONG)</option>
                        <option value="Otra" id="otra">Otra</option>
                    </select>
                    <div className="d-grid gap-3">
                        <div className="row g-3">
                            <div className="col-12 col-md-6">
                                <input
                                    type="text"
                                    id="cuit"
                                    className="form-control"
                                    placeholder="CUIT"
                                />
                            </div>

                            <div className="col-12 col-md-6">
                                <input
                                    type="text"
                                    id="domicilio"
                                    className="form-control"
                                    placeholder="Domicilio"
                                />
                            </div>
                        </div>

                        <div className="row g-3">
                            <div className="col-12 col-md-6">
                                <input
                                    type="text"
                                    id="localidad"
                                    className="form-control"
                                    placeholder="Localidad"
                                />
                            </div>

                            <div className="col-12 col-md-6">
                                <input
                                    type="text"
                                    id="provincia"
                                    className="form-control"
                                    placeholder="Provincia"
                                />
                            </div>
                        </div>
                    </div>
                    <input type="email" id="correo" className="form-control" placeholder="Correo electrónico" />
                    <input type="text" id="telefono" className="form-control" placeholder="Teléfono" />
                </form>
                <button type="button" className="btn btn-secondary" onClick={registrarInstitucion}>Registrar institución</button>
            </dialog>
            <div id="resultados"></div>
        </section>
    );
}