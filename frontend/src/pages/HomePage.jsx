import { useEffect, useState } from "react";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [summary, setSummary] = useState(null);
    const [summaryLoading, setSummaryLoading] = useState(false);
    const [searchKey, setSearchKey] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [planFilter, setPlanFilter] = useState("");
    const navigate = useNavigate();



    const fetchMembers = async () => {
        try {
            setLoading(true);
            const res = await axiosInstance.get("/members");
            setMembers(res.data.data);
        } catch (error) {
            console.log(error);
            toast.error("Failed to fetch members");
        } finally {
            setLoading(false);
        }
    };
    const handleSearch = async () => {
        if (!searchKey.trim()) {
            toast.error("Enter something to search");
            return;
        }

        try {
            setLoading(true);
            const res = await axiosInstance.get(`/members/search/${searchKey.trim()}`);
            setMembers(res.data.data);
            toast.success("Search results updated ✅");
        } catch (error) {
            console.log(error);
            toast.error("Search failed");
        } finally {
            setLoading(false);
        }
    };

    const handleFilter = async () => {
        if (!statusFilter && !planFilter) {
            toast.error("Select at least one filter");
            return;
        }

        try {
            setLoading(true);

            const query = new URLSearchParams();
            if (statusFilter) query.append("status", statusFilter);
            if (planFilter) query.append("membershipPlan", planFilter);

            const res = await axiosInstance.get(`/members/filter?${query.toString()}`);
            setMembers(res.data.data);
            toast.success("Filter applied ✅");
        } catch (error) {
            console.log(error);
            toast.error("Filter failed");
        } finally {
            setLoading(false);
        }
    };

    const handleClear = async () => {
        setSearchKey("");
        setStatusFilter("");
        setPlanFilter("");
        fetchMembers();
        toast.success("Reset ✅");
    };

    const getCurrentMonth = () => {
        const now = new Date();
        const yyyy = now.getFullYear();
        const mm = String(now.getMonth() + 1).padStart(2, "0");
        return `${yyyy}-${mm}`;
    };

    const fetchMonthlySummary = async () => {
        try {
            setSummaryLoading(true);
            const month = getCurrentMonth();
            const res = await axiosInstance.get(
                `/payments/summary/monthly?month=${month}`
            );
            setSummary(res.data);
        } catch (error) {
            console.log(error);
            toast.error("Failed to fetch monthly collection");
        } finally {
            setSummaryLoading(false);
        }
    };


    useEffect(() => {
        fetchMembers();
        fetchMonthlySummary();
    }, []);

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold">Fit-Track Dashboard</h1>
            <p className="mt-2 text-base-content/70">
                Manage members, payments and monthly collection.
            </p>
            {/* Dashboard Cards */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="card bg-base-200 shadow-xl border border-base-300 rounded-3xl">
                    <div className="card-body">
                        <p className="text-sm text-base-content/70">Total Members</p>
                        <h2 className="text-3xl font-bold">{members.length}</h2>
                    </div>
                </div>

                <div className="card bg-base-200 shadow-xl border border-base-300 rounded-3xl">
                    <div className="card-body">
                        <p className="text-sm text-base-content/70">Active Members</p>
                        <h2 className="text-3xl font-bold">
                            {members.filter((m) => m.status === "Active").length}
                        </h2>
                    </div>
                </div>

                <div className="card bg-base-200 shadow-xl border border-base-300 rounded-3xl">
                    <div className="card-body">
                        <p className="text-sm text-base-content/70">This Month Collection</p>

                        {summaryLoading ? (
                            <span className="loading loading-spinner loading-md"></span>
                        ) : (
                            <h2 className="text-3xl font-bold">
                                ₹ {summary?.totalCollected ?? 0}
                            </h2>
                        )}

                        <p className="text-xs text-base-content/60 mt-1">
                            Month: {summary?.month || "-"}
                        </p>
                    </div>
                </div>
            </div>


            <div className="mt-6">
                {loading ? (
                    <span className="loading loading-spinner loading-lg"></span>
                ) : (
                    <>
                        {/* Search + Filter */}
                        <div className="mt-6 card bg-base-200 shadow-xl border border-base-300 rounded-3xl">
                            <div className="card-body">
                                <h2 className="text-xl font-bold">Search / Filter Members</h2>

                                <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <input
                                        type="text"
                                        placeholder="Search by ID / Name / Phone / Email"
                                        className="input input-bordered w-full rounded-2xl md:col-span-2"
                                        value={searchKey}
                                        onChange={(e) => setSearchKey(e.target.value)}
                                    />

                                    <select
                                        className="select select-bordered w-full rounded-2xl"
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                    >
                                        <option value="">Filter by Status</option>
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                    </select>

                                    <select
                                        className="select select-bordered w-full rounded-2xl"
                                        value={planFilter}
                                        onChange={(e) => setPlanFilter(e.target.value)}
                                    >
                                        <option value="">Filter by Plan</option>
                                        <option value="Monthly">Monthly</option>
                                        <option value="Quarterly">Quarterly</option>
                                        <option value="Half-Yearly">Half-Yearly</option>
                                        <option value="Yearly">Yearly</option>
                                    </select>
                                </div>

                                <div className="mt-4 flex flex-col sm:flex-row gap-3 justify-end">
                                    <button
                                        className="btn btn-primary btn-outline rounded-2xl"
                                        onClick={handleSearch}
                                    >
                                        Search
                                    </button>

                                    <button
                                        className="btn btn-primary btn-outline rounded-2xl"
                                        onClick={handleFilter}
                                    >
                                        Apply Filter
                                    </button>

                                    <button
                                        className="btn btn-outline btn-secondary rounded-2xl"
                                        onClick={handleClear}
                                    >
                                        Clear
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Members Table */}
                        <div className="overflow-x-auto mt-6">
                            <table className="table table-zebra bg-base-200 rounded-3xl">
                                <thead>
                                    <tr>
                                        <th>Member ID</th>
                                        <th>Name</th>
                                        <th>Plan</th>
                                        <th>Status</th>
                                        <th>Next Due</th>
                                        <th>Action</th>

                                    </tr>
                                </thead>
                                <tbody>
                                    {members.map((m) => (
                                        <tr key={m._id}>
                                            <td>{m.memberId}</td>
                                            <td>{m.name}</td>
                                            <td>{m.membershipPlan}</td>
                                            <td>
                                                <span
                                                    className={`badge ${m.status === "Active" ? "badge-success" : "badge-error"
                                                        }`}
                                                >
                                                    {m.status}
                                                </span>
                                            </td>
                                            <td>{m.nextDueDate || "-"}</td>
                                            <td>
                                                <button
                                                    className="btn btn-primary btn-outline btn-sm rounded-2xl"
                                                    onClick={() => navigate(`/members/details?memberId=${m.memberId}`)}
                                                >
                                                    View
                                                </button>
                                            </td>

                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {members.length === 0 && (
                                <p className="mt-4 text-center text-base-content/70">
                                    No members found.
                                </p>
                            )}
                        </div>
                    </>
                )}

            </div>
        </div>
    );
};

export default HomePage;
