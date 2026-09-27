"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SignInForm } from "@/components/motion/signin-form";

export default function SignInPage() {
  const router = useRouter();
  const [formError, setFormError] = useState<string>();

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background px-4 py-10">
      <SignInForm
        title="Welcome back"
        description="Sign in to continue."
        errorMessage={formError}
        secondaryAction={
          <button
            type="button"
            onClick={() => router.push("/forgot-password")}
            className="text-sm font-medium text-foreground underline underline-offset-4"
          >
            Forgot password?
          </button>
        }
        onSubmit={async (values) => {
          setFormError(undefined);

          const res = await fetch("/api/signin", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(values),
          });

          if (!res.ok) {
            const data = await res.json().catch(() => null);
            setFormError(data?.message ?? "Invalid email or password.");
            throw new Error("Sign-in failed");
          }

          router.push("/dashboard");
        }}
        footer={
          <>
            Don&apos;t have an account?{" "}
            <button
              type="button"
              onClick={() => router.push("/signup")}
              className="font-medium text-foreground underline underline-offset-4"
            >
              Sign up
            </button>
          </>
        }
      />
    </div>
  );
}
