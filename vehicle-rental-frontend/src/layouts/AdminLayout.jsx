import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AdminLayout = () => {
    const { user, logout } = useAuth();

    const navLinkClass = ({ isActive }) =>
        `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
            isActive
                ? "bg-blue-600 text-white"
                : "text-slate-300 hover:bg-slate-800 hover:text-white"
        }`;

    const handleLogout = async () => {
        try {
            await logout();
        } finally {
            window.location.href = "/login";
        }
    };

    return (
        <div className="admin-shell min-h-screen bg-slate-50 md:flex">

            {/* Sidebar */}
            <aside className="flex w-full flex-col bg-slate-900 text-white md:min-h-screen md:w-64 md:shrink-0">
                <div className="border-b border-slate-700 px-6 py-6">
                    <h1 className="text-2xl font-bold tracking-tight">
                        DriveEase
                    </h1>
                    <p className="mt-1 text-sm text-slate-400">
                        Administration
                    </p>
                </div>

                <nav className="flex flex-wrap gap-2 p-4 md:flex-1 md:flex-col">
                    <NavLink to="/admin/dashboard" className={navLinkClass}>
                        <span>📊</span>
                        Dashboard
                    </NavLink>

                    <NavLink to="/admin/vehicles" className={navLinkClass}>
                        <span>🚘</span>
                        Manage Vehicles
                    </NavLink>

                    <NavLink to="/admin/customers" className={navLinkClass}>
                        <span>👥</span>
                        Manage Customers
                    </NavLink>

                    <NavLink to="/admin/rentals" className={navLinkClass}>
                        <span>📋</span>
                        Manage Rentals
                    </NavLink>
                </nav>

                {/* Admin account */}
                <div className="border-t border-slate-700 p-4">
                    <p className="truncate text-sm font-semibold">
                        {user?.name}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                        Administrator
                    </p>

                    <button
                        onClick={handleLogout}
                        className="mt-4 w-full rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-red-600 hover:text-white"
                    >
                        Logout
                    </button>
                </div>
            </aside>

            {/* Page content */}
            <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;