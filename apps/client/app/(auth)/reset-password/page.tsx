
import { ResetPasswordForm } from "@/components/reset-password-form";
import { redirect } from "next/navigation";

export default async function ResetPasswordPage() {
    return (
        <main className="min-h-screen max-h-screen flex flex-col items-center justify-center p-4 md:p-24 bg-gradient-to-b from-white to-gray-50">
            <div className="w-full max-w-md">
                <ResetPasswordForm />
            </div>
        </main>
    );
}
