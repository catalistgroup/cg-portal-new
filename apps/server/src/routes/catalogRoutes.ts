import { Router } from "express";
import { CatalogController } from "../controllers/CatalogController";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();
const catalogController = new CatalogController();

router.get(
  "/live-catalog",
  asyncHandler(catalogController.getCatalogs.bind(catalogController)),
);

router.get("/store/:storeId", catalogController.getCatalogsByStoreId);

router.get(
  "/get-qualified-brands",
  asyncHandler(catalogController.getAllQualifiedBrands.bind(catalogController)),
);

router.post(
  "/wishlist",
  asyncHandler(catalogController.addToWishlist.bind(catalogController)),
);

router.delete(
  "/wishlist/:catalogId",
  asyncHandler(catalogController.removeFromWishlist.bind(catalogController)),
);

router.get(
  "/wishlist",
  asyncHandler(catalogController.getWishlist.bind(catalogController)),
);

// router.get("/:id", authenticate, (req, res) =>
//   catalogController.getCatalogById(req, res),
// );
// router.post("/", authenticate, validate(catalogSchema), (req, res) =>
//   catalogController.createCatalog(req, res),
// );
// router.put("/:id", authenticate, validate(catalogSchema), (req, res) =>
//   catalogController.updateCatalog(req, res),
// );
// router.delete("/:id", authenticate, (req, res) =>
//   catalogController.deleteCatalog(req, res),
// );

export default router;
