import { Request, Response } from "express";
import prisma from "../configs/database";
import HttpError from "../utils/HttpError";

export class CatalogController {
  async getCatalogs(req: Request, res: Response) {
    const userId = req.user?.id;

    if (!userId) return res.status(400).json({ error: "User ID missing" });
    try {
      const catalogs = await prisma.$queryRaw`
        SELECT * FROM catalog_customer_view
       `;

      res.json(catalogs);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch catalogs" });
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

  // TODO: fix this query later not optimized
  //   async getAllQualifiedBrands(req: Request, res: Response) {
  //     try {
  //       const brands = await prisma.catalog.findMany({
  //         where: {
  //           selling_status: true,
  //           profitable: true,
  //         },
  //         distinct: ["brand"],
  //         select: {
  //           id: true,
  //           brand: true,
  //         },
  //         orderBy: {
  //           brand: "asc",
  //         },
  //       });

  //       const brandNames = brands.map((b) => b.brand);

  //       const matchedBrands = await prisma.brand.findMany({
  //         where: {
  //           name: { in: brandNames },
  //         },
  //         select: {
  //           id: true,
  //           name: true,
  //           profitable_and_selling: true,
  //         },
  //         orderBy: {
  //           name: "asc",
  //         },
  //       });

  //       //   const response = brands.map((b) => ({
  //       //     id: b.id,
  //       //     name: b.brand,
  //       //   }));

  //       res.status(200).json(matchedBrands);
  //     } catch (error) {
  //       console.error(error);
  //       res.status(500).json({ message: "Failed to retrieve brands" });
  //     }
  //   }

  async getAllQualifiedBrands(req: Request, res: Response) {
    try {
      const brands = await prisma.brand.findMany({
        select: { id: true, name: true, profitable_and_selling: true },
        where: {
          profitable_and_selling: {
            gt: 0,
          },
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
}
