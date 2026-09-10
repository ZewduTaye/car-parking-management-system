const prisma = require("../config/database");

// Get all customers
const getCustomers = async (req, res) => {
  try {
    const customers = await prisma.customer.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json({
      success: true,
      customers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get customer by ID
const getCustomerById = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const customer = await prisma.customer.findUnique({
      where: { id },
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    res.json({
      success: true,
      customer,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Create customer
const createCustomer = async (req, res) => {
  try {
    const { fullName, phone, email, carPlate, carModel } = req.body;

    if (!fullName || !phone || !carPlate) {
      return res.status(400).json({
        success: false,
        message: "Full name, phone and car plate are required",
      });
    }

    const existingCustomer = await prisma.customer.findUnique({
      where: { carPlate },
    });

    if (existingCustomer) {
      return res.status(400).json({
        success: false,
        message: "A customer with this car plate already exists",
      });
    }

    const customer = await prisma.customer.create({
      data: {
        fullName,
        phone,
        email,
        carPlate,
        carModel,
      },
    });

    res.status(201).json({
      success: true,
      message: "Customer created successfully",
      customer,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update customer
const updateCustomer = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const { fullName, phone, email, carPlate, carModel } = req.body;

    const customer = await prisma.customer.update({
      where: { id },
      data: {
        fullName,
        phone,
        email,
        carPlate,
        carModel,
      },
    });

    res.json({
      success: true,
      message: "Customer updated successfully",
      customer,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete customer
const deleteCustomer = async (req, res) => {
  try {
    const id = Number(req.params.id);

    await prisma.customer.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: "Customer deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
};