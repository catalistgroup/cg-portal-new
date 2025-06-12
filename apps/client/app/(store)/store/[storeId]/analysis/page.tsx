import { ProductAnalysis } from "@/components/product-analysis/product-analysis";
import api from "@/lib/api";
import { getCookie } from "cookies-next";
import { cookies } from "next/headers";

type Props = {
  params: Promise<{ storeId: string }>;
};

const getStores = async () => {
  try {
    const authToken = await getCookie("auth", { cookies });

    const { data } = await api.get("/store", {
      adapter: "fetch",
      fetchOptions: { cache: "no-store" },
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    return data;
  } catch (error) {
    return null;
  }
}

async function ProductAnalysisPage({ params }: Props) {
  const { storeId } = await params;
  const stores = await getStores();
  
  return (
    <div className="p-4">
      <ProductAnalysis storeId={storeId}  stores={stores}/>
    </div>
  );
}

export default ProductAnalysisPage;
