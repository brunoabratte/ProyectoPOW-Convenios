import styles from "./PanelLogin.module.css"

export default function PanelLogin(){
    return(
        <div className="d-flex justify-content-center align-items-center">
            <form className="d-flex flex-column gap-3">
                <input type="text" id="usuario" placeholder="Usuario" className="form-control"/>
                <input type="password" id="password" placeholder="Contraseña" className="form-control" />
                <button type="submit" className="btn btn-primary">
                    Iniciar Sesion
                </button>
            </form>   
        </div>
    );
}