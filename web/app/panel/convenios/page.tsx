"use client";

import { obtenerConvenios } from "@/services/conveniosService";
import { verificarSesion } from "@/services/authService";
import { useEffect } from "react";

export default function ConveniosPage(){
    useEffect(() => {
        verificarSesion();
    }, []);

    function abrirModal() {
        const modal = document.getElementById("ventanaRegistro") as HTMLDialogElement;
        modal.showModal();
    }

    function cerrarModal() {
        const modal = document.getElementById("ventanaRegistro") as HTMLDialogElement;
        modal.close();
    }

    async function listarConvenios(){
        let resultados = document.getElementById("resultados");
        if (resultados != null)
            resultados.innerHTML = ""

        let datos = await obtenerConvenios();
        if (datos.status == 200){
            let tabla = document.createElement("table");
            tabla.innerHTML = "";
            tabla.innerHTML = `
            <thead>
                <tr>
                    <th>C&oacute;digo</th>
                    <th>T&iacute;tulo</th>
                    <th>Tipo</th>
                    <th>Unidad</th>
                    <th>Estado</th>
                    <th></th>
                </tr>
            </thead>
            `;
            for (let i = 0; i < datos.data.length; i++){
                tabla.innerHTML += `
                <tbody>
                    <tr>
                        <td>${datos.data[i].codigo}</td>
                        <td>${datos.data[i].titulo}</td>
                        <td>${datos.data[i].tipoInstrumento}</td>
                        <td>${datos.data[i].unidad}</td>
                        <td>${datos.data[i].estado}</td>
                        <td><button class="btn btn-info">VER DETALLES</button></td>
                    </tr>
                </tbody>
                `
            }
            resultados?.appendChild(tabla);
        }

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
                    <button className="btn btn-secondary" onClick={abrirModal}>
                        + Nuevo convenio
                    </button>
                </div>
                <dialog id="ventanaRegistro" className="ventanaRegistro">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h3 className="titulo h3">Formulario de registro de un nuevo convenio</h3>
                            <button type="button" className="btn btn-danger" onClick={cerrarModal}>Cerrar</button>
                        </div>
                        
                        <h4 className="titulo h4">1. Informacion general</h4>

                        <form className="d-flex flex-column gap-3 mb-5">
                            <input type="text" id="titulo" className="form-control" placeholder="Título"/>
                            <select id="tipo" className="form-select" defaultValue="tipo-instrumento">
                                <option value="tipo-instrumento">Tipo de instrumento</option>
                                <option value="convenio-marco-colaboracion">Convenio marco de colaboracion</option>
                                <option value="convenio-especifico-colaboracion">Convenio espec&iacute;fico de colaboracion</option>
                                <option value="convenio-marco-pasantia">Convenio marco de pasant&iacute;a</option>
                                <option value="convenio-especifico-pasantia">Convenio espec&iacute;fico de pasant&iacute;a</option>
                                <option value="adenda">Adenda</option>
                            </select>
                            <select id="unidad-responsable" className="form-select" defaultValue="unlpam">
                                <option value="unlpam">UNLPam</option>
                            </select>
                            <textarea id="objeto" className="form-control" rows={4} placeholder="Ingrese el objeto del convenio..."></textarea>
                            <textarea id="alcance" className="form-control" rows={4} placeholder="Ingrese el alcance del convenio..."/>
                        </form>

                        <h4 className="titulo h4">2. Informacion administrativa y legal</h4>

                        <form className="d-flex flex-column gap-3 mb-5">
                            <textarea className="form-control" id="obligaciones" placeholder="Obligaciones..." rows={4}></textarea>
                            <textarea className="form-control" id="condiciones-rescision" placeholder="Condiciones de rescision..." rows={4}></textarea>
                            <textarea className="form-control" id="marco-legal" placeholder="Ingrese marco legal..." rows={4}></textarea>
                            <input type="text" id="resolucion" className="form-control" placeholder="Ingrese la resolucion"/>
                            <input type="text" id="expediente" className="form-control" placeholder="Ingrese un expediente o referencia"/>
                            <textarea className="form-control" id="condiciones-renovacion" placeholder="Ingrese las condiciones de renovacion..." rows={4}></textarea>
                            <textarea className="form-control" id="confidencialidad" placeholder="Ingrese la confidencialidad..." rows={4}></textarea>
                            <textarea className="form-control" id="notas-adicionales" placeholder="Notas adicionales..." rows={4}></textarea>
                        </form>

                        <h4 className="titulo h4">3. Fechas del convenio</h4>

                        <form className="d-flex flex-column gap-3 mb-5">
                            <label htmlFor="fecha-firma" className="form-label">Fecha de firma</label>
                            <input type="date" id="fecha-firma"/>
                            <label htmlFor="fecha-inicio" className="form-label">Fecha de inicio</label>
                            <input type="date" id="fecha-inicio"/>
                            <label htmlFor="fecha-vencimiento" className="form-label">Fecha de vencimiento</label>
                            <input type="date" id="fecha-vencimiento"/>
                            <label htmlFor="fecha-preaviso" className="form-label">Fecha de preaviso</label>
                            <input type="date" id="fecha-preaviso"/>
                        </form>

                        <h4 className="titulo h4">4. Partes e instituciones</h4>

                        <form className="d-flex flex-column gap-3 mb-5">
                            <h5 className="titulo h5">Instituciones firmantes</h5>
                            <select id="primera-institucion" className="form-select border rounded" defaultValue="unlpam">
                                <option value="unlpam">Universidad Nacional de La Pampa</option>
                            </select>
                            <select id="segunda-institucion" className="form-select border rounded" defaultValue="unlpam">
                                <option value="unlpam">Universidad Nacional de La Pampa</option>
                            </select>
                        </form>

                        <h4 className="titulo h4">5. Relaciones</h4>

                        <form id="relaciones-convenios" className="mb-5">
                            <p className="text-warning">Seleccione un tipo de convenio</p>
                        </form>

                        <h4 className="titulo h4">6. Personas y pasantias</h4>
                        
                        <form className="d-flex flex-column gap-3 mb-5">
                            <input type="text" id="nombre" className="form-control" placeholder="Nombre"/>
                            <input type="text" id="apellido" className="form-control" placeholder="Apellido"/>
                            <input type="text" id="dni" className="form-control" placeholder="DNI"/>
                            <input type="email" id="correo" className="form-control" placeholder="Correo electrónico"/>
                            <input type="tel" id="telefono" className="form-control" placeholder="Teléfono"/>
                            <div id="seccion-pasantias" className="d-flex flex-column"></div>
                        </form>

                        <h4 className="titulo h4">7. Documentacion</h4>

                        <form className="d-flex flex-column gap-3 mb-5">
                            <label htmlFor="archivo" className="form-label">Archivo PDF</label>
                            <input type="file" id="archivo" accept="application/pdf" className="form-control"/>
                            <select className="form-select border rounded" defaultValue="tipo-documento">
                                <option value="tipo-documento">Tipo de documento</option>
                                <option value="principal">Principal</option>
                                <option value="anexo">Anexo</option>
                                <option value="dictamen">Dictamen</option>
                                <option value="resolucion">Resolucion</option>
                                <option value="otro">Otro</option>
                            </select>
                        </form>
                        <button className="btn btn-secondary">Registrar convenio</button>
                </dialog>
                <div className="d-flex flex-column gap-3">
                    <form className="d-flex flex-column border rounded">
                        <input type="text" className="form-control border-0 border-bottom rounded-0 mb-4" id="buscador" placeholder="Buscar por código, título o palabra clave..."/>
                        <div className="opcionesFormulario">
                            <select className="form-select border-0">
                                <option value="">Tipo de instrumento</option>
                            </select>
                            <select className="form-select border-0">
                                <option value="">Estado</option>
                            </select>
                            <select className="form-select border-0">
                                <option value="">Unidad acad&eacute;mica</option>
                            </select>
                            <select className="form-select border-0">
                                <option value="">Rango de fechas</option>
                            </select>
                        </div>
                    </form>
                    <button className="btn btn-secondary" onClick={listarConvenios}>Buscar</button>
                </div>
                <div className="resultados pt-5" id="resultados">
                </div>
            </section>
        </div>
    );
}