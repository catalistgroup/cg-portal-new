"use client";

import { useQuery } from "@tanstack/react-query";
import { getWishlist } from "@/query/queryFn";
import { ProductsTable } from "@/components/products-table";
import { productColumns } from "@/components/products-table";
import { DataTable } from "@/components/ui/datatable";

export default function WishlistPage() {
  const { data: wishlist = [], isLoading } = useQuery({
    queryKey: ["wishlist"],
    queryFn: getWishlist,
  });

  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-2xl font-bold mb-4">My Wishlist</h1>
      <DataTable
        columns={productColumns}
        data={wishlist}
        isLoading={isLoading}
        defaultPageSize={10}
      />
    </div>
  );
}
