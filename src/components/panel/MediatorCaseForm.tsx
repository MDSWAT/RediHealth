"use client";

import { useState } from "react";
import { AdminShell } from "./AdminShell";
import { Container } from "@/components/ui/Container";
import { CheckCircleIcon } from "@/components/ui/icons";

const counties = ["Alba", "Arad", "Arges", "Bacau", "Bihor", "Bistrita-Nasaud", "Botosani", "Brasov", "Braila", "Bucuresti", "Buzau", "Caras-Severin", "Calarasi", "Cluj", "Constanta", "Covasna", "Dambovita", "Dolj", "Galati", "Giurgiu", "Gorj", "Harghita", "Hunedoara", "Ialomita", "Iasi", "Ilfov", "Maramures", "Mehedinti", "Mures", "Neamt", "Olt", "Prahova", "Salaj", "Satu Mare", "Sibiu", "Suceava", "Teleorman", "Timis", "Tulcea", "Vaslui", "Valcea", "Vrancea"];

const categories = ["Routine examination", "Dental care", "Vaccination", "General practitioner registration", "Specialist consultation", "Maternal care", "Child health", "Chronic condition management", "Mental health support", "Medication access", "Screening or tests", "Emergency referral", "Other"];

const barriers = ["No GP / family doctor", "No insurance / unclear entitlement", "Missing documents", "Language barrier", "Digital literacy barrier", "Transport problem", "Childcare problem", "Mobility limitation", "Financial barrier", "Discrimination concern", "Fear or lack of trust", "Previous negative experience", "Missed appointment", "Unstable housing", "Cross-border mobility", "No phone or internet", "Difficulty understanding medication", "Other"];

type MediatorCaseFormProps = {
  userEmail: string;
  userRole: string;
  isAdmin?: boolean;
};

export function MediatorCaseForm({ userEmail, userRole, isAdmin = false }: MediatorCaseFormProps) {
  const [selectedBarriers, setSelectedBarriers] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  function toggleBarrier(barrier: string) {
    setSelectedBarriers((current) => current.includes(barrier)
      ? current.filter((item) => item !== barrier)
      : [...current, barrier]);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    setIsSubmitting(true);
    setError("");
    setSaved(false);

    const form = new FormData(formElement);
    try {
      const response = await fetch("/api/mediator-cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          county: form.get("county"),
          fullName: form.get("fullName"),
          phone: form.get("phone"),
          address: form.get("address"),
          email: form.get("email"),
          careCategory: form.get("careCategory"),
          urgency: form.get("urgency"),
          barriers: selectedBarriers,
          targetDate: form.get("targetDate"),
          notes: form.get("notes"),
        }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(result.error || "Could not save this case.");
        return;
      }

      formElement.reset();
      setSelectedBarriers([]);
      setSaved(true);
    } catch {
      setError("Could not save this case.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AdminShell userEmail={userEmail} userRole={userRole} isAdmin={isAdmin}>
      <main id="main-content" className="min-h-screen py-5 sm:py-8 lg:py-10">
        <Container>
          <div className="mb-6 border-b border-border pb-5 sm:mb-8 sm:pb-6">
            <p className="text-xs font-bold uppercase text-primary">Mediator workspace</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">New support case</h1>
            <p className="mt-1 text-sm text-muted-foreground">Record the support needed and barriers to healthcare access.</p>
          </div>

          <form onSubmit={handleSubmit} className="max-w-4xl space-y-5 sm:space-y-6">
            {error ? <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-600" role="alert">{error}</p> : null}
            {saved ? <p className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-700" role="status"><CheckCircleIcon className="h-5 w-5" />Case saved successfully.</p> : null}

            <section className="grid gap-5 rounded-lg border border-border bg-card p-4 sm:grid-cols-2 sm:p-6">
              <label className="text-sm font-semibold text-foreground">County
                <select name="county" required defaultValue="" className="mt-1.5 block h-11 w-full rounded-lg border border-border bg-background px-3 text-sm font-normal text-foreground">
                  <option value="" disabled>Select a county</option>
                  {counties.map((county) => <option key={county} value={county}>{county}</option>)}
                </select>
              </label>
              <label className="text-sm font-semibold text-foreground">Full name
                <input name="fullName" required maxLength={200} className="mt-1.5 block h-11 w-full rounded-lg border border-border bg-background px-3 text-sm font-normal text-foreground" />
              </label>
              <label className="text-sm font-semibold text-foreground">Phone
                <input name="phone" type="tel" inputMode="tel" required maxLength={50} className="mt-1.5 block h-11 w-full rounded-lg border border-border bg-background px-3 text-sm font-normal text-foreground" />
              </label>
              <label className="text-sm font-semibold text-foreground">Address
                <input name="address" maxLength={500} autoComplete="street-address" className="mt-1.5 block h-11 w-full rounded-lg border border-border bg-background px-3 text-sm font-normal text-foreground" />
              </label>
              <label className="text-sm font-semibold text-foreground">Email address
                <input name="email" type="email" inputMode="email" autoComplete="email" required maxLength={320} className="mt-1.5 block h-11 w-full rounded-lg border border-border bg-background px-3 text-sm font-normal text-foreground" />
              </label>
              <label className="text-sm font-semibold text-foreground">Care category
                <select name="careCategory" required defaultValue="" className="mt-1.5 block h-11 w-full rounded-lg border border-border bg-background px-3 text-sm font-normal text-foreground">
                  <option value="" disabled>Select a category</option>
                  {categories.map((category) => <option key={category} value={category}>{category}</option>)}
                </select>
              </label>
              <label className="text-sm font-semibold text-foreground">Urgency
                <select name="urgency" defaultValue="moderate" className="mt-1.5 block h-11 w-full rounded-lg border border-border bg-background px-3 text-sm font-normal text-foreground">
                  <option value="low">Low</option><option value="moderate">Moderate</option><option value="high">High</option><option value="urgent">Urgent</option>
                </select>
              </label>
              <label className="text-sm font-semibold text-foreground sm:col-span-2">Target date
                <input name="targetDate" type="date" className="mt-1.5 block h-11 w-full rounded-lg border border-border bg-background px-3 text-sm font-normal text-foreground sm:max-w-xs" />
              </label>
            </section>

            <fieldset className="rounded-lg border border-border bg-card p-4 sm:p-6">
              <legend className="px-1 text-sm font-semibold text-foreground">Barriers identified</legend>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {barriers.map((barrier) => <label key={barrier} className="flex items-start gap-2 text-sm text-foreground"><input type="checkbox" checked={selectedBarriers.includes(barrier)} onChange={() => toggleBarrier(barrier)} className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary" />{barrier}</label>)}
              </div>
            </fieldset>

            <label className="block rounded-lg border border-border bg-card p-4 text-sm font-semibold text-foreground sm:p-6">Notes
              <textarea name="notes" rows={5} maxLength={4000} className="mt-2 block w-full rounded-lg border border-border bg-background p-3 text-sm font-normal text-foreground" placeholder="Add relevant context, requested support, or follow-up details." />
            </label>

            <button type="submit" disabled={isSubmitting} className="w-full rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-primary-hover disabled:opacity-60 sm:w-auto sm:py-2.5">{isSubmitting ? "Saving case..." : "Save case"}</button>
          </form>
        </Container>
      </main>
    </AdminShell>
  );
}