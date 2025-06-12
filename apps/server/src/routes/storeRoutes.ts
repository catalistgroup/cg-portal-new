import { Router } from "express";
import { StoreController } from "../controllers/StoreController";
import { authenticate } from "../middlewares/authMiddleware";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();
const storeController = new StoreController();

router.get("/", authenticate, asyncHandler(storeController.getStores.bind(storeController)));
router.get("/:id", authenticate, asyncHandler(storeController.getStoreById.bind(storeController)));
router.post("/", authenticate, asyncHandler(storeController.createStore.bind(storeController)));
router.put("/:id", authenticate, asyncHandler(storeController.updateStore.bind(storeController)));
router.delete("/:id", authenticate, asyncHandler(storeController.deleteStore.bind(storeController)));

export default router;
