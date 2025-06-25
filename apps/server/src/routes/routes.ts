import { Router } from "express";
import authRoutes from "./authRoutes";
import userRoutes from "./userRoutes";
import storeRoutes from "./storeRoutes";
import catalogRoutes from "./catalogRoutes";
import overviewRoutes from "./overviewRoutes";
import purchaseOrderRoutes from "./purchaseOrderRoutes";
import { authenticate } from "../middlewares/authMiddleware";
import adminRoutes from "./AdminRoutes";

const router = Router();

router.use("/auth", authRoutes);

router.use("/user", userRoutes);

router.use("/store", authenticate, storeRoutes);

router.use("/admin", authenticate, adminRoutes);

router.use("/catalog", authenticate, catalogRoutes);

router.use("/overview", authenticate, overviewRoutes);

router.use("/purchase-order", authenticate, purchaseOrderRoutes);

export default router;
