import { Router } from "express";
import { PurchaseOrderController } from "../controllers/PurchaseOrderController";

const router = Router();
const purchaseOrderController = new PurchaseOrderController();

router.post("/store/:storeId", purchaseOrderController.createPurchaseOrder);
router.post(
  "/:id/store/:storeId/resend",
  purchaseOrderController.resendPurchaseOrder,
);

router.get(
  "/store/:storeId",
  purchaseOrderController.getPurchaseOrdersByStoreId,
);
router.get(
  "/:id/store/:storeId",
  purchaseOrderController.getPurchaseOrderByOSId,
);

export default router;
