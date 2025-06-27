import { Router } from "express";
import { AdminController } from "../controllers/AdminController";
import { asyncHandler } from "../utils/asyncHandler";
import multer from "multer";

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

// Configure multer for file uploads
const upload = multer({ dest: "uploads/" });
router.post(
  "/import-bulk-catalogs",
  upload.single("file"),
  asyncHandler(adminController.importBulkCatalogs.bind(adminController)),
);

router.post(
  "/brand-merge",
  asyncHandler(adminController.brandMerge.bind(adminController)),
);

export default router;
