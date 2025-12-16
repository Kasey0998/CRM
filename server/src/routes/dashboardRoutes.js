import { Router } from "express";
import { auth } from "../middleware/auth.js";
import { stats } from "../controllers/dashboardController.js";

const router = Router();
router.use(auth);
router.get("/stats", stats);

export default router;
