"use client";

import { ProductsTable } from "@/components/products-table";
import DashboardOverview from "@/components/overview-dashboard";
import { useRoot } from "@/context/RootProvider";
import { cn } from "@/lib/utils";

type Props = { storeId: string };

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function StorePage({ storeId }: Props) {
  const { user } = useRoot();
  const searchParams = useSearchParams();
  const sortBy = searchParams.get("sortBy");

  return (
    <div
      className={cn(
        "mx-auto py-6 space-y-6",
        user?.type === "normal" && "opacity-50 select-none pointer-events-none"
      )}
    >
      <DashboardOverview storeId={storeId} />

      <section className="w-full overflow-x-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Active Products</h2>
          <div className="flex items-center gap-4">
            <Link href={`/store/${storeId}`}>All</Link>
            <Link href={`/store/${storeId}?sortBy=new`}>New This Week</Link>
            <Link href={`/store/${storeId}?sortBy=top`}>Top Movers</Link>
          </div>
        </div>
        <ProductsTable storeId={storeId} />
      </section>
    </div>
  );
}
