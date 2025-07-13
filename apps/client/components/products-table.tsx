"use client";

import type React from "react";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, BarChart3 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery, useMutation } from "@tanstack/react-query";
import { productsByStoreId } from "@/query/queryFn";
import { CatalogType } from "@/lib/types";
import { DataTable } from "./ui/datatable";
import { useDebounce } from "@/hooks/use-debounce";
import { productColumns } from "./product-columns";

export function ProductsTable({ storeId }: { storeId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sortBy = searchParams.get("sortBy");

  const { data = [], isLoading } = useQuery<CatalogType[]>({
    queryKey: ["products", storeId, sortBy],
    queryFn: () => productsByStoreId(storeId, { sortBy }),
  });

  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebounce(searchQuery, 300);

  const filtered = useMemo(
    () =>
      data.filter(
        (p) =>
          p.name.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
          p.brand.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
          p.asin.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
          p.upc?.toLowerCase().includes(debouncedQuery.toLowerCase())
      ),
    [data, debouncedQuery]
  );

  const [selected, setSelected] = useState<string[]>([]);

  return (
    <Card className="border-none shadow-md">
      <CardContent className="p-4 sm:p-6">
        <div className="space-y-4 w-full">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products..."
                className="pl-9 rounded-full border-black/10 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button
              onClick={() => router.push(`/store/${storeId}/analysis`)}
              className="rounded-full w-full sm:w-auto"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Analysis
            </Button>
          </div>

          <DataTable
            columns={productColumns}
            data={filtered}
            isLoading={isLoading}
            defaultPageSize={10}
          />
        </div>
      </CardContent>
    </Card>
  );
}
