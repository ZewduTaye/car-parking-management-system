require("dotenv").config();

const bcrypt = require("bcryptjs");
const prisma = require("./config/database");

const ADMIN_EMAIL = "admin@parking.com";
const ADMIN_NAME = "System Administrator";

// Get password from environment variable
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

async function createOrResetAdmin() {
  try {
    if (!ADMIN_PASSWORD) {
      throw new Error(
        "ADMIN_PASSWORD is not defined in your .env file."
      );
    }

    console.log("Creating/resetting admin account...");

    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);

    const existingAdmin = await prisma.user.findUnique({
      where: {
        email: ADMIN_EMAIL,
      },
    });

    if (existingAdmin) {
      await prisma.user.update({
        where: {
          email: ADMIN_EMAIL,
        },
        data: {
          name: ADMIN_NAME,
          password: hashedPassword,
          role: "ADMIN",
        },
      });

      console.log("");
      console.log("========================================");
      console.log("ADMIN ACCOUNT RESET SUCCESSFULLY");
      console.log("========================================");
      console.log(`Email: ${ADMIN_EMAIL}`);
      console.log("Password: The value stored in ADMIN_PASSWORD");
      console.log("Role: ADMIN");
      console.log("========================================");
    } else {
      await prisma.user.create({
        data: {
          name: ADMIN_NAME,
          email: ADMIN_EMAIL,
          password: hashedPassword,
          role: "ADMIN",
        },
      });

      console.log("");
      console.log("========================================");
      console.log("ADMIN ACCOUNT CREATED SUCCESSFULLY");
      console.log("========================================");
      console.log(`Email: ${ADMIN_EMAIL}`);
      console.log("Password: The value stored in ADMIN_PASSWORD");
      console.log("Role: ADMIN");
      console.log("========================================");
    }
  } catch (error) {
    console.error("");
    console.error("FAILED TO CREATE/RESET ADMIN");
    console.error("----------------------------------------");
    console.error(error);
    console.error("----------------------------------------");
  } finally {
    await prisma.$disconnect();
  }
}

createOrResetAdmin();