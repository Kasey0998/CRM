import { Router } from "express";
import { auth } from "../middleware/auth.js";
import { createClient, deleteClient, listClients, updateClient } from "../controllers/clientController.js";

const router = Router();
router.use(auth); // logged-in users (Admin/Employee)

router.get("/", listClients);
router.post("/", createClient);
router.patch("/:id", updateClient);
router.delete("/:id", deleteClient);

export default router;
