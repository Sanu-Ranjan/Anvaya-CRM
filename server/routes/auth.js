const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const asyncHandler = require("../middleware/asyncHandler");
const { httpError } = require("../middleware/errorHandler");
const { verifyToken } = require("../middleware/auth");

const router = express.Router();

const SALT_ROUNDS = 10;

const signToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

// never send the password hash back
const toPublicUser = ({ _id, name, email, role }) => ({
  _id,
  name,
  email,
  role,
});

// emails listed in ADMIN_EMAILS become admin on signup, everyone else is a member
const adminEmails = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

router.post(
  "/signup",
  asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      throw httpError(400, "Name, email and password are required.");
    }
    if (password.length < 6) {
      throw httpError(400, "Password must be at least 6 characters.");
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) throw httpError(409, "Email already registered.");

    const hashed = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await User.create({
      name,
      email: normalizedEmail,
      password: hashed,
      role: adminEmails.includes(normalizedEmail) ? "admin" : "member",
    });

    res
      .status(201)
      .json({ token: signToken(user._id), user: toPublicUser(user) });
  }),
);

router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      throw httpError(400, "Email and password are required.");
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    }).select("+password");

    // same message for both cases so we don't reveal which emails exist
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw httpError(401, "Invalid email or password.");
    }

    res.json({ token: signToken(user._id), user: toPublicUser(user) });
  }),
);

router.get(
  "/me",
  verifyToken,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);
    res.json({ user: toPublicUser(user) });
  }),
);

module.exports = router;
