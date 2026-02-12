import express from "express";
import {
  createPayment,
  getAllPayments,
  updatePayment,
  getPaymentsByMemberMongoId,
  getPaymentsByMemberId,
  deletePaymentByMongoId,
  monthlyCollectionSummary,
} from "../controllers/paymentController.js";

const router = express.Router();

// Create payment
router.post("/", createPayment);

// Get all payments
router.get("/", getAllPayments);

// ✅ Get payments by MongoDB Member _id
router.get("/member/id/:id", getPaymentsByMemberMongoId);

// ✅ Get payments by custom memberId
router.get("/member/memberid/:memberId", getPaymentsByMemberId);

// ✅ Monthly collection summary (your special feature)
router.get("/summary/monthly", monthlyCollectionSummary);

// Delete payment by MongoDB payment _id
router.delete("/id/:id", deletePaymentByMongoId);

router.put("/:id", updatePayment);


export default router;
