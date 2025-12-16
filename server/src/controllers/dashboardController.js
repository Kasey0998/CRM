import { Task } from "../models/index.js";

export async function stats(req, res) {
  const tasks = await Task.findAll();
  const total = tasks.length;

  const completed = tasks.filter(t => t.status === "completed").length;
  const pending = tasks.filter(t => t.status === "pending").length;
  const inProgress = tasks.filter(t => t.status === "in-progress").length;

  // treat "new" as created today
  const today = new Date();
  today.setHours(0,0,0,0);
  const newTasks = tasks.filter(t => new Date(t.createdAt) >= today).length;

  return res.json({ total, completed, pending, inProgress, new: newTasks });
}
