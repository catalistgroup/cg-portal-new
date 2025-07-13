import { Request, Response } from "express";
import prisma from "../configs/database";
import HttpError from "../utils/HttpError";

export class CatalogController {
  async getCatalogs(req: Request, res: Response) {
    const userId = req.user?.id;

    if (!userId) return res.status(400).json({ error: "User ID missing" });
    try {
      const catalogs = await this.fetchCatalogs(req);
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

      const catalogs = await this.fetchCatalogs(req);
      res.status(200).json(catalogs);
    } catch (error) {
      console.error(error);
      if (error instanceof HttpError) throw error;
      throw new HttpError("Failed to fetch catalogs", 500);
    }
  }

  private async fetchCatalogs(req: Request) {
    const { sortBy } = req.query;
    let orderBy: any = { created_at: "desc" };
    let where: any = {};

    if (sortBy === "new") {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      where.created_at = { gte: sevenDaysAgo };
    } else if (sortBy === "top") {
      // Placeholder for top movers
      orderBy = { name: "asc" };
    }

    return prisma.catalog.findMany({
      where,
      orderBy,
    });
  }

  async getCatalogById(req: Request, res: Response) {
    const id = Number(req.params.id);
    const userId = req.user?.id;

    if (!userId) throw new HttpError("Authorization failed", 401);

    try {
      const catalog = await prisma.catalog.findFirst({
        where: {
          id,
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
        },
      });
      res.status(201).json(catalog);
    } catch (error) {
      console.error(error);
      if (error instanceof HttpError) throw error;
      throw new HttpError("Failed to create catalog", 500);
    }
  }

  async getAllQualifiedBrands(req: Request, res: Response) {
    try {
      const brands = await prisma.brand.findMany({
        select: { id: true, name: true, profitable_and_selling: true },
        where: {
          profitable_and_selling: {
            gt: 0,
          },
          merged_to: null,
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

  async addToWishlist(req: Request, res: Response) {
    const userId = req.user?.id;
    const { catalogId } = req.body;

    if (!userId) throw new HttpError("Authorization failed", 401);

    try {
      const wishlistItem = await prisma.wishlist.create({
        data: {
          user_id: userId,
          catalog_id: catalogId,
        },
      });
      res.status(201).json(wishlistItem);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to add to wishlist" });
    }
  }

  async removeFromWishlist(req: Request, res: Response) {
    const userId = req.user?.id;
    const catalogId = Number(req.params.catalogId);

    if (!userId) throw new HttpError("Authorization failed", 401);

    try {
      await prisma.wishlist.delete({
        where: {
          user_id_catalog_id: {
            user_id: userId,
            catalog_id: catalogId,
          },
        },
      });
      res.status(204).send();
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to remove from wishlist" });
    }
  }

  async getWishlist(req: Request, res: Response) {
    const userId = req.user?.id;

    if (!userId) throw new HttpError("Authorization failed", 401);

    try {
      const wishlist = await prisma.wishlist.findMany({
        where: {
          user_id: userId,
        },
        include: {
          catalog: true,
        },
      });
      res.json(wishlist.map((item) => item.catalog));
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to fetch wishlist" });
    }
  }
}
