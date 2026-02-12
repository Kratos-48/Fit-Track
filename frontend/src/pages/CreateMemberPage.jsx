import { useState, useEffect } from "react";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useNavigate, Link } from "react-router-dom";

const CreateMemberPage = () => {
  const navigate = useNavigate();

  // ✅ Fixed plan pricing
  const PLAN_AMOUNTS = {
    Monthly: 1200,
    Quarterly: 3000,
    "Half-Yearly": 6900,
    Yearly: 10500,
  };

  const [formData, setFormData] = useState({
    memberId: "",
    name: "",
    phone: "",
    email: "",
    joinDate: "",
    membershipPlan: "Monthly",
    status: "Active",
  });

  // ✅ payment toggle + payment form
  const [addPaymentNow, setAddPaymentNow] = useState(false);
  const [paymentData, setPaymentData] = useState({
    amount: "",
    paymentMethod: "Cash",
    paymentDate: new Date().toISOString().slice(0, 10),
    note: "",
  });

  const [loading, setLoading] = useState(false);

  // ✅ Auto-generate Member ID: FT001, FT002 ...
  const generateNextMemberId = async () => {
    try {
      // NOTE: using existing /members list (no backend change needed)
      const res = await axiosInstance.get("/members");

      const list = Array.isArray(res.data?.data)
        ? res.data.data
        : Array.isArray(res.data)
        ? res.data
        : [];

      // extract FT numbers
      const nums = list
        .map((m) => String(m.memberId || ""))
        .filter((id) => id.startsWith("FT"))
        .map((id) => {
          const n = parseInt(id.replace("FT", ""), 10);
          return Number.isFinite(n) ? n : 0;
        });

      const maxNum = nums.length ? Math.max(...nums) : 0;
      const nextNum = maxNum + 1;

      const nextId = `FT${String(nextNum).padStart(3, "0")}`;

      setFormData((prev) => ({
        ...prev,
        memberId: nextId,
      }));
    } catch (err) {
      console.log(err);
      // fallback
      setFormData((prev) => ({
        ...prev,
        memberId: "FT001",
      }));
    }
  };

  // ✅ generate on load
  useEffect(() => {
    generateNextMemberId();
  }, []);

  // ✅ Auto-set amount when:
  // - addPaymentNow ON
  // - plan changes
  useEffect(() => {
    if (!addPaymentNow) return;

    setPaymentData((prev) => ({
      ...prev,
      amount: PLAN_AMOUNTS[formData.membershipPlan] || "",
    }));
  }, [formData.membershipPlan, addPaymentNow]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePaymentChange = (e) => {
    setPaymentData({ ...paymentData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      // ✅ 1) Create Member
      await axiosInstance.post("/members", formData);

      // ✅ 2) If payment enabled, create payment for same memberId
      if (addPaymentNow) {
        if (!paymentData.amount || Number(paymentData.amount) <= 0) {
          toast.error("Enter valid payment amount");
          return;
        }

        await axiosInstance.post("/payments", {
          memberId: formData.memberId,
          amount: Number(paymentData.amount),
          paymentMethod: paymentData.paymentMethod,
          paymentDate: paymentData.paymentDate,
          note: paymentData.note,
        });

        toast.success("Member + Payment created successfully ✅");
      } else {
        toast.success("Member created successfully ✅");
      }

      navigate("/");
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message || "Failed to create member");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 flex justify-center">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Add New Member</h1>
            <p className="text-base-content/70 mt-1">
              Create a Fit-Track member profile and assign membership plan.
            </p>
          </div>

          <Link to="/" className="btn btn-outline btn-neutral rounded-2xl">
            ← Back to Dashboard
          </Link>
        </div>

        {/* Card */}
        <div className="card bg-base-200 shadow-xl border border-base-300 rounded-3xl">
          <div className="card-body">
            <form onSubmit={handleSubmit} className="grid gap-6">
              {/* GRID 2 cols */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Member ID */}
                <div>
                  <label className="label">
                    <span className="label-text font-semibold">Member ID</span>
                  </label>
                  <input
                    type="text"
                    name="memberId"
                    placeholder="FT..."
                    className="input input-bordered w-full rounded-2xl"
                    value={formData.memberId}
                    onChange={handleChange}
                    required
                    readOnly // ✅ auto assigned
                  />
                  <p className="text-xs text-base-content/60 mt-2">
                    Auto generated (FT...)
                  </p>
                </div>

                {/* Name */}
                <div>
                  <label className="label">
                    <span className="label-text font-semibold">Full Name</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Enter full name"
                    className="input input-bordered w-full rounded-2xl"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="label">
                    <span className="label-text font-semibold">
                      Phone Number
                    </span>
                  </label>
                  <input
                    type="text"
                    name="phone"
                    placeholder="10-digit phone number"
                    className="input input-bordered w-full rounded-2xl"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="label">
                    <span className="label-text font-semibold">
                      Email Address
                    </span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter Email"
                    className="input input-bordered w-full rounded-2xl"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Joining Date */}
                <div>
                  <label className="label">
                    <span className="label-text font-semibold">
                      Joining Date
                    </span>
                  </label>
                  <input
                    type="date"
                    name="joinDate"
                    className="input input-bordered w-full rounded-2xl"
                    value={formData.joinDate}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Plan */}
                <div>
                  <label className="label">
                    <span className="label-text font-semibold">
                      Membership Plan
                    </span>
                  </label>
                  <select
                    name="membershipPlan"
                    className="select select-bordered w-full rounded-2xl"
                    value={formData.membershipPlan}
                    onChange={handleChange}
                    required
                  >
                    <option value="Monthly">Monthly (₹1200)</option>
                    <option value="Quarterly">Quarterly (₹3000)</option>
                    <option value="Half-Yearly">Half-Yearly (₹6900)</option>
                    <option value="Yearly">Yearly (₹10500)</option>
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="label">
                    <span className="label-text font-semibold">Status</span>
                  </label>
                  <select
                    name="status"
                    className="select select-bordered w-full rounded-2xl"
                    value={formData.status}
                    onChange={handleChange}
                    required
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                <div className="hidden md:block"></div>
              </div>

              {/* Payment Toggle */}
              <div className="p-5 rounded-3xl bg-base-100 border border-base-300">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <h3 className="text-lg font-bold">Add Payment (Optional)</h3>
                    <p className="text-sm text-base-content/70">
                      If payment is collected now, save it along with member.
                    </p>
                  </div>

                  <label className="label cursor-pointer gap-3">
                    <span className="label-text font-semibold">
                      Add Payment Now
                    </span>
                    <input
                      type="checkbox"
                      className="toggle toggle-primary"
                      checked={addPaymentNow}
                      onChange={(e) => setAddPaymentNow(e.target.checked)}
                    />
                  </label>
                </div>

                {/* Payment form */}
                {addPaymentNow && (
                  <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="label">
                        <span className="label-text font-semibold">
                          Amount (₹)
                        </span>
                      </label>
                      <input
                        type="number"
                        name="amount"
                        placeholder="Enter amount"
                        className="input input-bordered w-full rounded-2xl"
                        value={paymentData.amount}
                        onChange={handlePaymentChange}
                        required={addPaymentNow}
                        disabled
                      />
                      <p className="text-xs text-base-content/60 mt-2">
                        Auto-set based on selected plan.
                      </p>
                    </div>

                    <div>
                      <label className="label">
                        <span className="label-text font-semibold">
                          Payment Method
                        </span>
                      </label>
                      <select
                        name="paymentMethod"
                        className="select select-bordered w-full rounded-2xl"
                        value={paymentData.paymentMethod}
                        onChange={handlePaymentChange}
                      >
                        <option value="Cash">Cash</option>
                        <option value="UPI">UPI</option>
                        <option value="Card">Card</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                      </select>
                    </div>

                    <div>
                      <label className="label">
                        <span className="label-text font-semibold">
                          Payment Date
                        </span>
                      </label>
                      <input
                        type="date"
                        name="paymentDate"
                        className="input input-bordered w-full rounded-2xl"
                        value={paymentData.paymentDate}
                        onChange={handlePaymentChange}
                        required={addPaymentNow}
                      />
                    </div>

                    <div>
                      <label className="label">
                        <span className="label-text font-semibold">Note</span>
                      </label>
                      <input
                        type="text"
                        name="note"
                        placeholder="Optional note (e.g., Jan fees)"
                        className="input input-bordered w-full rounded-2xl"
                        value={paymentData.note}
                        onChange={handlePaymentChange}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 justify-end">
                <button
                  type="button"
                  className="btn btn-outline btn-secondary rounded-2xl"
                  onClick={() => navigate("/")}
                  disabled={loading}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn btn-primary btn-outline rounded-2xl"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="loading loading-spinner"></span>
                      Creating...
                    </span>
                  ) : (
                    "Create Member"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateMemberPage;
