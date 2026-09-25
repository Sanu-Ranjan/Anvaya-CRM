require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { initializeDatabase } = require("./config/db");
const { errorHandler } = require("./middleware/errorHandler");
const { ensureAdmin } = require("./utils/ensureAdmin");

const leadsRouter = require("./routes/leads");
const agentsRouter = require("./routes/agents");
const commentsRouter = require("./routes/comments");
const tagsRouter = require("./routes/tags");
const reportsRouter = require("./routes/reports");
const authRouter = require("./routes/auth");
const { verifyToken, requirePasswordChanged } = require("./middleware/auth");

const app = express();

const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS;
if (!ALLOWED_ORIGINS) {
  console.log("Error : Allowed ORIGIN not set");
  process.exit(1);
}
if (!process.env.JWT_SECRET) {
  console.log("Error : JWT_SECRET not set");
  process.exit(1);
}

const allowedOrigins = ALLOWED_ORIGINS?.split(",") || [];
app.use(
  cors({
    origin: allowedOrigins,
  }),
);

app.use(express.json());

app.get("/anvaya/v1/", (req, res) => {
  res.json({ message: "Anvaya CRM API is running." });
});

// public
app.use("/anvaya/v1/auth", authRouter);

// everything below needs a logged in user who has set their own password
const protect = [verifyToken, requirePasswordChanged];
app.use("/anvaya/v1/leads/:id/comments", protect, commentsRouter);
app.use("/anvaya/v1/leads", protect, leadsRouter);
app.use("/anvaya/v1/agents", protect, agentsRouter);
app.use("/anvaya/v1/tags", protect, tagsRouter);
app.use("/anvaya/v1/report", protect, reportsRouter);

app.use((req, res) => {
  res
    .status(404)
    .json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
});

app.use(errorHandler);

const PORT = process.env.PORT || 3000;

initializeDatabase()
  .then(ensureAdmin)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`✓ Anvaya API listening on http://localhost:${PORT}`);
    });
  });
