import { Client, Task } from "../models/index.js";

export async function listClients(req, res) {
  const clients = await Client.findAll({ order: [["createdAt", "DESC"]] });
  res.json({ clients });
}

export async function createClient(req, res) {
  const { name, address } = req.body || {};
  if (!name) return res.status(400).json({ message: "Client name is required" });

  const trimmed = name.trim();
  const exists = await Client.findOne({ where: { name: trimmed } });
  if (exists) return res.status(409).json({ message: "Client already exists" });

  const client = await Client.create({ name: trimmed, address: address || null });
  res.status(201).json({ client });
}

export async function updateClient(req, res) {
  const { id } = req.params;
  const { name, address } = req.body || {};

  const client = await Client.findByPk(id);
  if (!client) return res.status(404).json({ message: "Client not found" });

  if (name && name.trim() !== client.name) {
    const exists = await Client.findOne({ where: { name: name.trim() } });
    if (exists) return res.status(409).json({ message: "Client name already exists" });
    client.name = name.trim();
  }
  client.address = address ?? client.address;

  await client.save();
  res.json({ client });
}

export async function deleteClient(req, res) {
  const { id } = req.params;

  const client = await Client.findByPk(id);
  if (!client) return res.status(404).json({ message: "Client not found" });

  // ✅ protection
  const taskCount = await Task.count({ where: { clientId: client.id } });
  if (taskCount > 0) {
    return res.status(409).json({ message: "Cannot delete client: tasks exist for this client" });
  }

  await client.destroy();
  res.json({ message: "Client deleted" });
}
