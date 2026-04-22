const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("=== DeliveryCharge (Legacy) ===");
  const dcs = await prisma.deliveryCharge.findMany();
  console.log(JSON.stringify(dcs, null, 2));

  console.log("\n=== ShippingZone (New) ===");
  const zones = await prisma.shippingZone.findMany({
    include: {
      countries: true,
      methods: {
        include: { flatRate: true, rates: true }
      }
    }
  });
  console.log(JSON.stringify(zones, null, 2));
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
