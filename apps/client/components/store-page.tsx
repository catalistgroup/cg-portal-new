"use client";

import { ProductsTable } from "@/components/products-table";
import DashboardOverview from "@/components/overview-dashboard";
import { useRoot } from "@/context/RootProvider";
import { cn } from "@/lib/utils";

type Props = { storeId: string };

export default function StorePage({ storeId }: Props) {
  const { user } = useRoot();

  return (
    <div
      className={cn(
        "mx-auto py-6 space-y-6",
        user?.type === "normal" && "opacity-50 select-none pointer-events-none"
      )}
    >
      <DashboardOverview storeId={storeId} />

      <section className="w-full overflow-x-auto">
        <h2 className="text-xl font-semibold mb-4">Active Products</h2>
        <ProductsTable storeId={storeId} />
      </section>
    </div>
  );
}
