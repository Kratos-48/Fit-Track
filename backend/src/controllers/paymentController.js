import { Payment } from "../models/paymentModel.js";
import { Member } from "../models/memberModel.js";
import mongoose from "mongoose";

// ✅ helper to add months to a date string (yyyy-mm-dd)
const addMonthsToDate = (dateStr, monthsToAdd) => {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "";

  const d = date.getDate();
  date.setMonth(date.getMonth() + monthsToAdd);

  // fix month end issue
  if (date.getDate() !== d) {
    date.setDate(0);
  }

  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");

  return `${yyyy}-${mm}-${dd}`;
};

// ✅ decide months based on membership plan
const getPlanMonths = (plan) => {
  if (plan === "Monthly") return 1;
  if (plan === "Quarterly") return 3;
  if (plan === "Half-Yearly") return 6;
  if (plan === "Yearly") return 12;
  return 1;
};

// ✅ Create Payment
export const createPayment = async (req, res) => {
  try {
    const { memberId, amount, paymentDate, paymentMethod, note } = req.body;

    if (!memberId || !amount || !paymentDate) {
      return res.status(400).send({
        message: "Send all required fields: memberId, amount, paymentDate",
      });
    }

    // find member by custom memberId
    const member = await Member.findOne({ memberId });

    if (!member) {
      return res.status(404).send({ message: "Member not found" });
    }

    // create payment object
    const newPayment = {
      member: member._id,
      memberId: member.memberId,
      amount,
      paymentDate,
      paymentMethod: paymentMethod || "Cash",
      note: note || "",
    };

    const payment = await Payment.create(newPayment);

    // ✅ AUTO UPDATE MEMBER lastPaymentDate and nextDueDate
    const monthsToAdd = getPlanMonths(member.membershipPlan);
    const nextDueDate = addMonthsToDate(paymentDate, monthsToAdd);

    member.lastPaymentDate = paymentDate;
    member.nextDueDate = nextDueDate;

    await member.save();

    return res.status(201).send({
      message: "Payment added successfully ✅",
      payment,
      memberUpdated: {
        memberId: member.memberId,
        lastPaymentDate: member.lastPaymentDate,
        nextDueDate: member.nextDueDate,
      },
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).send({ message: error.message });
  }
};

// ✅ Get all payments
export const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find({})
      .populate("member")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      count: payments.length,
      data: payments,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).send({ message: error.message });
  }
};

// ✅ Get payments by MongoDB member _id
export const getPaymentsByMemberMongoId = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send({ message: "Invalid Member MongoDB ID" });
    }

    const payments = await Payment.find({ member: id }).sort({ createdAt: -1 });

    return res.status(200).json({
      count: payments.length,
      data: payments,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).send({ message: error.message });
  }
};

// ✅ Get payments by custom memberId
export const getPaymentsByMemberId = async (req, res) => {
  try {
    const { memberId } = req.params;

    const payments = await Payment.find({ memberId }).sort({ createdAt: -1 });

    return res.status(200).json({
      count: payments.length,
      data: payments,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).send({ message: error.message });
  }
};

// ✅ Delete payment by MongoDB payment _id
export const deletePaymentByMongoId = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send({ message: "Invalid Payment MongoDB ID" });
    }

    // find payment first
    const paymentToDelete = await Payment.findById(id);

    if (!paymentToDelete) {
      return res.status(404).json({ message: "Payment not found" });
    }

    const memberId = paymentToDelete.memberId;

    // delete payment
    await Payment.findByIdAndDelete(id);

    // find member
    const member = await Member.findOne({ memberId });

    if (!member) {
      return res.status(200).send({
        message: "Payment deleted, but Member not found to update due date",
      });
    }

    // find latest remaining payment for that member
    const latestPayment = await Payment.findOne({ memberId }).sort({
      paymentDate: -1,
      createdAt: -1,
    });

    if (!latestPayment) {
      // no payments left
      member.lastPaymentDate = "";
      member.nextDueDate = "";
      await member.save();

      return res.status(200).send({
        message: "Payment deleted and member due dates cleared ✅",
      });
    }

    // compute due date again from latest payment
    const monthsToAdd = getPlanMonths(member.membershipPlan);
    const nextDueDate = addMonthsToDate(latestPayment.paymentDate, monthsToAdd);

    member.lastPaymentDate = latestPayment.paymentDate;
    member.nextDueDate = nextDueDate;

    await member.save();

    return res.status(200).send({
      message: "Payment deleted and member due date updated ✅",
      memberUpdated: {
        memberId: member.memberId,
        lastPaymentDate: member.lastPaymentDate,
        nextDueDate: member.nextDueDate,
      },
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).send({ message: error.message });
  }
};


// ✅ Monthly collection summary (your special feature)
export const monthlyCollectionSummary = async (req, res) => {
  try {
    // expects: month=YYYY-MM
    // if not provided -> use current month
    let { month } = req.query;

    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    if (!month) {
      month = currentMonth;
    }

    const regex = new RegExp(`^${month}-`); // matches "YYYY-MM-"

    const payments = await Payment.find({ paymentDate: { $regex: regex } });

    const total = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

    return res.status(200).json({
      month,
      totalCollected: total,
      totalPayments: payments.length,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).send({ message: error.message });
  }
};

// ✅ Update payment by MongoDB payment _id
export const updatePaymentByMongoId = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send({ message: "Invalid Payment MongoDB ID" });
    }

    const { amount, paymentDate, paymentMethod, note } = req.body;

    if (!amount || !paymentDate || !paymentMethod) {
      return res.status(400).send({
        message: "Send all required fields: amount, paymentDate, paymentMethod",
      });
    }

    const payment = await Payment.findById(id);

    if (!payment) {
      return res.status(404).send({ message: "Payment not found" });
    }

    payment.amount = amount;
    payment.paymentDate = paymentDate;
    payment.paymentMethod = paymentMethod;
    payment.note = note || "";

    await payment.save();

    return res.status(200).send({
      message: "Payment updated successfully ✅",
      data: payment,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).send({ message: error.message });
  }
};

export const updatePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, paymentMethod, paymentDate, note } = req.body;

    const payment = await Payment.findById(id);
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    if (amount !== undefined) payment.amount = Number(amount);
    if (paymentMethod !== undefined) payment.paymentMethod = paymentMethod;
    if (paymentDate !== undefined) payment.paymentDate = paymentDate;
    if (note !== undefined) payment.note = note;

    await payment.save();

    return res.status(200).json({
      message: "Payment updated successfully",
      payment,
    });
  } catch (error) {
    console.log("updatePayment error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
