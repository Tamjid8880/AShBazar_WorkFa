import "dotenv/config";
import { MongoClient } from "mongodb";
import { PrismaClient, CouponStatus, DiscountType, OrderStatus, PaymentMethod } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

type Doc = Record<string, any>;

function asId(value: unknown): string | null {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (typeof value === "object" && value && "toString" in value) return String(value);
  return null;
}

function asDate(value: unknown, fallback = new Date()): Date {
  if (!value) return fallback;
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return fallback;
  return date;
}

function asNumber(value: unknown, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function toDiscountType(value: unknown): DiscountType {
  return value === "fixed" ? "fixed" : "percentage";
}

function toCouponStatus(value: unknown): CouponStatus {
  return value === "inactive" ? "inactive" : "active";
}

function toOrderStatus(value: unknown): OrderStatus {
  const raw = String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");
  const map: Record<string, OrderStatus> = {
    pending: "pending",
    accepted: "accepted",
    accept: "accepted",
    packed: "packed",
    on_the_way: "on_the_way",
    ontheway: "on_the_way",
    processing: "processing",
    shipped: "shipped",
    delivered: "delivered",
    cancelled: "cancelled",
    cancel: "cancelled"
  };
  return map[raw] ?? "pending";
}

function stockAlreadyAccounted(status: OrderStatus) {
  return status === "delivered";
}

function toPaymentMethod(value: unknown): PaymentMethod {
  return value === "prepaid" ? "prepaid" : "cod";
}

async function resetDatabase() {
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.poster.deleteMany();
  await prisma.couponCode.deleteMany();
  await prisma.product.deleteMany();
  await prisma.variant.deleteMany();
  await prisma.variantType.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.subCategory.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
}

async function main() {
  const mongoUrl = process.env.MONGO_URL;
  const mongoDbName = process.env.MONGO_DB_NAME ?? "test";
  const reset = process.env.MIGRATION_TRUNCATE === "true";

  if (!mongoUrl) {
    throw new Error("MONGO_URL is required in environment variables.");
  }

  const mongo = new MongoClient(mongoUrl);
  await mongo.connect();
  const db = mongo.db(mongoDbName);
  const existingCollections = new Set((await db.listCollections({}, { nameOnly: true }).toArray()).map((c) => c.name));

  const pickCollection = (...names: string[]) => {
    const matched = names.find((name) => existingCollections.has(name));
    return db.collection(matched ?? names[0]);
  };

  if (reset) {
    console.log("Reset mode enabled. Clearing PostgreSQL tables...");
    await resetDatabase();
  }

  const categories = await pickCollection("categories").find({}).toArray();
  for (const doc of categories) {
    await prisma.category.upsert({
      where: { id: asId(doc._id)! },
      update: {
        name: doc.name ?? "",
        image: doc.image ?? "no_url",
        createdAt: asDate(doc.createdAt),
        updatedAt: asDate(doc.updatedAt)
      },
      create: {
        id: asId(doc._id)!,
        name: doc.name ?? "",
        image: doc.image ?? "no_url",
        createdAt: asDate(doc.createdAt),
        updatedAt: asDate(doc.updatedAt)
      }
    });
  }
  console.log(`Migrated categories: ${categories.length}`);

  const subCategories = await pickCollection("subcategories", "subCategories").find({}).toArray();
  for (const doc of subCategories) {
    const categoryId = asId(doc.categoryId);
    if (!categoryId) continue;
    await prisma.subCategory.upsert({
      where: { id: asId(doc._id)! },
      update: {
        name: doc.name ?? "",
        categoryId,
        createdAt: asDate(doc.createdAt),
        updatedAt: asDate(doc.updatedAt)
      },
      create: {
        id: asId(doc._id)!,
        name: doc.name ?? "",
        categoryId,
        createdAt: asDate(doc.createdAt),
        updatedAt: asDate(doc.updatedAt)
      }
    });
  }
  console.log(`Migrated subCategories: ${subCategories.length}`);

  const brands = await pickCollection("brands").find({}).toArray();
  for (const doc of brands) {
    const subcategoryId = asId(doc.subcategoryId);
    if (!subcategoryId) continue;
    await prisma.brand.upsert({
      where: { id: asId(doc._id)! },
      update: {
        name: doc.name ?? "",
        subcategoryId,
        createdAt: asDate(doc.createdAt),
        updatedAt: asDate(doc.updatedAt)
      },
      create: {
        id: asId(doc._id)!,
        name: doc.name ?? "",
        subcategoryId,
        createdAt: asDate(doc.createdAt),
        updatedAt: asDate(doc.updatedAt)
      }
    });
  }
  console.log(`Migrated brands: ${brands.length}`);

  const variantTypes = await pickCollection("varianttypes", "variantTypes").find({}).toArray();
  for (const doc of variantTypes) {
    await prisma.variantType.upsert({
      where: { id: asId(doc._id)! },
      update: {
        name: doc.name ?? "",
        type: doc.type ?? "",
        createdAt: asDate(doc.createdAt),
        updatedAt: asDate(doc.updatedAt)
      },
      create: {
        id: asId(doc._id)!,
        name: doc.name ?? "",
        type: doc.type ?? "",
        createdAt: asDate(doc.createdAt),
        updatedAt: asDate(doc.updatedAt)
      }
    });
  }
  console.log(`Migrated variantTypes: ${variantTypes.length}`);

  const variants = await pickCollection("variants").find({}).toArray();
  for (const doc of variants) {
    const variantTypeId = asId(doc.variantTypeId);
    if (!variantTypeId) continue;
    await prisma.variant.upsert({
      where: { id: asId(doc._id)! },
      update: {
        name: doc.name ?? "",
        variantTypeId,
        createdAt: asDate(doc.createdAt),
        updatedAt: asDate(doc.updatedAt)
      },
      create: {
        id: asId(doc._id)!,
        name: doc.name ?? "",
        variantTypeId,
        createdAt: asDate(doc.createdAt),
        updatedAt: asDate(doc.updatedAt)
      }
    });
  }
  console.log(`Migrated variants: ${variants.length}`);

  const products = await pickCollection("products").find({}).toArray();
  for (const doc of products) {
    const categoryId = asId(doc.proCategoryId);
    const subCategoryId = asId(doc.proSubCategoryId);
    if (!categoryId || !subCategoryId) continue;

    const variantIds = Array.isArray(doc.proVariantId) ? doc.proVariantId.map((v: unknown) => asId(v)).filter(Boolean) as string[] : [];
    await prisma.product.upsert({
      where: { id: asId(doc._id)! },
      update: {
        name: doc.name ?? "",
        description: doc.description ?? null,
        quantity: Math.trunc(asNumber(doc.quantity)),
        price: asNumber(doc.price),
        offerPrice: doc.offerPrice === undefined || doc.offerPrice === null ? null : asNumber(doc.offerPrice),
        proCategoryId: categoryId,
        proSubCategoryId: subCategoryId,
        proBrandId: asId(doc.proBrandId),
        proVariantTypeId: asId(doc.proVariantTypeId),
        proVariantId: variantIds,
        images: Array.isArray(doc.images) ? doc.images : [],
        createdAt: asDate(doc.createdAt),
        updatedAt: asDate(doc.updatedAt)
      },
      create: {
        id: asId(doc._id)!,
        name: doc.name ?? "",
        description: doc.description ?? null,
        quantity: Math.trunc(asNumber(doc.quantity)),
        price: asNumber(doc.price),
        offerPrice: doc.offerPrice === undefined || doc.offerPrice === null ? null : asNumber(doc.offerPrice),
        proCategoryId: categoryId,
        proSubCategoryId: subCategoryId,
        proBrandId: asId(doc.proBrandId),
        proVariantTypeId: asId(doc.proVariantTypeId),
        proVariantId: variantIds,
        images: Array.isArray(doc.images) ? doc.images : [],
        createdAt: asDate(doc.createdAt),
        updatedAt: asDate(doc.updatedAt)
      }
    });
  }
  console.log(`Migrated products: ${products.length}`);

  const coupons = await pickCollection("coupons", "couponcodes", "couponCodes").find({}).toArray();
  for (const doc of coupons) {
    await prisma.couponCode.upsert({
      where: { id: asId(doc._id)! },
      update: {
        couponCode: doc.couponCode ?? "",
        discountType: toDiscountType(doc.discountType),
        discountAmount: asNumber(doc.discountAmount),
        minimumPurchaseAmount: asNumber(doc.minimumPurchaseAmount),
        endDate: asDate(doc.endDate),
        status: toCouponStatus(doc.status),
        applicableCategoryId: asId(doc.applicableCategory),
        applicableSubCatId: asId(doc.applicableSubCategory),
        applicableProductId: asId(doc.applicableProduct),
        createdAt: asDate(doc.createdAt),
        updatedAt: asDate(doc.updatedAt)
      },
      create: {
        id: asId(doc._id)!,
        couponCode: doc.couponCode ?? "",
        discountType: toDiscountType(doc.discountType),
        discountAmount: asNumber(doc.discountAmount),
        minimumPurchaseAmount: asNumber(doc.minimumPurchaseAmount),
        endDate: asDate(doc.endDate),
        status: toCouponStatus(doc.status),
        applicableCategoryId: asId(doc.applicableCategory),
        applicableSubCatId: asId(doc.applicableSubCategory),
        applicableProductId: asId(doc.applicableProduct),
        createdAt: asDate(doc.createdAt),
        updatedAt: asDate(doc.updatedAt)
      }
    });
  }
  console.log(`Migrated coupons: ${coupons.length}`);

  const posters = await pickCollection("posters").find({}).toArray();
  for (const doc of posters) {
    await prisma.poster.upsert({
      where: { id: asId(doc._id)! },
      update: {
        posterName: doc.posterName ?? "",
        imageUrl: doc.imageUrl ?? "no_url",
        createdAt: asDate(doc.createdAt),
        updatedAt: asDate(doc.updatedAt)
      },
      create: {
        id: asId(doc._id)!,
        posterName: doc.posterName ?? "",
        imageUrl: doc.imageUrl ?? "no_url",
        createdAt: asDate(doc.createdAt),
        updatedAt: asDate(doc.updatedAt)
      }
    });
  }
  console.log(`Migrated posters: ${posters.length}`);

  const users = await pickCollection("users").find({}).toArray();
  for (const doc of users) {
    const rawPassword = String(doc.password ?? "");
    const looksHashed = rawPassword.startsWith("$2a$") || rawPassword.startsWith("$2b$") || rawPassword.startsWith("$2y$");
    const passwordHash = looksHashed ? rawPassword : await bcrypt.hash(rawPassword, 10);

    await prisma.user.upsert({
      where: { id: asId(doc._id)! },
      update: {
        name: doc.name ?? "",
        password: passwordHash,
        createdAt: asDate(doc.createdAt),
        updatedAt: asDate(doc.updatedAt)
      },
      create: {
        id: asId(doc._id)!,
        name: doc.name ?? "",
        password: passwordHash,
        createdAt: asDate(doc.createdAt),
        updatedAt: asDate(doc.updatedAt)
      }
    });
  }
  console.log(`Migrated users: ${users.length}`);

  const notifications = await pickCollection("notifications").find({}).toArray();
  for (const doc of notifications) {
    await prisma.notification.upsert({
      where: { id: asId(doc._id)! },
      update: {
        notificationId: doc.notificationId ?? `legacy_${asId(doc._id)}`,
        title: doc.title ?? "",
        description: doc.description ?? "",
        imageUrl: doc.imageUrl ?? null,
        createdAt: asDate(doc.createdAt),
        updatedAt: asDate(doc.updatedAt)
      },
      create: {
        id: asId(doc._id)!,
        notificationId: doc.notificationId ?? `legacy_${asId(doc._id)}`,
        title: doc.title ?? "",
        description: doc.description ?? "",
        imageUrl: doc.imageUrl ?? null,
        createdAt: asDate(doc.createdAt),
        updatedAt: asDate(doc.updatedAt)
      }
    });
  }
  console.log(`Migrated notifications: ${notifications.length}`);

  const orders = await pickCollection("orders").find({}).toArray();
  for (const doc of orders) {
    const orderId = asId(doc._id)!;
    const userID = asId(doc.userID);
    if (!userID) continue;

    const orderStatus = toOrderStatus(doc.orderStatus);
    const stockDeducted = stockAlreadyAccounted(orderStatus);

    await prisma.order.upsert({
      where: { id: orderId },
      update: {
        userID,
        orderDate: asDate(doc.orderDate),
        orderStatus,
        stockDeducted,
        totalPrice: asNumber(doc.totalPrice),
        phone: doc.shippingAddress?.phone ?? null,
        street: doc.shippingAddress?.street ?? null,
        city: doc.shippingAddress?.city ?? null,
        state: doc.shippingAddress?.state ?? null,
        postalCode: doc.shippingAddress?.postalCode ?? null,
        country: doc.shippingAddress?.country ?? null,
        paymentMethod: toPaymentMethod(doc.paymentMethod),
        couponCodeId: asId(doc.couponCode),
        subtotal: asNumber(doc.orderTotal?.subtotal, 0),
        discount: asNumber(doc.orderTotal?.discount, 0),
        total: asNumber(doc.orderTotal?.total, 0),
        trackingUrl: doc.trackingUrl ?? null
      },
      create: {
        id: orderId,
        userID,
        orderDate: asDate(doc.orderDate),
        orderStatus,
        stockDeducted,
        totalPrice: asNumber(doc.totalPrice),
        phone: doc.shippingAddress?.phone ?? null,
        street: doc.shippingAddress?.street ?? null,
        city: doc.shippingAddress?.city ?? null,
        state: doc.shippingAddress?.state ?? null,
        postalCode: doc.shippingAddress?.postalCode ?? null,
        country: doc.shippingAddress?.country ?? null,
        paymentMethod: toPaymentMethod(doc.paymentMethod),
        couponCodeId: asId(doc.couponCode),
        subtotal: asNumber(doc.orderTotal?.subtotal, 0),
        discount: asNumber(doc.orderTotal?.discount, 0),
        total: asNumber(doc.orderTotal?.total, 0),
        trackingUrl: doc.trackingUrl ?? null
      }
    });

    await prisma.orderItem.deleteMany({ where: { orderId } });
    const items = Array.isArray(doc.items) ? doc.items : [];
    for (const item of items) {
      const productId = asId(item.productID);
      if (!productId) continue;
      await prisma.orderItem.create({
        data: {
          orderId,
          productID: productId,
          productName: item.productName ?? "",
          quantity: Math.trunc(asNumber(item.quantity, 1)),
          price: asNumber(item.price),
          variant: item.variant ?? null
        }
      });
    }
  }
  console.log(`Migrated orders: ${orders.length}`);

  await mongo.close();
  await prisma.$disconnect();
  console.log("MongoDB to PostgreSQL migration completed.");
}

main().catch(async (error) => {
  console.error(error);
  await prisma.$disconnect();
  process.exit(1);
});
