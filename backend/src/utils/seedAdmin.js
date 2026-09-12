const dotenv = require("dotenv");
const path = require("path");
const mongoose = require("mongoose");

// Load env vars
dotenv.config({ path: path.join(__dirname, "../../.env") });

const connectDB = require("../config/db");
const Admin = require("../models/Admin");

const seedAdmin = async () => {
  try {
    await connectDB();

    const existingAdmin = await Admin.findOne();
    if (existingAdmin) {
      console.log(`[Seed Admin]: Admin account already exists (username: "${existingAdmin.username}"). No action taken.`);
      process.exit(0);
    }

    const defaultUsername = process.env.ADMIN_DEFAULT_USERNAME;
    const defaultPassword = process.env.ADMIN_DEFAULT_PASSWORD;

    if (!defaultUsername || !defaultPassword) {
      throw new Error(
        "ADMIN_DEFAULT_USERNAME and ADMIN_DEFAULT_PASSWORD must be set in .env before running seed. " +
        "Refusing to create an admin account with hardcoded credentials."
      );
    }

    const admin = await Admin.create({
      username: defaultUsername,
      password: defaultPassword,
      role: "admin"
    });

    console.log("=========================================");
    console.log("[Seed Admin]: Admin account seeded successfully!");
    console.log(`Username : ${admin.username}`);
    console.log(`Password : ${defaultPassword}`);
    console.log("Role     : admin");
    console.log("=========================================");

    process.exit(0);
  } catch (error) {
    console.error(`[Seed Admin Error]: ${error.message}`);
    process.exit(1);
  }
};

seedAdmin();
