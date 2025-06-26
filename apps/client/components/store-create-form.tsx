"use client";

import { useState, useEffect, use } from "react";
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
import { AlertCircle, Store, KeyRound, ShieldCheck, ShoppingBag } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { z } from "zod";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField, FormMessage } from "@/components/ui/form";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRoot } from "@/context/RootProvider";

const storeSchema = z.object({
  name: z.string().nonempty("Store name is required"),
  marketplace: z.enum(["Amazon", "Walmart"], {
    required_error: "Please select a marketplace",
  }),
  // api_client: z.string().nonempty("API Client is required"),
  // api_secret: z.string().nonempty("API Secret is required"),
});

type StoreFormType = z.infer<typeof storeSchema>;

export function StoreCreateForm() {
  const router = useRouter();

  const form = useForm<StoreFormType>({
    resolver: zodResolver(storeSchema),
    defaultValues: {
      name: "",
      marketplace: "Amazon",
    },
  });

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const watchedFields = useWatch({ control: form.control });

  useEffect(() => {
    setError("");
  }, [watchedFields]);

  const onSubmit = async (d: StoreFormType) => {
    setError("");
    setIsLoading(true);

    try {
      const payload = {
        name: d.name,
        marketplace: d.marketplace,
      };

      const { data } = await api.post("/store", payload);

      router.push("/store/" + data.id);
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || "Store creation failed";
      setError(errMsg);
      setIsLoading(false);
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
          <CardTitle className="text-center text-2xl font-bold">Create Store</CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            Enter your store details below
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

              {/* Store Name */}
              <FormField
                name="name"
                render={({ field, fieldState }) => (
                  <div>
                    <Label htmlFor="name">Store Name</Label>
                    <div className="relative">
                      <Store className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        {...field}
                        id="name"
                        placeholder="My Amazon Store"
                        className={cn("pl-10", fieldState.error && "border-red-500") + " mt-0.5 mb-2"}
                      />
                    </div>
                    <FormMessage />
                  </div>
                )}
              />

              {/* Marketplace */}
              <FormField
                name="marketplace"
                render={({ field, fieldState }) => (
                  <div>
                    <Label htmlFor="marketplace">Marketplace</Label>
                    <div className="relative">
                      <ShoppingBag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value || "Amazon"}
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

              {/* API Client */}
              {/* <FormField
                name="api_client"
                render={({ field, fieldState }) => (
                  <div>
                    <Label htmlFor="api_client">API Client</Label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        {...field}
                        id="api_client"
                        placeholder="API Client"
                        className={cn("pl-10", fieldState.error && "border-red-500") + " mt-0.5 mb-2"}
                      />
                    </div>
                    <FormMessage />
                  </div>
                )}
              /> */}

              {/* API Secret */}
              {/* <FormField
                name="api_secret"
                render={({ field, fieldState }) => (
                  <div>
                    <Label htmlFor="api_secret">API Secret</Label>
                    <div className="relative">
                      <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        {...field}
                        id="api_secret"
                        placeholder="API Secret"
                        type="text"
                        className={cn("pl-10", fieldState.error && "border-red-500") + " mt-0.5 mb-2"}
                      />
                    </div>
                    <FormMessage />
                  </div>
                )}
              /> */}

              <Button type="submit" className="mt-4 w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Store"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
