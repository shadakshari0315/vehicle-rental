import { useEffect, useMemo, useState } from "react";
import axiosInstance from "../../api/axiosInstance";

const emptyForm = {
    cname: "",
    email: "",
    mobileNo: "",
};

const AdminCustomers = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [actionId, setActionId] = useState(null);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [search, setSearch] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [statusFilter, setStatusFilter] = useState("ALL");

    const getErrorMessage = (err, fallback) => {
        const data = err.response?.data;

        if (typeof data === "string") return data;
        if (data?.message) return data.message;

        return fallback;
    };

    const fetchCustomers = async () => {
        try {
            setError("");
            const response = await axiosInstance.get("/customers");
            setCustomers(response.data);
        } catch (err) {
            setError(
                getErrorMessage(err, "Failed to load customers.")
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    const filteredCustomers = useMemo(() => {
        const query = search.trim().toLowerCase();

        return customers.filter((customer) => {
            const matchesSearch = [
                customer.cname,
                customer.email,
                customer.mobileNo,
            ].some((value) =>
                String(value ?? "").toLowerCase().includes(query)
            );

            const matchesStatus =
                statusFilter === "ALL" ||
                (statusFilter === "ACTIVE" && customer.active) ||
                (statusFilter === "INACTIVE" && !customer.active);

            return matchesSearch && matchesStatus;
        });
    }, [customers, search, statusFilter]);

    const openEditForm = (customer) => {
        setEditingCustomer(customer);
        setForm({
            cname: customer.cname ?? "",
            email: customer.email ?? "",
            mobileNo: customer.mobileNo ?? "",
        });
        setError("");
        setMessage("");
        setShowForm(true);
    };

    const closeForm = () => {
        setShowForm(false);
        setEditingCustomer(null);
        setForm(emptyForm);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");

        const payload = {
            cname: form.cname.trim(),
            email: form.email.trim(),
            mobileNo: form.mobileNo.trim(),
        };

        if (!payload.cname || !payload.email || !payload.mobileNo) {
            setError("All fields are required.");
            return;
        }

        if (payload.cname.length < 2 || payload.cname.length > 50) {
            setError("Name must contain between 2 and 50 characters.");
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
            setError("Please enter a valid email address.");
            return;
        }

        if (!/^[6-9][0-9]{9}$/.test(payload.mobileNo)) {
            setError("Enter a valid 10-digit Indian mobile number.");
            return;
        }

        setSaving(true);

        try {
            await axiosInstance.patch(
                `/customers/${editingCustomer.cid}`,
                payload
            );

            setMessage("Customer updated successfully.");
            closeForm();
            await fetchCustomers();
        } catch (err) {
            setError(
                getErrorMessage(err, "Failed to update customer.")
            );
        } finally {
            setSaving(false);
        }
    };

    const handleDeactivate = async (customer) => {
        const confirmed = window.confirm(
            `Are you sure you want to deactivate ${customer.cname}?`
        );

        if (!confirmed) return;

        setError("");
        setMessage("");
        setActionId(customer.cid);

        try {
            await axiosInstance.delete(`/customers/${customer.cid}`);
            setMessage(
                `${customer.cname} has been deactivated successfully.`
            );
            await fetchCustomers();
        } catch (err) {
            setError(
                getErrorMessage(
                    err,
                    "Failed to deactivate customer."
                )
            );
        } finally {
            setActionId(null);
        }
    };

    useEffect(() => {
        if (!message) return;

        const timer = setTimeout(() => {
            setMessage("");
        }, 3000);

        return () => clearTimeout(timer);
    }, [message]);

    if (loading) {
        return (
            <p className="mt-10 text-center text-slate-600">
                Loading customers...
            </p>
        );
    }

    return (
        <div>
            <p className="text-sm font-semibold text-blue-600">
                CUSTOMER MANAGEMENT
            </p>

            <h1 className="mt-2 text-3xl font-bold text-slate-900">
                Manage Customers
            </h1>

            <p className="mt-2 text-slate-600">
                View customer details, update profiles, and manage accounts.
            </p>

            {message && (
                <p
                    role="status"
                    className="mt-6 rounded-xl bg-green-50 p-4 text-green-800"
                >
                    {message}
                </p>
            )}

            {error && (
                <p
                    role="alert"
                    className="mt-6 rounded-xl bg-red-50 p-4 text-red-700"
                >
                    {error}
                </p>
            )}

            <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <h2 className="text-lg font-semibold text-slate-900">
                        Customers ({filteredCustomers.length})
                    </h2>

                    <input
                        type="search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search name, email, or mobile..."
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 sm:max-w-sm"
                    />

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                    >
                        <option value="ALL">All</option>
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                    </select>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[750px] text-left text-sm">
                        <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
                            <tr>
                                <th className="px-4 py-3 font-semibold">Sr. No.</th>
                                <th className="px-4 py-3 font-semibold">Customer</th>
                                <th className="px-4 py-3 font-semibold">Mobile</th>
                                <th className="px-4 py-3 font-semibold">Status</th>
                                <th className="px-4 py-3 font-semibold">Actions</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                            {filteredCustomers.map((customer, index) => (
                                <tr
                                    key={customer.cid}
                                    className="hover:bg-slate-50"
                                >
                                    <td className="px-4 py-4 text-slate-500">
                                        {index + 1}
                                    </td>

                                    <td className="px-4 py-4">
                                        <p className="font-semibold text-slate-900">
                                            {customer.cname}
                                        </p>
                                        <p className="mt-1 text-slate-500">
                                            {customer.email}
                                        </p>
                                    </td>

                                    <td className="px-4 py-4 text-slate-700">
                                        {customer.mobileNo}
                                    </td>

                                    <td className="px-4 py-4">
                                        <span
                                            className={`rounded-full px-3 py-1 text-xs font-semibold ${customer.active
                                                ? "bg-green-50 text-green-700"
                                                : "bg-red-50 text-red-700"
                                                }`}
                                        >
                                            {customer.active ? "Active" : "Inactive"}
                                        </span>
                                    </td>

                                    <td className="px-4 py-4">
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => openEditForm(customer)}
                                                disabled={!customer.active}
                                                className="font-semibold text-blue-700 hover:text-blue-900 disabled:cursor-not-allowed disabled:text-slate-400"
                                            >
                                                Edit
                                            </button>

                                            {customer.active && (
                                                <button
                                                    onClick={() => handleDeactivate(customer)}
                                                    disabled={actionId === customer.cid}
                                                    className="font-semibold text-red-600 hover:text-red-800 disabled:opacity-50"
                                                >
                                                    {actionId === customer.cid
                                                        ? "Processing..."
                                                        : "Deactivate"}
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            {filteredCustomers.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={4}
                                        className="px-4 py-10 text-center text-slate-500"
                                    >
                                        No customers found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/50 p-4">
                    <form
                        onSubmit={handleSubmit}
                        className="my-6 w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl sm:p-8"
                    >
                        <h2 className="text-2xl font-bold text-slate-900">
                            Edit Customer
                        </h2>

                        <div className="mt-6 space-y-4">
                            <div>
                                <label htmlFor="cname" className="mb-1 block text-sm font-medium text-slate-700">
                                    Full Name
                                </label>
                                <input
                                    id="cname"
                                    name="cname"
                                    value={form.cname}
                                    onChange={handleChange}
                                    minLength={2}
                                    maxLength={50}
                                    required
                                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
                                    Email
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label htmlFor="mobileNo" className="mb-1 block text-sm font-medium text-slate-700">
                                    Mobile Number
                                </label>
                                <input
                                    id="mobileNo"
                                    name="mobileNo"
                                    type="tel"
                                    value={form.mobileNo}
                                    onChange={handleChange}
                                    pattern="[6-9][0-9]{9}"
                                    maxLength={10}
                                    required
                                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                                />
                            </div>
                        </div>

                        <div className="mt-8 flex gap-3">
                            <button
                                type="button"
                                onClick={closeForm}
                                disabled={saving}
                                className="flex-1 rounded-xl border border-slate-300 py-3 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={saving}
                                className="flex-1 rounded-xl bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                            >
                                {saving ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default AdminCustomers;