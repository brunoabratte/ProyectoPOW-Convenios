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