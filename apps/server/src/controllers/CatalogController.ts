import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import prisma from "../configs/database";
import HttpError from "../utils/HttpError";
import { calcWholesalePrice } from "../utils/catalog-helper-function";

export class CatalogController {
  async getCatalogs(req: Request, res: Response) {
    const userId = req.user?.id;

    // @ts-ignore
    const isAdmin = req.user?.isAdmin;

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
        WHERE ${isAdmin ? true : Prisma.sql`c.selling_status = TRUE AND c.profitable = TRUE`}
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

  async getCatalogsByStoreId(req: Request, res: Response) {
    const userId = req.user?.id;
    const storeId = Number(req.params.storeId);

    if (!userId) throw new HttpError("Authorization failed", 401);

    try {
      // Verify store belongs to user
      const store = await prisma.store.findFirst({
        where: {
          id: storeId,
          user_id: userId,
        },
      });

      if (!store) {
        throw new HttpError("Store not found or access denied", 404);
      }

      const catalogs = await prisma.catalog.findMany({
        where: { store_id: storeId },
        orderBy: {
          created_at: "desc",
        },
      });
      res.status(200).json(catalogs);
    } catch (error) {
      console.error(error);
      if (error instanceof HttpError) throw error;
      throw new HttpError("Failed to fetch catalogs", 500);
    }
  }

  async getCatalogById(req: Request, res: Response) {
    const id = Number(req.params.id);
    const userId = req.user?.id;

    if (!userId) throw new HttpError("Authorization failed", 401);

    try {
      const catalog = await prisma.catalog.findFirst({
        where: {
          id,
          store: {
            user_id: userId,
          },
        },
        include: {
          store: true,
        },
      });

      if (!catalog) throw new HttpError("Catalog not found", 404);
      res.json(catalog);
    } catch (error) {
      console.error(error);
      if (error instanceof HttpError) throw error;
      throw new HttpError("Failed to fetch catalog", 500);
    }
  }

  async createCatalog(req: Request, res: Response) {
    const {
      asin,
      name,
      brand,
      buying_price,
      selling_price,
      sku,
      upc,
      supplier,
      moq,
      buybox_price,
      amazon_fee,
      profit,
      margin,
      roi,
      store_id,
      image_url,
    } = req.body;

    const userId = req.user?.id;
    if (!userId) throw new HttpError("Authorization failed", 401);

    try {
      // Verify store belongs to user
      const store = await prisma.store.findFirst({
        where: {
          id: Number(store_id),
          user_id: userId,
        },
      });

      if (!store) {
        throw new HttpError("Store not found or access denied", 404);
      }

      const catalog = await prisma.catalog.create({
        data: {
          asin,
          name,
          brand,
          buying_price,
          selling_price,
          sku,
          upc,
          supplier,
          moq: Number(moq),
          buybox_price,
          amazon_fee,
          profit,
          margin,
          roi: roi ? Number(roi) : null,
          image_url,
          store_id: Number(store_id),
        },
      });
      res.status(201).json(catalog);
    } catch (error) {
      console.error(error);
      if (error instanceof HttpError) throw error;
      throw new HttpError("Failed to create catalog", 500);
    }
  }

  async getAllBrands(req: Request, res: Response) {
    try {
      const brands = await prisma.brand.findMany({
        select: { id: true, name: true },
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

  // TODO: fix this query later not optimized
  async getAllQualifiedBrands(req: Request, res: Response) {
    try {
      const brands = await prisma.catalog.findMany({
        where: {
          selling_status: true,
          profitable: true,
        },
        distinct: ["brand"],
        select: {
          id: true,
          brand: true,
        },
        orderBy: {
          brand: "asc",
        },
      });

      const response = brands.map((b) => ({
        id: b.id,
        name: b.brand,
      }));

      res.status(200).json(response);
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

      // if (typeof profitableStatus !== "boolean") {
      //   return res.status(400).json({
      //     error: "profitableStatus is required and must be a boolean",
      //   });
      // }

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
        // profitableStatus: profitableStatus,
      });
    } catch (error) {
      console.error("Error in bulkBrandUpdate:", error);
      res.status(500).json({
        error: "Failed to update catalogs",
      });
    }
  }
}
