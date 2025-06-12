import { Router } from "express";
import OverviewController from "../controllers/OverviewController";

const router = Router();
const overviewController = new OverviewController();

router.get("/store/:storeId", overviewController.getOverviewByStoreId);

export default router;
