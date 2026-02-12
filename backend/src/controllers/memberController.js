import { Member } from "../models/memberModel.js";
import mongoose from "mongoose";

// ✅ Create Member
export const createMember = async (req, res) => {
  try {
    const {
      memberId,
      name,
      phone,
      email,
      joinDate,
      membershipPlan,
      status,
    } = req.body;

    if (
      !memberId ||
      !name ||
      !phone ||
      !email ||
      !joinDate ||
      !membershipPlan
    ) {
      return res.status(400).send({
        message: "Send all required fields: memberId, name, phone, email, joinDate, membershipPlan",
      });
    }

    // check memberId already exists
    const existing = await Member.findOne({ memberId });
    if (existing) {
      return res.status(400).send({ message: "MemberId already exists" });
    }

    const newMember = {
      memberId,
      name,
      phone,
      email,
      joinDate,
      membershipPlan,
      status: status || "Active",
    };

    const member = await Member.create(newMember);

    return res.status(201).send(member);
  } catch (error) {
    console.log(error.message);
    res.status(500).send({ message: error.message });
  }
};

// ✅ Get All Members
export const getAllMembers = async (req, res) => {
  try {
    const members = await Member.find({}).sort({ createdAt: -1 });

    return res.status(200).json({
      count: members.length,
      data: members,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).send({ message: error.message });
  }
};

// ✅ Get Member by MongoDB _id
export const getMemberByMongoId = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send({ message: "Invalid MongoDB ID" });
    }

    const member = await Member.findById(id);

    if (!member) {
      return res.status(404).send({ message: "Member not found" });
    }

    return res.status(200).json(member);
  } catch (error) {
    console.log(error.message);
    res.status(500).send({ message: error.message });
  }
};

// ✅ Get Member by custom memberId
export const getMemberByMemberId = async (req, res) => {
  try {
    const { memberId } = req.params;

    const member = await Member.findOne({ memberId });

    if (!member) {
      return res.status(404).send({ message: "Member not found" });
    }

    return res.status(200).json(member);
  } catch (error) {
    console.log(error.message);
    res.status(500).send({ message: error.message });
  }
};

// ✅ Update Member by MongoDB _id
export const updateMemberByMongoId = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send({ message: "Invalid MongoDB ID" });
    }

    const result = await Member.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (!result) {
      return res.status(404).json({ message: "Member not found" });
    }

    return res.status(200).send({ message: "Member updated successfully", data: result });
  } catch (error) {
    console.log(error.message);
    res.status(500).send({ message: error.message });
  }
};

// ✅ Update Member by custom memberId
export const updateMemberByMemberId = async (req, res) => {
  try {
    const { memberId } = req.params;

    const result = await Member.findOneAndUpdate(
      { memberId },
      req.body,
      { new: true }
    );

    if (!result) {
      return res.status(404).json({ message: "Member not found" });
    }

    return res.status(200).send({ message: "Member updated successfully", data: result });
  } catch (error) {
    console.log(error.message);
    res.status(500).send({ message: error.message });
  }
};

// ✅ Delete Member by MongoDB _id
export const deleteMemberByMongoId = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send({ message: "Invalid MongoDB ID" });
    }

    const result = await Member.findByIdAndDelete(id);

    if (!result) {
      return res.status(404).json({ message: "Member not found" });
    }

    return res.status(200).send({ message: "Member deleted successfully" });
  } catch (error) {
    console.log(error.message);
    res.status(500).send({ message: error.message });
  }
};

// ✅ Delete Member by custom memberId
export const deleteMemberByMemberId = async (req, res) => {
  try {
    const { memberId } = req.params;

    const result = await Member.findOneAndDelete({ memberId });

    if (!result) {
      return res.status(404).json({ message: "Member not found" });
    }

    return res.status(200).send({ message: "Member deleted successfully" });
  } catch (error) {
    console.log(error.message);
    res.status(500).send({ message: error.message });
  }
};

// ✅ Search members by memberId / name / phone / email
export const searchMembers = async (req, res) => {
  try {
    const { key } = req.params;

    const members = await Member.find({
      $or: [
        { memberId: { $regex: key, $options: "i" } },
        { name: { $regex: key, $options: "i" } },
        { phone: { $regex: key, $options: "i" } },
        { email: { $regex: key, $options: "i" } },
      ],
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      count: members.length,
      data: members,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).send({ message: error.message });
  }
};

// ✅ Filter members by status and membershipPlan
export const filterMembers = async (req, res) => {
  try {
    const { status, membershipPlan } = req.query;

    let query = {};

    if (status) {
      query.status = status;
    }

    if (membershipPlan) {
      query.membershipPlan = membershipPlan;
    }

    const members = await Member.find(query).sort({ createdAt: -1 });

    return res.status(200).json({
      count: members.length,
      data: members,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).send({ message: error.message });
  }
};
