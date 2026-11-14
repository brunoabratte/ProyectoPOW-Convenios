"use client"

import { verificarSesion } from "@/services/authService";
import { obtenerInstituciones, registrar } from "@/services/institucionesService";
import { useEffect } from "react";

export default function InstitucionesPage(){
    useEffect(() => {
        verificarSesion();
    }, []);

    function normalizar(texto: string) {
        return texto
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[-\s]/g, "_");
    }

    async function listarInstituciones(){
        let contenedor = document.getElementById("resultados");
        let buscador = document.getElementById("buscador") as HTMLInputElement | null;
        if (contenedor != null){
            contenedor.innerHTML = "";
        }

        if (buscador == null)
            return;

        let datos = await obtenerInstituciones();
        if (datos.status == 200){
            let arreglo = datos.data;

            let textoBuscado = buscador.value.trim().toLowerCase();

            let institucionesFiltradas = arreglo.filter((institucion: any) => {
                let coincideBusqueda =
                    textoBuscado === "" ||
                    normalizar(institucion.nombre ?? "").includes(normalizar(textoBuscado));

                    return coincideBusqueda;
            });
            let tabla = document.createElement("table");
            tabla.className = "table table-striped table-bordered rounded";
            tabla.innerHTML = `
            <thead>
                <tr>
                    <th>Nombre</th>
                    <th>Tipo de institucion</th>
                    <th>Correo electrónico</th>
                    <th>Teléfono</th>
                </tr>
            </thead>
            `;

            for (let i = 0; i < institucionesFiltradas.length; i++){
                tabla.innerHTML += `
                <tbody>
                    <tr>
                        <td>${institucionesFiltradas[i].nombre}</td>
                        <td>${institucionesFiltradas[i].tipo_institucion}</td>
                        <td>${institucionesFiltradas[i].correo ?? "No disponible"}</td>
                        <td>${institucionesFiltradas[i].telefono ?? "No disponible"}</td>
                    </tr>
                <tbody>
                `
            }
            contenedor?.appendChild(tabla);
        }
        
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

        if (nombre.value == "" || tipoInstitucion.value == ""){
            alert("El nombre y tipo de institucion son obligatorios");
            return;
        }

        let datos = new FormData();

        datos.append("nombre", nombre.value);
        datos.append("tipo_institucion", tipoInstitucion.value);
        datos.append("cuit", cuit.value);
        datos.append("domicilio", domicilio.value);
        datos.append("localidad", localidad.value);
        datos.append("provincia", provincia.value);
        datos.append("correo", correo.value);
        datos.append("telefono", telefono.value);

        let respuesta = await registrar(datos);

        if (respuesta.status == 201){
            alert(respuesta.mensaje);
            listarInstituciones();
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
                <button className="btn btn-secondary" onClick={abrirModal}>+ Nueva instituci&oacute;n</button>
            </div>
            <form>
                <input type="text" id="buscador" className="form-control" placeholder="Buscar institución... (si no ingresa nada se listaran todas)"></input>
            </form>
            <button className="btn btn-secondary" onClick={listarInstituciones}>Buscar</button>
            <dialog id="ventanaRegistro" className="ventanaRegistro">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h3 className="titulo h3">Formulario de registro de una nueva institucion</h3>
                    <button type="button" className="btn btn-danger" onClick={cerrarModal}>Cerrar</button>
                </div>

                <form className="d-flex flex-column gap-3 mb-3">
                    <input type="text" id="razon-social" className="form-control" placeholder="Nombre/razón social" />
                    <select className="form-select" defaultValue="" id="tipo-institucion">
                        <option value="">Tipo de instituci&oacute;n</option>
                        <option value="Universidad" id="universidad">Universidad</option>
                        <option value="Empresa" id="empresa">Empresa</option>
                        <option value="Organismo publico" id="organismo-publico">Organismo p&uacute;blico</option>
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
                <button className="btn btn-secondary" onClick={registrarInstitucion}>Registrar instituci&oacute;n</button>
            </dialog>
            <div id="resultados"></div>
        </section>
    );
}