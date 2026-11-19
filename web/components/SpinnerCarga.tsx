interface Props {
    mensaje?: string;
}

export default function SpinnerCarga({ mensaje = "Cargando información..." }: Props) {
    return (
        <div className="d-flex flex-column justify-content-center align-items-center py-4">
            <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Cargando...</span>
            </div>

            <p className="mt-3 text-secondary">
                {mensaje}
            </p>
        </div>
    );
}