const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../config/database");

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.warn("WARNING: JWT_SECRET is not configured.");
}

const createToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

// ===============================
// CUSTOMER REGISTRATION
// ===============================
const register = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      vehiclePlate,
      carModel,
      password,
      confirmPassword,
    } = req.body;

    // Required fields
    if (
      !fullName ||
      !email ||
      !phone ||
      !vehiclePlate ||
      !password ||
      !confirmPassword
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all required fields.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPlate = vehiclePlate.trim().toUpperCase();

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    // Password validation
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters.",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match.",
      });
    }

    // Check existing User
    const existingUser = await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message:
          "An account with this email already exists. Please sign in.",
      });
    }

    // Check existing Customer email
    const existingCustomer = await prisma.customer.findFirst({
      where: {
        email: normalizedEmail,
      },
    });

    if (existingCustomer) {
      return res.status(409).json({
        success: false,
        message:
          "A customer with this email already exists.",
      });
    }

    // Check vehicle plate
    const existingPlate = await prisma.customer.findUnique({
      where: {
        carPlate: normalizedPlate,
      },
    });

    if (existingPlate) {
      return res.status(409).json({
        success: false,
        message:
          "This vehicle plate is already registered.",
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create User + Customer together
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: fullName.trim(),
          email: normalizedEmail,
          password: passwordHash,
          role: "CUSTOMER",
        },
      });

      const customer = await tx.customer.create({
        data: {
          fullName: fullName.trim(),
          email: normalizedEmail,
          phone: phone.trim(),
          carPlate: normalizedPlate,
          carModel: carModel?.trim() || null,
        },
      });

      return {
        user,
        customer,
      };
    });

    const token = createToken(result.user);

    return res.status(201).json({
      success: true,
      message: "Customer account created successfully.",
      token,
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        role: result.user.role,
        customerId: result.customer.id,
        fullName: result.customer.fullName,
        phone: result.customer.phone,
        carPlate: result.customer.carPlate,
        carModel: result.customer.carModel,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create customer account.",
    });
  }
};

// ===============================
// LOGIN
// ===============================
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const passwordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    let customer = null;

    if (user.role === "CUSTOMER") {
      customer = await prisma.customer.findFirst({
        where: {
          email: normalizedEmail,
        },
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          carPlate: true,
          carModel: true,
        },
      });
    }

    const token = createToken(user);

    return res.json({
      success: true,
      message: "Login successful.",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        customerId: customer?.id || null,
        fullName: customer?.fullName || null,
        phone: customer?.phone || null,
        carPlate: customer?.carPlate || null,
        carModel: customer?.carModel || null,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to sign in.",
    });
  }
};

// ===============================
// CURRENT USER
// ===============================
const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: req.user.id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    let customer = null;

    if (user.role === "CUSTOMER") {
      customer = await prisma.customer.findFirst({
        where: {
          email: user.email,
        },
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          carPlate: true,
          carModel: true,
        },
      });
    }

    return res.json({
      success: true,
      user: {
        ...user,
        customerId: customer?.id || null,
        fullName: customer?.fullName || null,
        phone: customer?.phone || null,
        carPlate: customer?.carPlate || null,
        carModel: customer?.carModel || null,
      },
    });
  } catch (error) {
    console.error("Get current user error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve user information.",
    });
  }
};

module.exports = {
  register,
  login,
  getMe,
};