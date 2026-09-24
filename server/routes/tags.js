const express = require("express");
const Tag = require("../models/Tag");
const asyncHandler = require("../middleware/asyncHandler");
const { requireAdmin } = require("../middleware/auth");

const router = express.Router();

router.post(
  "/",
  requireAdmin,
  asyncHandler(async (req, res) => {
    const tag = await Tag.create(req.body);
    res.status(201).json(tag);
  }),
);

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const tags = await Tag.find().sort({ name: 1 });
    res.json(tags);
  }),
);

module.exports = router;
