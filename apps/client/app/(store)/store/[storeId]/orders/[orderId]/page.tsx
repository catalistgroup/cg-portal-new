import { PurchaseOrderDetails } from "@/components/purchase-order-details";

type Props = {
  params: Promise<{ storeId: string; orderId: string }>;
};

async function OrderDetailsPage({ params }: Props) {
  const { storeId, orderId } = await params;

  return (
    <div className="p-4">
      <PurchaseOrderDetails storeId={storeId} orderId={orderId} />
    </div>
  );
}

export default OrderDetailsPage;
