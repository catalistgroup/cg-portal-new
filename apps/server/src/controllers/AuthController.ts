import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import prisma from "../configs/database";
import HttpError from "../utils/HttpError";
import { createUserSchema, loginUserSchema } from "../validators/userValidator";
import { SignJWT } from "jose";
import { JWT_SECRET } from "../utils/constants";
import OTPService from "../utils/otpService";
import { sendResetPasswordEmail } from "../utils/emailService";
import { z } from "zod";

const forgotPasswordSchema = z.object({
  email: z.string().email(),
  hostname: z.string().optional(),
});

const verifyOTPSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
});

const resetPasswordSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export class AuthController {
  async register(req: Request, res: Response) {
    const body = await createUserSchema.parseAsync(req.body);

    const userExists = await prisma.user.findUnique({
      where: { email: body.email.toLocaleLowerCase() },
    });
    if (userExists) {
      throw new HttpError("User already exists", 402);
    }

    // Destructure to remove storefront and company from user creation
    const { storefront, company, ...userData } = body;

    const hashedPassword = await bcrypt.hash(body.password, 10);
    const user = await prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword,
        type: "normal",
      },
    });

    await prisma.store.create({
      data: {
        name: company,
        marketplace: storefront,
        api_client: "123",
        api_secret: "123",
        is_active: true,
        user_id: user.id,
      },
    });

    const token = await new SignJWT({
      id: user.id,
      name: user.name,
      email: user.email,
      type: user?.type,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("5days")
      .sign(JWT_SECRET);

    res.status(201).json({ message: "User created successfully", token });
  }

  async login(req: Request, res: Response) {
    let { email, password } = await loginUserSchema.parseAsync(req.body);
    email = email.toLocaleLowerCase();
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new HttpError("Invalid credentials", 404);
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new HttpError("Invalid credentials", 404);

    const token = await new SignJWT({
      id: user.id,
      name: user.name,
      email: user.email,
      type: user?.type,
      isAdmin: user?.is_superuser || false,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("5days")
      .sign(JWT_SECRET);

    res.json({ message: "Login successful", token });
  }

  async forgotPassword(req: Request, res: Response) {
    let { email } = await forgotPasswordSchema.parseAsync(req.body);
    email = email.toLocaleLowerCase();
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new HttpError("User not found", 404);
    }

    const otp = OTPService.storeOTP(email);
    if (otp === null) {
      throw new HttpError("Please wait before requesting another code", 429);
    }

    const sent = await sendResetPasswordEmail(email, otp, req.body.hostname);
    if (!sent) {
      throw new HttpError("Failed to send reset code", 500);
    }

    res.json({ message: "Reset code sent successfully" });
  }

  async verifyOTP(req: Request, res: Response) {
    let { email, code } = await verifyOTPSchema.parseAsync(req.body);
    email = email.toLocaleLowerCase();
    try {
      const isValid = OTPService.verifyOTP(email, code);
      if (!isValid) {
        throw new HttpError("Invalid code", 400);
      }
    } catch (error: any) {
      if (error.message === "Code has expired") {
        throw new HttpError("Code has expired", 400);
      } else if (error.message === "Invalid code") {
        throw new HttpError("Invalid code", 400);
      }
      throw new HttpError("Verification failed", 400);
    }

    res.json({ message: "Code verified successfully" });
  }

  async resetPassword(req: Request, res: Response) {
    let { email, password } = await resetPasswordSchema.parseAsync(req.body);
    email = email.toLocaleLowerCase();
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new HttpError("User not found", 404);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });

    res.json({ message: "Password reset successfully" });
  }

  async resendOTP(req: Request, res: Response) {
    let { email } = await forgotPasswordSchema.parseAsync(req.body);
    email = email.toLocaleLowerCase();
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new HttpError("User not found", 404);
    }

    const otp = OTPService.storeOTP(email);
    if (otp === null) {
      throw new HttpError("Please wait before requesting another code", 429);
    }

    const sent = await sendResetPasswordEmail(email, otp, req.body.hostname);
    if (!sent) {
      throw new HttpError("Failed to send reset code", 500);
    }

    res.json({ message: "Reset code resent successfully" });
  }
}
