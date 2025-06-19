import { RegisterForm } from "@/components/register-form";
import { getCookie } from "cookies-next";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_EMAILS } from "@/constants";

async function RegisterPage() {
    const authToken = await getCookie("auth", { cookies });

    const h = await headers();
    const userString = h.get("x-user");
    const user = parseUser(String(userString));

    if (!user) {
        return redirect("/login");
    }

    if (!ADMIN_EMAILS.includes(user.email)) {
        return redirect("/login");
    }

    // if (authToken) {
    //     return redirect("/store");
    // }

    return (
        <main className="min-h-screen flex flex-col items-center justify-center p-4 md:p-24 bg-gradient-to-b from-white to-gray-50">
            <div className="w-full max-w-md">
                <RegisterForm />
            </div>
        </main>
    );
}

function parseUser(str: string) {
    try {
        return JSON.parse(str);
    } catch (error) {
        return null;
    }
}

export default RegisterPage;
