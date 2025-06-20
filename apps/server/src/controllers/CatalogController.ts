import { Request, Response } from "express";
import prisma from "../configs/database";
import HttpError from "../utils/HttpError";
import { calcWholesalePrice } from "../utils/catalog-helper-function";

export class CatalogController {
  async getCatalogs(req: Request, res: Response) {
    const userId = req.user?.id;

    const isAdmin = req.user?.isAdmin;

    if (!userId) return res.status(400).json({ error: "User ID missing" });
    try {
      const catalogs = await prisma.catalog.findMany({
        where: isAdmin ? undefined : { selling_status: true, profitable: true },
      });

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
          profitable: newCalculatedData.profitable,
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
}
