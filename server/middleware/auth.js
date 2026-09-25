const jwt = require("jsonwebtoken");
const User = require("../models/User");
const asyncHandler = require("./asyncHandler");
const { httpError } = require("./errorHandler");

// checks the Bearer token and loads the user (role is read fresh from the DB)
const verifyToken = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw httpError(401, "Unauthorized: token missing");
  }

  let decoded;
  try {
    decoded = jwt.verify(authHeader.split(" ")[1], process.env.JWT_SECRET);
  } catch {
    throw httpError(401, "Unauthorized: invalid or expired token");
  }

  const user = await User.findById(decoded.id);
  if (!user) throw httpError(401, "Unauthorized: user not found");

  req.user = {
    id: user._id,
    name: user.name,
    role: user.role,
    salesAgent: user.salesAgent,
    mustChangePassword: user.mustChangePassword,
  };
  next();
});

// use after verifyToken
const requireAdmin = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return next(httpError(403, "Forbidden: admin access required"));
  }
  next();
};

// use after verifyToken: blocks everything until the temporary password is changed
const requirePasswordChanged = (req, res, next) => {
  if (req.user?.mustChangePassword) {
    return next(httpError(403, "Please change your temporary password first."));
  }
  next();
};

module.exports = { verifyToken, requireAdmin, requirePasswordChanged };
