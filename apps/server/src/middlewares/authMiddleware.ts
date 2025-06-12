import { jwtVerify } from "jose";
import { Request, RequestHandler } from "express";
import { JWT_SECRET } from "../utils/constants";

export const authenticate: RequestHandler = async (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
    res.status(401).json({ message: "Access denied, no token provided" });
    return;
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    req.user = payload as Request["user"];
    next();
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "Invalid token" });
  }
};
