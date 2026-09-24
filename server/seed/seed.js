require("dotenv").config();
const mongoose = require("mongoose");
const { initializeDatabase } = require("../config/db");
const SalesAgent = require("../models/SalesAgent");
const Lead = require("../models/Lead");
const Comment = require("../models/Comment");
const Tag = require("../models/Tag");
const User = require("../models/User");
const bcrypt = require("bcrypt");

const agents = [
  { name: "John Doe", email: "john@anvaya.com" },
  { name: "Jane Smith", email: "jane@anvaya.com" },
  { name: "Mark Wilson", email: "mark@anvaya.com" },
  { name: "Priya Sharma", email: "priya@anvaya.com" },
];

// demo logins, also listed in the README
const demoUsers = [
  {
    name: "Demo Admin",
    email: "admin@anvaya.com",
    password: "admin123",
    role: "admin",
  },
  {
    name: "Demo Member",
    email: "member@anvaya.com",
    password: "member123",
    role: "member",
  },
];

const tags = [
  "High Value",
  "Follow-up",
  "Enterprise",
  "SMB",
  "Hot Lead",
  "Long-term",
];

const sources = [
  "Website",
  "Referral",
  "Cold Call",
  "Advertisement",
  "Email",
  "Other",
];
const statuses = ["New", "Contacted", "Qualified", "Proposal Sent", "Closed"];
const priorities = ["High", "Medium", "Low"];

const leadNames = [
  "Acme Corp",
  "Tech Solutions Ltd",
  "GlobalTrade Inc",
  "BlueWave Marketing",
  "Stellar Industries",
  "Pinnacle Group",
  "Apex Logistics",
  "Northwind Traders",
  "Contoso Pharmaceuticals",
  "Fabrikam Inc",
  "Litware Holdings",
  "Tailspin Toys",
  "Wide World Importers",
  "Adventure Works",
  "Proseware Systems",
  "Lucerne Publishing",
  "Coho Vineyard",
  "Margie's Travel",
  "Trey Research",
  "School of Fine Art",
];

const sampleComments = [
  "Reached out, waiting for response.",
  "Had a great call. Sending proposal next week.",
  "Lead asked for detailed pricing breakdown.",
  "Scheduled a demo for Friday.",
  "Decision-maker is on vacation, follow up in 2 weeks.",
  "Very interested. High likelihood of closing.",
  "Sent contract for review.",
  "Lead went cold. Will try one more outreach.",
];

const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const seed = async () => {
  await initializeDatabase();

  console.log("Clearing existing data...");
  await Promise.all([
    SalesAgent.deleteMany({}),
    Lead.deleteMany({}),
    Comment.deleteMany({}),
    Tag.deleteMany({}),
  ]);

  // only demo accounts are reset, real signups are left alone
  console.log("Seeding demo users...");
  await User.deleteMany({ email: { $in: demoUsers.map((u) => u.email) } });
  const createdUsers = await User.insertMany(
    await Promise.all(
      demoUsers.map(async (u) => ({
        ...u,
        password: await bcrypt.hash(u.password, 10),
      })),
    ),
  );

  console.log("Seeding sales agents...");
  const createdAgents = await SalesAgent.insertMany(agents);

  console.log("Seeding tags...");
  await Tag.insertMany(tags.map((name) => ({ name })));

  console.log("Seeding leads...");
  const createdLeads = [];
  for (const name of leadNames) {
    const status = randomItem(statuses);
    const numTags = randomInt(1, 2);
    const shuffled = [...tags].sort(() => Math.random() - 0.5);
    const leadTags = shuffled.slice(0, numTags);

    const lead = new Lead({
      name,
      source: randomItem(sources),
      salesAgent: randomItem(createdAgents)._id,
      status,
      tags: leadTags,
      timeToClose: randomInt(7, 60),
      priority: randomItem(priorities),
    });

    if (status === "Closed") {
      lead.closedAt = new Date(
        Date.now() - randomInt(0, 14) * 24 * 60 * 60 * 1000,
      );
    }

    await lead.save();
    createdLeads.push(lead);
  }

  console.log("Seeding comments...");
  for (const lead of createdLeads) {
    const numComments = randomInt(0, 3);
    for (let i = 0; i < numComments; i++) {
      await Comment.create({
        lead: lead._id,
        author: randomItem(createdUsers)._id,
        commentText: randomItem(sampleComments),
      });
    }
  }

  console.log(
    ` Seeded ${createdAgents.length} agents, ${createdLeads.length} leads, ${tags.length} tags.`,
  );
  await mongoose.connection.close();
  process.exit(0);
};

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
