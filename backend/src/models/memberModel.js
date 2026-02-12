import mongoose from "mongoose";

const memberSchema = mongoose.Schema(
  {
    memberId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      trim: true,
    },

    joinDate: {
      type: String,
      required: true,
    },

    membershipPlan: {
      type: String,
      required: true,
      enum: ["Monthly", "Quarterly", "Half-Yearly", "Yearly"],
    },

    status: {
      type: String,
      required: true,
      enum: ["Active", "Inactive"],
      default: "Active",
    },

    // ✅ NEW: track payments automatically
    lastPaymentDate: {
      type: String,
      default: "",
    },

    nextDueDate: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

export const Member = mongoose.model("Member", memberSchema);
