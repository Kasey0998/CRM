import bcrypt from "bcryptjs";
import { User } from "../models/index.js";

export async function ensureAdmin() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.log("ADMIN_EMAIL / ADMIN_PASSWORD not set. Skipping admin seed.");
    return;
  }

  const existing = await User.findOne({ where: { email } });
  if (existing) {
    console.log(`Admin exists: ${email} (no changes made)`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await User.create({
    role: "ADMIN",
    email,
    passwordHash,
    firstName: "Admin",
    lastName: "User"
  });

  console.log(`✅ Admin created: ${email}`);
}
