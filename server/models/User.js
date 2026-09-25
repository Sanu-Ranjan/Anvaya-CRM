const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      select: false,
    },
    role: {
      type: String,
      enum: ["admin", "agent"],
      required: true,
    },
    // agents are linked to their SalesAgent record, admins have none
    salesAgent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SalesAgent",
    },
    // true while the user still has the temporary password the admin set
    mustChangePassword: {
      type: Boolean,
      default: false,
    },
    // demo accounts from the seed, their password can't be changed
    isDemo: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

// own collection name so it never clashes with another project's "users"
module.exports = mongoose.model("User", userSchema, "anvayaUsers");
