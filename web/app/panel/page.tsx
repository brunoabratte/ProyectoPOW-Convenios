export default function PanelPage(){
    return(
        <div className="d-flex flex-column min-vh-100">
            <header className="headerPanelPrincipal">
                <h1>Gestión de Convenios</h1>
            </header>

            <div className="d-flex flex-grow-1">
                <aside className="barraLateral">
                    <nav>
                        <ul className="list-unstyled">
                            <li>
                                <label className="opcionMenu activa">Inicio</label>
                            </li>
                            <li>
                                <label className="opcionMenu">Convenios</label>
                            </li>
                            <li>
                                <label className="opcionMenu">Instituciones</label>
                            </li>
                            <li>
                                <label className="opcionMenu">Personas</label>                             
                            </li>
                            <li>
                                <label className="opcionMenu">Revisiones</label>                            
                            </li>
                            <li>
                                <label className="opcionMenu">Alertas</label>                              
                            </li>
                            <li>
                                <label className="opcionMenu">Administraci&oacute;n</label>
                            </li>
                        </ul>
                    </nav>
                </aside>

                <main className="flex-grow-1 p-4 border-start">
                    <h2>Panel principal</h2>
                </main>
            </div>
        </div>
    );
}