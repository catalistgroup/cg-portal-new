"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

const otpSchema = z.object({
  code: z
    .string()
    .min(6, "OTP must be 6 digits")
    .max(6, "OTP must be 6 digits")
    .regex(/^\d+$/, "OTP must be numeric"),
});

export default function OtpVerificationForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [resending, setResending] = useState(false);
  const [email, setEmail] = useState("");

  const { register, setValue, getValues, watch, handleSubmit } = useForm<{
    code: string;
  }>({
    resolver: zodResolver(otpSchema),
    defaultValues: { code: "" },
  });

  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const code = watch("code");

  // Clear error on input
  useEffect(() => {
    if (code.length > 0 && error) {
      setError("");
    }
  }, [code]);

  // Timer countdown
  useEffect(() => {
    if (resendTimer <= 0) return;

    const timer = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          setResending(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [resendTimer]);

  useEffect(() => {
    const storedEmail = sessionStorage.getItem("resetEmail");
    if (!storedEmail) {
      router.replace("/forgot-password");
    } else {
      setEmail(storedEmail);
    }
  }, [router]);

  // Update handleOtpInput to handle paste
  const handleOtpInput = (value: string, index: number) => {
    // Handle pasting
    if (value.length > 1) {
      const pastedValue = value.slice(0, 6).split('');
      const newCode = [...getValues("code").split('')];

      // Fill available slots with pasted numbers
      pastedValue.forEach((char, idx) => {
        if (idx < 6) {
          newCode[index + idx] = char;
        }
      });

      setValue("code", newCode.join(''));

      // Focus the next empty input or the last input
      const nextEmptyIndex = newCode.findIndex((val, idx) => !val && idx > index);
      if (nextEmptyIndex !== -1) {
        inputsRef.current[nextEmptyIndex]?.focus();
      } else {
        inputsRef.current[5]?.focus();
      }
      return;
    }

    // Handle single digit input
    const otpArray = getValues("code").split("");
    otpArray[index] = value;
    const newCode = otpArray.join("").substring(0, 6);
    setValue("code", newCode);

    if (value && inputsRef.current[index + 1]) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleBackspace = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Backspace" && !getValues("code")[index] && inputsRef.current[index - 1]) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const onSubmit = async (data: { code: string }) => {
    setIsLoading(true);
    try {
      await api.post("/auth/verify-otp", {
        email,
        code: data.code
      });
      router.push("/reset-password");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Invalid or expired code.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    setResending(true);
    setError("");
    try {
      const hostname = window.location.hostname;
      await api.post("/auth/resend-otp", { email, hostname });
      setResendTimer(60);
    } catch (err: any) {
      const errorMessage = err?.response?.status === 429
        ? "Please wait before requesting another code."
        : err?.response?.data?.message || "Failed to resend code.";
      setError(errorMessage);
      if (err?.response?.status !== 429) {
        setResendTimer(0);
      }
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-white to-[#f6f9ff] px-4">
      <Image src="/logo.svg" alt="Catalist Group" width={140} height={40} className="mb-8 h-[86px]" priority />
      <div className="w-full max-w-md bg-white shadow-md rounded-2xl p-6 space-y-6 text-center">
        <h1 className="text-2xl font-bold">OTP Verification</h1>
        <p className="text-muted-foreground text-sm">
          Check your inbox at <span className="font-semibold">{email}</span> for a verification code.
        </p>

        {error && (
          <Alert variant="destructive" className="flex justify-between items-center">
            <AlertCircle />
            <span>{error}</span>
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex justify-center gap-2">
            {Array(6)
              .fill(0)
              .map((_, i) => (
                <Input
                  key={i}
                  ref={(el) => { inputsRef.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={6} // Changed from 1 to 6 to allow paste
                  className="w-12 h-12 text-center text-lg font-semibold border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={code[i] || ""}
                  onChange={(e) => handleOtpInput(e.target.value, i)}
                  onKeyDown={(e) => handleBackspace(e, i)}
                  onPaste={(e) => {
                    e.preventDefault();
                    const pasteData = e.clipboardData.getData('text').replace(/[^0-9]/g, '');
                    handleOtpInput(pasteData, i);
                  }}
                />
              ))}
          </div>

          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
            disabled={isLoading || code.length !== 6}
          >
            {isLoading ? "Verifying..." : "Confirm"}
          </Button>
        </form>

        <div className="text-sm text-muted-foreground">
          Didn’t receive code?{" "}
          {resendTimer > 0 ? (
            <span className="text-gray-400">{resendTimer}s</span>
          ) : (
            <button
              onClick={handleResend}
              disabled={resending}
              className="text-blue-600 font-medium hover:underline"
            >
              {resending ? "Sending..." : "Resend"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
