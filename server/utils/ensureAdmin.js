const bcrypt = require("bcrypt");
const User = require("../models/User");

// creates the admin from ADMIN_NAME / ADMIN_EMAIL / ADMIN_PASSWORD on startup.
// runs only if that email has no account yet, so a password the admin
// changes later in the app is never overwritten
const ensureAdmin = async () => {
  const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.log("! ADMIN_EMAIL / ADMIN_PASSWORD not set, skipping admin setup");
    return;
  }
  if (ADMIN_PASSWORD.length < 6) {
    console.log("! ADMIN_PASSWORD must be at least 6 characters, skipping admin setup");
    return;
  }

  const email = ADMIN_EMAIL.trim().toLowerCase();
  if (await User.exists({ email })) return;

  await User.create({
    name: ADMIN_NAME || "Admin",
    email,
    password: await bcrypt.hash(ADMIN_PASSWORD, 10),
    role: "admin",
  });
  console.log(`✓ Admin account created: ${email}`);
};

module.exports = { ensureAdmin };
