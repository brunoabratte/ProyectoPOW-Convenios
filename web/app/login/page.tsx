
"use client";

import { useState } from "react";
import { iniciarSesion } from "@/services/authService";
import Image from "next/image";

export default function LoginPage() {
    const [error, setError] = useState("");
    const [cargando, setCargando] = useState(false);

    async function manejarLogin(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError("");
        setCargando(true);

        const datos = new FormData(e.currentTarget);

        const email = String(datos.get("email"));
        const password = String(datos.get("password"));

        try {
            await iniciarSesion(email, password);
        } catch {
            setError("No se pudo iniciar sesión. Verificá tus credenciales.");
        } finally {
            setCargando(false);
        }
    }

    return (
        <main className="loginSimple">
            <div className="loginTarjeta">

                <div className="loginTitulo">
                    <Image
                        src="/logo-facultad.png"
                        alt="Logo de la Universidad Nacional de La Pampa"
                        width={100}
                        height={100}
                        className="loginLogo"
                        priority
                    />

                    <h1>Gestión de Convenios</h1>
                    <p>Universidad Nacional de La Pampa</p>
                </div>

                <div className="loginSeparador"></div>

                <form onSubmit={manejarLogin}>
                    <div className="loginCampoSimple">
                        <label htmlFor="correo">Correo electrónico</label>
                        <input
                            type="email"
                            name="email"
                            id="correo"
                            placeholder="Ingresá tu correo"
                            autoComplete="username"
                            required
                        />
                    </div>

                    <div className="loginCampoSimple">
                        <label htmlFor="password">Contraseña</label>
                        <input
                            type="password"
                            name="password"
                            id="password"
                            placeholder="Ingresá tu contraseña"
                            autoComplete="current-password"
                            required
                        />
                    </div>

                    {error && <p className="loginErrorSimple">{error}</p>}

                    <button
                        type="submit"
                        disabled={cargando}
                    >
                        {cargando ? "Ingresando..." : "Iniciar sesión"}
                    </button>
                </form>

                <p className="loginPieSimple">
                    Sistema institucional de gestión
                </p>
            </div>
        </main>
    );
}
