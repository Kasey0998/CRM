import { Organization, Client, Task } from "../models/index.js";

export async function listOrganizations(req, res) {
  const orgs = await Organization.findAll({
    order: [["createdAt", "DESC"]],
    include: [{ model: Client }]
  });
  res.json({ organizations: orgs });
}

export async function createOrganization(req, res) {
  const { name } = req.body || {};
  if (!name) return res.status(400).json({ message: "Organization name is required" });

  const trimmed = name.trim();
  const exists = await Organization.findOne({ where: { name: trimmed } });
  if (exists) return res.status(409).json({ message: "Organization already exists" });

  const org = await Organization.create({ name: trimmed });
  res.status(201).json({ organization: org });
}

export async function updateOrganization(req, res) {
  const { id } = req.params;
  const { name } = req.body || {};

  const org = await Organization.findByPk(id);
  if (!org) return res.status(404).json({ message: "Organization not found" });

  if (name && name.trim() !== org.name) {
    const exists = await Organization.findOne({ where: { name: name.trim() } });
    if (exists) return res.status(409).json({ message: "Organization name already exists" });
    org.name = name.trim();
  }

  await org.save();
  res.json({ organization: org });
}

export async function deleteOrganization(req, res) {
  const { id } = req.params;

  const org = await Organization.findByPk(id);
  if (!org) return res.status(404).json({ message: "Organization not found" });

  // ✅ protection
  const taskCount = await Task.count({ where: { organizationId: org.id } });
  if (taskCount > 0) {
    return res.status(409).json({ message: "Cannot delete organization: tasks exist for this organization" });
  }

  await org.destroy();
  res.json({ message: "Organization deleted" });
}

export async function setOrganizationClients(req, res) {
  const { id } = req.params;
  const { clientIds } = req.body || {};

  const org = await Organization.findByPk(id);
  if (!org) return res.status(404).json({ message: "Organization not found" });

  if (!Array.isArray(clientIds)) {
    return res.status(400).json({ message: "clientIds must be an array" });
  }

  const clients = await Client.findAll({ where: { id: clientIds } });
  await org.setClients(clients);

  const updated = await Organization.findByPk(id, { include: [{ model: Client }] });
  res.json({ organization: updated });
}

export async function getOrganizationClients(req, res) {
  const { id } = req.params;

  const org = await Organization.findByPk(id, { include: [{ model: Client }] });
  if (!org) return res.status(404).json({ message: "Organization not found" });

  res.json({ clients: org.Clients || [] });
}
