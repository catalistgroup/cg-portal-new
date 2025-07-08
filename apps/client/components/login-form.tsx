"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle, User, Lock, Eye, EyeOff } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { z } from "zod";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField, FormMessage } from "@/components/ui/form";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import { setCookie } from "cookies-next";
import Image from "next/image";
import { toast } from "sonner";

const loginSchema = z.object({
  email: z.string().nonempty("Email required").email(),
  password: z
    .string()
    .nonempty("Password required")
    .min(8, "Password must be 8 char"),
});

type FormType = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);


  const watchedEmail = useWatch({ control: form.control, name: "email" });
  const watchedPassword = useWatch({ control: form.control, name: "password" });

  useEffect(() => {
    if (watchedEmail || watchedPassword) {
      setError("");
    }
  }, [watchedEmail, watchedPassword]);



  const onSubmit = async (d: FormType) => {
    setError("");
    setIsLoading(true);

    try {
      const { data } = await api.post("/auth/login", d);
      setCookie("auth", data.token);

      const { data: storeData } = await api.get("/store");
      const store = storeData.at(0);

      if (!store) {
        toast.error("Store not found, please create a store first");
        router.push("/create-store");
        return;
      }

      router.push("/store/" + store.id);
    } catch (err: any) {
      const errMsg = err.response ? err?.response?.data?.message : err?.message;
      setError(errMsg || "Login failed. Please check your credentials.");
      setIsLoading(false);
      toast.error(errMsg);
    }
  };

  return (
    <div className="bg-gradient-to-br from-white to-[#f6f9ff] flex flex-col items-center justify-center px-4">
      <Image
        src="/logo.svg"
        alt="Catalist Group"
        width={140}
        height={40}
        className="object-contain h-[86px] w-fit mb-8"
        priority
      />
      <Card className="w-full max-w-md rounded-2xl shadow-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">
            Welcome Back!
          </CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            Please enter your login credentials below
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-6 pt-0">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <Alert variant="destructive" className="flex justify-between items-center">
                  <AlertCircle />
                  <span>{error}</span>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <FormField
                    name="email"
                    render={({ field, fieldState }) => (
                      <>
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter your email"
                          autoComplete="email"
                          className={cn("pl-10", fieldState.error && "border-red-500") + " mt-0.5 mb-2"}
                          {...field}
                        />
                        <FormMessage />
                      </>
                    )}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <FormField
                    name="password"
                    render={({ field, fieldState }) => (
                      <>
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          autoComplete="current-password"
                          className={cn("pl-10 pr-10", fieldState.error && "border-red-500") + " mt-0.5 mb-2"}
                          {...field}
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-3 h-4 w-4 text-muted-foreground flex justify-center items-center"
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

              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-1">
                  <input type="checkbox" id="remember" className="accent-blue-600 w-4 h-4" />
                  <label htmlFor="remember">Remember Me</label>
                </div>
                <a href="/forgot-password" className="text-blue-600 hover:underline">
                  Forgot Password?
                </a>
              </div>

              <Button
                type="submit"
                className="mt-4 w-full bg-blue-600 hover:bg-blue-700 transition-colors duration-200" // Added transition
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Login"}
              </Button>

              {/* <div className="text-sm text-center mt-2">
                <span>Don't have an account? </span>
                <a href="/register" className="text-blue-600 hover:underline">
                  Register
                </a>
              </div> */}

            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
