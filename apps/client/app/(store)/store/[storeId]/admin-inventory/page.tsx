import api from '@/lib/api';
import { getCookie } from 'cookies-next';
import { cookies, headers } from 'next/headers';
import { parseUser } from '@/utils/helper-function';
import { ModifyInventory } from '@/components/product-analysis/modify-inventory';
import { redirect } from 'next/navigation';

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
  const userString = h.get('x-user');
  const user = parseUser(String(userString));

  const isAdmin = user?.is_superuser;

  if (!isAdmin) {
    return redirect("/store");
  }

  return (
    <div className="p-4">
      <ModifyInventory storeId={storeId} stores={stores} isAdmin={isAdmin} />
    </div>
  );
}

export default ProductAnalysisPage;
