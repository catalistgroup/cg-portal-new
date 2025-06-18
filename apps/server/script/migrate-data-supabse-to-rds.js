const { Client } = require("pg");

// Source DB config
const sourceClient = new Client({
  host: "",
  user: "postgres",
  password: "",
  database: "postgres",
  port: 5432,
  ssl: { rejectUnauthorized: false },
});

// Destination DB config
const destClient = new Client({
  host: "",
  user: "postgres",
  password: "",
  database: "postgres",
  port: 5432,
  ssl: { rejectUnauthorized: false },
});

async function migrateData() {
  try {
    await sourceClient.connect();
    await destClient.connect();

    // 1. Fetch data from source
    const res = await sourceClient.query(
      "SELECT * FROM public.master_catalog ORDER BY id ASC ",
    );
    const items = res.rows;

    // 2. Insert into destination
    for (const item of items) {
      await destClient.query(
        `INSERT INTO "Catalog" (
        id, asin, name, brand, buying_price, selling_price, sku, upc, moq,
        buybox_price, amazon_fee, profit, margin, roi, selling_status, supplier,
        image_url, wfs_id, walmart_buybox, walmart_fees, walmart_margin,
        walmart_roi, created_at, updated_at, store_id, profitable
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9,
        $10, $11, $12, $13, $14, $15, $16,
        $17, $18, $19, $20, $21,
        $22, $23, $24, $25, $26
      )`,
        [
          item.id,
          item.asin,
          item.name,
          item.brand,
          item.buying_price,
          item.selling_price,
          item.sku ?? null,
          item.upc ?? null,
          item.moq ?? 100,
          item.buybox_price ?? null,
          item.amazon_fee ?? null,
          item.profit ?? null,
          item.margin ?? null,
          item.roi ?? null,
          item.selling_status ?? false,
          item.supplier ?? null,
          item.image_url ?? null,
          item.wfs_id ?? null,
          item.walmart_buybox ?? null,
          item.walmart_fees ?? null,
          item.walmart_margin ?? null,
          item.walmart_roi ?? null,
          item.created_at ?? new Date(),
          item.updated_at ?? new Date(),
          item["store-id"] ?? 1,
          item.profitable ?? false,
        ],
      );
    }

    console.log("Migration complete");
  } catch (error) {
    console.error("Migration failed", error);
  } finally {
    await sourceClient.end();
    await destClient.end();
  }
}

migrateData();
