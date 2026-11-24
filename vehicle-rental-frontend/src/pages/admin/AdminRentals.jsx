
import { useEffect, useMemo, useState } from "react";
import axiosInstance from "../../api/axiosInstance";

const AdminRentals = () => {
    const [rentals, setRentals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    useEffect(() => {
        if (!error) return;

        // Errors remain visible until the next action.
    }, [error]);

    useEffect(() => {
        const fetchRentals = async () => {
            try {
                const response = await axiosInstance.get("/rentals");
                setRentals(response.data);
            } catch (err) {
                const data = err.response?.data;
                setError(
                    typeof data === "string"
                        ? data
                        : data?.message || "Failed to load rentals."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchRentals();
    }, []);

    const filteredRentals = useMemo(() => {
        const query = search.trim().toLowerCase();

        return rentals.filter((rental) => {
            const vehicle = rental.vehicle;

            const matchesSearch = [
                rental.rid,
                rental.customer?.cname,
                rental.customer?.email,
                rental.customer?.mobileNo,
                vehicle?.vname,
                vehicle?.vehicleNumber,
                vehicle?.company,
            ].some((value) =>
                String(value ?? "").toLowerCase().includes(query)
            );

            const status = rental.endDate ? "RETURNED" : "ONGOING";

            const matchesStatus =
                statusFilter === "ALL" || statusFilter === status;

            return matchesSearch && matchesStatus;
        });
    }, [rentals, search, statusFilter]);

    if (loading) {
        return (
            <p className="mt-10 text-center text-slate-600">
                Loading rentals...
            </p>
        );
    }

    return (
        <div>
            <p className="text-sm font-semibold text-blue-600">
                RENTAL MANAGEMENT
            </p>

            <h1 className="mt-2 text-3xl font-bold text-slate-900">
                Manage Rentals
            </h1>

            <p className="mt-2 text-slate-600">
                View ongoing and completed vehicle rentals.
            </p>

            {error && (
                <p
                    role="alert"
                    className="mt-6 rounded-xl bg-red-50 p-4 text-red-700"
                >
                    {error}
                </p>
            )}

            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-sm text-slate-500">Total Rentals</p>
                    <p className="mt-2 text-3xl font-bold text-slate-900">
                        {rentals.length}
                    </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-sm text-slate-500">Ongoing Rentals</p>
                    <p className="mt-2 text-3xl font-bold text-blue-700">
                        {rentals.filter((r) => !r.endDate).length}
                    </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-sm text-slate-500">Returned Rentals</p>
                    <p className="mt-2 text-3xl font-bold text-green-700">
                        {rentals.filter((r) => r.endDate).length}
                    </p>
                </div>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <h2 className="text-lg font-semibold text-slate-900">
                        Rental Records ({filteredRentals.length})
                    </h2>

                    <div className="flex flex-col gap-3 sm:flex-row">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                        >
                            <option value="ALL">All Rentals</option>
                            <option value="ONGOING">Ongoing</option>
                            <option value="RETURNED">Returned</option>
                        </select>

                        <input
                            type="search"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search vehicle or rental ID..."
                            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 sm:max-w-sm"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px] text-left text-sm">
                        <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
                            <tr>
                                <th className="px-4 py-3 font-semibold">Sr. No.</th>
                                <th className="px-4 py-3 font-semibold">Vehicle</th>
                                <th className="px-4 py-3 font-semibold">Customer</th>
                                <th className="px-4 py-3 font-semibold">Start Date</th>
                                <th className="px-4 py-3 font-semibold">Return Date</th>
                                <th className="px-4 py-3 font-semibold">Total Amount</th>
                                <th className="px-4 py-3 font-semibold">Status</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                            {filteredRentals.map((rental, index) => (
                                
                                <tr
                                    key={rental.rid}
                                    className="hover:bg-slate-50"
                                >
                                    <td className="px-4 py-4 text-slate-500">
                                        {index + 1}
                                    </td>

                                    <td className="px-4 py-4">
                                        <p className="font-semibold text-slate-900">
                                            {rental.vehicle?.vname ?? "Unknown vehicle"}
                                        </p>
                                        <p className="mt-1 text-slate-500">
                                            {rental.vehicle?.vehicleNumber ?? "—"}
                                        </p>
                                    </td>

                                    <td className="px-4 py-4">
                                        <p className="font-semibold text-slate-900">
                                            {rental.customer?.cname ?? "Unknown customer"}
                                        </p>
                                        <p className="mt-1 text-slate-500">
                                            {rental.customer?.email ?? "—"}
                                        </p>
                                        <p className="mt-1 text-slate-500">
                                            {rental.customer?.mobileNo ?? "—"}
                                        </p>
                                    </td>

                                    <td className="px-4 py-4 text-slate-700">
                                        {rental.startDate}
                                    </td>

                                    <td className="px-4 py-4 text-slate-700">
                                        {rental.endDate ?? "—"}
                                    </td>

                                    <td className="px-4 py-4 font-medium text-slate-900">
                                        {rental.endDate
                                            ? `₹${Number(rental.totalAmount).toLocaleString("en-IN")}`
                                            : "Pending"}
                                    </td>

                                    <td className="px-4 py-4">
                                        <span
                                            className={`rounded-full px-3 py-1 text-xs font-semibold ${rental.endDate
                                                    ? "bg-green-50 text-green-700"
                                                    : "bg-blue-50 text-blue-700"
                                                }`}
                                        >
                                            {rental.endDate ? "Returned" : "Ongoing"}
                                        </span>
                                    </td>
                                </tr>
                            ))}

                            {filteredRentals.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="px-4 py-10 text-center text-slate-500"
                                    >
                                        No rentals found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminRentals;
