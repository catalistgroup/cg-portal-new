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
import { AlertCircle, User, Lock, Eye, EyeOff, Building2, Phone, Store } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { z } from "zod";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField, FormMessage } from "@/components/ui/form";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import { setCookie } from "cookies-next";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const registerSchema = z
  .object({
    firstName: z.string().nonempty("First name is required"),
    lastName: z.string().nonempty("Last name is required"),
    email: z.string().nonempty("Email is required").email("Invalid email"),
    phone: z.string().nonempty("Phone is required"),
    company: z.string().nonempty("Company is required"),
    storefront: z.enum(["Amazon", "Walmart"], {
      required_error: "Please select a marketplace",
    }),
    password: z
      .string()
      .nonempty("Password is required")
      .min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().nonempty("Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormType = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();

  const form = useForm<FormType>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      company: "",
      storefront: "Amazon",
      password: "",
      confirmPassword: "",
    },
  });

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const watchedFields = useWatch({ control: form.control });

  useEffect(() => {
    setError("");
  }, [watchedFields]);

  const onSubmit = async (d: FormType) => {
    setError("");
    setIsLoading(true);

    try {
      const payload = {
        name: `${d.firstName} ${d.lastName}`.trim(),
        email: d.email,
        phone: d.phone,
        company: d.company,
        storefront: d.storefront,
        password: d.password,
      };

      const res = await api.post("/auth/register", payload);
      setCookie("auth", res.data.token);
      router.push("/store");
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || "Registration failed";
      setError(errMsg);
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
          <CardTitle className="text-center text-2xl font-bold">Register</CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            Create your account below
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <Alert variant="destructive" className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </Alert>
              )}

              {/* First Name */}
              <FormField
                name="firstName"
                render={({ field, fieldState }) => (
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      {...field}
                      id="firstName"
                      placeholder="Enter first name"
                      className={cn(fieldState.error && "border-red-500")}
                    />
                    <FormMessage />
                  </div>
                )}
              />

              {/* Last Name */}
              <FormField
                name="lastName"
                render={({ field, fieldState }) => (
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      {...field}
                      id="lastName"
                      placeholder="Enter last name"
                      className={cn(fieldState.error && "border-red-500")}
                    />
                    <FormMessage />
                  </div>
                )}
              />

              {/* Email */}
              <FormField
                name="email"
                render={({ field, fieldState }) => (
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        {...field}
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        className={cn("pl-10", fieldState.error && "border-red-500")}
                      />
                    </div>
                    <FormMessage />
                  </div>
                )}
              />

              {/* Phone */}
              <FormField
                name="phone"
                render={({ field, fieldState }) => (
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        {...field}
                        id="phone"
                        type="tel"
                        placeholder="Enter phone number"
                        className={cn("pl-10", fieldState.error && "border-red-500")}
                      />
                    </div>
                    <FormMessage />
                  </div>
                )}
              />

              {/* Company */}
              <FormField
                name="company"
                render={({ field, fieldState }) => (
                  <div>
                    <Label htmlFor="company">Company</Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        {...field}
                        id="company"
                        placeholder="Enter company name"
                        className={cn("pl-10", fieldState.error && "border-red-500")}
                      />
                    </div>
                    <FormMessage />
                  </div>
                )}
              />

              {/* Storefront */}
              <FormField
                name="storefront"
                render={({ field, fieldState }) => (
                  <div>
                    <Label htmlFor="storefront">Marketplace</Label>
                    <div className="relative">
                      <Store className="absolute left-3 top-3 h-4 w-4 text-muted-foreground z-10" />
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <SelectTrigger className="w-full pl-10">
                          <SelectValue placeholder="Select marketplace" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Amazon">Amazon</SelectItem>
                          <SelectItem value="Walmart">Walmart</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <FormMessage />
                  </div>
                )}
              />

              {/* Password */}
              <FormField
                name="password"
                render={({ field, fieldState }) => (
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        {...field}
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter password"
                        className={cn("pl-10 pr-10", fieldState.error && "border-red-500") + "mt-0.5 mb-2"}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-3"
                        onClick={() => setShowPassword((prev) => !prev)}
                        aria-label="Toggle password visibility"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <FormMessage />
                  </div>
                )}
              />

              {/* Confirm Password */}
              <FormField
                name="confirmPassword"
                render={({ field, fieldState }) => (
                  <div>
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        {...field}
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm password"
                        className={cn("pl-10 pr-10", fieldState.error && "border-red-500") + "mt-0.5 mb-2"}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-3"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        aria-label="Toggle password visibility"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>


                    <FormMessage />
                  </div>
                )}
              />

              <Button
                type="submit"
                className="mt-4 w-full bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
                disabled={isLoading}
              >
                {isLoading ? "Registering..." : "Register"}
              </Button>

              <p className="text-sm text-center text-muted-foreground mt-2">
                Already have an account?{" "}
                <Link href="/" className="text-blue-600 hover:underline">
                  Login
                </Link>
              </p>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
