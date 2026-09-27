"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SignUpForm } from "@/components/motion/signup-form-extended";

export default function SignUpPage() {
  const router = useRouter();
  const [formError, setFormError] = useState<string>();

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background px-4 py-10">
      <SignUpForm
        title="Create your account"
        description="Start building in under a minute."
        errorMessage={formError}
        dobSound
        onSubmit={async (values) => {
          setFormError(undefined);

          const res = await fetch("/api/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(values),
          });

          if (!res.ok) {
            const data = await res.json().catch(() => null);
            setFormError(data?.message ?? "Something went wrong. Please try again.");
            throw new Error("Signup failed");
          }

          router.push("/welcome");
        }}
        footer={
          <>
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="font-medium text-foreground underline underline-offset-4"
            >
              Sign in
            </button>
          </>
        }
      />
    </div>
  );
}
