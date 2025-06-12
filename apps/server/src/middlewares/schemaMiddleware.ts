import { ZodError, ZodSchema } from "zod";
import { Request, Response, NextFunction } from "express";

export const schemaValidate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((e) => ({
          path: e.path.join("."),
          message: e.message,
        }));
        return res.status(400).json({ errors });
      }
      next(error);
    }
  };
};
