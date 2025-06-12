"use client";

import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { redirect, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { AlertCircle, ChevronLeft } from "lucide-react";
import api from "@/lib/api";

const forgotPasswordSchema = z.object({
  email: z.string().nonempty("Email is required").email("Invalid email"),
});

type ForgotPasswordFormType = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isSent, setIsSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ForgotPasswordFormType>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const watchedEmail = useWatch({ control: form.control, name: "email" });

  useEffect(() => {
    if (watchedEmail) {
      setError("");
    }
  }, [watchedEmail]);

  const onSubmit = async (values: ForgotPasswordFormType) => {
    setError("");
    setIsLoading(true);
    try {
      const hostname = window.location.hostname;
      await api.post("/auth/forgot-password", { ...values, hostname });
      sessionStorage.setItem("resetEmail", values.email);
      router.push("/otp-verification");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to send reset code.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-white to-[#f6f9ff] min-h-screen flex flex-col items-center justify-center px-4">
      <Image
        src="/logo.png"
        alt="Catalist Group"
        width={140}
        height={40}
        className="mb-8 h-[86px] w-auto object-contain"
        priority
      />
      <Card className="w-full max-w-md rounded-2xl shadow-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">
            Forgot Password?
          </CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            Enter your email, and we'll send a verification code to reset your password.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {error && (
            <Alert variant="destructive" className="flex justify-between items-center">
              <AlertCircle />
              <span>{error}</span>
            </Alert>
          )}

          {isSent ? (
            <p className="text-center text-green-600">
              A verification code has been sent to your email.
            </p>
          ) : (
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input className="mt-0.5 mb-2"
                  id="email"
                  type="email"
                  placeholder="Enter email address"
                  {...form.register("email")}
                />
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                {isLoading ? "Sending..." : "Submit"}
              </Button>
            </form>
          )}

          <div className="text-sm text-center">
            <a
              href="/login"
              className="text-blue-600 hover:text-blue-400 hover:underline flex items-center justify-center cursor-pointer"
            >
              <ChevronLeft className="h-5" /> Back to Login
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
