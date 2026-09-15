const prisma = require("../config/database");

const isValidId = (id) => Number.isInteger(id) && id > 0;

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

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid customer ID",
      });
    }

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
      message: "Unable to load customer",
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

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid customer ID",
      });
    }

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
    if (error.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: "A customer with this car plate already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Unable to update customer",
    });
  }
};

// Delete customer
const deleteCustomer = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid customer ID",
      });
    }

    const [reservationCount, vipReservationCount] = await Promise.all([
      prisma.reservation.count({ where: { customerId: id } }),
      prisma.vIPReservation.count({ where: { customerId: id } }),
    ]);

    if (reservationCount > 0 || vipReservationCount > 0) {
      return res.status(409).json({
        success: false,
        message: "Customer cannot be deleted while reservations exist",
      });
    }

    await prisma.customer.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: "Customer deleted successfully",
    });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    res.status(500).json({
      success: false,
      message: "Unable to delete customer",
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