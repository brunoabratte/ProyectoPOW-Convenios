"use client"

import { iniciarSesion } from "@/services/authService";

export default function LoginPage(){
    async function manejarLogin(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const datos = new FormData(e.currentTarget);

        const email = String(datos.get("email"));
        const password = String(datos.get("password"));

        await iniciarSesion(email, password);
    }
    return (
        <main className="min-vh-100 d-flex justify-content-center align-items-center bg-light bg-gradient">
            <div className="border p-5 rounded bg-white">
                <h1 className="text-center mb-4 text-primary">Iniciar Sesi&oacute;n</h1>
                <div className="d-flex justify-content-center align-items-center">
            <form className="d-flex flex-column gap-3" onSubmit={manejarLogin}>
                <input type="email" name="email" id="correo" placeholder="Correo electrónico" className="form-control"/>
                <input type="password" name="password" id="password" placeholder="Contraseña" className="form-control" />
                <button type="submit" className="btn btn-primary">
                    Iniciar Sesion
                </button>
                <p className="bg-warning" id="texto-aviso"></p>
            </form>   
        </div>
            </div>
        </main>
    );
}