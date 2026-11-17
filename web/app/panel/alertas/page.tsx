"use client"

import { verificarSesion } from "@/services/authService";
import { obtenerConvenios } from "@/services/conveniosService";
import { useEffect } from "react";

// Un convenio sin plazo de preaviso se considera "proximo a vencer" cuando faltan estos días o menos
const DIAS_ALERTA = 30;

export default function AlertasPage(){
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

        lista.sort((a, b) => a.dias - b.dias);

        let filas = "";

        for (let i = 0; i < lista.length; i++) {
            let alerta = lista[i];
            let c = alerta.convenio;

            filas += `
            <tr>
                <td>${escapar(c.codigo)}</td>
                <td>${escapar(c.titulo)}</td>
                <td>${escapar(c.tipo_instrumento?.nombre)}</td>
                <td>${escapar(c.unidad?.nombre)}</td>
                <td>${formatearFecha(alerta.vencimiento)}</td>
                <td>${alerta.preaviso > 0 ? formatearFecha(alerta.fechaPreaviso) : "-"}</td>
                <td><strong>${textoDias(alerta.dias)}</strong></td>
                <td>
                    <a class="btn btn-info" href="/panel/convenios?abrir=${c.id_instrumento}">Ver convenio</a>
                </td>
            </tr>
            `;
        }

        return `
        <table class="table table-striped table-bordered rounded">
            <thead>
                <tr>
                    <th>C&oacute;digo</th>
                    <th>T&iacute;tulo</th>
                    <th>Tipo</th>
                    <th>Unidad</th>
                    <th>Vencimiento</th>
                    <th>Preaviso desde</th>
                    <th>Situaci&oacute;n</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>${filas}</tbody>
        </table>
        `;
    }

    async function listarAlertas() {
        let resultados = document.getElementById("resultados-alertas");

        if (resultados == null)
            return;

        let datos = await obtenerConvenios();

        if (datos.status != 200) {
            resultados.innerHTML = "<p>No se pudieron obtener los convenios.</p>";
            return;
        }

        let hoy = new Date();
        hoy.setHours(0, 0, 0, 0);

        let vencidos: any[] = [];
        let enPreaviso: any[] = [];
        let proximos: any[] = [];
        let sinVencimiento = 0;

        for (let i = 0; i < datos.data.length; i++) {
            let c = datos.data[i];
            let estado = c.estado?.nombre;

            // Solo convenios en vigor: no se avisa de borradores, rescindidos ni archivados
            if (estado !== "firmado" && estado !== "aprobado")
                continue;

            if (c.fecha_vencimiento == null) {
                sinVencimiento++;
                continue;
            }

            let vencimiento = crearFecha(c.fecha_vencimiento);
            let dias = Math.round((vencimiento.getTime() - hoy.getTime()) / 86400000);
            let preaviso = Number(c.plazo_preaviso ?? 0);

            // Fecha desde la cual corre el preaviso = vencimiento menos los días de preaviso
            let fechaPreaviso = new Date(vencimiento);
            fechaPreaviso.setDate(fechaPreaviso.getDate() - preaviso);

            let alerta = { convenio: c, vencimiento: vencimiento, dias: dias, preaviso: preaviso, fechaPreaviso: fechaPreaviso };

            if (dias < 0)
                vencidos.push(alerta);
            else if (preaviso > 0 && dias <= preaviso)
                enPreaviso.push(alerta);
            else if (dias <= DIAS_ALERTA)
                proximos.push(alerta);
        }

        if (vencidos.length == 0 && enPreaviso.length == 0 && proximos.length == 0) {
            resultados.innerHTML = `<p class="text-muted">No hay alertas de vencimiento por el momento.</p>`;
        }
        else {
            resultados.innerHTML = `
            <h5 class="titulo h5">Vencidos (${vencidos.length})</h5>
            ${armarTabla(vencidos)}
            <h5 class="titulo h5">En per&iacute;odo de preaviso (${enPreaviso.length})</h5>
            ${armarTabla(enPreaviso)}
            <h5 class="titulo h5">Pr&oacute;ximos a vencer (${proximos.length})</h5>
            ${armarTabla(proximos)}
            `;
        }

        let nota = document.getElementById("nota-sin-vencimiento");
        if (nota != null)
            nota.innerHTML = sinVencimiento > 0
                ? `${sinVencimiento} convenio(s) en vigor con <em>sin vencimiento registrado</em>.`
                : "";
    }

    return (
        <section className="border rounded p-4 d-flex flex-column gap-3">
            <div className="mb-3">
                <h2 className="titulo h2">Alertas</h2>
                <small className="form-text text-muted">
                    Convenios firmados o aprobados vencidos, en per&iacute;odo de preaviso o que vencen en los pr&oacute;ximos {DIAS_ALERTA} d&iacute;as
                </small>
            </div>
            <div id="resultados-alertas"></div>
            <small id="nota-sin-vencimiento" className="text-muted"></small>
        </section>
    );
}