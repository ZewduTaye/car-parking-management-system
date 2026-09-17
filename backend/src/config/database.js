const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

// Make sure DATABASE_URL exists
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined in the environment variables.");
}

// PostgreSQL adapter for Prisma 7
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

// Create Prisma client
const prisma = new PrismaClient({
  adapter,
});

module.exports = prisma;