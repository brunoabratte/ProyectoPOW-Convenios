export default function ConveniosPage(){
    return(
        <div>
            <section className="listadoConvenios">
                <h4 className="titulo h4">Gesti&oacute;n de convenios</h4>
                <p>Consulta y administracion de instrumentos</p>
                <div className="buscadorConvenios gap-5">
                    <form>
                        <input type="text" className="form-control border-0 border-bottom rounded-0 mb-4" id="buscador" placeholder="Buscar por código, título o palabra clave..."/>
                        <div className="opcionesFormulario">
                            <select className="form-control border-0">
                                <option value="" selected>Tipo de instrumento</option>
                            </select>
                            <select className="form-control border-0">
                                <option value="" selected>Estado</option>
                            </select>
                            <select className="form-control border-0">
                                <option value="" selected>Unidad acad&eacute;mica</option>
                            </select>
                            <select className="form-control border-0">
                                <option value="" selected>Rango de fechas</option>
                            </select>
                        </div>
                    </form>
                </div>
            </section>
        </div>
    );
}