import { Router } from "express";
import { CatalogController } from "../controllers/CatalogController";

const router = Router();
const catalogController = new CatalogController();

// router.get("/", authenticate, (req, res) =>
//   catalogController.getCatalogs(req, res),
// );

router.get("/store/:storeId", catalogController.getCatalogsByStoreId);

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
