import { Outlet, Navigate } from "react-router-dom/dist"
import ScrollToTop from "../components/ScrollToTop"
import { MobileNavbar } from "../components/Navbar/MobileNavbar"
import { TopBar } from "../components/TopBar"

// Base component that maintains the navbar and footer throughout the page and the scroll to top functionality.
export const Layout = () => {
    const token = localStorage.getItem("token")
    
    if (!token) return <Navigate to="/auth" replace />
    return (
        <ScrollToTop>
            <TopBar />
            <div className="flex-grow-1 overflow-auto p-3 pb-5 pb-lg-2 mb-5">
                <Outlet />
            </div>
            <div className="d-lg-none">
                <MobileNavbar />
            </div>
            {/* <Footer /> */}
        </ScrollToTop>
    )
}