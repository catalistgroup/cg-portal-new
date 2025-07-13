import StorePage from "@/components/store-page";
import { ProductsTable } from "@/components/products-table";

type Props = {
  params: { storeId: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export default function Page({ params, searchParams }: Props) {
  const { storeId } = params;
  const { sortBy } = searchParams;

  return (
    <div className="px-4">
      <StorePage storeId={storeId} />
    </div>
  );
}
