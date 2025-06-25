import { Router } from "express";
import { AdminController } from "../controllers/AdminController";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();
const adminController = new AdminController();

router.get(
  "/all-catalogs",
  asyncHandler(adminController.getAllCatalogs.bind(adminController)),
);

router.post(
  "/update-catalog-product",
  asyncHandler(adminController.updateCatalogProduct.bind(adminController)),
);

router.get(
  "/get-all-brands",
  asyncHandler(adminController.getAllBrands.bind(adminController)),
);

router.post(
  "/bulk-catalog-update-by-brand",
  asyncHandler(adminController.bulkBrandUpdate.bind(adminController)),
);

export default router;
