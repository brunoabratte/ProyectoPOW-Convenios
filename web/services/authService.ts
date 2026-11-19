var url = "http://127.0.0.1:8000/api/"

export async function obtenerRolActual(): Promise<string | null> {
    let token = localStorage.getItem("token");
    if (!token) return null;

    try {
        let res = await fetch(url + "me", {
            headers: { "Accept": "application/json", "Authorization": `Bearer ${token}` }
        });
        if (!res.ok) return null;
        let datos = await res.json();
        return datos.usuario?.rol ?? null;
    } catch {
        return null;
    }
}

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

export async function verificarSesion(){
    let token = localStorage.getItem("token");

    if (token == null){
        window.location.replace("/login");
        return;
    }

    // Comprueba con el servidor que el token siga siendo válido
    try {
        let res = await fetch(url + "me", {
            method: "GET",
            headers: {
                "Accept": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        if (res.status == 401){
            localStorage.removeItem("token");
            window.location.replace("/login");
        }
    }
    catch {
        // Si el servidor no responde, no se redirige: el usuario no hizo nada mal
    }
}

export async function cerrarSesion(){
    let token = localStorage.getItem("token");

    // Se revoca el token en el servidor
    try {
        await fetch(url + "logout", {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });
    }
    catch {
        // Si el servidor no responde igual se cierra la sesión en este navegador
    }

    localStorage.removeItem("token");
    window.location.replace("/login");
}
