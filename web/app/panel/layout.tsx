"use client";

import BarraLateral from "@/components/BarraLateral";
import { cerrarSesion } from "@/services/authService";
import { useState } from "react";

export default function PanelLayout({
    children
}: {
    children: React.ReactNode;
}) {
    const [menuAbierto, setMenuAbierto] = useState(false);
    return (
        <div className="d-flex flex-column min-vh-100">

            <header className="headerPanelPrincipal">
                <img
                    className="logoConvenios"
                    src="/panel-logo.png"
                    alt="UNLPam Convenios"
                />

                <img 
                    className="logoCuenta"
                    src="/cuenta-logo.png"
                    alt="UNLPam cuenta"
                    onClick={() => setMenuAbierto(!menuAbierto)}
                />
                {menuAbierto && (
                <div className="menu-usuario">

                    <button onClick={cerrarSesion}>
                        Cerrar sesión
                    </button>

                </div>
    )}
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