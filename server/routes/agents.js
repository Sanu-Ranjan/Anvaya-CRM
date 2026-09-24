const express = require("express");
const SalesAgent = require("../models/SalesAgent");
const asyncHandler = require("../middleware/asyncHandler");
const { httpError } = require("../middleware/errorHandler");
const mongoose = require("mongoose");
const { requireAdmin } = require("../middleware/auth");
const router = express.Router();

router.post(
  "/",
  requireAdmin,
  asyncHandler(async (req, res) => {
    const agent = await SalesAgent.create(req.body);
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
    res.json({ message: "Agent deleted successfully." });
  }),
);

module.exports = router;
