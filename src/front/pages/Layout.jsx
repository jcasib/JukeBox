import { Outlet } from "react-router-dom/dist"
import ScrollToTop from "../components/ScrollToTop"
import { Navbar } from "../components/Navbar"
import { Footer } from "../components/Footer"
import { MobileNavbar } from "../components/Navbar/MobileNavbar"

// Base component that maintains the navbar and footer throughout the page and the scroll to top functionality.
export const Layout = () => {
    return (
        <ScrollToTop>
            {/* <Navbar /> */}
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