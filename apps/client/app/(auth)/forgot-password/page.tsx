import ForgotPasswordForm from "@/components/forgot-password-form";
import { getCookie } from "cookies-next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

async function ForgotPasswordPage() {
    const authToken = await getCookie("auth", { cookies });

    return (
        <main className="min-h-screen max-h-screen flex flex-col items-center justify-center p-4 md:p-24 bg-gradient-to-b from-white to-gray-50">
            <div className="w-full max-w-md">
                <ForgotPasswordForm />
            </div>
        </main>
    );
}

export default ForgotPasswordPage;
