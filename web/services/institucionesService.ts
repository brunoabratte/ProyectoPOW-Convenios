var url = "http://127.0.0.1:8000/api/instituciones";

export async function registrar(datos : FormData){
    let token = localStorage.getItem("token");

    let res = await fetch(url, {
        method: "POST",
        headers: {
            "Accept": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: datos
    });

    return await res.json();
}

export async function obtenerInstituciones(){
    let token = localStorage.getItem("token");

    let res = await fetch(url, {
        method: "GET",
        headers: {
            "Accept": "application/json",
            "Authorization": `Bearer ${token}`
        }
    });

    return await res.json();
}
