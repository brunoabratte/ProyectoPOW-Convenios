
"use client";

import BarraLateral from "@/components/BarraLateral";
import NotificacionesMenu from "@/components/NotificacionesMenu";
import { cerrarSesion } from "@/services/authService";
import { useEffect, useState } from "react";

export default function PanelLayout({
    children
}: {
    children: React.ReactNode;
}) {
    const [menuAbierto, setMenuAbierto] = useState(false);
    const [rol, setRol] = useState("");

    useEffect(() => {
        async function cargarUsuario() {
            let token = localStorage.getItem("token");

            if (token == null)
                return;

            try {
                let res = await fetch("http://127.0.0.1:8000/api/me", {
                    headers: {
                        "Accept": "application/json",
                        "Authorization": `Bearer ${token}`
                    }
                });

                if (res.ok) {
                    let datos = await res.json();
                    setRol(datos.usuario.rol);
                }
            }
            catch {
                console.error("No se pudo obtener el usuario.");
            }
        }

        cargarUsuario();
    }, []);

    return (
        <div className="d-flex flex-column min-vh-100">

            <header className="headerPanelPrincipal">

                <img
                    className="logoConvenios"
                    src="/logo-facultad.png"
                    alt="UNLPam Convenios"
                />

                <div className="headerAcciones">

                    <NotificacionesMenu />

                    <div className="usuarioContenedor">

                        <img
                            className="logoCuenta"
                            src="/cuenta-logo.png"
                            alt="Cuenta de usuario"
                            onClick={() => setMenuAbierto(!menuAbierto)}
                        />

                        {menuAbierto && (
                            <div className="menu-usuario">

                                <strong>Mi cuenta</strong>

                                <span className="rolUsuario">
                                    {rol || "Cargando rol..."}
                                </span>

                                <button onClick={cerrarSesion}>
                                    Cerrar sesión
                                </button>

                            </div>
                        )}

                    </div>

                </div>

            </header>

            <div className="d-flex flex-grow-1">

                <BarraLateral />

                <main className="flex-grow-1 p-4">
                    {children}
                </main>

            </div>

        </div>
    );
}
