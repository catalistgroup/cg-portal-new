"use client";

import type React from "react";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, BarChart3 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { productsByStoreId } from "@/query/queryFn";
import { CatalogType } from "@/lib/types";
import Link from "next/link";
import { DataTable } from "./ui/datatable";
import { ColumnDef } from "@tanstack/react-table";
import { useDebounce } from "@/hooks/use-debounce";
import Image from "next/image";

export const productColumns: ColumnDef<CatalogType>[] = [
  {
    accessorKey: "image_url",
    header: "Image",
    cell: ({ getValue }) => (
      <div className="flex items-center justify-center border-[1.6px] border-gray-200 rounded-md p-1.5">
        <Image
          height={80}
          width={80}
          alt="product_image"
          className="h-[45px] object-cover"
          src={String(getValue() || "/default_product.png")}
        />
      </div>
    ),
  },
  { accessorKey: "brand", header: "Brand" },
  {
    accessorKey: "name",
    header: "Product Name",
    cell: ({ row }) => {
      const asin = row.original.asin;
      const productName = String(row.getValue("name"));
      const amazonLink = `https://www.amazon.com/dp/${asin}`;

      return (
        <div className="min-w-[300px] max-w-[400px] text-primary hover:underline">
          <a href={amazonLink} target="_blank" rel="noopener noreferrer">{productName}</a>
        </div>
      );
    },
  },
  { accessorKey: "asin", header: "ASIN" },
  { accessorKey: "upc", header: "UPC/EAN" },
  { accessorKey: "moq", header: "MOQ" },

  {
    accessorKey: "selling_price",
    header: "Price",
    cell({ getValue }) {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(Number(getValue()));
    },
  },
  {
    accessorKey: "buybox_price",

    header: "Amazon Buybox",
    id: "amazon_buybox",
  },
  {
    accessorKey: "amazon_fee",
    id: "amazon_fee",
    header: "Amazon Fees",
    cell({ getValue }) {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(Number(getValue()));
    },
  },
  {
    accessorKey: "profit",
    header: "Profit",
    id: "amazon_profit",
    cell({ getValue }) {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(Number(getValue()));
    },
  },
  {
    accessorKey: "margin",
    header: "Margin",
    id: "amazon_margin",
    cell({ getValue }) {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(Number(getValue()));
    },
  },
  {
    accessorKey: "roi",
    header: "ROI",
    id: "amazon_roi",
    cell({ getValue }) {
      return Number(getValue()).toFixed(2) + "%";
    },
  },
  // {
  //   accessorKey: "wfs_id",

  //   header: "WFS ID",
  //   id: "walmart_wfs_id",
  // },
  // {
  //   accessorKey: "walmart_buybox",

  //   header: "Walmart Buybox",
  // },
  // {
  //   accessorKey: "walmart_fees",
  //   header: "Walmart Fees",
  //   cell({ getValue }) {
  //     return getValue()
  //       ? new Intl.NumberFormat("en-US", {
  //           style: "currency",
  //           currency: "USD",
  //         }).format(Number(getValue()))
  //       : null;
  //   },
  // },
  // {
  //   accessorKey: "walmart_profit",
  //   header: "Profit",
  //   cell({ getValue }) {
  //     return getValue()
  //       ? new Intl.NumberFormat("en-US", {
  //           style: "currency",
  //           currency: "USD",
  //         }).format(Number(getValue()))
  //       : null;
  //   },
  // },
  // {
  //   accessorKey: "walmart_margin",
  //   header: "Margin",
  //   cell({ getValue }) {
  //     return getValue()
  //       ? new Intl.NumberFormat("en-US", {
  //           style: "currency",
  //           currency: "USD",
  //         }).format(Number(getValue()))
  //       : null;
  //   },
  // },
  // {
  //   accessorKey: "walmart_roi",
  //   header: "ROI",
  //   cell({ getValue }) {
  //     return getValue() ? Number(getValue()).toFixed(2) + "%" : null;
  //   },
  // },
];

export function ProductsTable({ storeId }: { storeId: string }) {
  const router = useRouter();

  const { data = [], isLoading } = useQuery<CatalogType[]>({
    queryKey: ["products", storeId],
    queryFn: () => productsByStoreId(storeId),
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
