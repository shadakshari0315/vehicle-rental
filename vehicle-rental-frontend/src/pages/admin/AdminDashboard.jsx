// const AdminDashboard = () => {
//     return (
//         <div>
//             <p className="text-sm font-medium text-blue-600">
//                 ADMINISTRATION
//             </p>

//             <h1 className="mt-2 text-3xl font-bold text-slate-900">
//                 Admin Dashboard
//             </h1>

//             <p className="mt-2 text-slate-600">
//                 Manage your vehicles, customers, and rental operations
//                 from one place.
//             </p>

//             <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
//                 <h2 className="text-lg font-semibold text-slate-900">
//                     Welcome, Administrator!
//                 </h2>

//                 <p className="mt-2 text-sm text-slate-600">
//                     Your administration dashboard will appear here.
//                 </p>
//             </div>
//         </div>
//     );
// };

// export default AdminDashboard;

import { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import { useAuth } from "../../context/AuthContext";

const AdminDashboard = () => {
    const { user } = useAuth();

    const [vehicles, setVehicles] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [rentals, setRentals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [
                    vehicleResponse,
                    customerResponse,
                    rentalResponse,
                ] = await Promise.all([
                    axiosInstance.get("/vehicles"),
                    axiosInstance.get("/customers"),
                    axiosInstance.get("/rentals"),
                ]);

                setVehicles(vehicleResponse.data);
                setCustomers(customerResponse.data);
                setRentals(rentalResponse.data);
            } catch (err) {
                setError(
                    "Failed to load dashboard statistics. Please try again."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const activeVehicles = vehicles.filter(
        (vehicle) => vehicle.active
    );

    const availableVehicles = activeVehicles.filter(
        (vehicle) => vehicle.available
    );

    const summaryCards = [
        {
            title: "Total Vehicles",
            value: activeVehicles.length,
            description: "Active vehicles in the fleet",
            icon: "🚘",
            color: "bg-blue-50 text-blue-700",
        },
        {
            title: "Available Vehicles",
            value: availableVehicles.length,
            description: "Ready to be rented",
            icon: "🔑",
            color: "bg-emerald-50 text-emerald-700",
        },
        {
            title: "Registered Customers",
            value: customers.length,
            description: "Registered customer accounts",
            icon: "👥",
            color: "bg-violet-50 text-violet-700",
        },
        {
            title: "Total Rentals",
            value: rentals.length,
            description: "Ongoing and returned rentals",
            icon: "📋",
            color: "bg-orange-50 text-orange-700",
        },
    ];

    if (loading) {
        return (
            <p className="mt-10 text-center text-slate-600">
                Loading dashboard statistics...
            </p>
        );
    }

    return (
        <div>
            <p className="text-sm font-semibold tracking-wide text-blue-600">
                ADMINISTRATION
            </p>

            <h1 className="mt-2 text-3xl font-bold text-slate-900">
                Welcome back{user?.name ? `, ${user.name}` : ""}! 👋
            </h1>

            <p className="mt-2 text-slate-600">
                Here's an overview of your vehicle rental business.
            </p>

            {error ? (
                <div
                    role="alert"
                    className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700"
                >
                    {error}
                </div>
            ) : (
                <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
                    {summaryCards.map((card) => (
                        <div
                            key={card.title}
                            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                        >
                            <div className="flex items-center justify-between gap-3">
                                <p className="text-sm font-medium text-slate-500">
                                    {card.title}
                                </p>

                                <span
                                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl ${card.color}`}
                                >
                                    {card.icon}
                                </span>
                            </div>

                            <p className="mt-5 text-3xl font-bold text-slate-900">
                                {card.value}
                            </p>

                            <p className="mt-2 text-sm text-slate-500">
                                {card.description}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;