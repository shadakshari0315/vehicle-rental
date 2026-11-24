import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await logout();
        } finally {
            navigate("/login", { replace: true });
        }
    };

    const navLinkClass = ({ isActive }) =>
        `block rounded-lg px-3 py-2 text-sm font-medium transition ${
            isActive
                ? "bg-blue-50 text-blue-700"
                : "text-slate-600 hover:bg-slate-100 hover:text-blue-700"
        }`;

    return (
        <nav className="sticky top-0 z-40 border-b border-slate-200 bg-white">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
                {/* Brand */}
                <NavLink to="/dashboard" className="flex items-center gap-2">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-xl text-white">
                        🚘
                    </span>
                    <span className="text-xl font-bold tracking-tight text-slate-900">
                        DriveEase
                    </span>
                </NavLink>

                {/* Desktop navigation */}
                <div className="hidden items-center gap-2 md:flex">
                    <NavLink to="/dashboard" className={navLinkClass}>
                        Dashboard
                    </NavLink>

                    <NavLink to="/vehicles" className={navLinkClass}>
                        Vehicles
                    </NavLink>

                    <NavLink to="/my-rentals" className={navLinkClass}>
                        My Rentals
                    </NavLink>
                </div>

                {/* User and logout */}
                <div className="hidden items-center gap-4 md:flex">
                    <div className="text-right">
                        <p className="text-sm font-semibold text-slate-800">
                            {user?.name}
                        </p>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                    >
                        Logout
                    </button>
                </div>

                {/* Mobile menu button */}
                <button
                    type="button"
                    onClick={() => setMenuOpen(!menuOpen)}
                    aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
                    aria-expanded={menuOpen}
                    className="rounded-lg p-2 text-slate-700 hover:bg-slate-100 md:hidden"
                >
                    {menuOpen ? (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6">
                            <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
                        </svg>
                    ) : (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6">
                            <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    )}
                </button>
            </div>

            {/* Mobile navigation */}
            {menuOpen && (
                <div className="space-y-2 border-t border-slate-200 px-4 py-4 md:hidden">
                    <NavLink
                        to="/dashboard"
                        className={navLinkClass}
                        onClick={() => setMenuOpen(false)}
                    >
                        Dashboard
                    </NavLink>

                    <NavLink
                        to="/vehicles"
                        className={navLinkClass}
                        onClick={() => setMenuOpen(false)}
                    >
                        Vehicles
                    </NavLink>

                    <NavLink
                        to="/my-rentals"
                        className={navLinkClass}
                        onClick={() => setMenuOpen(false)}
                    >
                        My Rentals
                    </NavLink>

                    <div className="flex items-center justify-between border-t border-slate-200 pt-3">
                        <div>
                            <p className="text-sm font-semibold text-slate-800">
                                {user?.name}
                            </p>
                            <p className="text-xs text-slate-500">
                                {user?.role}
                            </p>
                        </div>

                        <button
                            onClick={handleLogout}
                            className="rounded-lg bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-100"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
