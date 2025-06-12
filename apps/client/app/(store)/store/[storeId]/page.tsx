import StorePage from "@/components/store-page";

type Props = {
  params: Promise<{ storeId: string }>;
};

export default async function Page({ params }: Props) {
  // In a real app, you would fetch store data based on the storeId
  const { storeId } = await params;

  return (<div className="px-4">
    <StorePage storeId={storeId} />;
  </div>)
}
