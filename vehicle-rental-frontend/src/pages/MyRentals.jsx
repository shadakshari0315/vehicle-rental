
import { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";

const MyRentals = () => {
    const [rentals, setRentals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [returningId, setReturningId] = useState(null);
    const [returnMessage, setReturnMessage] = useState("");
    const [returnError, setReturnError] = useState("");

    useEffect(() => {
        const fetchRentals = async () => {
            try {
                const response = await axiosInstance.get("/rentals");
                setRentals(response.data);
            } catch (error) {
                setError("Failed to load your rentals. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchRentals();
    }, []);

    if (loading) {
        return (
            <p className="mt-10 text-center text-slate-600">
                Loading your rentals...
            </p>
        );
    }

    if (error) {
        return (
            <p role="alert" className="mt-10 text-center text-red-600">
                {error}
            </p>
        );
    }

    const handleReturn = async (rentalId) => {
        setReturningId(rentalId);
        setReturnMessage("");
        setReturnError("");

        try {
            await axiosInstance.put(`/rentals/${rentalId}/return`);

            setReturnMessage(`Rental #${rentalId} returned successfully!`);

            const response = await axiosInstance.get("/rentals");
            setRentals(response.data);
        } catch (error) {
            setReturnError(
                error.response?.data?.message ||
                (typeof error.response?.data === "string"
                    ? error.response.data
                    : "Failed to return vehicle. Please try again.")
            );
        } finally {
            setReturningId(null);
        }
    };

    return (
        <div className="rentals-page min-h-screen bg-slate-100 px-6 py-10">
            <div className="mx-auto max-w-7xl">
                <h1 className="mb-2 text-3xl font-bold text-slate-900">
                    My Rentals
                </h1>

                <p className="mb-8 text-slate-600">
                    View your current and previous vehicle rentals.
                </p>

                {returnMessage && (
                    <p className="mb-5 rounded-xl bg-green-100 p-4 text-green-800">
                        {returnMessage}
                    </p>
                )}

                {returnError && (
                    <p role="alert" className="mb-5 rounded-xl bg-red-100 p-4 text-red-800">
                        {returnError}
                    </p>
                )}

                {rentals.length === 0 ? (
                    <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
                        <p className="text-lg font-semibold text-slate-800">
                            No rentals yet
                        </p>
                        <p className="mt-2 text-slate-500">
                            Your bookings will appear here.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {rentals.map((rental) => (
                            <div
                                key={rental.rid}
                                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-900">
                                            {rental.vehicle?.vname ?? "Vehicle"}
                                        </h2>

                                        <p className="mt-1 text-sm text-slate-500">
                                            {rental.vehicle?.vehicleNumber}
                                        </p>
                                    </div>

                                    <span
                                        className={`rounded-full px-3 py-1 text-xs font-semibold ${rental.endDate
                                            ? "bg-green-100 text-green-700"
                                            : "bg-blue-100 text-blue-700"
                                            }`}
                                    >
                                        {rental.endDate ? "Returned" : "Ongoing"}
                                    </span>
                                </div>

                                <div className="mt-5 space-y-3 border-t border-slate-100 pt-4 text-sm">
                                    <p className="flex justify-between gap-4">
                                        <span className="text-slate-500">
                                            Rental ID
                                        </span>
                                        <span className="font-medium text-slate-800">
                                            #{rental.rid}
                                        </span>
                                    </p>

                                    <p className="flex justify-between gap-4">
                                        <span className="text-slate-500">
                                            Start date
                                        </span>
                                        <span className="font-medium text-slate-800">
                                            {rental.startDate}
                                        </span>
                                    </p>

                                    <p className="flex justify-between gap-4">
                                        <span className="text-slate-500">
                                            End date
                                        </span>
                                        <span className="font-medium text-slate-800">
                                            {rental.endDate ?? "Not returned"}
                                        </span>
                                    </p>
                                </div>

                                <div className="mt-5 border-t border-slate-100 pt-4">
                                    <p className="text-sm text-slate-500">
                                        Total amount
                                    </p>

                                    <p className="mt-1 text-2xl font-bold text-blue-700">
                                        ₹{rental.totalAmount}
                                    </p>
                                </div>
                                {!rental.endDate && (
                                    <button
                                        onClick={() => handleReturn(rental.rid)}
                                        disabled={returningId === rental.rid}
                                        className="mt-5 w-full rounded-xl bg-green-600 py-3 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {returningId === rental.rid
                                            ? "Returning..."
                                            : "Return Vehicle"}
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyRentals;
