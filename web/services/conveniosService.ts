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

export async function registrarParte(datos : FormData){
    let token = localStorage.getItem("token");

    let res = await fetch(url + "partes", {
        method: "POST",
        headers: {
            "Accept": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: datos
    });

    return await res.json();
}

export async function subirDocumento(datos : FormData){
    let token = localStorage.getItem("token");

    let res = await fetch(url + "documentos", {
        method: "POST",
        headers: {
            "Accept": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: datos
    });

    return await res.json();
}

export async function obtenerObservaciones(idInstrumento : string){
    let token = localStorage.getItem("token");

    let res = await fetch(url + `observaciones?id_instrumento=${idInstrumento}`, {
        method: "GET",
        headers: {
            "Accept": "application/json",
            "Authorization": `Bearer ${token}`
        }
    });

    return await res.json();
}

export async function crearObservacion(datos : FormData){
    let token = localStorage.getItem("token");

    let res = await fetch(url + "observaciones", {
        method: "POST",
        headers: {
            "Accept": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: datos
    });

    return await res.json();
}

export async function resolverObservacion(id : string){
    let token = localStorage.getItem("token");

    let res = await fetch(url + `observaciones/${id}/resolver`, {
        method: "PUT",
        headers: {
            "Accept": "application/json",
            "Authorization": `Bearer ${token}`
        }
    });

    return await res.json();
}

// PATCH no puede llevar FormData en Laravel (no lo lee), por eso este va en JSON, como el login
export async function cambiarEstado(id : string, datos : { id_estado_nuevo : number, fundamento : string }){
    let token = localStorage.getItem("token");

    let res = await fetch(url + `instrumentos/${id}/estado`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(datos)
    });

    return await res.json();
}

// La descarga necesita el token, por eso no sirve un simple enlace
export async function descargarDocumento(id : string, nombre : string){
    let token = localStorage.getItem("token");

    let res = await fetch(url + `documentos/${id}/descargar`, {
        method: "GET",
        headers: {
            "Accept": "application/json",
            "Authorization": `Bearer ${token}`
        }
    });

    if (!res.ok)
        return false;

    let archivo = await res.blob();
    let enlace = document.createElement("a");
    enlace.href = URL.createObjectURL(archivo);
    enlace.download = nombre;
    enlace.click();
    setTimeout(() => URL.revokeObjectURL(enlace.href), 1000);

    return true;
}