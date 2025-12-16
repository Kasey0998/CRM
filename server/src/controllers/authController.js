import jwt from "jsonwebtoken";
import { User } from "../models/index.js";

function sign(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

export async function login(req, res) {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ message: "Email & password required" });

  const user = await User.findOne({ where: { email } });
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const ok = await user.verifyPassword(password);
  if (!ok) return res.status(401).json({ message: "Invalid credentials" });

  const token = sign(user.id);
  return res.json({
    token,
    user: {
      id: user.id,
      role: user.role,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName
    }
  });
}

export async function me(req, res) {
  return res.json({ user: req.user });
}
