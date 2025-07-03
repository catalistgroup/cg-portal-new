import { Request, Response } from "express";
import prisma from "../configs/database";
import { calcWholesalePrice } from "../utils/catalog-helper-function";
import { bulkCatalogItemSchema } from "../validators/catalogValidator";
import { REQUIRED_KEYS_BULK_CATALOG_IMPORT } from "../constants";

export class AdminController {
  async getAllCatalogs(req: Request, res: Response) {
    const userId = req.user?.id;

    // @ts-ignore
    const isAdmin = req.user?.isAdmin;

    if (!isAdmin) {
      return res.status(403).json({ error: "Action Unauthorized" });
    }

    if (!userId) return res.status(400).json({ error: "User ID missing" });
    try {
      const catalogs = await prisma.$queryRaw`
        WITH brand_order AS (
         SELECT
          name,
           last_item_inserted_at,
            ROW_NUMBER() OVER (ORDER BY last_item_inserted_at DESC) AS sort_order
         FROM "Brand"
        )
        SELECT
          c.*,
          b.last_item_inserted_at
        FROM "Catalog" c
        JOIN brand_order b ON c.brand = b.name
        ORDER BY b.sort_order, c.created_at DESC
        `;

      res.json(catalogs);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch catalogs" });
    }
  }

  async updateCatalogProduct(req: Request, res: Response) {
    try {
      const asin = req.body?.asin;
      const selling_status = req.body?.selling_status;
      const buying_price = req.body?.buying_price;
      const buybox_price = req.body?.buybox_price;
      const amazon_fee = req.body?.amazon_fee;
      const profitable = req.body?.profitable;
      const force_profitable_manual = req.body?.force_profitable_manual;

      if (!asin || typeof asin !== "string") {
        return res.status(400).json({ error: "Invalid or missing asin" });
      }

      if (buybox_price === undefined || isNaN(Number(buybox_price))) {
        return res
          .status(400)
          .json({ error: "Invalid or missing buybox price" });
      }

      if (amazon_fee === undefined || isNaN(Number(amazon_fee))) {
        return res.status(400).json({ error: "Invalid or missing amazon fee" });
      }

      if (typeof selling_status !== "boolean") {
        return res
          .status(400)
          .json({ error: "Invalid or missing selling status" });
      }

      if (buying_price !== undefined && isNaN(Number(buying_price))) {
        return res.status(400).json({ error: "Invalid buying price" });
      }

      if (force_profitable_manual) {
        if (typeof profitable !== "boolean") {
          return res
            .status(400)
            .json({ error: "Invalid or missing profitable status" });
        }
      }

      const newCalculatedData = calcWholesalePrice({
        asin,
        buying_price,
        buybox_price,
        amazon_fee,
      });

      // Update the catalog product in the database
      const updatedCatalog = await prisma.catalog.update({
        where: { asin },
        data: {
          selling_status,
          buying_price,
          profitable: force_profitable_manual
            ? profitable
            : newCalculatedData.profitable,
          selling_price: newCalculatedData.selling_price?.toString?.(),
          moq: newCalculatedData.moq || 0,
          buybox_price: newCalculatedData.buybox_price?.toString?.(),
          profit: newCalculatedData.profit?.toString?.(),
          margin: newCalculatedData.margin?.toString?.(),
          roi: !!newCalculatedData.roi
            ? parseFloat(newCalculatedData.roi)
            : null,
        },
      });

      res.status(200).json({
        message: "Catalog updated successfully",
        data: updatedCatalog,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to update catalog product" });
    }
  }

  async getAllBrands(req: Request, res: Response) {
    try {
      const brands = await prisma.brand.findMany({
        select: { id: true, name: true, all_catalog_count: true },
        where: {
          all_catalog_count: {
            gt: 0,
          },
          merged_to: null, // brands which aren't merged
        },
        orderBy: {
          name: "asc",
        },
      });
      res.status(200).json(brands);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to retrieve brands" });
    }
  }

  async bulkBrandUpdate(req: Request, res: Response) {
    try {
      const { brand, sellingStatus } = req.body;

      // Validate required fields
      if (!brand || typeof brand !== "string") {
        return res.status(400).json({
          error: "Brand is required and must be a string",
        });
      }

      if (typeof sellingStatus !== "boolean") {
        return res.status(400).json({
          error: "sellingStatus is required and must be a boolean",
        });
      }

      // Check if brand exists in the Brand table
      const brandExists = await prisma.brand.findFirst({
        where: { name: brand },
      });

      if (!brandExists) {
        return res.status(404).json({
          error: `Brand '${brand}' not found`,
        });
      }

      const updateResult = await prisma.catalog.updateMany({
        where: {
          brand: brand,
        },
        data: {
          selling_status: sellingStatus,
          updated_at: new Date(),
        },
      });

      res.status(200).json({
        message: `Successfully updated ${updateResult.count} catalog's for brand '${brand}'`,
        brand: brand,
        sellingStatus: sellingStatus,
        updatedCount: updateResult.count,
      });
    } catch (error) {
      console.error("Error in bulkBrandUpdate:", error);
      res.status(500).json({
        error: "Failed to update catalogs",
      });
    }
  }

  async importBulkCatalogs(req: Request, res: Response) {
    const jsonData = req.body;
    const failedItems: any[] = [];
    const successItems: string[] = [];
    let insertCount = 0;
    let updateCount = 0;

    try {
      const extractZodErrors = (error: any): string[] => {
        const errors = [];
        if (error.issues) {
          for (const issue of error.issues) {
            errors.push(`${issue.path.join(".")}: ${issue.message}`);
          }
        }
        if (error.unionErrors) {
          const field = error.path?.join(".") || "field";
          errors.push(`${field}: Invalid value - expected number or null`);
        }
        return errors.length > 0 ? errors : ["Validation failed"];
      };

      if (!Array.isArray(jsonData) || jsonData.length === 0) {
        return res.status(400).json({ error: "No catalog items provided" });
      }

      for (const [index, item] of jsonData.entries()) {
        const itemErrors: string[] = [];

        for (const key of REQUIRED_KEYS_BULK_CATALOG_IMPORT) {
          if (
            item[key] === undefined ||
            item[key] === null ||
            item[key] === ""
          ) {
            itemErrors.push(`${key}: Required`);
          }
        }

        if (itemErrors.length > 0) {
          failedItems.push({
            asin: item.asin || `Catalog ${index + 1}`,
            error: itemErrors,
          });
          continue;
        }

        const validation = bulkCatalogItemSchema.safeParse(item);
        if (!validation.success) {
          const cleanErrors = extractZodErrors(validation.error);
          failedItems.push({
            asin: item.asin || `Catalog ${index + 1}`,
            error: cleanErrors,
          });
          continue;
        }

        const data = validation.data;

        try {
          const calcResult = calcWholesalePrice(data);

          const processedData = {
            asin: data.asin,
            profitable: calcResult.profitable,
            brand: data.brand,
            name: data.name,
            sku: data.sku || null,
            upc: data.upc || null,
            moq: calcResult.moq ?? data.moq,
            buying_price: calcResult.buying_price.toString(),
            selling_price: calcResult.selling_price.toString(),
            buybox_price: calcResult.buybox_price?.toString() || null,
            amazon_fee: data.amazon_fee.toString(),
            profit: calcResult.profit.toString(),
            margin: calcResult.margin.toString(),
            roi: parseFloat(calcResult.roi),
            updated_at: new Date().toISOString(),
            selling_status: true,
            image_url: data.image_url,
          };

          const existingRecord = await prisma.catalog.findUnique({
            where: { asin: processedData.asin },
          });

          if (existingRecord) {
            await prisma.catalog.update({
              where: { asin: processedData.asin },
              data: processedData,
            });
            updateCount++;
          } else {
            await prisma.catalog.create({
              data: processedData,
            });
            insertCount++;
          }

          successItems.push(data.asin);
        } catch (dbErr) {
          let dbErrorMessage = "Database error occurred";
          if (dbErr instanceof Error) {
            if (dbErr.message.includes("Unique constraint failed")) {
              dbErrorMessage = "Record with this identifier already exists";
            } else if (dbErr.message.includes("Foreign key constraint")) {
              dbErrorMessage = "Referenced record does not exist";
            } else {
              dbErrorMessage = dbErr.message;
            }
          }

          failedItems.push({
            asin: item.asin || `Catalog ${index + 1}`,
            error: [dbErrorMessage],
          });
        }
      }

      const response = {
        message: failedItems.length === 0 ? "success" : "partial_failure",
        items_succeeded: successItems.length,
        items_failed: failedItems.length,
        new_items_inserted: insertCount,
        existing_items_updated: updateCount,
        failed_items: failedItems,
      };

      if (failedItems.length === 0) {
        res.status(200).json(response);
      } else if (successItems.length === 0) {
        res.status(400).json(response);
      } else {
        res.status(207).json(response);
      }
    } catch (err) {
      console.error("File processing error:", err);
      res.status(500).json({
        error: "Failed to process the JSON file",
        details: err instanceof Error ? err.message : "Unknown error",
      });
    }
  }

  async brandMerge(req: Request, res: Response) {
    try {
      const { brands, active_brand } = req.body;

      if (!brands || !Array.isArray(brands) || brands.length < 2) {
        return res.status(400).json({
          error: "At least 2 brands are required for merging",
        });
      }

      if (!active_brand || !active_brand.id || !active_brand.name) {
        return res.status(400).json({
          error: "Active brand with id and name is required",
        });
      }

      const activeBrandInArray = brands.find(
        (brand) => brand.id === active_brand.id,
      );
      if (!activeBrandInArray) {
        return res.status(400).json({
          error: "Active brand must be one of the brands in the merge list",
        });
      }

      const brandNames = brands.map((brand) => brand.name);
      const brandIds = brands.map((brand) => brand.id);
      const activeBrandName = active_brand.name;
      const activeBrandId = active_brand.id;

      const existingBrands = await prisma.brand.findMany({
        where: {
          id: { in: brandIds },
        },
        select: {
          id: true,
          name: true,
          all_catalog_count: true,
          profitable_and_selling: true,
        },
      });

      if (existingBrands.length !== brands.length) {
        const existingIds = existingBrands.map((b) => b.id);
        const missingIds = brandIds.filter((id) => !existingIds.includes(id));
        return res.status(400).json({
          error: `Brands with IDs ${missingIds.join(", ")} not found in database`,
        });
      }

      const totalAllCatalog = existingBrands.reduce(
        (sum, b) => sum + (b.all_catalog_count || 0),
        0,
      );
      const totalProfitableAndSelling = existingBrands.reduce(
        (sum, b) => sum + (b.profitable_and_selling || 0),
        0,
      );

      const mergedBrandIds = brandIds.filter((id) => id !== activeBrandId);

      const result = await prisma.$transaction(async (tx) => {
        const catalogUpdateResult = await tx.catalog.updateMany({
          where: {
            brand: { in: brandNames },
          },
          data: {
            brand: activeBrandName,
            updated_at: new Date(),
          },
        });

        const brandUpdateResult = await tx.brand.updateMany({
          where: {
            id: { in: mergedBrandIds },
          },
          data: {
            merged_to: activeBrandId,
            updated_at: new Date(),
          },
        });

        await tx.brand.update({
          where: { id: activeBrandId },
          data: {
            all_catalog_count: totalAllCatalog,
            profitable_and_selling: totalProfitableAndSelling,
            last_item_inserted_at: new Date(),
            updated_at: new Date(),
          },
        });

        return {
          catalogsUpdated: catalogUpdateResult.count,
          brandsMarkedMerged: brandUpdateResult.count,
          activeBrandId,
          activeBrandName,
          totalAllCatalog,
          totalProfitableAndSelling,
        };
      });

      res.status(200).json({
        message: "Brands merged successfully",
        data: {
          catalogsUpdated: result.catalogsUpdated,
          brandsMarkedMerged: result.brandsMarkedMerged,
          activeBrand: {
            id: result.activeBrandId,
            name: result.activeBrandName,
            all_catalog_count: result.totalAllCatalog,
            profitable_and_selling: result.totalProfitableAndSelling,
          },
          mergedBrands: brands.filter((brand) => brand.id !== activeBrandId),
        },
      });
    } catch (error) {
      console.error("Error during brand merge:", error);

      if (error instanceof Error) {
        if (error.message.includes("Foreign key constraint")) {
          return res.status(400).json({
            error: "Cannot merge brands that are referenced by other records",
            details:
              "Some brands may be in use by purchase orders or other entities",
          });
        }

        if (error.message.includes("Unique constraint")) {
          return res.status(400).json({
            error: "Brand name conflict detected",
            details: "The target brand name may already exist",
          });
        }
      }

      res.status(500).json({
        error: "Failed to merge brands",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}
