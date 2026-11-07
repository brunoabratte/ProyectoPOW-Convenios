import PanelLogin from "@/components/panelLogin";

export default function LoginPage(){
    return (
        <main className="min-vh-100 d-flex justify-content-center align-items-center bg-light bg-gradient">
            <div className="border p-5 rounded bg-white">
                <h1 className="text-center mb-4 text-primary">Iniciar Sesi&oacute;n</h1>
                <PanelLogin />
            </div>
        </main>
    );
}