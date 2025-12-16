import { Router } from "express";
import { auth } from "../middleware/auth.js";
import { requireRole } from "../middleware/requireRole.js";
import { createEmployee, listEmployees, updateEmployee, deleteEmployee } from "../controllers/userController.js";

const router = Router();

router.use(auth);
router.use(requireRole("ADMIN"));

router.get("/employees", listEmployees);
router.post("/employees", createEmployee);
router.patch("/employees/:id", updateEmployee);
router.delete("/employees/:id", deleteEmployee);

export default router;
