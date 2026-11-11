var url = "http://127.0.0.1:8000/api/"

export async function iniciarSesion(email: string, password: string){
    let textoAviso = document.getElementById("texto-aviso");
    if (textoAviso !== null)
        textoAviso.innerHTML = "";

    let res = await fetch(url + "login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        body: JSON.stringify({
            email: email,
            password: password
        })
    });

    let datos = await res.json();

    if (datos.token == null){
        if (textoAviso !== null)
            textoAviso.innerHTML += "El correo o contraseña son incorrectos";
    }
    else{
        localStorage.setItem("token", datos.token);
        window.location.replace("/panel");
    }
}