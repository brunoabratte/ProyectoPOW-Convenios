import { obtenerConvenios } from "@/services/conveniosService";

const DIAS_ALERTA = 30;

export async function obtenerCantidadAlertas() {
    let datos = await obtenerConvenios();

    if (datos.status !== 200) {
        return null;
    }

    let hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    let cantidad = 0;

    for (let i = 0; i < datos.data.length; i++) {
        let c = datos.data[i];
        let estado = c.estado?.nombre;

        if (estado !== "firmado" && estado !== "aprobado")
            continue;

        if (c.fecha_vencimiento == null)
            continue;

        let vencimiento = new Date(
            String(c.fecha_vencimiento).substring(0, 10) + "T00:00:00"
        );

        let dias = Math.round(
            (vencimiento.getTime() - hoy.getTime()) / 86400000
        );

        let preaviso = Number(c.plazo_preaviso ?? 0);

        if (
            dias < 0 ||
            (preaviso > 0 && dias <= preaviso) ||
            dias <= DIAS_ALERTA
        ) {
            cantidad++;
        }
    }

    return cantidad;
}

export async function obtenerAlertas() {
    let token = localStorage.getItem("token");

    let res = await fetch("http://127.0.0.1:8000/api/alertas", {
        method: "GET",
        headers: {
            "Accept": "application/json",
            "Authorization": `Bearer ${token}`
        }
    });

    return await res.json();
}
