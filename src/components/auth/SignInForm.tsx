"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { GoogleIcon } from "@/components/ui/icons";

type Stage = "email" | "code";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const inputClass =
  "mt-1.5 block h-12 w-full rounded-lg border border-border bg-card px-3.5 text-base text-foreground " +
  "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 " +
  "focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background " +
  "aria-[invalid=true]:border-primary";

export function SignInForm({
  googleConfigured,
  initialError = "",
}: {
  googleConfigured: boolean;
  initialError?: string;
}) {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState(initialError);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function requestCode() {
    const normalizedEmail = email.trim().toLowerCase();
    if (!emailPattern.test(normalizedEmail)) {
      setError("Enter a valid email address.");
      return;
    }

    setError("");
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/auth/email-code/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(result.error || "We could not send a code. Please try again.");
        return;
      }
      setStage("code");
    } catch {
      setError("We could not send a code. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function verifyCode() {
    if (!/^\d{6}$/.test(code.trim())) {
      setError("Enter the six-digit code from your email.");
      return;
    }

    setError("");
    setIsSubmitting(true);
    try {
      const res = await signIn("email-code", {
        code: code.trim(),
        redirect: false,
      });

      if (res?.error) {
        const response = await fetch("/api/auth/email-code/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: code.trim() }),
        });
        const result = (await response.json()) as {
          error?: string;
          redirectTo?: string;
        };
        if (!response.ok) {
          setError(
            result.error || "That code is not correct or has expired. Try again.",
          );
          return;
        }
        router.push(result.redirectTo || "/panel");
        return;
      }

      router.push("/panel");
    } catch {
      setError("We could not verify that code. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-8 sm:p-10">
      {stage === "email" ? (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void requestCode();
          }}
          noValidate
        >
          <label htmlFor="email" className="text-sm font-semibold text-foreground">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "email-error" : "email-hint"}
            className={inputClass}
            placeholder="you@example.com"
          />
          {error ? (
            <p id="email-error" className="mt-2 text-sm text-primary">
              {error}
            </p>
          ) : (
            <p id="email-hint" className="mt-2 text-sm text-muted-foreground">
              We&apos;ll send a six-digit code to this address.
            </p>
          )}
          <div className="mt-7">
            <Button type="submit" size="lg" disabled={isSubmitting}>
              {isSubmitting ? "Sending code..." : "Email me a code"}
            </Button>
          </div>
        </form>
      ) : (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void verifyCode();
          }}
          noValidate
        >
          <h2 className="text-xl font-semibold text-foreground">Check your email</h2>
          <p className="mt-2 text-base leading-relaxed text-muted-foreground">
            We sent a six-digit code to <strong className="font-semibold text-foreground">{email}</strong>. It expires in 10 minutes.
          </p>
          <label htmlFor="code" className="mt-6 block text-sm font-semibold text-foreground">
            Six-digit code
          </label>
          <input
            id="code"
            name="code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={code}
            onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "code-error" : undefined}
            className={inputClass}
            placeholder="123456"
          />
          {error ? (
            <p id="code-error" className="mt-2 text-sm text-primary">
              {error}
            </p>
          ) : null}
          <div className="mt-7 flex flex-wrap items-center gap-4">
            <Button type="submit" size="lg" disabled={isSubmitting}>
              {isSubmitting ? "Signing in..." : "Continue"}
            </Button>
            <button
              type="button"
              className="text-sm font-semibold text-primary hover:text-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              onClick={() => {
                setCode("");
                setError("");
                setStage("email");
              }}
            >
              Use a different email
            </button>
          </div>
        </form>
      )}

      {googleConfigured ? (
        <>
          <div className="my-8 flex items-center gap-4" aria-hidden="true">
            <span className="h-px flex-1 bg-border" />
            <span className="text-sm text-muted-foreground">or</span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <Button
            type="button"
            variant="outline"
            fullWidth
            onClick={() => void signIn("google", { callbackUrl: "/panel" })}
          >
            <GoogleIcon className="h-5 w-5" />
            Continue with Google
          </Button>
        </>
      ) : null}
    </div>
  );
}
