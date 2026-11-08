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
                            Inicio
                        </Link>
                    </li>

                    <li>
                        <Link
                            href="/panel/convenios"
                            className={`opcionMenu ${pathname === "/panel/convenios" ? "activa" : ""}`}
                        >
                            Convenios
                        </Link>
                    </li>

                    <li>
                        <Link
                            href="/panel/instituciones"
                            className={`opcionMenu ${pathname === "/panel/instituciones" ? "activa" : ""}`}
                        >
                            Instituciones
                        </Link>
                    </li>

                    <li>
                        <Link
                            href="/panel/personas"
                            className={`opcionMenu ${pathname === "/panel/personas" ? "activa" : ""}`}
                        >
                            Personas
                        </Link>
                    </li>

                    <li>
                        <Link
                            href="/panel/revisiones"
                            className={`opcionMenu ${pathname === "/panel/revisiones" ? "activa" : ""}`}
                        >
                            Revisiones
                        </Link>
                    </li>

                    <li>
                        <Link
                            href="/panel/alertas"
                            className={`opcionMenu ${pathname === "/panel/alertas" ? "activa" : ""}`}
                        >
                            Alertas
                        </Link>
                    </li>

                    <li>
                        <Link
                            href="/panel/administracion"
                            className={`opcionMenu ${pathname === "/panel/administracion" ? "activa" : ""}`}
                        >
                            Administracion
                        </Link>
                    </li>

                </ul>
            </nav>
        </aside>
    );
}
