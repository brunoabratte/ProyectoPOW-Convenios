var url = "http://127.0.0.1:8000/api/";

// Devuelve el usuario que inició sesión (incluye su rol)
export async function obtenerUsuarioActual(){
    let token = localStorage.getItem("token");

    let res = await fetch(url + "me", {
        method: "GET",
        headers: {
            "Accept": "application/json",
            "Authorization": `Bearer ${token}`
        }
    });

    return await res.json();
}

// "filtros" es un texto como "page=2&accion=crear"
export async function obtenerAuditorias(filtros : string){
    let token = localStorage.getItem("token");

    let res = await fetch(url + "auditorias?" + filtros, {
        method: "GET",
        headers: {
            "Accept": "application/json",
            "Authorization": `Bearer ${token}`
        }
    });

    return await res.json();
}