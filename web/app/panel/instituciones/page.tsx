"use client"

export default function InstitucionesPage(){
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
                <input type="text" className="form-control" placeholder="Buscar institución..."></input>
            </form>
            <button className="btn btn-secondary">Buscar</button>
            <dialog id="ventanaRegistro" className="ventanaRegistro">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h3 className="titulo h3">Formulario de registro de una nueva institucion</h3>
                    <button type="button" className="btn btn-danger" onClick={cerrarModal}>Cerrar</button>
                </div>

                <form className="d-flex flex-column gap-3 mb-3">
                    <input type="text" id="razon-social" className="form-control" placeholder="Nombre/razón social" />
                    <select className="form-select" defaultValue="tipo-institucion" id="tipo-institucion">
                        <option value="tipo-institucion">Tipo de instituci&oacute;n</option>
                        <option value="universidad" id="universidad">Universidad</option>
                        <option value="empresa" id="empresa">Empresa</option>
                        <option value="organismo-publico" id="organismo-publico">Organismo p&uacute;blico</option>
                        <option value="ong" id="ong">Organismo no gubernamental (ONG)</option>
                        <option value="otra" id="otra">Otra</option>
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
                    <input type="tel" id="telefono" className="form-control" placeholder="Teléfono" />
                </form>
                <button className="btn btn-secondary">Registrar instituci&oacute;n</button>
            </dialog>
            <div id="resultados"></div>
        </section>
    );
}