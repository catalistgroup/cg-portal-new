import prisma from "../configs/database";
import bcrypt from "bcryptjs";
import { faker } from "@faker-js/faker";
import {
  Catalog,
  PurchaseOrder,
  PurchaseOrderItem,
  Store,
  User,
} from ".prisma/client";

async function main(): Promise<void> {
  console.log("Clearing existing data...");

  await prisma.purchaseOrderItem.deleteMany({});
  await prisma.purchaseOrder.deleteMany({});
  await prisma.catalog.deleteMany({});
  await prisma.store.deleteMany({});
  await prisma.user.deleteMany({});

  console.log("Existing data cleared.");

  faker.seed(123);

  const users: Omit<User, "id">[] = [];
  for (let i = 0; i < 5; i++) {
    const hashedPassword = await bcrypt.hash("password123", 10);
    users.push({
      name: faker.person.fullName(),
      email: `example${i}@store.com`,
      password: hashedPassword,
      phone: faker.phone.number(),
      type: faker.helpers.arrayElement(["normal", "store"]),
      is_active: true,
      is_superuser: false,
      is_deleted: false,
      created_at: faker.date.past(),
      updated_at: new Date(),
      deleted_at: null,
    });
  }
  for (const user of users) {
    await prisma.user.create({ data: user });
  }
  const createdUsers = await prisma.user.findMany();

  const stores: Omit<Store, "id">[] = [];
  for (const user of createdUsers) {
    for (let i = 0; i < 2; i++) {
      stores.push({
        name: faker.company.name(),
        marketplace: faker.company.name(),
        api_client: faker.internet.password(),
        api_secret: faker.internet.password(),
        is_active: true,
        is_deleted: false,
        user_id: user.id,
        created_at: faker.date.past(),
        updated_at: new Date(),
        deleted_at: null,
      });
    }
  }
  for (const store of stores) {
    await prisma.store.create({ data: store });
  }
  const createdStores = await prisma.store.findMany();

  const catalogs: Omit<Catalog, "id">[] = [];
  const catalogsPerStore = 100;
  for (const store of createdStores) {
    for (let i = 0; i < catalogsPerStore; i++) {
      catalogs.push({
        asin: faker.string.alphanumeric(10).toUpperCase(),
        name: faker.commerce.productName(),
        brand: faker.company.name(),
        buying_price: faker.commerce.price({ min: 5, max: 800, dec: 2 }),
        selling_price: faker.commerce.price({ min: 10, max: 1000, dec: 2 }),
        sku: faker.string.alphanumeric(8).toUpperCase(),
        upc: faker.string.numeric(12),
        supplier: faker.company.name(),
        moq: faker.number.int({ min: 1, max: 100 }),
        buybox_price: faker.commerce.price({ min: 10, max: 1100, dec: 2 }),
        amazon_fee: faker.commerce.price({ min: 1, max: 50, dec: 2 }),
        profit: faker.commerce.price({ min: 1, max: 300, dec: 2 }),
        margin: faker.commerce.price({ min: 1, max: 100, dec: 2 }),
        roi: parseFloat(faker.commerce.price({ min: 1, max: 100, dec: 2 })),
        selling_status: faker.datatype.boolean(),
        image_url: faker.image.urlLoremFlickr({ category: "product" }),
        store_id: store.id,
        created_at: faker.date.past(),
        updated_at: new Date(),
        walmart_buybox: null,
        walmart_fees: null,
        walmart_margin: null,
        walmart_profit: null,
        walmart_roi: null,
        wfs_id: null,
      });
    }
  }
  console.log("Inserting catalogs...");
  await prisma.catalog.createMany({ data: catalogs, skipDuplicates: true });
  console.log("Catalogs inserted.");

  const allCatalogs = await prisma.catalog.findMany();

  const purchaseOrders: Omit<PurchaseOrder, "id">[] = [];
  for (const store of createdStores) {
    for (let i = 0; i < 3; i++) {
      const user = createdUsers.find((user: User) => user.id === store.user_id);
      purchaseOrders.push({
        order_placed_at: faker.date.recent(),
        order_id: faker.string.uuid(),
        order_status: faker.helpers.arrayElement(["pending", "completed", "cancelled"]),
        is_draft: faker.datatype.boolean(),
        is_api_succeed: faker.datatype.boolean(),
        created_at: faker.date.past(),
        updated_at: new Date(),
        store_id: store.id,
        user_id: user?.id ?? createdUsers[0].id,
        paymentMethod: faker.helpers.arrayElement(["credit_card", "paypal", "wire_transfer"]),
        prepRequired: faker.helpers.arrayElement(["none", "standard", "special"]),
        ungateAssistance: faker.datatype.boolean() ? "needed" : "not_needed",
        billingCountry: faker.address.country(),
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        email: faker.internet.email(),
        phone: faker.phone.number(),
        company: faker.company.name(),
        storefront: faker.company.name(),
        street: faker.address.streetAddress(),
        city: faker.address.city(),
        state: faker.address.state(),
        zip: faker.address.zipCode(),
      });
    }
  }
  const createdOrders = [];
  for (const order of purchaseOrders) {
    const createdOrder = await prisma.purchaseOrder.create({ data: order });
    createdOrders.push(createdOrder);
  }

  const purchaseOrderItems: Omit<PurchaseOrderItem, "id">[] = [];
  for (const order of createdOrders) {
    const catalogsForStore = allCatalogs.filter(
      (catalog: Catalog) => catalog.store_id === order.store_id,
    );
    for (let i = 0; i < 5; i++) {
      const catalog = faker.helpers.arrayElement(catalogsForStore) as Catalog;
      if (!catalog) continue;
      purchaseOrderItems.push({
        asin: catalog.asin,
        title: catalog.name,
        brand: catalog.brand,
        unit_price: Number(catalog.selling_price),
        quantity: faker.number.int({ min: 1, max: 10 }),
        sku: catalog.sku || '',
        upc: catalog.upc || '',
        supplier: catalog.supplier || '',
        purchase_order_id: order.id,
      });
    }
  }
  for (const item of purchaseOrderItems) {
    await prisma.purchaseOrderItem.create({ data: item });
  }

  console.log("Seeding finished.");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
