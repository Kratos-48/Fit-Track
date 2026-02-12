import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";

const PaymentsPage = () => {
  // ✅ Fixed plan pricing
  const PLAN_AMOUNTS = {
    Monthly: 1200,
    Quarterly: 3000,
    "Half-Yearly": 6900,
    Yearly: 10500,
  };

  // Add payment form
  const [formData, setFormData] = useState({
    memberId: "",
    amount: "",
    paymentDate: "",
    paymentMethod: "UPI",
    note: "",
  });

  // ✅ Payment Type (membership vs advance/extra)
  const [paymentType, setPaymentType] = useState("MEMBERSHIP"); // MEMBERSHIP | EXTRA

  // ✅ Plan base (only for MEMBERSHIP)
  const [paymentPlanBase, setPaymentPlanBase] = useState("Monthly");

  const [loading, setLoading] = useState(false);

  // Monthly summary
  const [selectedMonth, setSelectedMonth] = useState("");
  const [monthlySummary, setMonthlySummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  // Payments list
  const [payments, setPayments] = useState([]);
  const [filterMemberId, setFilterMemberId] = useState("");
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // ✅ Auto set amount based on plan (only for membership)
  useEffect(() => {
    if (paymentType === "MEMBERSHIP") {
      setFormData((prev) => ({
        ...prev,
        amount: PLAN_AMOUNTS[paymentPlanBase] || "",
      }));
    }
  }, [paymentPlanBase, paymentType]);

  // ✅ If user switches to EXTRA, unlock amount (don’t auto change)
  useEffect(() => {
    if (paymentType === "EXTRA") {
      // keep existing amount as-is (manual)
      return;
    }
    if (paymentType === "MEMBERSHIP") {
      setFormData((prev) => ({
        ...prev,
        amount: PLAN_AMOUNTS[paymentPlanBase] || "",
      }));
    }
  }, [paymentType]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ Get current month in YYYY-MM
  const getCurrentMonth = () => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    return `${yyyy}-${mm}`;
  };

  const fetchMonthlySummary = async (monthValue) => {
    try {
      setSummaryLoading(true);
      const res = await axiosInstance.get(
        `/payments/summary/monthly?month=${monthValue}`
      );
      setMonthlySummary(res.data);
    } catch (error) {
      console.log(error);
      toast.error("Failed to fetch monthly summary");
    } finally {
      setSummaryLoading(false);
    }
  };

  const fetchAllPayments = async () => {
    try {
      setPaymentsLoading(true);
      const res = await axiosInstance.get("/payments");
      setPayments(res.data.data);
    } catch (error) {
      console.log(error);
      toast.error("Failed to fetch payments");
    } finally {
      setPaymentsLoading(false);
    }
  };

  const fetchPaymentsByMemberId = async (memberId) => {
    try {
      setPaymentsLoading(true);
      const res = await axiosInstance.get(`/payments/member/memberid/${memberId}`);
      setPayments(res.data.data);
    } catch (error) {
      console.log(error);
      toast.error("Failed to fetch member payments");
    } finally {
      setPaymentsLoading(false);
    }
  };

  const handleDeletePayment = async () => {
    if (!selectedPayment?._id) return;

    try {
      setDeleting(true);
      await axiosInstance.delete(`/payments/id/${selectedPayment._id}`);
      toast.success("Payment deleted ✅");

      setOpenDeleteModal(false);
      setSelectedPayment(null);

      // refresh
      fetchAllPayments();
      fetchMonthlySummary(selectedMonth);
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message || "Failed to delete payment");
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    const cm = getCurrentMonth();
    setSelectedMonth(cm);
    fetchMonthlySummary(cm);
    fetchAllPayments();
  }, []);

  const handleAddPayment = async (e) => {
    e.preventDefault();

    if (!formData.memberId || !formData.amount || !formData.paymentDate) {
      toast.error("Please fill Member ID, Amount and Payment Date");
      return;
    }

    try {
      setLoading(true);

      const memberId = formData.memberId.trim();

      // ✅ Membership payment: update member plan first (so due date updates)
      // ✅ Extra payment: do NOT touch plan/due date
      if (paymentType === "MEMBERSHIP") {
        await axiosInstance.put(`/members/memberid/${memberId}`, {
          membershipPlan: paymentPlanBase,
        });
      }

      await axiosInstance.post("/payments", {
        memberId,
        amount: Number(formData.amount),
        paymentDate: formData.paymentDate,
        paymentMethod: formData.paymentMethod,
        note:
          paymentType === "EXTRA"
            ? `[EXTRA] ${formData.note || ""}`.trim()
            : formData.note,
      });

      toast.success(
        paymentType === "MEMBERSHIP"
          ? "Membership payment added ✅ (Due date updated)"
          : "Extra/Advance payment added ✅"
      );

      // reset form (keep method)
      setFormData({
        memberId: "",
        amount:
          paymentType === "MEMBERSHIP"
            ? PLAN_AMOUNTS[paymentPlanBase] || ""
            : "",
        paymentDate: "",
        paymentMethod: formData.paymentMethod,
        note: "",
      });

      // refresh data
      fetchAllPayments();
      fetchMonthlySummary(selectedMonth);
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message || "Failed to add payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 flex justify-center">
      <div className="w-full max-w-6xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Payments</h1>
          <p className="text-base-content/70 mt-1">
            Add member payments and view monthly collection.
          </p>
        </div>

        {/* Monthly Summary */}
        <div className="card bg-base-200 shadow-xl border border-base-300 rounded-3xl mb-6">
          <div className="card-body">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">Monthly Collection</h2>
                <p className="text-base-content/70 text-sm">
                  Shows total amount collected in the selected month.
                </p>
              </div>

              <input
                type="month"
                className="input input-bordered rounded-2xl"
                value={selectedMonth}
                onChange={(e) => {
                  const m = e.target.value;
                  setSelectedMonth(m);
                  fetchMonthlySummary(m);
                }}
              />
            </div>

            <div className="mt-4">
              {summaryLoading ? (
                <span className="loading loading-spinner loading-md"></span>
              ) : monthlySummary ? (
                <div className="stats stats-vertical md:stats-horizontal shadow bg-base-100 rounded-2xl border border-base-300">
                  <div className="stat">
                    <div className="stat-title">Month</div>
                    <div className="stat-value text-lg">{monthlySummary.month}</div>
                  </div>
                  <div className="stat">
                    <div className="stat-title">Total Collected</div>
                    <div className="stat-value text-2xl">
                      ₹ {monthlySummary.totalCollected}
                    </div>
                  </div>
                  <div className="stat">
                    <div className="stat-title">Payments</div>
                    <div className="stat-value text-2xl">
                      {monthlySummary.totalPayments}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-base-content/70">No data</p>
              )}
            </div>
          </div>
        </div>

        {/* Add Payment */}
        <div className="card bg-base-200 shadow-xl border border-base-300 rounded-3xl mb-6">
          <div className="card-body">
            <h2 className="text-xl font-bold">Add Payment</h2>

            <form
              onSubmit={handleAddPayment}
              className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {/* Payment Type */}
              <select
                className="select select-bordered w-full rounded-2xl"
                value={paymentType}
                onChange={(e) => setPaymentType(e.target.value)}
              >
                <option value="MEMBERSHIP">
                  Membership Payment (Updates Due Date)
                </option>
                <option value="EXTRA">
                  Advance / Extra Payment (No Due Date Change)
                </option>
              </select>

              {/* Plan base */}
              <select
                className={`select select-bordered w-full rounded-2xl ${
                  paymentType !== "MEMBERSHIP" ? "opacity-60" : ""
                }`}
                value={paymentPlanBase}
                onChange={(e) => setPaymentPlanBase(e.target.value)}
                disabled={paymentType !== "MEMBERSHIP"}
              >
                <option value="Monthly">Monthly (₹1200)</option>
                <option value="Quarterly">Quarterly (₹3000)</option>
                <option value="Half-Yearly">Half-Yearly (₹6900)</option>
                <option value="Yearly">Yearly (₹10500)</option>
              </select>

              <input
                type="text"
                name="memberId"
                placeholder="Member ID (FT001)"
                className="input input-bordered w-full rounded-2xl"
                value={formData.memberId}
                onChange={handleChange}
              />

              {/* Amount */}
              <input
                type="number"
                name="amount"
                placeholder="Amount (₹)"
                className="input input-bordered w-full rounded-2xl"
                value={formData.amount}
                onChange={handleChange}
                disabled={paymentType === "MEMBERSHIP"} // ✅ lock for membership
              />

              <input
                type="date"
                name="paymentDate"
                className="input input-bordered w-full rounded-2xl"
                value={formData.paymentDate}
                onChange={handleChange}
              />

              <select
                name="paymentMethod"
                className="select select-bordered w-full rounded-2xl"
                value={formData.paymentMethod}
                onChange={handleChange}
              >
                <option value="UPI">UPI</option>
                <option value="Cash">Cash</option>
                <option value="Card">Card</option>
                <option value="NetBanking">NetBanking</option>
              </select>

              <input
                type="text"
                name="note"
                placeholder={
                  paymentType === "EXTRA"
                    ? "Note (e.g., advance fees / extra payment)"
                    : "Note (optional)"
                }
                className="input input-bordered w-full rounded-2xl md:col-span-2"
                value={formData.note}
                onChange={handleChange}
              />

              <div className="md:col-span-2 flex justify-end">
                <button
                  type="submit"
                  className="btn btn-primary btn-outline rounded-2xl"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="loading loading-spinner"></span>
                      Adding...
                    </span>
                  ) : (
                    "Add Payment"
                  )}
                </button>
              </div>
            </form>

            <p className="text-xs text-base-content/60 mt-3">
              Membership payments auto-set fixed amounts and update due date. Extra
              payments do not change due date.
            </p>
          </div>
        </div>

        {/* Payments List */}
        <div className="card bg-base-200 shadow-xl border border-base-300 rounded-3xl">
          <div className="card-body">
            <h2 className="text-xl font-bold">Payment History</h2>

            <div className="mt-4 flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="Filter by Member ID (FT001)"
                className="input input-bordered w-full rounded-2xl"
                value={filterMemberId}
                onChange={(e) => setFilterMemberId(e.target.value)}
              />

              <button
                className="btn btn-primary btn-outline rounded-2xl"
                onClick={() => {
                  if (!filterMemberId.trim()) {
                    toast.error("Enter Member ID to filter");
                    return;
                  }
                  fetchPaymentsByMemberId(filterMemberId.trim());
                }}
              >
                Search
              </button>

              <button
                className="btn btn-outline btn-secondary rounded-2xl"
                onClick={() => {
                  setFilterMemberId("");
                  fetchAllPayments();
                }}
              >
                Clear
              </button>
            </div>

            {paymentsLoading ? (
              <span className="loading loading-spinner loading-lg"></span>
            ) : (
              <div className="overflow-x-auto mt-4">
                <table className="table table-zebra bg-base-100 rounded-2xl">
                  <thead>
                    <tr>
                      <th>Member ID</th>
                      <th>Amount</th>
                      <th>Date</th>
                      <th>Method</th>
                      <th>Note</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((p) => (
                      <tr key={p._id}>
                        <td>{p.memberId}</td>
                        <td>₹ {p.amount}</td>
                        <td>{p.paymentDate}</td>
                        <td>{p.paymentMethod}</td>
                        <td>{p.note || "-"}</td>
                        <td>
                          <button
                            className="btn btn-outline btn-secondary btn-sm rounded-2xl"
                            onClick={() => {
                              setSelectedPayment(p);
                              setOpenDeleteModal(true);
                            }}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {payments.length === 0 && (
                  <p className="mt-4 text-center text-base-content/70">
                    No payments found.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Delete Payment Modal */}
        {openDeleteModal && (
          <div className="modal modal-open">
            <div className="modal-box rounded-3xl">
              <h3 className="font-bold text-lg text-error">Confirm Delete</h3>

              <p className="py-4 text-base-content/70">
                Are you sure you want to delete this payment?
              </p>

              <div className="bg-base-200 p-4 rounded-2xl border border-base-300">
                <p className="text-sm text-base-content/70">
                  <span className="font-semibold">Member ID:</span>{" "}
                  {selectedPayment?.memberId}
                </p>
                <p className="text-sm text-base-content/70">
                  <span className="font-semibold">Amount:</span> ₹{" "}
                  {selectedPayment?.amount}
                </p>
                <p className="text-sm text-base-content/70">
                  <span className="font-semibold">Date:</span>{" "}
                  {selectedPayment?.paymentDate}
                </p>
              </div>

              <div className="modal-action">
                <button
                  className="btn btn-outline btn-neutral rounded-2xl"
                  onClick={() => {
                    setOpenDeleteModal(false);
                    setSelectedPayment(null);
                  }}
                  disabled={deleting}
                >
                  Cancel
                </button>

                <button
                  className="btn btn-error rounded-2xl"
                  onClick={handleDeletePayment}
                  disabled={deleting}
                >
                  {deleting ? (
                    <span className="flex items-center gap-2">
                      <span className="loading loading-spinner"></span>
                      Deleting...
                    </span>
                  ) : (
                    "Yes, Delete"
                  )}
                </button>
              </div>
            </div>

            <div
              className="modal-backdrop"
              onClick={() => {
                setOpenDeleteModal(false);
                setSelectedPayment(null);
              }}
            ></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentsPage;
