require("dotenv").config();

const prisma = require("./config/database");
const { hashPassword } = require("./utils/passwordHash");

async function main() {
  const email = "admin@parking.com";
  const password = "Admin@12345";
  const name = "System Administrator";

  console.log("Creating admin account...");

  const existingUser = await prisma.user.findUnique({
    where: {
      email: email.toLowerCase(),
    },
  });

  if (existingUser) {
    console.log("\nAdmin account already exists.");
    console.log("Email:", email);
    console.log("Role:", existingUser.role);
    return;
  }

  const hashedPassword = await hashPassword(password);

  const admin = await prisma.user.create({
    data: {
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  console.log("\n========================================");
  console.log("   ADMIN ACCOUNT CREATED SUCCESSFULLY");
  console.log("========================================");
  console.log("Email:    " + admin.email);
  console.log("Password: " + password);
  console.log("Role:     " + admin.role);
  console.log("========================================\n");
}

main()
  .catch((error) => {
    console.error("\n❌ Failed to create admin:");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });