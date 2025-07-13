"use client";

import type React from "react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { CatalogType } from "@/lib/types";
import { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} from "@/query/queryFn";

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
        <div className="min-w-[300px] max-w-[400px] hover:underline text-catalogue_primary-background">
          <a href={amazonLink} target="_blank" rel="noopener noreferrer">
            {productName}
          </a>
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
  {
    id: "wishlist",
    cell: ({ row }) => {
      const { data: wishlist = [] } = useQuery({
        queryKey: ["wishlist"],
        queryFn: getWishlist,
      });
      const isWishlisted = useMemo(
        () => wishlist.some((item) => item.id === row.original.id),
        [wishlist, row.original.id]
      );
      const { mutate: addToWishlistMutation } = useMutation(addToWishlist);
      const { mutate: removeFromWishlistMutation } =
        useMutation(removeFromWishlist);

      const handleWishlistClick = () => {
        if (isWishlisted) {
          removeFromWishlistMutation(row.original.id);
        } else {
          addToWishlistMutation(row.original.id);
        }
      };

      return (
        <Button variant="ghost" size="icon" onClick={handleWishlistClick}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-6 w-6 ${
              isWishlisted ? "text-red-500 fill-current" : "text-gray-500"
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </Button>
      );
    },
  },
];
