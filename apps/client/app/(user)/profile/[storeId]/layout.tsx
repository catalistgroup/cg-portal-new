// import { StoreHeader } from "@/components/store-header";
// import RootProvider from "@/context/RootProvider";
// import { headers } from "next/headers";
// import { redirect } from "next/navigation";
// import React, { ReactNode } from "react";

// type Props = {
//   children: ReactNode;
//   params: Promise<{ storeId: string }>;
// };

// async function RootLayout({ children }: Props) {

//   const h = await headers();
//   const userString = h.get("x-user");
//   const user = parseUser(String(userString));

//   if (!user) {
//     return redirect("/login");
//   }

//   return (
//     <RootProvider user={user}>
//       <main className="flex min-h-screen flex-col bg-[#F1F5FD]">
//         <StoreHeader
//           storeId={storeId}
//           stores={stores}
//           user={user}
//         />
//         {children}
//       </main>
//     </RootProvider>
//   );
// }

// function parseUser(str: string) {
//   try {
//     return JSON.parse(str);
//   } catch (error) {
//     return null;
//   }
// }

// export default RootLayout;


import { StoreHeader } from "@/components/store-header";
import RootProvider from "@/context/RootProvider";
import api from "@/lib/api";
import { getCookie } from "cookies-next";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import React, { ReactNode } from "react";

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

type Props = {
  children: ReactNode;
  params: Promise<{ storeId: string }>;
};

async function RootLayout({ children, params }: Props) {
  const { storeId } = await params;
  const stores = await getStores();

  const h = await headers();
  const userString = h.get("x-user");
  const user = parseUser(String(userString));

  if (!user) {
    return redirect("/login");
  }

  return (
    <RootProvider user={user}>
      <main className="flex min-h-screen flex-col bg-[#F1F5FD]">
        <StoreHeader
          storeId={storeId}
          stores={stores}
          user={user}
        />
        {children}
      </main>
    </RootProvider>
  );
}

function parseUser(str: string) {
  try {
    return JSON.parse(str);
  } catch (error) {
    return null;
  }
}

export default RootLayout;
