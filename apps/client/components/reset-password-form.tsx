"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { z } from "zod";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField, FormMessage } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import api from "@/lib/api";

const resetPasswordSchema = z
  .object({
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormType = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const form = useForm<FormType>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const watchedNewPassword = useWatch({ control: form.control, name: "newPassword" });
  const watchedConfirmPassword = useWatch({ control: form.control, name: "confirmPassword" });

  useEffect(() => {
    if (watchedNewPassword || watchedConfirmPassword) {
      setError("");
    }
  }, [watchedNewPassword, watchedConfirmPassword]);

  useEffect(() => {
    const storedEmail = sessionStorage.getItem("resetEmail");
    if (!storedEmail) {
      router.replace("/forgot-password");
    } else {
      setEmail(storedEmail);
    }
  }, [router]);

  const onSubmit = async (data: FormType) => {
    setError("");
    setIsLoading(true);
    try {
      await api.post("/auth/reset-password", {
        email,
        password: data.newPassword
      });
      sessionStorage.removeItem("resetEmail");
      router.push("/login");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Password reset failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-white to-[#f6f9ff] flex flex-col items-center justify-center min-h-screen px-4">
      <img src="/logo.svg" alt="Catalist Group" width={140} height={40} className="object-contain h-[86px] w-fit mb-8" />
      <Card className="w-full max-w-md rounded-2xl shadow-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">Reset Password</CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            For security, your password must be at least 8 characters long and not one you've used previously.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <Alert variant="destructive" className="flex justify-between items-center">
                  <AlertCircle />
                  <span>{error}</span>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <FormField
                    name="newPassword"
                    render={({ field, fieldState }) => (
                      <>
                        <Input
                          id="newPassword"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter new password"
                          className={cn("pr-10", fieldState.error && "border-red-500") + "mt-0.5 mb-2"}
                          {...field}
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-3 h-4 w-4 text-muted-foreground"
                          aria-label="Toggle password visibility"
                          onClick={() => setShowPassword((prev) => !prev)}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <FormMessage />
                      </>
                    )}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <FormField
                    name="confirmPassword"
                    render={({ field, fieldState }) => (
                      <>
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm new password"
                          className={cn("pr-10", fieldState.error && "border-red-500") + "mt-0.5 mb-2"}
                          {...field}
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-3 h-4 w-4 text-muted-foreground"
                          aria-label="Toggle password visibility"
                          onClick={() => setShowConfirmPassword((prev) => !prev)}
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <FormMessage />
                      </>
                    )}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="mt-4 w-full bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
                disabled={isLoading}
              >
                {isLoading ? "Resetting..." : "Reset Password"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
