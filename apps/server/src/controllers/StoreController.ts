import { Request, Response } from "express";
import prisma from "../configs/database";
import HttpError from "../utils/HttpError";

export class StoreController {
  async getStores(req: Request, res: Response) {
    const userId = req.user?.id;
    if (!userId) throw new HttpError("Authorization failed");

    const stores = await prisma.store.findMany({
      where: { user_id: userId, is_deleted: false },
    });

    res.status(200).json(stores);
  }

  async getStoreById(req: Request, res: Response) {
    const id = Number(req.params.id);
    const userId = req.user?.id;
    if (!userId) throw new HttpError("Authorization failed");

    const store = await prisma.store.findFirst({
      where: { id, user_id: userId, is_deleted: false },
    });

    if (!store) throw new HttpError("Store not found with this id");

    res.status(200).json(store);
  }

  async createStore(req: Request, res: Response) {
    const { name, marketplace } = req.body;
    const userId = req.user?.id;
    if (!userId) return res.status(400).json({ error: "User ID missing" });

    try {
      const store = await prisma.store.create({
        data: {
          name,
          marketplace,
          api_client: "123",
          api_secret: "123",
          is_active: true,
          user_id: userId,
        },
      });
      res.status(201).json(store);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Failed to create store" });
    }
  }

  async updateStore(req: Request, res: Response) {
    const id = Number(req.params.id);
    const { name, marketplace, api_client, api_secret, is_active, is_deleted } =
      req.body;
    const userId = req.user?.id;
    if (!userId) return res.status(400).json({ error: "User ID missing" });

    try {
      const store = await prisma.store.updateMany({
        where: { id, user_id: userId },
        data: {
          name,
          marketplace,
          api_client,
          api_secret,
          is_active,
          is_deleted,
        },
      });
      if (store.count === 0)
        return res
          .status(404)
          .json({ error: "Store not found or no permission" });
      res.json(store);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Failed to update store" });
    }
  }

  async deleteStore(req: Request, res: Response) {
    const id = Number(req.params.id);
    const userId = req.user?.id;

    if (!userId) throw new HttpError("Authorization failed", 401);
    if (isNaN(id)) throw new HttpError("Invalid store ID", 400);

    try {
      const existingStore = await prisma.store.findFirst({
        where: {
          id,
          user_id: userId,
          is_deleted: false
        }
      });

      if (!existingStore) {
        throw new HttpError("Store not found or no permission", 404);
      }

      await prisma.store.update({
        where: { id },
        data: {
          is_deleted: true,
          deleted_at: new Date(),
          is_active: false
        }
      });

      res.status(200).json({ message: "Store deleted successfully" });
    } catch (error) {
      if (error instanceof HttpError) {
        throw error;
      }
      console.error('Delete store error:', error);
      throw new HttpError("Failed to delete store", 500);
    }
  }
}
