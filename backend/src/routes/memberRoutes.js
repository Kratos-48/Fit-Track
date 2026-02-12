import express from "express";
import {
  createMember,
  getAllMembers,
  getMemberByMongoId,
  getMemberByMemberId,
  updateMemberByMongoId,
  updateMemberByMemberId,
  deleteMemberByMongoId,
  deleteMemberByMemberId,
  searchMembers,
  filterMembers
} from "../controllers/memberController.js";

const router = express.Router();

// Create member
router.post("/", createMember);

// Get all members
router.get("/", getAllMembers);

// ✅ Filter members by membershipPlan, status, joinDate range
router.get("/filter", filterMembers);

// ✅ Search members by name, email, or memberId
router.get("/search/:key", searchMembers);

// ✅ Get member by MongoDB _id
router.get("/id/:id", getMemberByMongoId);

// ✅ Get member by custom memberId
router.get("/memberid/:memberId", getMemberByMemberId);

// ✅ Update member by MongoDB _id
router.put("/id/:id", updateMemberByMongoId);

// ✅ Update member by custom memberId
router.put("/memberid/:memberId", updateMemberByMemberId);

// ✅ Delete member by MongoDB _id
router.delete("/id/:id", deleteMemberByMongoId);

// ✅ Delete member by custom memberId
router.delete("/memberid/:memberId", deleteMemberByMemberId);

export default router;
