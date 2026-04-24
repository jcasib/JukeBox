import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { getRole } from "../../services/backEndServices";

export const MobileNavbar = () => {

    const [authorized, setAuthorized] = useState(false)

    const checkRole = async () => {
        const role = await getRole()
        if (role === "mod" || role === "admin") {
            setAuthorized(true)
        } else {
            setAuthorized(false)
        }
    }

    useEffect(() => {
        checkRole()
        const id = setInterval(checkRole, 30000)
        return () => clearInterval(id)
    }, [])

    return (
        <nav className="sidebar fixed-bottom d-lg-none">
            <div className="container-fluid">

                <div className="nav d-flex justify-content-around w-100">
                    {/* Home */}
                    <NavLink to="/" end className="btn text-center fs-2">
                        <i className="bi bi-house-door"></i>
                        <span className="d-block" style={{ fontSize: "0.65rem" }}>Inicio</span>
                    </NavLink>

                    {/* Search */}
                    <NavLink to="/search" className="btn text-center fs-2">
                        <i className="bi bi-search"></i>
                        <span className="d-block" style={{ fontSize: "0.65rem" }}>Buscar</span>
                    </NavLink>

                    {/* Request */}
                    <NavLink to="/requests" className="btn text-center fs-2" >
                        <i className="bi bi-music-note-list"></i>
                        <span className="d-block" style={{ fontSize: "0.65rem" }}>Peticiones</span>
                    </NavLink>

                    {/* Admin */}
                    {authorized && <NavLink to="/mod" className="btn text-center fs-2">
                        <i className="bi bi-shield-check"></i>
                        <span className="d-block" style={{ fontSize: "0.65rem" }}>Moderador</span>
                    </NavLink>}

                    {/* Settings
                    <NavLink to="/app/profile" className="btn text-center px-3">
                        <i className="bi bi-gear"></i>
                    </NavLink> */}

                </div>
            </div>
        </nav>
    );
};