"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { ClipboardCheckIcon, LockIcon } from "@/components/ui/icons";

type Fields = {
  name: string;
  phone: string;
  email: string;
  description: string;
};

type Errors = Partial<Record<keyof Fields, string>>;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const inputClass =
  "mt-1.5 block w-full rounded-lg border border-border bg-card px-3.5 text-base text-foreground " +
  "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 " +
  "focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background " +
  "aria-[invalid=true]:border-primary";

function validate(values: Fields): Errors {
  const errors: Errors = {};

  if (!values.phone.trim()) {
    errors.phone = "Please enter a phone number we can reach you on.";
  }

  if (!values.email.trim()) {
    errors.email = "Please enter your email address.";
  } else if (!emailPattern.test(values.email.trim())) {
    errors.email = "Please enter a valid email address.";
  }

  if (values.description.trim().length < 10) {
    errors.description =
      "Please describe what's wrong in a little more detail (at least 10 characters).";
  }

  return errors;
}

export function RequestHelpForm() {
  const [values, setValues] = useState<Fields>({
    name: "",
    phone: "",
    email: "",
    description: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);
  const [submissionError, setSubmissionError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function update<K extends keyof Fields>(key: K, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setSubmissionError("");
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length !== 0) {
      return;
    }

    setSubmissionError("");
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/medical-help-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const result = (await response.json()) as { error?: string };
      if (response.ok) {
      setSubmitted(true);
      } else {
        setSubmissionError(
          result.error || "We could not save your request. Please try again.",
        );
      }
    } catch {
      setSubmissionError("We could not save your request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 sm:p-10">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-soft text-primary">
          <ClipboardCheckIcon className="h-6 w-6" />
        </span>
        <h2 className="mt-5 text-2xl font-semibold tracking-tight text-foreground">
          Your request has been received
        </h2>
        <p className="mt-3 text-base leading-relaxed text-muted-foreground">
          Thank you, {values.name.trim() || "we've got your details"}. We have sent a confirmation email to{" "}
          <span className="font-medium text-foreground">{values.email.trim()}</span>. A
          healthcare support worker will review what you&apos;ve shared and get
          in touch using the contact details you provided.
        </p>
        <p className="mt-4 rounded-lg bg-muted px-4 py-3 text-sm leading-relaxed text-muted-foreground">
          This service does not provide emergency care. If you think you may be
          experiencing a medical emergency, contact your local emergency service
          immediately.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button href="/">Back to home</Button>
          <Button
            variant="outline"
            onClick={() => {
              setValues({ name: "", phone: "", email: "", description: "" });
              setSubmitted(false);
            }}
          >
            Submit another request
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      className="rounded-2xl border border-border bg-card p-8 sm:p-10"
    >
      {submissionError ? (
        <p
          role="alert"
          className="mb-6 rounded-lg bg-primary-soft px-4 py-3 text-sm leading-relaxed text-foreground"
        >
          {submissionError}
        </p>
      ) : null}
      <div className="grid gap-6">
        <div>
          <label htmlFor="name" className="text-sm font-semibold text-foreground">
            Full name{" "}
            <span className="font-normal text-muted-foreground">(optional)</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            value={values.name}
            onChange={(event) => update("name", event.target.value)}
            className={`${inputClass} h-11`}
            placeholder="Your name"
          />
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label
              htmlFor="phone"
              className="text-sm font-semibold text-foreground"
            >
              Phone number
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              required
              value={values.phone}
              onChange={(event) => update("phone", event.target.value)}
              aria-invalid={Boolean(errors.phone)}
              aria-describedby={errors.phone ? "phone-error" : undefined}
              className={`${inputClass} h-11`}
              placeholder="e.g. 0123 456 789"
            />
            {errors.phone ? (
              <p id="phone-error" className="mt-1.5 text-sm text-primary">
                {errors.phone}
              </p>
            ) : null}
          </div>

          <div>
            <label
              htmlFor="email"
              className="text-sm font-semibold text-foreground"
            >
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              required
              value={values.email}
              onChange={(event) => update("email", event.target.value)}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "email-error" : undefined}
              className={`${inputClass} h-11`}
              placeholder="you@example.com"
            />
            {errors.email ? (
              <p id="email-error" className="mt-1.5 text-sm text-primary">
                {errors.email}
              </p>
            ) : null}
          </div>
        </div>

        <div>
          <label
            htmlFor="description"
            className="text-sm font-semibold text-foreground"
          >
            Briefly, what&apos;s wrong?
          </label>
          <textarea
            id="description"
            name="description"
            required
            rows={5}
            value={values.description}
            onChange={(event) => update("description", event.target.value)}
            aria-invalid={Boolean(errors.description)}
            aria-describedby={
              errors.description ? "description-error" : "description-hint"
            }
            className={`${inputClass} py-2.5`}
            placeholder="Tell us what you need help with, such as your symptoms or the kind of care you're trying to arrange."
          />
          {errors.description ? (
            <p id="description-error" className="mt-1.5 text-sm text-primary">
              {errors.description}
            </p>
          ) : (
            <p id="description-hint" className="mt-1.5 text-sm text-muted-foreground">
              Please don&apos;t include more personal detail than you need to.
            </p>
          )}
        </div>

        <div className="flex items-start gap-2.5 rounded-lg bg-muted px-4 py-3">
          <LockIcon className="mt-0.5 h-5 w-5 flex-none text-primary" />
          <p className="text-sm leading-relaxed text-muted-foreground">
            Your details are used only to respond to your request and are handled
            confidentially.
          </p>
        </div>

        <div>
          <Button type="submit" size="lg" disabled={isSubmitting}>
            {isSubmitting ? "Sending request..." : "Send request"}
          </Button>
        </div>
      </div>
    </form>
  );
}
