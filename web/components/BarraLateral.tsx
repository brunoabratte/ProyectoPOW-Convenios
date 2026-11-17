"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="barraLateral">
            <nav>
                <ul className="list-unstyled">

                    <li>
                        <Link
                            href="/panel"
                            className={`opcionMenu ${pathname === "/panel" ? "activa" : ""}`}
                        >
                            <img className="logo" src="/inicio-logo.png"/>
                            Inicio
                        </Link>
                    </li>

                    <li>
                        <Link
                            href="/panel/convenios"
                            className={`opcionMenu ${pathname === "/panel/convenios" ? "activa" : ""}`}
                        >
                            <img className="logo" src="/convenios-logo.png"/>
                            Convenios
                        </Link>
                    </li>

                    <li>
                        <Link
                            href="/panel/instituciones"
                            className={`opcionMenu ${pathname === "/panel/instituciones" ? "activa" : ""}`}
                        >
                            <img className="logo" src="/instituciones-logo.png"/>
                            Instituciones
                        </Link>
                    </li>

                    <li>
                        <Link
                            href="/panel/personas"
                            className={`opcionMenu ${pathname === "/panel/personas" ? "activa" : ""}`}
                        >
                            <img className="logo" src="/personas-logo.png"/>
                            Personas
                        </Link>
                    </li>

                    <li>
                        <Link
                            href="/panel/revisiones"
                            className={`opcionMenu ${pathname === "/panel/revisiones" ? "activa" : ""}`}
                        >
                            <img className="logo" src="/revisiones-logo.png"/>
                            Revisiones
                        </Link>
                    </li>

                    <li>
                        <Link
                            href="/panel/alertas"
                            className={`opcionMenu ${pathname === "/panel/alertas" ? "activa" : ""}`}
                        >
                            <img className="logo" src="/alertas-logo.png"/>
                            Alertas
                        </Link>
                    </li>

                    <li>
                        <Link
                            href="/panel/administracion"
                            className={`opcionMenu ${pathname === "/panel/administracion" ? "activa" : ""}`}
                        >
                            <img className="logo" src="/administracion-logo.png"/>
                            Administracion
                        </Link>
                    </li>

                </ul>
            </nav>
        </aside>
    );
}
