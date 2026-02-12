import { useState, useEffect } from "react";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useSearchParams } from "react-router-dom";

const MemberDetailPage = () => {
  const [searchMemberId, setSearchMemberId] = useState("");
  const [member, setMember] = useState(null);
  const [editData, setEditData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [searchParams] = useSearchParams();

  // ✅ Payments states (only history)
  const [payments, setPayments] = useState([]);
  const [loadingPayments, setLoadingPayments] = useState(false);

  const fetchPayments = async (memberId) => {
    try {
      setLoadingPayments(true);

      const res = await axiosInstance.get(
        `/payments/member/memberid/${memberId}`
      );

      const list =
        Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.payments)
          ? res.data.payments
          : Array.isArray(res.data?.data)
          ? res.data.data
          : [];

      const sorted = [...list].sort((a, b) => {
        const da = new Date(a.paymentDate || a.createdAt || 0).getTime();
        const db = new Date(b.paymentDate || b.createdAt || 0).getTime();
        return db - da;
      });

      setPayments(sorted);
    } catch (err) {
      console.error(err);
      setPayments([]);
      toast.error("Failed to load payment history");
    } finally {
      setLoadingPayments(false);
    }
  };

  const handleSearch = async () => {
    if (!searchMemberId.trim()) {
      toast.error("Enter Member ID");
      return;
    }

    try {
      setLoading(true);
      const res = await axiosInstance.get(
        `/members/memberid/${searchMemberId.trim()}`
      );

      setMember(res.data);

      // ✅ keep editData with formatted date for input[type=date]
      setEditData({
        ...res.data,
        nextDueDate: res.data?.nextDueDate
          ? String(res.data.nextDueDate).slice(0, 10)
          : "",
      });

      // ✅ fetch payments history only
      await fetchPayments(res.data.memberId);

      toast.success("Member found ✅");
    } catch (error) {
      console.log(error);
      setMember(null);
      setEditData(null);
      setPayments([]);
      toast.error(error?.response?.data?.message || "Member not found");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const mid = searchParams.get("memberId");
    if (mid) {
      setSearchMemberId(mid);
      (async () => {
        try {
          setLoading(true);
          const res = await axiosInstance.get(`/members/memberid/${mid}`);
          setMember(res.data);

          // ✅ keep editData with formatted date for input[type=date]
          setEditData({
            ...res.data,
            nextDueDate: res.data?.nextDueDate
              ? String(res.data.nextDueDate).slice(0, 10)
              : "",
          });

          // ✅ fetch payments history only
          await fetchPayments(res.data.memberId);
        } catch (error) {
          console.log(error);
          toast.error("Member not found");
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [searchParams]);

  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    try {
      setSaving(true);
      const res = await axiosInstance.put(
        `/members/memberid/${member.memberId}`,
        {
          name: editData.name,
          phone: editData.phone,
          email: editData.email,
          membershipPlan: editData.membershipPlan,
          status: editData.status,

          // ✅ NEW: manual due date update
          nextDueDate: editData.nextDueDate,
        }
      );

      toast.success("Member updated ✅");

      const updated = res.data.data;
      setMember(updated);

      // ✅ keep editData in sync + formatted
      setEditData({
        ...updated,
        nextDueDate: updated?.nextDueDate
          ? String(updated.nextDueDate).slice(0, 10)
          : "",
      });
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await axiosInstance.delete(`/members/memberid/${member.memberId}`);
      toast.success("Member deleted ✅");

      setMember(null);
      setEditData(null);
      setPayments([]);
      setSearchMemberId("");
      setOpenDeleteModal(false);
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message || "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="p-6 flex justify-center">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Member Details</h1>
          <p className="text-base-content/70 mt-1">
            Search member using Member ID and view full details.
          </p>
        </div>

        {/* Search bar */}
        <div className="card bg-base-200 shadow-xl border border-base-300 rounded-3xl">
          <div className="card-body">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="Enter Member ID"
                className="input input-bordered w-full rounded-2xl"
                value={searchMemberId}
                onChange={(e) => setSearchMemberId(e.target.value)}
              />

              <button
                className="btn btn-primary btn-outline rounded-2xl"
                onClick={handleSearch}
                disabled={loading}
              >
                {loading ? (
                  <span className="loading loading-spinner"></span>
                ) : (
                  "Search"
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Member info */}
        {member && (
          <div className="mt-6 card bg-base-200 shadow-xl border border-base-300 rounded-3xl">
            <div className="card-body">
              <h2 className="card-title text-2xl">Member Information</h2>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-base-100 border border-base-300">
                  <p className="text-sm text-base-content/60">Member ID</p>
                  <p className="font-semibold">{member.memberId}</p>
                </div>

                <div className="p-4 rounded-2xl bg-base-100 border border-base-300">
                  <p className="text-sm text-base-content/60">Name</p>
                  <p className="font-semibold">{member.name}</p>
                </div>

                <div className="p-4 rounded-2xl bg-base-100 border border-base-300">
                  <p className="text-sm text-base-content/60">Phone</p>
                  <p className="font-semibold">{member.phone}</p>
                </div>

                <div className="p-4 rounded-2xl bg-base-100 border border-base-300">
                  <p className="text-sm text-base-content/60">Email</p>
                  <p className="font-semibold">{member.email}</p>
                </div>

                <div className="p-4 rounded-2xl bg-base-100 border border-base-300">
                  <p className="text-sm text-base-content/60">Plan</p>
                  <p className="font-semibold">{member.membershipPlan}</p>
                </div>

                <div className="p-4 rounded-2xl bg-base-100 border border-base-300">
                  <p className="text-sm text-base-content/60">Status</p>
                  <p className="font-semibold">{member.status}</p>
                </div>

                <div className="p-4 rounded-2xl bg-base-100 border border-base-300">
                  <p className="text-sm text-base-content/60">
                    Last Payment Date
                  </p>
                  <p className="font-semibold">{member.lastPaymentDate || "-"}</p>
                </div>

                <div className="p-4 rounded-2xl bg-base-100 border border-base-300">
                  <p className="text-sm text-base-content/60">Next Due Date</p>
                  <p className="font-semibold">{member.nextDueDate || "-"}</p>
                </div>
              </div>

              {/* Update Member */}
              <div className="mt-8">
                <h3 className="text-xl font-bold">Update Member</h3>

                {editData && (
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="name"
                      placeholder="Full Name"
                      className="input input-bordered w-full rounded-2xl"
                      value={editData.name}
                      onChange={handleEditChange}
                    />

                    <input
                      type="text"
                      name="phone"
                      placeholder="Phone Number"
                      className="input input-bordered w-full rounded-2xl"
                      value={editData.phone}
                      onChange={handleEditChange}
                    />

                    <input
                      type="email"
                      name="email"
                      placeholder="Email Address"
                      className="input input-bordered w-full rounded-2xl"
                      value={editData.email}
                      onChange={handleEditChange}
                    />

                    <select
                      name="membershipPlan"
                      className="select select-bordered w-full rounded-2xl"
                      value={editData.membershipPlan}
                      onChange={handleEditChange}
                    >
                      <option value="Monthly">Monthly</option>
                      <option value="Quarterly">Quarterly</option>
                      <option value="Half-Yearly">Half-Yearly</option>
                      <option value="Yearly">Yearly</option>
                    </select>

                    <select
                      name="status"
                      className="select select-bordered w-full rounded-2xl"
                      value={editData.status}
                      onChange={handleEditChange}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>

                    {/* ✅ NEW: Next Due Date manual input */}
                    <div>
                      <label className="label">
                        <span className="label-text font-semibold">
                          Next Due Date (Manual)
                        </span>
                      </label>
                      <input
                        type="date"
                        name="nextDueDate"
                        className="input input-bordered w-full rounded-2xl"
                        value={editData.nextDueDate || ""}
                        onChange={handleEditChange}
                      />
                    </div>
                  </div>
                )}

                <div className="mt-6 flex justify-end">
                  <button
                    className="btn btn-primary btn-outline rounded-2xl"
                    onClick={handleUpdate}
                    disabled={saving}
                  >
                    {saving ? (
                      <span className="flex items-center gap-2">
                        <span className="loading loading-spinner"></span>
                        Saving...
                      </span>
                    ) : (
                      "Update Member"
                    )}
                  </button>
                </div>
              </div>

              {/* Payments history only */}
              <div className="mt-10">
                <h3 className="text-xl font-bold">Payments</h3>

                <div className="mt-4 p-5 rounded-3xl bg-base-100 border border-base-300">
                  <h4 className="font-semibold text-lg">📜 Payment History</h4>

                  {loadingPayments ? (
                    <div className="mt-4">
                      <span className="loading loading-spinner"></span>
                      <span className="ml-2">Loading payments...</span>
                    </div>
                  ) : payments.length === 0 ? (
                    <p className="text-base-content/60 mt-4">
                      No payments found.
                    </p>
                  ) : (
                    <div className="overflow-x-auto mt-4">
                      <table className="table table-zebra">
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Amount</th>
                            <th>Method</th>
                            <th>Note</th>
                          </tr>
                        </thead>
                        <tbody>
                          {payments.map((p) => (
                            <tr key={p._id}>
                              <td>
                                {p.paymentDate ? p.paymentDate.slice(0, 10) : "-"}
                              </td>
                              <td>₹{p.amount}</td>
                              <td>{p.paymentMethod}</td>
                              <td>{p.note || "-"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>

              {/* Delete Confirmation Modal */}
              {openDeleteModal && (
                <div className="modal modal-open">
                  <div className="modal-box rounded-3xl">
                    <h3 className="font-bold text-lg text-error">
                      Confirm Delete
                    </h3>
                    <p className="py-4 text-base-content/70">
                      Are you sure you want to delete this member?
                      <br />
                      <span className="font-semibold">Member ID:</span>{" "}
                      {member?.memberId}
                    </p>

                    <div className="modal-action">
                      <button
                        className="btn btn-outline btn-neutral rounded-2xl"
                        onClick={() => setOpenDeleteModal(false)}
                        disabled={deleting}
                      >
                        Cancel
                      </button>

                      <button
                        className="btn btn-error rounded-2xl"
                        onClick={handleDelete}
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
                    onClick={() => setOpenDeleteModal(false)}
                  ></div>
                </div>
              )}

              {/* <div className="mt-10 flex justify-end">
                <button
                  className="btn btn-error btn-outline rounded-2xl"
                  onClick={() => setOpenDeleteModal(true)}
                >
                  Delete Member
                </button>
              </div> */}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MemberDetailPage;
