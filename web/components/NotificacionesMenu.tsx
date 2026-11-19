"use client";

import { useEffect, useState } from "react";
import {
    obtenerNotificaciones,
    marcarNotificacionLeida
} from "@/services/notificacionesService";

interface Notificacion {
    id_notificacion: number;
    mensaje: string;
    tipo: string;
    leida_en: string | null;
    created_at: string;
    instrumento?: {
        codigo: string;
        titulo: string;
    };
}

export default function NotificacionesMenu() {
    const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
    const [abierto, setAbierto] = useState(false);

    async function cargarNotificaciones() {
        try {
            let datos = await obtenerNotificaciones();

            if (datos.status === true) {
                setNotificaciones(
                    datos.data.data.filter(
                        (n: Notificacion) => n.leida_en === null
                    )
                );
            }
        } catch {
            console.error("No se pudieron cargar las notificaciones.");
        }
    }

    useEffect(() => {
        cargarNotificaciones();
    }, []);

    async function marcarLeida(id: number) {
        let respuesta = await marcarNotificacionLeida(id);

        if (respuesta.status === true) {
            setNotificaciones(actuales =>
                actuales.filter(n => n.id_notificacion !== id)
            );
        }
    }

    let pendientes = notificaciones.length;

    return (
        <div className="notificaciones-contenedor">
            <button
                type="button"
                className="boton-notificaciones"
                onClick={() => setAbierto(!abierto)}
            >
                <span>🔔</span>

                {pendientes > 0 && (
                    <span className="contador-notificaciones">
                        {pendientes}
                    </span>
                )}
            </button>

            {abierto && (
                <div className="menu-notificaciones">
                    <h5>Notificaciones</h5>

                    {notificaciones.length === 0 ? (
                        <p>No tenés notificaciones.</p>
                    ) : (
                        notificaciones.map(n => (
                            <div
                                key={n.id_notificacion}
                                className={`notificacion-item ${n.leida_en === null ? "no-leida" : ""}`}
                            >
                                <p>{n.mensaje}</p>

                                {n.instrumento && (
                                    <small>
                                        {n.instrumento.codigo} - {n.instrumento.titulo}
                                    </small>
                                )}

                                {n.leida_en === null && (
                                    <button
                                        type="button"
                                        onClick={() => marcarLeida(n.id_notificacion)}
                                    >
                                        Marcar como leída
                                    </button>
                                )}
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
