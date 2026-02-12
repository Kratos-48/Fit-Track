import mongoose from "mongoose";

const paymentSchema = mongoose.Schema(
  {
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      required: true,
    },

    memberId: {
      type: String,
      required: true,
      trim: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    paymentDate: {
      type: String,
      required: true, // yyyy-mm-dd
    },

    paymentMethod: {
      type: String,
      required: true,
      enum: ["Cash", "UPI", "Card", "NetBanking"],
      default: "Cash",
    },

    note: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Payment = mongoose.model("Payment", paymentSchema);
