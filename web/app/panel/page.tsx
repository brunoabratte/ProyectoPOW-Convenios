export default function PanelPage(){
    return(
                <div className="flex-grow-1 p-4 h-100">
                    <h2 className="titulo">Panel principal</h2>
                    <p className="fs-6 fw-light">Resumen de la gesti&oacute;n de convenios</p>
                    <div className="contenedorPrincipal">
                        <div className="contenedorCampos">
                            <div className="campoPanel">
                                <p className="tituloCampo">Vigentes</p>
                                <p className="numero">-</p>
                            </div>
                            <div className="campoPanel">
                                <p className="tituloCampo">En revisi&oacute;n</p>
                                <p className="numero">-</p>
                            </div>
                            <div className="campoPanel">
                                <p className="tituloCampo">Por vencer</p>
                                <p className="numero">-</p>
                            </div>
                            <div className="campoPanel">
                                <p className="tituloCampo">Instituciones</p>
                                <p className="numero">-</p>
                            </div>
                        </div>
                        <div className="campoConveniosRecientes">
                            <h2 className="titulo fs-6">Convenios recientes</h2>
                        </div>
                    </div>
                </div>
    );
}