import api from "@/lib/api";
import { getCookie } from "cookies-next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

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
};

async function Page() {
  const stores = await getStores();

  if (stores && stores.length > 0) {
    return redirect("/store/" + stores[0].id);
  } else {
    return redirect("/create-store");
  }
}

export default Page;
