import { ProductAnalysis } from '@/components/product-analysis/product-analysis';
import api from '@/lib/api';
import { getCookie } from 'cookies-next';
import { cookies, headers } from 'next/headers';
import { parseUser } from '@/utils/helper-function';
import { ADMIN_EMAILS } from '@/constants';

type Props = {
  params: Promise<{ storeId: string }>;
};

const getStores = async () => {
  try {
    const authToken = await getCookie('auth', { cookies });

    const { data } = await api.get('/store', {
      adapter: 'fetch',
      fetchOptions: { cache: 'no-store' },
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    return data;
  } catch (error) {
    return null;
  }
};

async function ProductAnalysisPage({ params }: Props) {
  const { storeId } = await params;
  const stores = await getStores();

  const h = await headers();
  const userString = h.get("x-user");
  const user = parseUser(String(userString));

  const isAdmin = ADMIN_EMAILS.includes(user?.email);

  return (
    <div className="p-4">
      <ProductAnalysis storeId={storeId} stores={stores} isAdmin={isAdmin} />
    </div>
  );
}

export default ProductAnalysisPage;
