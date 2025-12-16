import { Router } from "express";
import { auth } from "../middleware/auth.js";
import {
  listOrganizations,
  createOrganization,
  updateOrganization,
  deleteOrganization,
  setOrganizationClients,
  getOrganizationClients
} from "../controllers/organizationController.js";

const router = Router();
router.use(auth);

router.get("/", listOrganizations);
router.post("/", createOrganization);
router.patch("/:id", updateOrganization);
router.delete("/:id", deleteOrganization);

// mapping
router.get("/:id/clients", getOrganizationClients);
router.put("/:id/clients", setOrganizationClients);

export default router;
