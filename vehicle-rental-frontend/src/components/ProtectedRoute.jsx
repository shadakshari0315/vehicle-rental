import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ allowedRoles }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <p className="mt-10 text-center text-slate-600">
                Checking authentication...
            </p>
        );
    }

    // User is not logged in
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // User does not have the required role
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        const redirectPath =
            user.role === "ADMIN" ? "/admin/dashboard" : "/dashboard";

        return <Navigate to={redirectPath} replace state={{ from: location }} />;
    }

    return <Outlet />;
};

export default ProtectedRoute;