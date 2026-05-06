export const Privacy = () => {
    return (
        <div className="container-fluid py-3">
            <h1 className="fw-bold mb-1" style={{ color: "var(--primary)" }}>Política de Privacidad</h1>
            <p style={{ color: "var(--muted-foreground)", fontSize: "13px" }} className="mb-4">Jukebox — jukeboxapp.es · Última actualización: Mayo 2026</p>

            <section className="mb-4">
                <h5 className="fw-bold">1. Responsable del Tratamiento</h5>
                <p>En cumplimiento del RGPD y la LOPDGDD, el responsable del tratamiento es:</p>
                <p><strong>Nombre:</strong> Jordi Castro Ibarz<br />
                <strong>Aplicación:</strong> Jukebox<br />
                <strong>Sitio web:</strong> jukeboxapp.es<br />
                <strong>Contacto:</strong> contact@jukeboxapp.es</p>
            </section>

            <section className="mb-4">
                <h5 className="fw-bold">2. Datos que Recopilamos</h5>
                <p>Recopilamos los siguientes datos al registrarse:</p>
                <ul>
                    <li>Nombre de usuario</li>
                    <li>Correo electrónico</li>
                    <li>Contraseña (cifrada con bcrypt)</li>
                    <li>Peticiones de canciones realizadas</li>
                </ul>
            </section>

            <section className="mb-4">
                <h5 className="fw-bold">3. Finalidad del Tratamiento</h5>
                <ul>
                    <li>Gestionar su registro y acceso a la aplicación</li>
                    <li>Permitirle realizar peticiones de canciones</li>
                    <li>Gestionar el sistema de moderación</li>
                </ul>
            </section>

            <section className="mb-4">
                <h5 className="fw-bold">4. Base Legal</h5>
                <p>El consentimiento otorgado al registrarse, conforme al artículo 6.1.a) del RGPD.</p>
            </section>

            <section className="mb-4">
                <h5 className="fw-bold">5. Conservación de los Datos</h5>
                <p>Sus datos se conservan mientras mantenga una cuenta activa. Las peticiones se eliminan automáticamente cada día a las 10:00h. Puede solicitar la eliminación en cualquier momento escribiendo a contact@jukeboxapp.es.</p>
            </section>

            <section className="mb-4">
                <h5 className="fw-bold">6. Destinatarios</h5>
                <p>Sus datos no se ceden a terceros salvo obligación legal. Usamos Railway y Vercel como proveedores de infraestructura bajo las garantías del RGPD.</p>
            </section>

            <section className="mb-4">
                <h5 className="fw-bold">7. Sus Derechos</h5>
                <p>Tiene derecho a acceder, rectificar, suprimir y oponerse al tratamiento de sus datos. También puede reclamar ante la <strong>Agencia Española de Protección de Datos</strong> (www.aepd.es).</p>
                <p>Para ejercer sus derechos: <strong>contact@jukeboxapp.es</strong></p>
            </section>

            <section className="mb-4">
                <h5 className="fw-bold">8. Seguridad</h5>
                <p>Aplicamos medidas técnicas adecuadas: contraseñas cifradas, comunicaciones HTTPS y autenticación JWT.</p>
            </section>

            <section className="mb-4">
                <h5 className="fw-bold">9. Modificaciones</h5>
                <p>Nos reservamos el derecho a modificar esta política. Cualquier cambio será comunicado a través de la aplicación.</p>
            </section>
        </div>
    )
}