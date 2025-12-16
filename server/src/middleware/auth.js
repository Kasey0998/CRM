import jwt from "jsonwebtoken";
import { User } from "../models/index.js";

export async function auth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: "Missing token" });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(payload.userId, { attributes: { exclude: ["passwordHash"] } });
    if (!user) return res.status(401).json({ message: "Invalid token user" });
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid/expired token" });
  }
}
