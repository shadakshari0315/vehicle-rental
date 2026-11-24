import { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";

const Vehicles = () => {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [startDate, setStartDate] = useState("");
    const [rentalMessage, setRentalMessage] = useState("");
    const [rentalError, setRentalError] = useState("");
    const [renting, setRenting] = useState(false);

    const handleRent = async (e) => {
        e.preventDefault();

        setRentalMessage("");
        setRentalError("");
        setRenting(true);

        try {
            await axiosInstance.post("/rentals", {
                vehicleId: selectedVehicle.vid,
                startDate: startDate,
            });

            setRentalMessage("Vehicle rented successfully!");
            setSelectedVehicle(null);
            setStartDate("");

            const response = await axiosInstance.get("/vehicles");
            setVehicles(response.data);
        } catch (error) {
            setRentalError(
                error.response?.data?.message ||
                "Failed to rent vehicle. Please try again."
            );
        } finally {
            setRenting(false);
        }
    };

    useEffect(() => {
        const fetchVehicles = async () => {
            try {
                const response = await axiosInstance.get("/vehicles");
                setVehicles(response.data);
            } catch (error) {
                setError("Failed to load vehicles. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchVehicles();
    }, []);

    if (loading) {
        return (
            <p className="mt-10 text-center text-slate-600">
                Loading vehicles...
            </p>
        );
    }

    if (error) {
        return (
            <p className="mt-10 text-center text-red-600">
                {error}
            </p>
        );
    }

    return (
        <div className="vehicle-page min-h-screen bg-slate-100 px-6 py-10">
            <div className="mx-auto max-w-7xl">
                <h1 className="mb-2 text-3xl font-bold text-slate-900">
                    Available Vehicles
                </h1>

                <p className="mb-8 text-slate-600">
                    Find the right vehicle for your next journey.
                </p>

                {rentalMessage && (
                    <p className="mb-5 rounded-xl bg-green-100 p-4 text-green-800">
                        {rentalMessage}
                    </p>
                )}

                {rentalError && (
                    <p role="alert" className="mb-5 rounded-xl bg-red-100 p-4 text-red-800">
                        {rentalError}
                    </p>
                )}

                {vehicles.length === 0 ? (
                    <p className="text-slate-600">
                        No vehicles found.
                    </p>
                ) : (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {vehicles.map((vehicle) => (
                            <div
                                key={vehicle.vid}
                                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                            >
                                <div className="mb-4 flex items-start justify-between gap-3">
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-900">
                                            {vehicle.vname}
                                        </h2>

                                        <p className="mt-1 text-sm text-slate-500">
                                            {vehicle.vehicleNumber}
                                        </p>
                                    </div>

                                    <span
                                        className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${vehicle.available && vehicle.active
                                            ? "bg-green-100 text-green-700"
                                            : "bg-red-100 text-red-700"
                                            }`}
                                    >
                                        {vehicle.active
                                            ? vehicle.available
                                                ? "Available"
                                                : "Rented"
                                            : "Inactive"}
                                    </span>
                                </div>

                                <div className="mt-6 border-t border-slate-100 pt-4">
                                    <p className="text-sm text-slate-500">
                                        Rental price
                                    </p>

                                    <p className="mt-1 text-2xl font-bold text-blue-700">
                                        ₹{vehicle.rentPerDay}
                                        <span className="text-sm font-normal text-slate-500">
                                            {" "}/ day
                                        </span>
                                    </p>
                                </div>
                                {vehicle.active && vehicle.available && (
                                    <button
                                        onClick={() => {
                                            setSelectedVehicle(vehicle);
                                            setRentalMessage("");
                                            setRentalError("");
                                            setStartDate("");
                                        }}
                                        className="mt-5 w-full rounded-xl bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700"
                                    >
                                        Rent Vehicle
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
                {selectedVehicle && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                        <form
                            onSubmit={handleRent}
                            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
                        >
                            <h2 className="text-2xl font-bold text-slate-900">
                                Rent {selectedVehicle.vname}
                            </h2>

                            <label className="mt-5 block text-sm font-semibold text-slate-700">
                                Rental start date
                            </label>

                            <input
                                type="date"
                                value={startDate}
                                min={new Date().toLocaleDateString("en-CA")}
                                onChange={(e) => setStartDate(e.target.value)}
                                required
                                className="mt-2 w-full rounded-xl border border-slate-300 p-3"
                            />

                            <div className="mt-6 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setSelectedVehicle(null)}
                                    className="flex-1 rounded-xl border border-slate-300 py-3 font-semibold"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={renting}
                                    className="flex-1 rounded-xl bg-blue-600 py-3 font-semibold text-white disabled:opacity-60"
                                >
                                    {renting ? "Booking..." : "Confirm Rental"}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
            
        </div>
    );
};

export default Vehicles;
