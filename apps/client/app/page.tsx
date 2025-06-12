import { getCookie } from "cookies-next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

async function Home() {
  const authToken = await getCookie("auth", { cookies });

  if (authToken) {
    return redirect("store");
  } else {
    return redirect("/login");
  }

}

export default Home;
