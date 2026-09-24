const express = require("express");
const mongoose = require("mongoose");
const Comment = require("../models/Comment");
const Lead = require("../models/Lead");
const asyncHandler = require("../middleware/asyncHandler");
const { httpError } = require("../middleware/errorHandler");

const router = express.Router({ mergeParams: true });

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const leadId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(leadId)) {
      throw httpError(400, `Invalid lead ID: ${leadId}`);
    }
    const lead = await Lead.findById(leadId);
    if (!lead) {
      throw httpError(404, `Lead with ID '${leadId}' not found.`);
    }

    // author is always the logged in user, never taken from the body
    const comment = await Comment.create({
      lead: leadId,
      author: req.user.id,
      commentText: req.body.commentText,
    });

    const populated = await comment.populate("author", "name");
    res.status(201).json(populated);
  }),
);

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const leadId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(leadId)) {
      throw httpError(400, `Invalid lead ID: ${leadId}`);
    }
    const lead = await Lead.findById(leadId);
    if (!lead) {
      throw httpError(404, `Lead with ID '${leadId}' not found.`);
    }
    const comments = await Comment.find({ lead: leadId })
      .populate("author", "name")
      .sort({ createdAt: -1 });
    res.json(comments);
  }),
);

module.exports = router;
