import { useEffect, useMemo, useState } from "react";
import axiosInstance from "../../api/axiosInstance";

const validateField = (name, value) => {
    const trimmedValue = value.trim();

    switch (name) {
        case "vname":
            if (!trimmedValue) return "Vehicle name cannot be blank.";
            if (trimmedValue.length < 2)
                return "Vehicle name must contain at least 2 characters.";
            if (trimmedValue.length > 50)
                return "Vehicle name cannot exceed 50 characters.";
            break;

        case "company":
            if (!trimmedValue) return "Company cannot be blank.";
            if (trimmedValue.length < 2)
                return "Company name must contain at least 2 characters.";
            if (trimmedValue.length > 50)
                return "Company name cannot exceed 50 characters.";
            break;

        case "vehicleNumber":
            if (!trimmedValue) return "Vehicle number cannot be blank.";
            if (!/^[A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{4}$/.test(trimmedValue))
                return "Use the format GJ01AB1234.";
            break;

        case "rentPerDay":
            if (!trimmedValue) return "Rent per day is required.";
            if (!Number.isFinite(Number(value)) || Number(value) <= 0)
                return "Rent per day must be greater than 0.";
            break;

        default:
            break;
    }

    return "";
};

const emptyForm = {
    vname: "",
    company: "",
    vehicleNumber: "",
    rentPerDay: "",
};

const AdminVehicles = () => {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [fieldErrors, setFieldErrors] = useState({});
    const [message, setMessage] = useState("");
    const [search, setSearch] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [editingVehicle, setEditingVehicle] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [registrationError, setRegistrationError] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    const fetchVehicles = async () => {
        try {
            setError("");
            const response = await axiosInstance.get("/vehicles");
            setVehicles(response.data);
        } catch (err) {
            setError("Failed to load vehicles. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVehicles();
    }, []);

    const filteredVehicles = useMemo(() => {
        const query = search.trim().toLowerCase();

        return vehicles.filter((vehicle) => {
            const matchesSearch = [
                vehicle.vname,
                vehicle.company,
                vehicle.vehicleNumber,
            ].some((value) =>
                value?.toLowerCase().includes(query)
            );

            const matchesStatus =
                statusFilter === "ALL" ||
                (statusFilter === "ACTIVE" && vehicle.active) ||
                (statusFilter === "INACTIVE" && !vehicle.active);

            return matchesSearch && matchesStatus;
        });
    }, [vehicles, search, statusFilter]);

    const openAddForm = () => {
        setEditingVehicle(null);
        setForm(emptyForm);
        setError("");
        setMessage("");
        setShowForm(true);
        setFieldErrors({});
    };

    const openEditForm = (vehicle) => {
        setEditingVehicle(vehicle);
        setForm({
            vname: vehicle.vname,
            company: vehicle.company,
            vehicleNumber: vehicle.vehicleNumber,
            rentPerDay: String(vehicle.rentPerDay),
        });
        setError("");
        setMessage("");
        setShowForm(true);
        setFieldErrors({});
    };

    const closeForm = () => {
        setShowForm(false);
        setEditingVehicle(null);
        setForm(emptyForm);
        setFieldErrors({});
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));

        setFieldErrors((previous) => ({
            ...previous,
            [name]: validateField(name, value),
        }));

        if (name === "vehicleNumber") {
            setRegistrationError("");
        }
    };

    const getErrorMessage = (err, fallback) => {
        const data = err.response?.data;

        if (typeof data === "string") return data;
        if (data?.message) return data.message;

        return fallback;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const fieldsToValidate = editingVehicle
            ? ["vname", "company", "rentPerDay"]
            : ["vname", "company", "vehicleNumber", "rentPerDay"];

        const errors = {};

        fieldsToValidate.forEach((name) => {
            const error = validateField(name, form[name] ?? "");
            if (error) errors[name] = error;
        });

        setFieldErrors(errors);

        if (Object.values(errors).some(Boolean)) {
            return;
        }

        setError("");
        setMessage("");
        setSaving(true);

        try {
            if (editingVehicle) {
                // Update only the editable fields.
                await axiosInstance.patch(
                    `/vehicles/${editingVehicle.vid}`,
                    {
                        vname: form.vname.trim(),
                        company: form.company.trim(),
                        rentPerDay: Number(form.rentPerDay),
                    }
                );

                setMessage("Vehicle updated successfully.");
            } else {
                await axiosInstance.post("/vehicles", {
                    vname: form.vname.trim(),
                    company: form.company.trim(),
                    vehicleNumber: form.vehicleNumber
                        .trim()
                        .toUpperCase(),
                    rentPerDay: Number(form.rentPerDay),
                });

                setMessage("Vehicle added successfully.");
            }

            closeForm();
            await fetchVehicles();
        } catch (err) {
            if (
                err.response?.status === 409 &&
                !editingVehicle
            ) {
                setRegistrationError(
                    "This registration number is already registered."
                );
            } else {
                setError(
                    getErrorMessage(
                        err,
                        "Failed to save vehicle. Please check your input."
                    )
                );
            }
        } finally {
            setSaving(false);
        }
    };

    const handleDeactivate = async (vehicle) => {
        const confirmed = window.confirm(
            `Are you sure you want to deactivate ${vehicle.vname} (${vehicle.vehicleNumber})?`
        );

        if (!confirmed) return;

        setError("");
        setMessage("");

        try {
            await axiosInstance.delete(`/vehicles/${vehicle.vid}`);
            setMessage("Vehicle deactivated successfully.");
            await fetchVehicles();
        } catch (err) {
            setError(
                getErrorMessage(
                    err,
                    "Failed to deactivate vehicle."
                )
            );
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
                Loading vehicles...
            </p>
        );
    }

    return (
        <div>
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <p className="text-sm font-semibold text-blue-600">
                        INVENTORY
                    </p>
                    <h1 className="mt-2 text-3xl font-bold text-slate-900">
                        Manage Vehicles
                    </h1>
                    <p className="mt-2 text-slate-600">
                        Add, update, and manage your vehicle fleet.
                    </p>
                </div>

                <button
                    onClick={openAddForm}
                    className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
                >
                    + Add Vehicle
                </button>
            </div>

            {message && (
                <p className="mt-6 rounded-xl bg-green-50 p-4 text-green-800">
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
                        Vehicle Inventory ({filteredVehicles.length})
                    </h2>

                    <input
                        type="search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search vehicles..."
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:max-w-sm"
                    />

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                    >
                        <option value="ALL">All Vehicles</option>
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                    </select>

                </div>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[850px] text-left text-sm">
                        <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
                            <tr>
                                <th className="px-4 py-3 font-semibold">Sr. No.</th>
                                <th className="px-4 py-3 font-semibold">Vehicle</th>
                                <th className="px-4 py-3 font-semibold">Registration</th>
                                <th className="px-4 py-3 font-semibold">Rent / Day</th>
                                <th className="px-4 py-3 font-semibold">Availability</th>
                                <th className="px-4 py-3 font-semibold">Status</th>
                                <th className="px-4 py-3 font-semibold">Actions</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                            {filteredVehicles.map((vehicle, index) => (
                                <tr
                                    key={vehicle.vid}
                                    className="hover:bg-slate-50"
                                >
                                    <td className="px-4 py-4 text-slate-500">
                                        {index + 1}
                                    </td>

                                    <td className="px-4 py-4">
                                        <p className="font-semibold text-slate-900">
                                            {vehicle.vname}
                                        </p>
                                        <p className="mt-1 text-slate-500">
                                            {vehicle.company}
                                        </p>
                                    </td>

                                    <td className="px-4 py-4 text-slate-700">
                                        {vehicle.vehicleNumber}
                                    </td>

                                    <td className="px-4 py-4 font-medium text-slate-900">
                                        ₹{Number(vehicle.rentPerDay).toLocaleString("en-IN")}
                                    </td>

                                    <td className="px-4 py-4">
                                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${vehicle.active && vehicle.available
                                            ? "bg-green-50 text-green-700"
                                            : "bg-slate-100 text-slate-600"
                                            }`}>
                                            {vehicle.available ? "Available" : "Rented"}
                                        </span>
                                    </td>

                                    <td className="px-4 py-4">
                                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${vehicle.active
                                            ? "bg-blue-50 text-blue-700"
                                            : "bg-red-50 text-red-700"
                                            }`}>
                                            {vehicle.active ? "Active" : "Inactive"}
                                        </span>
                                    </td>

                                    <td className="px-4 py-4">
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => openEditForm(vehicle)}
                                                disabled={!vehicle.active}
                                                className="font-semibold text-blue-700 hover:text-blue-900 disabled:cursor-not-allowed disabled:text-slate-400"
                                            >
                                                Edit
                                            </button>

                                            {vehicle.active && (
                                                <button
                                                    onClick={() => handleDeactivate(vehicle)}
                                                    disabled={!vehicle.available}
                                                    className="font-semibold text-red-600 hover:text-red-800 disabled:cursor-not-allowed disabled:text-slate-400"
                                                >
                                                    Deactivate
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            {filteredVehicles.length === 0 && (
                                <tr>
                                    <td
                                        colSpan="6"
                                        className="px-4 py-10 text-center text-slate-500"
                                    >
                                        No vehicles found.
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
                            {editingVehicle ? "Edit Vehicle" : "Add Vehicle"}
                        </h2>

                        <p className="mt-2 text-sm text-slate-500">
                            {editingVehicle
                                ? "Update the vehicle details below."
                                : "Enter the details for the new vehicle."}
                        </p>

                        <div className="mt-6 space-y-4">
                            <div>
                                <label htmlFor="vname" className="mb-1 block text-sm font-medium text-slate-700">
                                    Vehicle Name
                                </label>
                                <input
                                    id="vname"
                                    name="vname"
                                    value={form.vname}
                                    onChange={handleChange}
                                    minLength={2}
                                    maxLength={50}
                                    required
                                    className={`w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 ${fieldErrors.vname
                                        ? "border-red-500 focus:border-red-500"
                                        : "border-slate-300 focus:border-blue-500"
                                        }`}
                                />
                                {fieldErrors.vname && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {fieldErrors.vname}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="company" className="mb-1 block text-sm font-medium text-slate-700">
                                    Company
                                </label>
                                <input
                                    id="company"
                                    name="company"
                                    value={form.company}
                                    onChange={handleChange}
                                    minLength={2}
                                    maxLength={50}
                                    required
                                    className={`w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 ${fieldErrors.company
                                        ? "border-red-500 focus:border-red-500"
                                        : "border-slate-300 focus:border-blue-500"
                                        }`}
                                />
                                {fieldErrors.company && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {fieldErrors.company}
                                    </p>
                                )}
                            </div>

                            {!editingVehicle && (
                                <div>
                                    <label htmlFor="vehicleNumber" className="mb-1 block text-sm font-medium text-slate-700">
                                        Registration Number
                                    </label>
                                    <input
                                        id="vehicleNumber"
                                        name="vehicleNumber"
                                        value={form.vehicleNumber}
                                        onChange={handleChange}
                                        placeholder="GJ01AB1234"
                                        pattern="[A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{4}"
                                        title="Format: GJ01AB1234"
                                        required
                                        className={`w-full rounded-xl border px-4 py-3 uppercase outline-none ${fieldErrors.vehicleNumber || registrationError
                                            ? "border-red-500 focus:border-red-500"
                                            : "border-slate-300 focus:border-blue-500"
                                            }`}
                                    />
                                    {registrationError && (
                                        <p className="mt-1 text-sm text-red-600" role="alert">
                                            {registrationError}
                                        </p>
                                    )}
                                    {fieldErrors.vehicleNumber && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {fieldErrors.vehicleNumber}
                                        </p>
                                    )}
                                </div>
                            )}

                            <div>
                                <label htmlFor="rentPerDay" className="mb-1 block text-sm font-medium text-slate-700">
                                    Rent per Day (₹)
                                </label>
                                <input
                                    id="rentPerDay"
                                    name="rentPerDay"
                                    type="number"
                                    min="0.01"
                                    step="0.01"
                                    value={form.rentPerDay}
                                    onChange={handleChange}
                                    required
                                    className={`w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 ${fieldErrors.rentPerDay
                                        ? "border-red-500 focus:border-red-500"
                                        : "border-slate-300 focus:border-blue-500"
                                        }`}
                                />
                                {fieldErrors.rentPerDay && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {fieldErrors.rentPerDay}
                                    </p>
                                )}
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
                                {saving
                                    ? "Saving..."
                                    : editingVehicle
                                        ? "Save Changes"
                                        : "Add Vehicle"}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default AdminVehicles;