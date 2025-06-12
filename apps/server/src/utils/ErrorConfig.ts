import { ErrorRequestHandler } from "express";
import * as z from "zod";
import HttpError from "./HttpError";

class ErrorConfig {
  static normalizeZodError(
    errors: z.ZodError,
  ): { field: string; message: string }[] {
    return errors.errors.map((error) => ({
      field: error.path.join(", "),
      message: `${error.message}`,
    }));
  }

  static ErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
    if (err) {
      console.log(err);
      if (err instanceof z.ZodError) {
        const newError = ErrorConfig.normalizeZodError(err);
        res
          .status(403)
          .send({ message: newError[0].message, issues: newError });
      } else if (err instanceof HttpError) {
        res
          .status(err.statusCode || 400)
          .send({ message: err.message, issues: [] });
      } else {
        res.status(500).send({
          message: `Something went wrong! ${err.message}`,
          issues: [],
        });
      }
    } else {
      next();
    }
  };
}

export default ErrorConfig;
