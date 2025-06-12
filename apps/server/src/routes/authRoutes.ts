import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();
const authController = new AuthController();

router.post("/register", asyncHandler(authController.register.bind(authController)));
router.post("/login", asyncHandler(authController.login.bind(authController)));
router.post("/forgot-password", asyncHandler(authController.forgotPassword.bind(authController)));
router.post("/verify-otp", asyncHandler(authController.verifyOTP.bind(authController)));
router.post("/reset-password", asyncHandler(authController.resetPassword.bind(authController)));
router.post("/resend-otp", asyncHandler(authController.resendOTP.bind(authController)));

export default router;
