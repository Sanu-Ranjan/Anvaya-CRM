const express = require("express");
const bcrypt = require("bcrypt");
const SalesAgent = require("../models/SalesAgent");
const User = require("../models/User");
const asyncHandler = require("../middleware/asyncHandler");
const { httpError } = require("../middleware/errorHandler");
const mongoose = require("mongoose");
const { requireAdmin } = require("../middleware/auth");
const router = express.Router();

const MIN_PASSWORD = 6;

const checkPassword = (password) => {
  if (!password || password.length < MIN_PASSWORD) {
    throw httpError(
      400,
      `Temporary password must be at least ${MIN_PASSWORD} characters.`,
    );
  }
};

// admin creates the agent and their login together,
// the agent has to change this temporary password on first login
router.post(
  "/",
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;
    checkPassword(password);

    const normalizedEmail = email?.trim().toLowerCase();
    if (normalizedEmail && (await User.exists({ email: normalizedEmail }))) {
      throw httpError(409, `A login for '${normalizedEmail}' already exists.`);
    }

    const agent = await SalesAgent.create({ name, email });
    try {
      await User.create({
        name: agent.name,
        email: agent.email,
        password: await bcrypt.hash(password, 10),
        role: "agent",
        salesAgent: agent._id,
        mustChangePassword: true,
      });
    } catch (err) {
      // don't leave an agent without a login behind
      await SalesAgent.findByIdAndDelete(agent._id);
      throw err;
    }

    res.status(201).json(agent);
  }),
);

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const agents = await SalesAgent.find().sort({ name: 1 });
    res.json(agents);
  }),
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const agent = await SalesAgent.findById(req.params.id);
    if (!agent)
      throw httpError(404, `Sales agent with ID '${req.params.id}' not found.`);
    res.json(agent);
  }),
);

// admin sets a new temporary password (forgotten password, or an agent
// added before logins existed); creates the login if there isn't one yet
router.patch(
  "/:id/password",
  requireAdmin,
  asyncHandler(async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      throw httpError(400, `Invalid agent ID: ${req.params.id}`);
    }
    const { password } = req.body;
    checkPassword(password);

    const agent = await SalesAgent.findById(req.params.id);
    if (!agent) {
      throw httpError(404, `Agent with ID '${req.params.id}' not found.`);
    }

    const existing = await User.findOne({ salesAgent: agent._id });
    if (existing?.isDemo) {
      throw httpError(403, "Demo account passwords can't be changed.");
    }

    await User.findOneAndUpdate(
      { salesAgent: agent._id },
      {
        name: agent.name,
        email: agent.email,
        password: await bcrypt.hash(password, 10),
        role: "agent",
        salesAgent: agent._id,
        mustChangePassword: true,
      },
      { upsert: true, runValidators: true },
    );

    res.json({ message: `Temporary password set for ${agent.name}.` });
  }),
);

router.delete(
  "/:id",
  requireAdmin,
  asyncHandler(async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      throw httpError(400, `Invalid agent ID: ${req.params.id}`);
    }
    const agent = await SalesAgent.findByIdAndDelete(req.params.id);
    if (!agent) {
      throw httpError(404, `Agent with ID '${req.params.id}' not found.`);
    }
    // their login goes with them
    await User.deleteMany({ salesAgent: agent._id });
    res.json({ message: "Agent deleted successfully." });
  }),
);

module.exports = router;
