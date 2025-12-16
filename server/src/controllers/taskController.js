import { Op } from "sequelize";
import { Client, Organization, Task, User } from "../models/index.js";

const STATUSES = ["pending", "follow-up", "reverted of client", "completed", "in-progress"];
const SERVICES = ["Accounting", "It-return", "GST", "Data-entry"];

// Create
export async function createTask(req, res) {
  const { organizationId, clientId, taskName, service, status } = req.body || {};

  if (!organizationId || !clientId || !taskName || !service) {
    return res.status(400).json({ message: "organizationId, clientId, taskName, service are required" });
  }
  if (!SERVICES.includes(service)) return res.status(400).json({ message: "Invalid service" });
  if (status && !STATUSES.includes(status)) return res.status(400).json({ message: "Invalid status" });

  const org = await Organization.findByPk(organizationId);
  if (!org) return res.status(404).json({ message: "Organization not found" });

  const client = await Client.findByPk(clientId);
  if (!client) return res.status(404).json({ message: "Client not found" });

  const linked = await org.getClients({ where: { id: clientId } });
  if (!linked || linked.length === 0) {
    return res.status(400).json({ message: "Selected client is not linked to selected organization" });
  }

  const task = await Task.create({
    taskName: taskName.trim(),
    service,
    status: status || "pending",
    clientId,
    organizationId,
    createdByUserId: req.user.id
  });

  return res.status(201).json({ task });
}

// List + filters
export async function listTasks(req, res) {
  const { q, status, service, organizationId, clientId, assigned, created } = req.query;

  const where = {};

  if (req.user.role !== "ADMIN") {
    where[Op.or] = [{ createdByUserId: req.user.id }, { assignedToUserId: req.user.id }];
  }

  if (q && String(q).trim()) {
    where.taskName = { [Op.like]: `%${String(q).trim()}%` };
  }
  if (status && STATUSES.includes(status)) where.status = status;
  if (service && SERVICES.includes(service)) where.service = service;
  if (organizationId) where.organizationId = Number(organizationId);
  if (clientId) where.clientId = Number(clientId);

  if (assigned === "me") where.assignedToUserId = req.user.id;
  if (created === "me") where.createdByUserId = req.user.id;

  const tasks = await Task.findAll({
    where,
    order: [["createdAt", "DESC"]],
    include: [
      { model: Client },
      { model: Organization },
      { as: "createdBy", model: User, attributes: ["id", "email", "firstName", "lastName", "role"] },
      { as: "assignedTo", model: User, attributes: ["id", "email", "firstName", "lastName", "role"] }
    ]
  });

  return res.json({ tasks, statuses: STATUSES, services: SERVICES });
}

// Update (edit)
export async function updateTask(req, res) {
  const { id } = req.params;
  const { taskName, service, status, organizationId, clientId, assignedToUserId } = req.body || {};

  const task = await Task.findByPk(id);
  if (!task) return res.status(404).json({ message: "Task not found" });

  if (req.user.role !== "ADMIN") {
    const allowed = task.createdByUserId === req.user.id || task.assignedToUserId === req.user.id;
    if (!allowed) return res.status(403).json({ message: "Not allowed" });
  }

  if (typeof taskName !== "undefined") {
    if (!String(taskName).trim()) return res.status(400).json({ message: "taskName cannot be empty" });
    task.taskName = String(taskName).trim();
  }

  if (typeof service !== "undefined") {
    if (!SERVICES.includes(service)) return res.status(400).json({ message: "Invalid service" });
    task.service = service;
  }

  if (typeof status !== "undefined") {
    if (!STATUSES.includes(status)) return res.status(400).json({ message: "Invalid status" });
    task.status = status;
  }

  if (typeof organizationId !== "undefined" || typeof clientId !== "undefined") {
    const newOrgId = typeof organizationId !== "undefined" ? Number(organizationId) : task.organizationId;
    const newClientId = typeof clientId !== "undefined" ? Number(clientId) : task.clientId;

    const org = await Organization.findByPk(newOrgId);
    if (!org) return res.status(404).json({ message: "Organization not found" });

    const client = await Client.findByPk(newClientId);
    if (!client) return res.status(404).json({ message: "Client not found" });

    const linked = await org.getClients({ where: { id: newClientId } });
    if (!linked || linked.length === 0) {
      return res.status(400).json({ message: "Selected client is not linked to selected organization" });
    }

    task.organizationId = newOrgId;
    task.clientId = newClientId;
  }

  if (typeof assignedToUserId !== "undefined") {
    if (req.user.role === "ADMIN") {
      if (assignedToUserId === null || assignedToUserId === "") {
        task.assignedToUserId = null;
      } else {
        const u = await User.findByPk(Number(assignedToUserId));
        if (!u) return res.status(404).json({ message: "User not found" });
        task.assignedToUserId = u.id;
      }
    } else {
      if (Number(assignedToUserId) !== req.user.id) {
        return res.status(403).json({ message: "Employees can assign only to themselves" });
      }
      task.assignedToUserId = req.user.id;
    }
  }

  await task.save();

  const updated = await Task.findByPk(task.id, {
    include: [
      { model: Client },
      { model: Organization },
      { as: "createdBy", model: User, attributes: ["id", "email", "firstName", "lastName", "role"] },
      { as: "assignedTo", model: User, attributes: ["id", "email", "firstName", "lastName", "role"] }
    ]
  });

  return res.json({ task: updated });
}

// Delete
export async function deleteTask(req, res) {
  const { id } = req.params;

  const task = await Task.findByPk(id);
  if (!task) return res.status(404).json({ message: "Task not found" });

  if (req.user.role !== "ADMIN" && task.createdByUserId !== req.user.id) {
    return res.status(403).json({ message: "Only creator can delete this task" });
  }

  await task.destroy();
  return res.json({ message: "Task deleted" });
}

// Employee self-assign
export async function assignSelf(req, res) {
  const { id } = req.params;

  if (req.user.role !== "EMPLOYEE") {
    return res.status(403).json({ message: "Only employee can self-assign" });
  }

  const task = await Task.findByPk(id);
  if (!task) return res.status(404).json({ message: "Task not found" });

  task.assignedToUserId = req.user.id;
  await task.save();

  return res.json({ task });
}

// Back-compat status endpoint
export async function updateStatus(req, res) {
  return updateTask(req, res);
}

// Assignment dropdown helper
export async function listEmployeesForAssign(req, res) {
  const employees = await User.findAll({
    where: { role: "EMPLOYEE" },
    attributes: ["id", "employeeCode", "email", "firstName", "lastName"],
    order: [["employeeCode", "ASC"]]
  });
  return res.json({ employees });
}

// Dashboard stats
export async function taskStats(req, res) {
  const where = {};
  if (req.user.role !== "ADMIN") {
    where[Op.or] = [{ createdByUserId: req.user.id }, { assignedToUserId: req.user.id }];
  }

  const total = await Task.count({ where });

  // Use Task.sequelize instead of importing sequelize
  const sq = Task.sequelize;

  const byStatusRows = await Task.findAll({
    where,
    attributes: ["status", [sq.fn("COUNT", sq.col("id")), "count"]],
    group: ["status"]
  });

  const byServiceRows = await Task.findAll({
    where,
    attributes: ["service", [sq.fn("COUNT", sq.col("id")), "count"]],
    group: ["service"]
  });

  const byStatus = Object.fromEntries(byStatusRows.map(r => [r.get("status"), Number(r.get("count"))]));
  const byService = Object.fromEntries(byServiceRows.map(r => [r.get("service"), Number(r.get("count"))]));

  return res.json({ total, byStatus, byService, statuses: STATUSES, services: SERVICES });
}
