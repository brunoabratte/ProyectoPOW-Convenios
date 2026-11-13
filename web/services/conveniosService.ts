var url = "http://127.0.0.1:8000/api/";

export async function obtenerConvenios(){
    let token = localStorage.getItem("token");

    let res = await fetch(url + "instrumentos", {
        method: "GET",
        headers: {
            "Accept": "application/json",
            "Authorization": `Bearer ${token}`
        }
    });

    return await res.json();
}

export async function obtenerConvenioEspecifico(id : string){
    let token = localStorage.getItem("token");

    let res = await fetch(url + `instrumentos/${id}`, {
        method: "GET",
        headers: {
            "Accept": "application/json",
            "Authorization": `Bearer ${token}`
        } 
    });

    return await res.json();
}

export async function registrar(datos : FormData){
    let token = localStorage.getItem("token");

    let res = await fetch(url + "instrumentos", {
        method: "POST",
        headers: {
            "Accept": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: datos
    });

    return await res.json();
}