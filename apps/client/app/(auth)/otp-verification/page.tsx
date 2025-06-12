import OtpVerificationForm from "@/components/otp-verification-form";
import { RegisterForm } from "@/components/register-form";
import { getCookie } from "cookies-next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

async function OTPVerificationPage() {
    const authToken = await getCookie("auth", { cookies });

    return (
        <main className="min-h-screen max-h-screen flex flex-col items-center justify-center p-4 md:p-24 bg-gradient-to-b from-white to-gray-50">
            <div className="w-full max-w-md">
                <OtpVerificationForm />
            </div>
        </main>
    );
}

export default OTPVerificationPage;
