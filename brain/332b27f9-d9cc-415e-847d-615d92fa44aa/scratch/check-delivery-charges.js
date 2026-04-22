const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const charges = await prisma.deliveryCharge.findMany();
  console.log("Delivery Charges in DB:", JSON.stringify(charges, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
