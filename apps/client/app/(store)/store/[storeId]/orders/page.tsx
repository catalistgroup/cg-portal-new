import { PurchaseOrdersList } from "@/components/purchase-orders-list";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

type Props = {
  params: Promise<{ storeId: string }>;
};

async function OrdersPage({ params }: Props) {
  const h = await headers();
  const userString = h.get("x-user");
  const user = parseUser(String(userString));

  if (!user) {
    return redirect("/login");
  }
  const { storeId } = await params;

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Purchase Orders</h2>
      <PurchaseOrdersList storeId={storeId} user={user} />
    </div>
  );
}

function parseUser(str: string) {
  try {
    return JSON.parse(str);
  } catch (error) {
    return null;
  }
}

export default OrdersPage;
