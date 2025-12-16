import { Router } from "express";
import { auth } from "../middleware/auth.js";
import {
  createTask,
  listTasks,
  updateTask,
  deleteTask,
  assignSelf,
  updateStatus,
  listEmployeesForAssign,
  taskStats
} from "../controllers/taskController.js";

const router = Router();
router.use(auth);

router.get("/", listTasks);
router.post("/", createTask);

router.patch("/:id", updateTask);
router.delete("/:id", deleteTask);

router.post("/:id/assign-self", assignSelf);
router.patch("/:id/status", updateStatus);

// optional helpers
router.get("/meta/employees", listEmployeesForAssign);
router.get("/meta/stats", taskStats);

export default router;
