const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const asyncHandler = require("../middleware/asyncHandler");
const { httpError } = require("../middleware/errorHandler");
const { verifyToken } = require("../middleware/auth");

const router = express.Router();

const SALT_ROUNDS = 10;
const MIN_PASSWORD = 6;

const signToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

// never send the password hash back
const toPublicUser = ({
  _id,
  name,
  email,
  role,
  salesAgent,
  mustChangePassword,
  isDemo,
}) => ({ _id, name, email, role, salesAgent, mustChangePassword, isDemo });

const ROLE_LABEL = { admin: "an admin", agent: "a sales agent" };

// there is no public signup: agent logins are created by the admin,
// the admin account from ADMIN_EMAIL / ADMIN_PASSWORD in .env
router.post(
  "/login",
  asyncHandler(async (req, res) => {
    // role = which login tab was used ("admin" or "agent")
    const { email, password, role } = req.body;
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
    if (role && role !== user.role) {
      throw httpError(
        403,
        `This account is not ${ROLE_LABEL[role] ?? role} account.`,
      );
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

router.post(
  "/change-password",
  verifyToken,
  asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      throw httpError(400, "Current and new password are required.");
    }
    if (newPassword.length < MIN_PASSWORD) {
      throw httpError(
        400,
        `New password must be at least ${MIN_PASSWORD} characters.`,
      );
    }

    const user = await User.findById(req.user.id).select("+password");
    if (user.isDemo) {
      throw httpError(403, "Demo account passwords can't be changed.");
    }
    if (!(await bcrypt.compare(currentPassword, user.password))) {
      throw httpError(400, "Current password is incorrect.");
    }
    if (await bcrypt.compare(newPassword, user.password)) {
      throw httpError(400, "New password must be different from the current one.");
    }

    user.password = await bcrypt.hash(newPassword, SALT_ROUNDS);
    user.mustChangePassword = false;
    await user.save();

    res.json({ user: toPublicUser(user) });
  }),
);

module.exports = router;
