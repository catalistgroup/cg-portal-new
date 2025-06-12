"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { Eye, Plus, Calendar, Search, RefreshCw } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { purchaseOrdersByStoreId } from "@/query/queryFn";
import { PurchaseOrderType, UserType } from "@/lib/types";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "./ui/datatable";
import Link from "next/link";
import { Input } from "./ui/input";
import { toast } from "sonner";
import api from "@/lib/api";

const getColumns = (user: UserType, handleResend: (orderId: number) => Promise<void>): ColumnDef<PurchaseOrderType>[] => [
  {
    accessorKey: "id",
    header: "Order ID",
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: "order_placed_at",
    header: "Date",
    cell: (info) => (
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-gray-500" />
        {new Date(info.getValue() as Date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })}
      </div>
    ),
  },
  {
    id: "itemsCount",
    header: "Items",

    cell: (info) => {
      const items = info.row.original.items;
      const count = items
        ? items.reduce((sum, item) => {
            if (item.asin === "PREP_AND_PACK_FEES" || item.asin === "CREDIT_CARD_FEE") return sum;
            return sum + item.quantity;
          }, 0)
        : 0;
      return (
        <span className="px-2 py-1 rounded-full w-fit bg-black/5 text-xs  block">
          {count} items
        </span>
      );
    }
  },
  {
    id: "totalAmount",
    header: () => <div>Total Amount</div>,
    cell: (info) => {
      const items = info.row.original.items;
      const total = items
        ? items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0)
        : 0;
      return (
        <span className="font-medium block">
          {new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
          }).format(total)}
        </span>
      );
    },
  },
  {
    id: "itemStatus",
    header: () => <div>Status</div>,
    cell: ({ row }) => {
      return (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${row?.original?.order_status === 'received'
          ? "bg-green-100 text-green-500"
          : "bg-red-100 text-red-500"
          }`}>
          {row?.original?.order_status}
        </span>
      );
    },
  },
  ...(user?.is_superuser
    ? [{
      id: "apiStatus",
      header: () => <div>API Status</div>,
      cell: ({ row }: any) => {
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${row.original.is_api_succeed
            ? "bg-green-100 text-green-500"
            : "bg-red-100 text-red-500"
            }`}>
            {row.original.is_api_succeed ? "received" : "failed"}
          </span>
        );
      },
    }]
    : []),
  {
    id: "actions",
    header: () => <div className="text-right pr-1">Actions</div>,
    cell: ({ row }) => (
      <div className="text-right flex items-center justify-end gap-2">
        <Link href={`/store/${row.original.store_id}/orders/${row.original.id}`}>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full border-black/10 hover:bg-black/5 hover:text-black"
          >
            <Eye className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">View details</span>
          </Button>
        </Link>

        {/* Show Resend button only for superuser and failed orders */}
        {user?.is_superuser && (
          <Button
            variant="outline"
            size="sm"
            className="rounded-full border-red-200 text-red-500 hover:bg-red-50"
            onClick={() => handleResend(row.original.id)}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Resend</span>
          </Button>
        )}
      </div>
    ),
  },
];

export function PurchaseOrdersList({ storeId, user }: { storeId: string, user: UserType }) {

  const { data = [], isLoading } = useQuery<PurchaseOrderType[]>({
    queryKey: ["purchase-orders", storeId],
    queryFn: () => purchaseOrdersByStoreId(storeId),
  });

  const router = useRouter();

  const handleCreateOrder = () => {
    router.push(`/store/${storeId}/analysis`);
  };

  const handleResend = async (orderId: number) => {
    try {
      await api.post(`/purchase-order/${orderId}/store/${storeId}/resend`);
      toast.success("Order resent successfully");
    } catch (error) {
      console.error("Failed to resend order:", error);
      toast.error("Failed to resend order");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Button
          onClick={handleCreateOrder}
          className="rounded-full w-full sm:order-2 sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create New Order
        </Button>

        <div className="w-full sm:w-auto md:w-[40%] lg:w-[35%] relative sm:order-1">
          <Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search products..."
            className="pl-9 rounded-xl w-full"
          />
        </div>
      </div>




      <Card className="border-none shadow-md">
        <CardContent className="p-5">
          <DataTable
            columns={getColumns(user, handleResend)}
            data={data}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>
    </div>
  );
}
