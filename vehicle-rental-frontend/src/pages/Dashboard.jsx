// import { useAuth } from '../context/AuthContext';

// const Dashboard = () => {

//     const { user } = useAuth();

//     return (
//         <div className="min-h-screen bg-slate-100 p-8">
//             <div className="mx-auto max-w-5xl rounded-2xl bg-white p-8 shadow-lg">
//                 <h1 className="text-3xl font-bold text-slate-900">
//                     Welcome, {user.name}!
//                 </h1>

//                 <p className="mt-3 text-slate-600">
//                     Welcome to your Vehicle Rental System dashboard.
//                 </p>

//                 <div className="mt-6 rounded-xl bg-blue-50 p-5">
//                     <p><strong>Name:</strong> {user.name}</p>
//                     <p className="mt-2"><strong>Email:</strong> {user.email}</p>
//                 </div>
//             </div>
//         </div>
//     );
// }

// export default Dashboard

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axiosInstance from "../api/axiosInstance";

const Dashboard = () => {
    const { user } = useAuth();

    const [vehicles, setVehicles] = useState([]);
    const [rentals, setRentals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setError("");

                const [vehicleResponse, rentalResponse] =
                    await Promise.all([
                        axiosInstance.get("/vehicles"),
                        axiosInstance.get("/rentals"),
                    ]);

                setVehicles(vehicleResponse.data);
                setRentals(rentalResponse.data);
            } catch (err) {
                setError(
                    "Unable to load dashboard data. Please try again."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const activeRentals = rentals.filter(
        (rental) => rental.endDate == null
    );

    const completedRentals = rentals.filter(
        (rental) => rental.endDate != null
    );

    const availableVehicles = vehicles.filter(
        (vehicle) => vehicle.active && vehicle.available
    ).length;

    const totalSpent = completedRentals.reduce(
        (total, rental) => total + Number(rental.totalAmount || 0),
        0
    );

    const summaryCards = [
        {
            title: "Available Vehicles",
            value: availableVehicles,
            description: "Ready for your next trip",
            icon: "🚘",
            color: "bg-blue-50 text-blue-700",
        },
        {
            title: "Active Rentals",
            value: activeRentals.length,
            description: "Vehicles currently rented",
            icon: "🔑",
            color: "bg-emerald-50 text-emerald-700",
        },
        {
            title: "Total Rentals",
            value: rentals.length,
            description: "Your complete rental count",
            icon: "📋",
            color: "bg-violet-50 text-violet-700",
        },
        {
            title: "Total Spent",
            value: `₹${totalSpent.toLocaleString("en-IN")}`,
            description: "On completed rentals",
            icon: "💰",
            color: "bg-orange-50 text-orange-700",
        },
    ];

    if (loading) {
        return (
            <div className="p-8 text-center text-slate-600">
                Loading your dashboard...
            </div>
        );
    }

    return (
        <div className="customer-dashboard min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">

                {/* Welcome section */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                        Welcome back, {user?.name}! 👋
                    </h1>

                    <p className="mt-2 text-slate-600">
                        Ready for your next journey? Find a vehicle
                        that fits your plans.
                    </p>
                </div>

                {/* Error message */}
                {error && (
                    <div
                        role="alert"
                        className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700"
                    >
                        {error}
                    </div>
                )}

                {!error && (
                    <>
                        {/* Summary cards */}
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
                            {summaryCards.map((card) => (
                                <div
                                    key={card.title}
                                    className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                                >
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-medium text-slate-500">
                                            {card.title}
                                        </p>

                                        <span
                                            className={`flex h-11 w-11 items-center justify-center rounded-xl text-xl ${card.color}`}
                                        >
                                            {card.icon}
                                        </span>
                                    </div>

                                    <p className="mt-4 text-3xl font-bold text-slate-900">
                                        {card.value}
                                    </p>

                                    <p className="mt-2 text-sm text-slate-500">
                                        {card.description}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* Quick actions */}
                        <div className="mt-8 rounded-2xl bg-blue-600 p-6 text-white shadow-sm sm:p-8">
                            <h2 className="text-xl font-bold">
                                Where would you like to go?
                            </h2>

                            <p className="mt-2 text-sm text-blue-100">
                                Explore available vehicles or manage
                                your existing rentals.
                            </p>

                            <div className="mt-5 flex flex-wrap gap-3">
                                <Link
                                    to="/vehicles"
                                    className="rounded-lg bg-white px-5 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
                                >
                                    Browse Vehicles →
                                </Link>

                                <Link
                                    to="/my-rentals"
                                    className="rounded-lg border border-blue-300 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                                >
                                    My Rentals
                                </Link>
                            </div>
                        </div>

                        {/* Current rentals */}
                        <div className="mt-8">
                            <div className="mb-5 flex items-center justify-between gap-3">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900">
                                        Current Rentals
                                    </h2>

                                    <p className="mt-1 text-sm text-slate-500">
                                        Keep track of your ongoing rentals.
                                    </p>
                                </div>

                                <Link
                                    to="/my-rentals"
                                    className="shrink-0 text-sm font-semibold text-blue-700 hover:text-blue-800"
                                >
                                    View all →
                                </Link>
                            </div>

                            {activeRentals.length === 0 ? (
                                <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center">
                                    <div className="text-4xl">🚗</div>

                                    <h3 className="mt-4 text-lg font-semibold text-slate-900">
                                        No active rentals yet
                                    </h3>

                                    <p className="mt-2 text-sm text-slate-500">
                                        Your next journey starts with
                                        finding the right vehicle.
                                    </p>

                                    <Link
                                        to="/vehicles"
                                        className="mt-5 inline-block rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                                    >
                                        Find a Vehicle
                                    </Link>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                                    {activeRentals.map((rental) => (
                                        <div
                                            key={rental.rid}
                                            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex items-center gap-4">
                                                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-2xl">
                                                        🚘
                                                    </div>

                                                    <div>
                                                        <h3 className="font-bold text-slate-900">
                                                            {rental.vehicle?.vname
                                                                || "Vehicle"}
                                                        </h3>

                                                        <p className="mt-1 text-sm text-slate-500">
                                                            {rental.vehicle?.vehicleNumber}
                                                        </p>
                                                    </div>
                                                </div>

                                                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                                                    Ongoing
                                                </span>
                                            </div>

                                            <div className="mt-5 border-t border-slate-100 pt-4">
                                                <p className="text-sm text-slate-500">
                                                    Rental start date
                                                </p>

                                                <p className="mt-1 font-medium text-slate-800">
                                                    {rental.startDate}
                                                </p>
                                            </div>

                                            <Link
                                                to="/my-rentals"
                                                className="mt-5 inline-flex text-sm font-semibold text-blue-700 hover:text-blue-800"
                                            >
                                                View rental details →
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Dashboard;