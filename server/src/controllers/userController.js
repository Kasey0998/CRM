import bcrypt from "bcryptjs";
import { User } from "../models/index.js";

export async function createEmployee(req, res) {
  const { email, password, firstName, lastName, address, phone } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ message: "email and password are required" });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const exists = await User.findOne({ where: { email: normalizedEmail } });
  if (exists) return res.status(409).json({ message: "Email already exists" });

  const maxCode = await User.max("employeeCode", { where: { role: "EMPLOYEE" } });
  const nextEmployeeCode = (Number(maxCode) || 0) + 1;

  const passwordHash = await bcrypt.hash(password, 10);

  const employee = await User.create({
    role: "EMPLOYEE",
    email: normalizedEmail,
    passwordHash,
    employeeCode: nextEmployeeCode,
    firstName: firstName || null,
    lastName: lastName || null,
    address: address || null,
    phone: phone || null
  });

  return res.status(201).json({
    user: {
      id: employee.id,
      employeeCode: employee.employeeCode,
      role: employee.role,
      email: employee.email,
      firstName: employee.firstName,
      lastName: employee.lastName,
      address: employee.address,
      phone: employee.phone
    }
  });
}

export async function listEmployees(req, res) {
  const employees = await User.findAll({
    where: { role: "EMPLOYEE" },
    attributes: { exclude: ["passwordHash"] },
    order: [["employeeCode", "ASC"]]
  });
  return res.json({ employees });
}

export async function updateEmployee(req, res) {
  const { id } = req.params;
  const { email, password, firstName, lastName, address, phone } = req.body || {};

  const employee = await User.findByPk(id);
  if (!employee || employee.role !== "EMPLOYEE") {
    return res.status(404).json({ message: "Employee not found" });
  }

  if (email && email.trim().toLowerCase() !== employee.email) {
    const newEmail = email.trim().toLowerCase();
    const exists = await User.findOne({ where: { email: newEmail } });
    if (exists) return res.status(409).json({ message: "Email already exists" });
    employee.email = newEmail;
  }

  if (typeof firstName !== "undefined") employee.firstName = firstName || null;
  if (typeof lastName !== "undefined") employee.lastName = lastName || null;
  if (typeof address !== "undefined") employee.address = address || null;
  if (typeof phone !== "undefined") employee.phone = phone || null;

  if (password && password.trim()) {
    employee.passwordHash = await bcrypt.hash(password, 10);
  }

  await employee.save();

  return res.json({
    employee: {
      id: employee.id,
      employeeCode: employee.employeeCode,
      role: employee.role,
      email: employee.email,
      firstName: employee.firstName,
      lastName: employee.lastName,
      address: employee.address,
      phone: employee.phone
    }
  });
}

export async function deleteEmployee(req, res) {
  const { id } = req.params;

  const employee = await User.findByPk(id);
  if (!employee || employee.role !== "EMPLOYEE") {
    return res.status(404).json({ message: "Employee not found" });
  }

  await employee.destroy();
  return res.json({ message: "Employee deleted" });
}
