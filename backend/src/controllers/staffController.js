const prisma = require("../config/database");
const { hashPassword } = require("../utils/passwordHash");

const staffSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  createdAt: true,
  updatedAt: true,
};

const validRoles = ["ADMIN", "STAFF"];

const parseId = (value) => {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
};

const validateStaff = ({ name, email, role, password }, requirePassword = false) => {
  if (!name || !email) return "Name and email are required";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "A valid email is required";
  if (role !== undefined && !validRoles.includes(role)) return "Invalid staff role";
  if (requirePassword && (!password || password.length < 8)) return "Password must be at least 8 characters";
  if (password !== undefined && password !== "" && password.length < 8) return "Password must be at least 8 characters";
  return null;
};

const getStaff = async (req, res) => {
  try {
    const staff = await prisma.user.findMany({
      select: staffSelect,
      orderBy: { createdAt: "desc" },
    });
    res.json({ success: true, staff });
  } catch (error) {
    console.error("Error getting staff:", error);
    res.status(500).json({ success: false, message: "Unable to load staff" });
  }
};

const createStaff = async (req, res) => {
  const { name, email, password, role } = req.body;
  const validationError = validateStaff({ name, email, password, role }, true);
  if (validationError) return res.status(400).json({ success: false, message: validationError });

  try {
    const staff = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: await hashPassword(password),
        role: role || "STAFF",
      },
      select: staffSelect,
    });
    res.status(201).json({ success: true, message: "Staff member created", staff });
  } catch (error) {
    if (error.code === "P2002") return res.status(409).json({ success: false, message: "Email already registered" });
    res.status(500).json({ success: false, message: "Unable to create staff member" });
  }
};

const updateStaff = async (req, res) => {
  const id = parseId(req.params.id);
  const { name, email, password, role } = req.body;
  if (!id) return res.status(400).json({ success: false, message: "Invalid staff ID" });

  const validationError = validateStaff({ name, email, password, role });
  if (validationError) return res.status(400).json({ success: false, message: validationError });

  try {
    const data = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role: role || "STAFF",
    };
    if (password) data.password = await hashPassword(password);

    const staff = await prisma.user.update({ where: { id }, data, select: staffSelect });
    res.json({ success: true, message: "Staff member updated", staff });
  } catch (error) {
    if (error.code === "P2025") return res.status(404).json({ success: false, message: "Staff member not found" });
    if (error.code === "P2002") return res.status(409).json({ success: false, message: "Email already registered" });
    res.status(500).json({ success: false, message: "Unable to update staff member" });
  }
};

const deleteStaff = async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ success: false, message: "Invalid staff ID" });
  if (id === req.user.id) return res.status(409).json({ success: false, message: "You cannot delete your own account" });

  try {
    const staff = await prisma.user.findUnique({ where: { id }, select: { id: true, role: true } });
    if (!staff) return res.status(404).json({ success: false, message: "Staff member not found" });

    if (staff.role === "ADMIN") {
      const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
      if (adminCount <= 1) return res.status(409).json({ success: false, message: "The last administrator cannot be deleted" });
    }

    await prisma.user.delete({ where: { id } });
    res.json({ success: true, message: "Staff member deleted" });
  } catch (error) {
    if (error.code === "P2003") return res.status(409).json({ success: false, message: "Staff member has related reservations and cannot be deleted" });
    res.status(500).json({ success: false, message: "Unable to delete staff member" });
  }
};

module.exports = {
  getStaff,
  createStaff,
  updateStaff,
  deleteStaff,
};
