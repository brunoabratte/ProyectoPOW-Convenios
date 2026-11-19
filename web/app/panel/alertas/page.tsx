"use client"

import { verificarSesion } from "@/services/authService";
import { obtenerAlertas } from "@/services/alertasService";
import { useEffect, useState } from "react";
import SpinnerCarga from "@/components/SpinnerCarga";

// Un convenio sin plazo de preaviso se considera "proximo a vencer" cuando faltan estos días o menos
const DIAS_ALERTA = 30;

export default function AlertasPage(){
    const [cargando, setCargando] = useState(true);
    useEffect(() => {
        verificarSesion();
        listarAlertas();
    }, []);

    // Evita que un texto con etiquetas HTML se ejecute al mostrarlo con innerHTML.
    // Si el dato viene vacio devuelve "-".
    function escapar(texto: any) {
        if (texto === null || texto === undefined || texto === "")
            return "-";

        return String(texto)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    }

    function formatearFecha(fecha: Date) {
        return fecha.toLocaleDateString("es-AR");
    }

    function crearFecha(texto: string) {
        return new Date(String(texto).substring(0, 10) + "T00:00:00");
    }

    function textoDias(dias: number) {
        if (dias < 0)
            return "Venció hace " + Math.abs(dias) + (Math.abs(dias) == 1 ? " día" : " días");
        if (dias == 0)
            return "Vence hoy";
        if (dias == 1)
            return "Vence mañana";

        return "Vence en " + dias + " días";
    }

    // Arma la tabla de un grupo de alertas, ordenada de la mas urgente a la menos urgente
    function armarTabla(lista: any[]) {
        if (lista.length == 0)
            return `<p class="text-muted">Ninguno.</p>`;

        let hoy = new Date();
        hoy.setHours(0, 0, 0, 0);

        lista.sort((a, b) => {
            let fechaA = crearFecha(a.fecha_vencimiento);
            let fechaB = crearFecha(b.fecha_vencimiento);
            return fechaA.getTime() - fechaB.getTime();
        });

        let filas = "";

        for (let i = 0; i < lista.length; i++) {
            let alerta = lista[i];

            let vencimiento = crearFecha(alerta.fecha_vencimiento);
            let dias = Math.round(
                (vencimiento.getTime() - hoy.getTime()) / 86400000
            );

            let fechaPreaviso = alerta.fecha_preaviso
                ? crearFecha(alerta.fecha_preaviso)
                : null;

            filas += `
            <tr>
                <td>${escapar(alerta.codigo)}</td>
                <td>${escapar(alerta.titulo)}</td>
                <td>${escapar(alerta.tipo?.nombre)}</td>
                <td>${escapar(alerta.unidad?.nombre ?? "-")}</td>
                <td>${formatearFecha(vencimiento)}</td>
                <td>${fechaPreaviso ? formatearFecha(fechaPreaviso) : "-"}</td>
                <td><strong>${textoDias(dias)}</strong></td>
                <td>
                    <a class="btn btn-info" href="/panel/convenios?abrir=${alerta.id}">
                        Ver convenio
                    </a>
                </td>
            </tr>
            `;
        }

        return `
        <table class="table table-striped table-bordered rounded">
            <thead>
                <tr>
                    <th>Código</th>
                    <th>Título</th>
                    <th>Tipo</th>
                    <th>Unidad</th>
                    <th>Vencimiento</th>
                    <th>Preaviso desde</th>
                    <th>Situación</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>${filas}</tbody>
        </table>
        `;
    }

    async function listarAlertas() {
        setCargando(true);

        try {
            let resultados = document.getElementById("resultados-alertas");

            if (resultados == null)
                return;

            let datos = await obtenerAlertas();

            if (datos.status != 200) {
                resultados.innerHTML = "<p>No se pudieron obtener las alertas.</p>";
                return;
            }

            let vencidos = datos.data.vencidos;
            let enPreaviso = datos.data.en_preaviso;
            let proximos = datos.data.proximos_a_vencer;

            if (vencidos.length == 0 && enPreaviso.length == 0 && proximos.length == 0) {
                resultados.innerHTML = `
                    <p class="text-muted">No hay alertas de vencimiento por el momento.</p>
                `;
            }
            else {
                resultados.innerHTML = `
                    <h5 class="titulo h5">Vencidos (${vencidos.length})</h5>
                    ${armarTabla(vencidos)}
                    <h5 class="titulo h5">En período de preaviso (${enPreaviso.length})</h5>
                    ${armarTabla(enPreaviso)}
                    <h5 class="titulo h5">Próximos a vencer (${proximos.length})</h5>
                    ${armarTabla(proximos)}
                `;
            }

        } finally {
            setCargando(false);
        }
    }

    return (
        <section className="border rounded p-4 d-flex flex-column gap-3">
            <div className="mb-3">
                <h2 className="titulo h2">Alertas</h2>
                <small className="form-text text-muted">
                    Convenios firmados o aprobados vencidos, en per&iacute;odo de preaviso o que vencen en los pr&oacute;ximos {DIAS_ALERTA} d&iacute;as
                </small>
            </div>
            {cargando && (
                <SpinnerCarga mensaje="Cargando alertas..." />
            )}

            <div
                id="resultados-alertas"
                style={{ display: cargando ? "none" : "block" }}
            ></div>

            <small
                id="nota-sin-vencimiento"
                className="text-muted"
                style={{ display: cargando ? "none" : "block" }}
            ></small>
        </section>
    );
}