const url = "http://127.0.0.1:8000/api/";

export async function obtenerNotificaciones() {
    let token = localStorage.getItem("token");

    let res = await fetch(url + "notificaciones", {
        method: "GET",
        headers: {
            "Accept": "application/json",
            "Authorization": `Bearer ${token}`
        }
    });

    return await res.json();
}

export async function marcarNotificacionLeida(id: number) {
    let token = localStorage.getItem("token");

    let res = await fetch(url + `notificaciones/${id}/leer`, {
        method: "PATCH",
        headers: {
            "Accept": "application/json",
            "Authorization": `Bearer ${token}`
        }
    });

    return await res.json();
}
