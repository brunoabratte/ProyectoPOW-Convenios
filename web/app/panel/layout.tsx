import BarraLateral from "@/components/BarraLateral";

export default function PanelLayout({
    children
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="d-flex flex-column min-vh-100">

            <header className="headerPanelPrincipal">
                <img
                    src="/panel-logo.png"
                    alt="UNLPam Convenios"
                />
            </header>

            <div className="d-flex flex-grow-1">

                <BarraLateral />

                <main className="flex-grow-1 p-4">
                    {children}
                </main>

            </div>
        </div>
    );
}