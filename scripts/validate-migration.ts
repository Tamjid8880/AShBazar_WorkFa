import "dotenv/config";
import { MongoClient } from "mongodb";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function printRow(name: string, mongoCount: number, pgCount: number) {
  const ok = mongoCount === pgCount ? "OK" : "MISMATCH";
  console.log(
    `${name.padEnd(16)} | mongo=${String(mongoCount).padStart(6)} | pg=${String(pgCount).padStart(6)} | ${ok}`
  );
}

async function countMongoOrderItems(db: ReturnType<MongoClient["db"]>, pick: (...names: string[]) => ReturnType<ReturnType<MongoClient["db"]>["collection"]>) {
  const ordersCol = pick("orders");
  let total = 0;
  const cursor = ordersCol.find({}, { projection: { items: 1 } });
  for await (const doc of cursor) {
    const items = doc.items;
    total += Array.isArray(items) ? items.length : 0;
  }
  return total;
}

async function main() {
  const mongoUrl = process.env.MONGO_URL;
  const mongoDbName = process.env.MONGO_DB_NAME ?? "test";
  if (!mongoUrl) throw new Error("MONGO_URL is required in .env");

  const mongo = new MongoClient(mongoUrl);
  await mongo.connect();
  const db = mongo.db(mongoDbName);

  const collections = new Set((await db.listCollections().toArray()).map((c) => c.name));
  const pick = (...names: string[]) => db.collection(names.find((n) => collections.has(n)) ?? names[0]);

  const mongoCounts = {
    categories: await pick("categories").countDocuments({}),
    subCategories: await pick("subcategories", "subCategories").countDocuments({}),
    brands: await pick("brands").countDocuments({}),
    variantTypes: await pick("varianttypes", "variantTypes").countDocuments({}),
    variants: await pick("variants").countDocuments({}),
    products: await pick("products").countDocuments({}),
    coupons: await pick("coupons", "couponcodes", "couponCodes").countDocuments({}),
    posters: await pick("posters").countDocuments({}),
    users: await pick("users").countDocuments({}),
    notifications: await pick("notifications").countDocuments({}),
    orders: await pick("orders").countDocuments({})
  };

  const mongoOrderItems = await countMongoOrderItems(db, pick);

  const pgCounts = {
    categories: await prisma.category.count(),
    subCategories: await prisma.subCategory.count(),
    brands: await prisma.brand.count(),
    variantTypes: await prisma.variantType.count(),
    variants: await prisma.variant.count(),
    products: await prisma.product.count(),
    coupons: await prisma.couponCode.count(),
    posters: await prisma.poster.count(),
    users: await prisma.user.count(),
    notifications: await prisma.notification.count(),
    orders: await prisma.order.count()
  };

  console.log("=== Count Validation ===");
  printRow("categories", mongoCounts.categories, pgCounts.categories);
  printRow("subCategories", mongoCounts.subCategories, pgCounts.subCategories);
  printRow("brands", mongoCounts.brands, pgCounts.brands);
  printRow("variantTypes", mongoCounts.variantTypes, pgCounts.variantTypes);
  printRow("variants", mongoCounts.variants, pgCounts.variants);
  printRow("products", mongoCounts.products, pgCounts.products);
  printRow("coupons", mongoCounts.coupons, pgCounts.coupons);
  printRow("posters", mongoCounts.posters, pgCounts.posters);
  printRow("users", mongoCounts.users, pgCounts.users);
  printRow("notifications", mongoCounts.notifications, pgCounts.notifications);
  printRow("orders", mongoCounts.orders, pgCounts.orders);

  const pgOrderItems = await prisma.orderItem.count();
  const orderItemsOk = mongoOrderItems === pgOrderItems ? "OK" : "MISMATCH";
  console.log(
    `orderItems        | mongo=${String(mongoOrderItems).padStart(6)} | pg=${String(pgOrderItems).padStart(6)} | ${orderItemsOk}`
  );

  console.log("\n=== Integrity Checks (PostgreSQL FK sanity) ===");

  const [orphanOrders] = await prisma.$queryRaw<Array<{ count: bigint }>>`
    SELECT COUNT(*)::bigint AS count
    FROM "Order" o
    WHERE NOT EXISTS (SELECT 1 FROM "User" u WHERE u.id = o."userID")
  `;
  const orphanOrdersCount = Number(orphanOrders?.count ?? 0);

  const ordersWithNoItems = await prisma.order.count({
    where: { items: { none: {} } }
  });

  const [productsBadCategory] = await prisma.$queryRaw<Array<{ count: bigint }>>`
    SELECT COUNT(*)::bigint AS count
    FROM "Product" p
    WHERE NOT EXISTS (SELECT 1 FROM "Category" c WHERE c.id = p."proCategoryId")
  `;
  const productsBadCategoryCount = Number(productsBadCategory?.count ?? 0);

  const [productsBadSubCategory] = await prisma.$queryRaw<Array<{ count: bigint }>>`
    SELECT COUNT(*)::bigint AS count
    FROM "Product" p
    WHERE NOT EXISTS (SELECT 1 FROM "SubCategory" s WHERE s.id = p."proSubCategoryId")
  `;
  const productsBadSubCategoryCount = Number(productsBadSubCategory?.count ?? 0);

  const [orderItemsBadProduct] = await prisma.$queryRaw<Array<{ count: bigint }>>`
    SELECT COUNT(*)::bigint AS count
    FROM "OrderItem" i
    WHERE NOT EXISTS (SELECT 1 FROM "Product" p WHERE p.id = i."productID")
  `;
  const orderItemsBadProductCount = Number(orderItemsBadProduct?.count ?? 0);

  const [couponsBadCategory] = await prisma.$queryRaw<Array<{ count: bigint }>>`
    SELECT COUNT(*)::bigint AS count
    FROM "CouponCode" c
    WHERE c."applicableCategoryId" IS NOT NULL
      AND NOT EXISTS (SELECT 1 FROM "Category" x WHERE x.id = c."applicableCategoryId")
  `;
  const couponsBadCategoryCount = Number(couponsBadCategory?.count ?? 0);

  console.log(`orders referencing missing user:        ${orphanOrdersCount}`);
  console.log(`orders with zero line items:            ${ordersWithNoItems}`);
  console.log(`products referencing missing category:  ${productsBadCategoryCount}`);
  console.log(`products referencing missing subCategory: ${productsBadSubCategoryCount}`);
  console.log(`order items referencing missing product: ${orderItemsBadProductCount}`);
  console.log(`coupons referencing missing category:   ${couponsBadCategoryCount}`);

  const countMismatches = Object.keys(mongoCounts).filter(
    (k) => mongoCounts[k as keyof typeof mongoCounts] !== pgCounts[k as keyof typeof pgCounts]
  );
  const orderItemsMismatch = mongoOrderItems !== pgOrderItems;
  const integrityIssues =
    orphanOrdersCount +
    ordersWithNoItems +
    productsBadCategoryCount +
    productsBadSubCategoryCount +
    orderItemsBadProductCount +
    couponsBadCategoryCount;

  if (countMismatches.length === 0 && !orderItemsMismatch && integrityIssues === 0) {
    console.log("\nMigration validation looks good.");
  } else {
    if (countMismatches.length > 0) {
      console.log(`\nCount mismatches on: ${countMismatches.join(", ")}`);
    }
    if (orderItemsMismatch) {
      console.log("\nOrder line item counts differ between Mongo and Postgres.");
    }
    if (integrityIssues > 0) {
      console.log("\nMigration validation found relation or data issues. Review rows above.");
    }
    process.exitCode = 1;
  }

  await mongo.close();
  await prisma.$disconnect();
}

main().catch(async (error) => {
  console.error(error);
  await prisma.$disconnect();
  process.exit(1);
});
