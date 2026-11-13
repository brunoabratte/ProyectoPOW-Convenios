"use client";

import { obtenerConvenioEspecifico, obtenerConvenios, registrar, registrarParte, subirDocumento } from "@/services/conveniosService";
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

    function normalizar(texto: string) {
        return texto
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[-\s]/g, "_");
    }

    async function abrirDetalles(id : string){
        const modal = document.getElementById("ventanaDetalles") as HTMLDialogElement;

        let datos = await obtenerConvenioEspecifico(id);

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
        <button type="button" class="btn btn-danger mt-3" id="cerrar-detalles">
            Cerrar
        </button>
        `;
        modal.querySelector("#cerrar-detalles")?.addEventListener("click", cerrarDetalles);
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
    if (valor("codigo") === "" || valor("titulo") === "" || valor("tipo") === "" || valor("unidad-responsable") === ""){
        alert("Completá código, título, tipo de instrumento y unidad responsable.");
        return;
    }

    if (valor("primera-institucion") !== "" && valor("primera-institucion") === valor("segunda-institucion")){
        alert("Las dos partes deben ser instituciones distintas.");
        return;
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

    // [nombre que espera la API, id del campo en el formulario]
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

    let respuesta = await registrar(datos);

    // Si no vino "data", la API rechazó el registro (validación, permisos, etc.)
    if (respuesta.data == null){
        let mensaje = respuesta.errors
            ? Object.values(respuesta.errors).join("\n")
            : (respuesta.mensaje ?? respuesta.message ?? "No se pudo registrar el convenio.");
        alert(mensaje);
        return;
    }

    let idInstrumento = String(respuesta.data.id_instrumento);
    let avisos = "";

    // 3. Partes (instituciones firmantes)
    let instituciones = [valor("primera-institucion"), valor("segunda-institucion")];

    for (let i = 0; i < instituciones.length; i++){
        if (instituciones[i] === "")
            continue;

        let parte = new FormData();
        parte.append("id_instrumento", idInstrumento);
        parte.append("id_institucion", instituciones[i]);
        parte.append("caracter_parte", i === 0 ? "Primera parte" : "Segunda parte");

        let resParte = await registrarParte(parte);
        if (resParte.datos == null)
            avisos += "\n- No se pudo registrar la parte " + (i + 1);
    }

    // 4. Documento
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
    listarConvenios();
    }

    async function listarConvenios(){
        let resultados = document.getElementById("resultados");
        let buscador = document.getElementById("buscador") as HTMLInputElement | null;
        let filtroTipo = document.getElementById("filtro-tipo") as HTMLSelectElement | null;
        let filtroEstado = document.getElementById("filtro-estado") as HTMLSelectElement | null;;
        let filtroUnidad = document.getElementById("filtro-unidad-academica") as HTMLSelectElement | null;;
        let filtroFechas = document.getElementById("filtro-fechas") as HTMLSelectElement | null;;
        if (resultados != null)
            resultados.innerHTML = ""
        
        if (filtroTipo == null || filtroEstado == null || filtroUnidad == null || filtroFechas == null || buscador == null)
            return;

        let datos = await obtenerConvenios();
        console.log("Respuesta de la API:", datos);
        console.log("Convenios recibidos:", datos.data);
        console.log("Filtros seleccionados:", {
            tipo: filtroTipo.value,
            estado: filtroEstado.value,
            unidad: filtroUnidad.value
        });

        if (datos.status == 200){
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

                let coincideBusqueda =
                    textoBuscado === "" ||
                    normalizar(convenio.codigo ?? "").includes(normalizar(textoBuscado)) ||
                    normalizar(convenio.titulo ?? "").includes(normalizar(textoBuscado)) ||
                    normalizar(convenio.tipo_instrumento.nombre ?? "").includes(normalizar(textoBuscado)) ||
                    normalizar(convenio.unidad.nombre ?? "").includes(normalizar(textoBuscado)) ||
                    normalizar(convenio.estado.nombre ?? "").includes(normalizar(textoBuscado));

                return coincideTipo && coincideEstado && coincideUnidad && coincideBusqueda;
            });

            console.log("Convenios filtrados:", conveniosFiltrados);
            let tabla = document.createElement("table");
            tabla.className = "table table-striped table-bordered rounded"
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
            for (let i = 0; i < conveniosFiltrados.length; i++){
                tabla.innerHTML += `
                <tbody>
                    <tr>
                        <td>${conveniosFiltrados[i].codigo}</td>
                        <td>${conveniosFiltrados[i].titulo}</td>
                        <td>${conveniosFiltrados[i].tipo_instrumento?.nombre ?? "Sin tipo"}</td>
                        <td>${conveniosFiltrados[i].unidad?.nombre ?? "Sin unidad"}</td>
                        <td>${conveniosFiltrados[i].estado?.nombre ?? "Sin estado"}</td>
                        <td>
                            <button 
                                type="button"
                                class="btn btn-info btn-detalles"
                                data-id="${conveniosFiltrados[i].id_instrumento}">
                                VER DETALLES
                                </button>
                        </td>
                    </tr>
                </tbody>
                `
            }
            tabla.querySelectorAll(".btn-detalles").forEach((boton) => {
                boton.addEventListener("click", () => {
                    let id = boton.getAttribute("data-id");

                    if (id != null)
                        abrirDetalles(id);
                });
            });
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
                            <input type="text" name="codigo" id="codigo" className="form-control" placeholder="Código único"/>
                            <input type="text" name="titulo" id="titulo" className="form-control" placeholder="Título"/>
                            <select id="tipo" className="form-select" defaultValue="">
                                <option value="">Tipo de instrumento</option>
                                <option value="7">Convenio marco de colaboracion</option>
                                <option value="8">Convenio espec&iacute;fico de colaboracion</option>
                                <option value="9">Convenio marco de pasant&iacute;a</option>
                                <option value="10">Convenio espec&iacute;fico de pasant&iacute;a</option>
                                <option value="4">Adenda</option>
                            </select>
                            <select id="unidad-responsable" name="unidad" className="form-select" defaultValue="1">
                                <option value="1">Facultad de ingeniería</option>
                                <option value="2">Rectorado</option>
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

                        <form className="d-flex flex-column gap-3 mb-5">
                            <h5 className="titulo h5">Instituciones firmantes</h5>
                            <select id="primera-institucion" name="primera_institucion" className="form-select border rounded" defaultValue="1">
                                <option value="1">Universidad Nacional de La Pampa</option>
                                <option value="2">Instituto Pampeano de Innovacion</option>
                                <option value="3">Empresa Tecnológica Horizonte</option>
                            </select>
                            <select id="segunda-institucion" name="segunda_institucion" className="form-select border rounded" defaultValue="2">
                                <option value="1">Universidad Nacional de La Pampa</option>
                                <option value="2">Instituto Pampeano de Innovacion</option>
                                <option value="3">Empresa Tecnológica Horizonte</option>
                            </select>
                        </form>

                        <h4 className="titulo h4">5. Relaciones</h4>

                        <form id="relaciones-convenios" className="mb-5">
                            <p className="text-warning">Seleccione un tipo de convenio</p>
                        </form>

                        <h4 className="titulo h4">6. Personas y pasantias</h4>
                        
                        <form className="d-flex flex-column gap-3 mb-5">
                            <input type="text" name="nombre" id="nombre" className="form-control" placeholder="Nombre"/>
                            <input type="text" name="apellido" id="apellido" className="form-control" placeholder="Apellido"/>
                            <input type="text" name="dni" id="dni" className="form-control" placeholder="DNI"/>
                            <input type="email" name="correo" id="correo" className="form-control" placeholder="Correo electrónico"/>
                            <input type="tel" name="telefono" id="telefono" className="form-control" placeholder="Teléfono"/>
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
                        <button className="btn btn-secondary" onClick={registrarConvenio}>Registrar convenio</button>
                </dialog>
                <div className="d-flex flex-column gap-3">
                    <form className="d-flex flex-column border rounded">
                        <input type="text" className="form-control border-0 border-bottom rounded-0 mb-4" id="buscador" placeholder="Buscar por código, título o palabra clave..."/>
                        <div className="opcionesFormulario">
                            <select className="form-select border-0" id="filtro-tipo" defaultValue="">
                                <option value="">Tipo de instrumento</option>
                                <option value="convenio_marco_colaboracion">Convenio marco de colaboracion</option>
                                <option value="convenio_especifico_colaboracion">Convenio espec&iacute;fico de colaboracion</option>
                                <option value="convenio_marco_pasantia">Convenio marco de pasant&iacute;a</option>
                                <option value="convenio_especifico_pasantia">Convenio espec&iacute;fico de pasant&iacute;a</option>
                                <option value="adenda">Adenda</option>
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
                                <option value="">Unidad acad&eacute;mica</option>
                                <option value="Facultad de ingeniería">Facultad de ingenier&iacute;a</option>
                                <option value="Rectorado">Rectorado</option>
                            </select>
                            <select className="form-select border-0" id="filtro-fechas" defaultValue="">
                                <option value="">Rango de fechas</option>
                            </select>
                        </div>
                    </form>
                    <button className="btn btn-secondary" onClick={listarConvenios}>Buscar</button>
                    <dialog className="ventanaRegistro" id="ventanaDetalles"></dialog>
                </div>
                <div className="resultados pt-5" id="resultados">
                </div>
            </section>
        </div>
    );
}