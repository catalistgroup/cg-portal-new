import { Router } from "express";
import { AdminController } from "../controllers/AdminController";
import { asyncHandler } from "../utils/asyncHandler";
import express from "express";

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

router.post(
  "/import-bulk-catalogs",
  express.json(),
  asyncHandler(adminController.importBulkCatalogs.bind(adminController)),
);

export default router;
