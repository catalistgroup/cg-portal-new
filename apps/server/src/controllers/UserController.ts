import { Request, Response } from "express";
import prisma from "../configs/database";
import HttpError from "../utils/HttpError";
import bcrypt from "bcryptjs";
import { createUserSchema, updateUserSchema } from "../validators/userValidator";

export class UserController {
  async getUsers(req: Request, res: Response) {
    const users = await prisma.user.findMany({
      where: { is_deleted: false },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        type: true,
        is_active: true,
        is_superuser: true,
        created_at: true,
        updated_at: true,
      },
    });
    res.json(users);
  }

  async getUserById(req: Request, res: Response) {
    const { id } = req.params;
    const user = await prisma.user.findFirst({
      where: { id: Number(id), is_deleted: false },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        type: true,
        orders: {
          orderBy: { created_at: "desc" },
          take: 1,
        },
        is_active: true,
        is_superuser: true,
        created_at: true,
        updated_at: true,
      },
    });

    if (!user) throw new HttpError("User not found", 404);
    res.json(user);
  }

  async createUser(req: Request, res: Response) {
    const data = await createUserSchema.parseAsync(req.body);

    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existingUser) throw new HttpError("Email already exists", 400);

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        type: true,
        orders: {
          orderBy: { created_at: "desc" },
          take: 1,
        },
        is_active: true,
        created_at: true,
        updated_at: true,
      },
    });

    res.status(201).json(user);
  }

  async updateUser(req: Request, res: Response) {
    const { id } = req.params;
    const data = await updateUserSchema.parseAsync(req.body);

    const existingUser = await prisma.user.findFirst({
      where: { id: Number(id), is_deleted: false },
    });
    if (!existingUser) throw new HttpError("User not found", 404);

    if (data.email) {
      const emailExists = await prisma.user.findFirst({
        where: { email: data.email, id: { not: Number(id) } },
      });
      if (emailExists) throw new HttpError("Email already exists", 400);
    }

    const user = await prisma.user.update({
      where: { id: Number(id) },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        type: true,
        orders: {
          orderBy: { created_at: "desc" },
          take: 1,
        },
        is_active: true,
        created_at: true,
        updated_at: true,
      },
    });

    res.json(user);
  }

  async deleteUser(req: Request, res: Response) {
    const { id } = req.params;

    const existingUser = await prisma.user.findFirst({
      where: { id: Number(id), is_deleted: false },
    });
    if (!existingUser) throw new HttpError("User not found", 404);

    await prisma.user.update({
      where: { id: Number(id) },
      data: { is_deleted: true, deleted_at: new Date() },
    });

    res.json({ message: "User deleted successfully" });
  }
}