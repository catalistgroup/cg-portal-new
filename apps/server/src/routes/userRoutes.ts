import { Router } from "express";
import { UserController } from "../controllers/UserController";
import { authenticate } from "../middlewares/authMiddleware";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();
const userController = new UserController();

router.get("/", authenticate, asyncHandler(userController.getUsers.bind(userController)));
router.get("/:id", authenticate, asyncHandler(userController.getUserById.bind(userController)));
router.post("/", authenticate, asyncHandler(userController.createUser.bind(userController)));
router.put("/:id", authenticate, asyncHandler(userController.updateUser.bind(userController)));
router.delete("/:id", authenticate, asyncHandler(userController.deleteUser.bind(userController)));

export default router;
