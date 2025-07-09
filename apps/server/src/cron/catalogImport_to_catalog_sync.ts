import cron from "node-cron";
import { PrismaClient } from "@prisma/client";
import {
  calcWholesalePrice,
  calcSellingPrice,
} from "../utils/catalog-helper-function";
import axios from "axios";
import { EXTERNAL_API_URL, EXTERNAL_WEBHOOK_TOKEN } from "../constants";

const prisma = new PrismaClient();

// Configuration
const CRON_SCHEDULE = "0 4 * * *"; // Run daily at 4:00 am UTC
const BATCH_SIZE = 100; // Process records in batches
const MAX_RETRIES = 3;
const RETRY_DELAY = 5000; // 5 seconds

// Type definitions
interface ImportStats {
  updated: number;
  errors: number;
  created: number;
  deleted: number;
  processed: number;
  endTime: Date | null;
  startTime: Date | null;
}

interface Brand {
  id: number;
  name: string;
  merged_to: number | null;
}

interface BrandResolution {
  id: number | null;
  name: string | null;
  merged_to: number | null;
}

interface CatalogImport {
  id: number;
  asin: string;
  name: string;
  brand: string;
  buying_price: string;
  selling_price: string;
  sku: string | null;
  upc: string | null;
  moq: number;
  buybox_price: string | null;
  amazon_fee: string | null;
  profit: string | null;
  margin: string | null;
  roi: number | null;
  selling_status: boolean;
  supplier: string | null;
  image_url: string | null;
  wfs_id: string | null;
  walmart_buybox: string | null;
  walmart_fees: string | null;
  walmart_profit: string | null;
  walmart_margin: string | null;
  walmart_roi: string | null;
  profitable: boolean;
}

class CatalogImportProcessor {
  private isRunning: boolean;
  private brandCache: Map<string, Brand>;
  private stats: ImportStats;

  constructor() {
    this.isRunning = false;
    this.brandCache = new Map();
    this.stats = {
      processed: 0,
      updated: 0,
      created: 0,
      deleted: 0,
      errors: 0,
      startTime: null,
      endTime: null,
    };
  }

  async init(): Promise<void> {
    console.log("Catalog Import Cron Job initialized");
    this.startCronJob();
  }

  startCronJob(): void {
    cron.schedule(
      CRON_SCHEDULE,
      async () => {
        if (this.isRunning) {
          console.log("Previous import job is still running, skipping...");
          return;
        }

        await this.processImport();
      },
      {
        timezone: "UTC",
      },
    );

    console.log(`Cron job scheduled: ${CRON_SCHEDULE}`);
  }

  async processImport(): Promise<void> {
    this.isRunning = true;
    this.resetStats();

    try {
      console.log("Starting catalog import process...");

      // Get total count for progress tracking
      const totalCount = await prisma.catalogImport.count();
      console.log(`Total records to process: ${totalCount}`);

      if (totalCount === 0) {
        console.log("No records to process");
        return;
      }

      // Load brand cache
      // await this.loadBrandCache();

      // Process records in batches
      let offset = 0;
      while (offset < totalCount) {
        const batch = await this.getBatch(offset, BATCH_SIZE);
        if (batch.length === 0) break;

        await this.processBatch(batch);
      }

      await this.logStats();
    } catch (error) {
      console.error("Error in catalog import process:", error);
      this.stats.errors++;

      // Send notification (implement your notification logic here)
      await this.sendErrorNotification(
        error instanceof Error ? error : new Error(String(error)),
      );
    } finally {
      this.isRunning = false;
      this.stats.endTime = new Date();
      console.log("Catalog import process completed");
      // Send webhook to n8n to update the status of the catalog import
      await this.sendWebhook({
        id: 0,
        status: "complete",
      });
    }
  }

  async loadBrandCache(): Promise<void> {
    console.log("Loading brand cache...");

    const brands = await prisma.brand.findMany({
      select: {
        id: true,
        name: true,
        merged_to: true,
      },
    });

    this.brandCache.clear();
    brands.forEach((brand) => {
      this.brandCache.set(brand.name, brand);
    });

    console.log(`Brand cache loaded: ${brands.length} brands`);
  }

  async getBatch(offset: number, limit: number): Promise<CatalogImport[]> {
    return await prisma.catalogImport.findMany({
      skip: offset,
      take: limit,
      orderBy: {
        id: "asc",
      },
    });
  }

  async processBatch(batch: CatalogImport[]): Promise<void> {
    // const promises = batch.map((record: CatalogImport) =>
    //   this.processRecord(record),
    // );

    for (const record of batch) {
      try {
        await this.processRecord(record);
      } catch (error) {
        console.error(`Error processing record ${record.id}:`, error);
        this.stats.errors++;
      }
    }
    // const results = await Promise.allSettled(promises);

    // results.forEach((result, index) => {
    //   if (result.status === "rejected") {
    //     console.error(
    //       `Error processing record ${batch[index].id}:`,
    //       result.reason,
    //     );
    //     this.stats.errors++;
    //   }
    // });
  }

  async processRecord(importRecord: CatalogImport): Promise<void> {
    let retries = 0;

    while (retries < MAX_RETRIES) {
      try {
        const existingCatalog = await prisma.catalog.findUnique({
          where: { asin: importRecord.asin },
          select: {
            id: true,
            brand_id: true,
            asin: true,
            forced_selling_price: true,
            selling_price: true,
          },
        });

        if (existingCatalog) {
          // Update existing record (without changing brand or brand_id)
          await this.updateExistingCatalog(existingCatalog.asin, importRecord);
          this.stats.updated++;
        } else {
          // Create new record with brand resolution
          await this.createNewCatalog(importRecord);
          this.stats.created++;
        }

        // Delete the record from catalogImport table after successful processing
        await this.deleteFromCatalogImport(importRecord.id);
        this.stats.deleted++;

        this.stats.processed++;
        return;
      } catch (error) {
        retries++;
        console.error(
          `Error processing record ${importRecord.id} (attempt ${retries}):`,
          error,
        );

        if (retries < MAX_RETRIES) {
          await this.delay(RETRY_DELAY);
        } else {
          throw error;
        }
      }
    }
  }

  async updateExistingCatalog(
    asin: string,
    importRecord: CatalogImport,
  ): Promise<void> {
    // First, get the existing catalog to check forced_selling_price
    const existingCatalog = await prisma.catalog.findUnique({
      where: { asin: asin },
      select: {
        id: true,
        brand_id: true,
        asin: true,
        forced_selling_price: true,
        selling_price: true,
        moq: true,
        profitable: true,
      },
    });

    if (!existingCatalog) {
      throw new Error(`Catalog with ASIN ${asin} not found`);
    }

    let calculatedResult;
    let moq = importRecord.moq;
    let profitable = false;

    if (existingCatalog.forced_selling_price && existingCatalog.selling_price) {
      // Use calcSellingPrice when forced_selling_price is true
      calculatedResult = calcSellingPrice({
        asin: importRecord.asin,
        selling_price: existingCatalog.selling_price,
        buybox_price: importRecord.buybox_price,
        amazon_fee: importRecord.amazon_fee,
      });

      // For forced selling price, we don't recalculate MOQ or profitable status
      moq = existingCatalog.moq;
      profitable = existingCatalog.profitable;
    } else {
      // Use calcWholesalePrice for normal calculation
      calculatedResult = calcWholesalePrice({
        asin: importRecord.asin,
        buying_price: importRecord.buying_price,
        buybox_price: importRecord.buybox_price,
        amazon_fee: importRecord.amazon_fee,
      });

      moq = calculatedResult.moq || importRecord.moq;
      profitable = calculatedResult.profitable;
    }

    await prisma.catalog.update({
      where: { asin: asin },
      data: {
        name: importRecord.name,
        buying_price: importRecord.buying_price,
        selling_price: existingCatalog.forced_selling_price
          ? existingCatalog.selling_price
          : calculatedResult.selling_price?.toString?.(),
        sku: importRecord.sku,
        upc: importRecord.upc,
        moq: moq,
        buybox_price: calculatedResult.buybox_price?.toString?.(),
        amazon_fee: importRecord.amazon_fee,
        profit: calculatedResult.profit?.toString?.(),
        margin: calculatedResult.margin?.toString?.(),
        roi: !!calculatedResult.roi ? parseFloat(calculatedResult.roi) : null,
        selling_status: importRecord.selling_status,
        supplier: importRecord.supplier,
        image_url: importRecord.image_url,
        wfs_id: importRecord.wfs_id,
        walmart_buybox: importRecord.walmart_buybox,
        walmart_fees: importRecord.walmart_fees,
        walmart_profit: importRecord.walmart_profit,
        walmart_margin: importRecord.walmart_margin,
        walmart_roi: importRecord.walmart_roi,
        profitable: profitable,
        updated_at: new Date(),
        // brand: importRecord.brand, // Don't update brand
        // Don't update brand_id
      },
    });
  }
  // TODO : createNewCatalogItem
  async createNewCatalog(importRecord: CatalogImport): Promise<void> {
    // Resolve brand_id and brand name based on brand name and merged_to logic
    const brandResolution = await this.resolveBrandId(importRecord.brand);

    const calculatedResult = calcWholesalePrice({
      asin: importRecord.asin,
      buying_price: importRecord.buying_price,
      buybox_price: importRecord.buybox_price,
      amazon_fee: importRecord.amazon_fee,
    });

    await prisma.catalog.create({
      data: {
        asin: importRecord.asin,
        name: importRecord.name,
        brand: brandResolution.name || importRecord.brand, // if brand not find use brand name from importRecord
        brand_id: brandResolution.merged_to || brandResolution.id,
        buying_price: importRecord.buying_price,
        selling_price: calculatedResult.selling_price?.toString?.(),
        sku: importRecord.sku,
        upc: importRecord.upc,
        moq: calculatedResult.moq || 100,
        buybox_price: calculatedResult.buybox_price?.toString?.(),
        amazon_fee: importRecord.amazon_fee,
        profit: calculatedResult.profit?.toString?.(),
        margin: calculatedResult.margin?.toString?.(),
        roi: !!calculatedResult.roi ? parseFloat(calculatedResult.roi) : null,
        selling_status: importRecord.selling_status,
        supplier: importRecord.supplier,
        image_url: importRecord.image_url,
        wfs_id: importRecord.wfs_id,
        walmart_buybox: importRecord.walmart_buybox,
        walmart_fees: importRecord.walmart_fees,
        walmart_profit: importRecord.walmart_profit,
        walmart_margin: importRecord.walmart_margin,
        walmart_roi: importRecord.walmart_roi,
        profitable: calculatedResult?.profitable || false,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });
  }

  async deleteFromCatalogImport(importRecordId: number): Promise<void> {
    await prisma.catalogImport.delete({
      where: { id: importRecordId },
    });
  }

  async sendWebhook(body: {
    id: number;
    status: "complete" | "error" | "in_progress";
  }): Promise<void> {
    try {
      const response = await axios.post(
        `${EXTERNAL_API_URL}/webhook/catalog-upload-status`,
        body,
        {
          headers: {
            Authorization: `Bearer ${EXTERNAL_WEBHOOK_TOKEN}`,
            "Content-Type": "application/json",
          },
        },
      );

      console.log("Webhook sent:", response.data);
    } catch (error) {
      console.error("Error sending webhook:");
    }
  }

  async resolveBrandId(brandName: string): Promise<BrandResolution> {
    if (!brandName) return { id: null, name: null, merged_to: null };

    const brand = await prisma.brand.findFirst({
      where: { name: brandName },
    });

    console.log("Brand Found ", brand, "Nanme ==>", brand?.name);

    if (!brand) {
      // Create new brand
      const newBrand = await prisma.brand.create({
        data: { name: brandName },
      });
      return newBrand;
    }

    return brand;
  }

  async logStats(): Promise<void> {
    const duration =
      this.stats.endTime && this.stats.startTime
        ? this.stats.endTime.getTime() - this.stats.startTime.getTime()
        : 0;
    const durationMinutes = Math.round(duration / 60000);

    console.log("Import Statistics:");
    console.log(`Processed: ${this.stats.processed}`);
    console.log(`Updated: ${this.stats.updated}`);
    console.log(`Created: ${this.stats.created}`);
    console.log(`Deleted from Import: ${this.stats.deleted}`);
    console.log(`Errors: ${this.stats.errors}`);
    console.log(`Duration: ${durationMinutes} minutes`);

    // Update brand statistics
    await this.updateBrandStatistics();
  }

  async updateBrandStatistics(): Promise<void> {
    console.log("Updating brand statistics...");

    try {
      // Update all_catalog_count for each brand
      const brandStats = await prisma.catalog.groupBy({
        by: ["brand_id"],
        _count: {
          id: true,
        },
        where: {
          brand_id: {
            not: null,
          },
        },
      });

      for (const stat of brandStats) {
        if (stat.brand_id) {
          await prisma.brand.update({
            where: { id: stat.brand_id },
            data: {
              all_catalog_count: stat._count.id,
              updated_at: new Date(),
            },
          });
        }
      }

      // Update profitable_and_selling count
      const profitableStats = await prisma.catalog.groupBy({
        by: ["brand_id"],
        _count: {
          id: true,
        },
        where: {
          brand_id: {
            not: null,
          },
          profitable: true,
          selling_status: true,
        },
      });

      for (const stat of profitableStats) {
        if (stat.brand_id) {
          await prisma.brand.update({
            where: { id: stat.brand_id },
            data: {
              profitable_and_selling: stat._count.id,
              updated_at: new Date(),
            },
          });
        }
      }

      console.log("Brand statistics updated");
    } catch (error) {
      console.error("Error updating brand statistics:", error);
    }
  }

  async sendErrorNotification(error: Error): Promise<void> {
    // TODO: add notification. Examples: Email, Slack, Discord, etc.
    await this.sendWebhook({
      id: 0,
      status: "error",
    });
    console.error("Critical Error Notification:", {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      stats: this.stats,
    });
  }

  resetStats(): void {
    this.stats = {
      processed: 0,
      updated: 0,
      created: 0,
      deleted: 0,
      errors: 0,
      startTime: new Date(),
      endTime: null,
    };
  }

  delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Manual trigger for testing
  async triggerManual(): Promise<void> {
    console.log("Manual trigger initiated");
    await this.processImport();
  }

  // Graceful shutdown
  async shutdown(): Promise<void> {
    console.log("Shutting down catalog import processor...");
    await prisma.$disconnect();
    console.log("Shutdown complete");
  }
}

// Initialize and export
const catalogProcessor = new CatalogImportProcessor();

// Handle graceful shutdown
process.on("SIGTERM", async () => {
  await catalogProcessor.shutdown();
  process.exit(0);
});

process.on("SIGINT", async () => {
  await catalogProcessor.shutdown();
  process.exit(0);
});

// Auto-initialize if running directly
if (require.main === module) {
  catalogProcessor.init();
}

// Export for use in your application
export default {
  catalogProcessor,
  init: () => catalogProcessor.init(),
  triggerManual: () => catalogProcessor.triggerManual(),
};
