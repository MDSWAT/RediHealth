"use client";

import { useState } from "react";
import { AdminShell } from "./AdminShell";
import { Container } from "@/components/ui/Container";
import { CheckCircleIcon, ClipboardCheckIcon } from "@/components/ui/icons";
import { useLanguage } from "@/lib/i18n/language-context";

const counties = ["Alba", "Arad", "Arges", "Bacau", "Bihor", "Bistrita-Nasaud", "Botosani", "Brasov", "Braila", "Bucuresti", "Buzau", "Caras-Severin", "Calarasi", "Cluj", "Constanta", "Covasna", "Dambovita", "Dolj", "Galati", "Giurgiu", "Gorj", "Harghita", "Hunedoara", "Ialomita", "Iasi", "Ilfov", "Maramures", "Mehedinti", "Mures", "Neamt", "Olt", "Prahova", "Salaj", "Satu Mare", "Sibiu", "Suceava", "Teleorman", "Timis", "Tulcea", "Vaslui", "Valcea", "Vrancea"];
const categoryKeys = ["Routine examination", "Dental care", "Vaccination", "General practitioner registration", "Specialist consultation", "Maternal care", "Child health", "Chronic condition management", "Mental health support", "Medication access", "Screening or tests", "Emergency referral", "Other"];
const barrierKeys = ["No GP / family doctor", "No insurance / unclear entitlement", "Missing documents", "Language barrier", "Digital literacy barrier", "Transport problem", "Childcare problem", "Mobility limitation", "Financial barrier", "Discrimination concern", "Fear or lack of trust", "Previous negative experience", "Missed appointment", "Unstable housing", "Cross-border mobility", "No phone or internet", "Difficulty understanding medication", "Other"];
const inputClassName = "mt-1.5 block h-11 w-full rounded-lg border border-border bg-background px-3 text-sm font-normal text-foreground transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

type MediatorCaseFormProps = {
  userEmail: string;
  userRole: string;
  isAdmin?: boolean;
};

export function MediatorCaseForm({ userEmail, userRole, isAdmin = false }: MediatorCaseFormProps) {
  const { lang } = useLanguage();
  const t = {
    en: {
      errSave: "Could not save this case.",
      saved: "Case saved successfully.",
      eyebrow: "Mediator workspace",
      title: "New support case",
      subtitle: "Record the support needed and barriers to healthcare access.",
      personDetails: "Person details",
      supportNeeded: "Support needed",
      caseTiming: "Case timing",
      county: "County",
      selectCounty: "Select a county",
      fullName: "Full name",
      dateOfBirth: "Date of birth",
      phone: "Phone",
      address: "Address",
      email: "Email address",
      careCategory: "Care category",
      selectCategory: "Select a category",
      urgency: "Urgency",
      low: "Low",
      moderate: "Moderate",
      high: "High",
      urgent: "Urgent",
      targetDate: "Target date",
      barriers: "Barriers identified",
      notes: "Notes",
      notesPlaceholder: "Add relevant context, requested support, or follow-up details.",
      saving: "Saving case...",
      save: "Save case",
      categories: ["Routine examination", "Dental care", "Vaccination", "General practitioner registration", "Specialist consultation", "Maternal care", "Child health", "Chronic condition management", "Mental health support", "Medication access", "Screening or tests", "Emergency referral", "Other"],
      barriersList: ["No GP / family doctor", "No insurance / unclear entitlement", "Missing documents", "Language barrier", "Digital literacy barrier", "Transport problem", "Childcare problem", "Mobility limitation", "Financial barrier", "Discrimination concern", "Fear or lack of trust", "Previous negative experience", "Missed appointment", "Unstable housing", "Cross-border mobility", "No phone or internet", "Difficulty understanding medication", "Other"],
    },
    ro: {
      errSave: "Nu am putut salva acest caz.",
      saved: "Caz salvat cu succes.",
      eyebrow: "Spatiu mediator",
      title: "Caz nou de suport",
      subtitle: "Inregistreaza suportul necesar si barierele de acces la servicii medicale.",
      personDetails: "Date persoana",
      supportNeeded: "Suport necesar",
      caseTiming: "Planificare caz",
      county: "Judet",
      selectCounty: "Selecteaza un judet",
      fullName: "Nume complet",
      dateOfBirth: "Data nasterii",
      phone: "Telefon",
      address: "Adresa",
      email: "Adresa email",
      careCategory: "Categorie de ingrijire",
      selectCategory: "Selecteaza o categorie",
      urgency: "Urgenta",
      low: "Scazuta",
      moderate: "Moderata",
      high: "Ridicata",
      urgent: "Urgenta",
      targetDate: "Data tinta",
      barriers: "Bariere identificate",
      notes: "Notite",
      notesPlaceholder: "Adauga context relevant, suportul solicitat sau detalii de monitorizare.",
      saving: "Se salveaza cazul...",
      save: "Salveaza cazul",
      categories: ["Consult de rutina", "Ingrijire dentara", "Vaccinare", "Inscriere la medic de familie", "Consult de specialitate", "Ingrijire materna", "Sanatatea copilului", "Gestionare afectiuni cronice", "Suport sanatate mintala", "Acces la medicamente", "Screening sau analize", "Trimitere urgenta", "Altele"],
      barriersList: ["Fara medic de familie", "Fara asigurare / drepturi neclare", "Documente lipsa", "Bariera lingvistica", "Bariera de alfabetizare digitala", "Problema de transport", "Problema de ingrijire copil", "Limitare de mobilitate", "Bariera financiara", "Risc de discriminare", "Teama sau lipsa de incredere", "Experienta negativa anterioara", "Programare ratata", "Locuire instabila", "Mobilitate transfrontaliera", "Fara telefon sau internet", "Dificultate in intelegerea tratamentului", "Altele"],
    },
    sq: {
      errSave: "Nuk mund ta ruanim kete rast.",
      saved: "Rasti u ruajt me sukses.",
      eyebrow: "Hapesira e mediatorit",
      title: "Rast i ri mbeshtetjeje",
      subtitle: "Regjistro mbeshtetjen e nevojshme dhe barrierat ne aksesin shendetesor.",
      personDetails: "Te dhenat e personit",
      supportNeeded: "Mbeshtetja e nevojshme",
      caseTiming: "Planifikimi i rastit",
      county: "Qarku",
      selectCounty: "Zgjidh nje qark",
      fullName: "Emri i plote",
      dateOfBirth: "Datelindja",
      phone: "Telefoni",
      address: "Adresa",
      email: "Adresa email",
      careCategory: "Kategoria e kujdesit",
      selectCategory: "Zgjidh nje kategori",
      urgency: "Urgjenca",
      low: "E ulet",
      moderate: "Mesatare",
      high: "E larte",
      urgent: "Urgjente",
      targetDate: "Data e synuar",
      barriers: "Barrierat e identifikuara",
      notes: "Shenime",
      notesPlaceholder: "Shto kontekstin perkates, mbeshtetjen e kerkuar ose detaje ndjekjeje.",
      saving: "Duke ruajtur rastin...",
      save: "Ruaj rastin",
      categories: ["Kontroll rutine", "Kujdes dentar", "Vaksinim", "Regjistrim te mjeku i familjes", "Konsulte specialisti", "Kujdes maternal", "Shendeti i femijes", "Menaxhim i semundjeve kronike", "Mbeshteje per shendetin mendor", "Akses ne barna", "Skrining ose analiza", "Referim urgjent", "Tjeter"],
      barriersList: ["Pa mjek familjeje", "Pa sigurim / te drejta te paqarta", "Dokumente qe mungojne", "Barriere gjuhesore", "Barriere ne aftesi dixhitale", "Problem transporti", "Problem kujdesi per femijet", "Kufizim levizshmerie", "Barriere financiare", "Shqetesim diskriminimi", "Frike ose mungese besimi", "Eksperience e meparshme negative", "Takim i humbur", "Strehim i paqendrueshem", "Levizshmeri nderkufitare", "Pa telefon ose internet", "Veshtiresi ne kuptimin e mjekimit", "Tjeter"],
    },
    it: {
      errSave: "Impossibile salvare questo caso.",
      saved: "Caso salvato con successo.",
      eyebrow: "Spazio mediatore",
      title: "Nuovo caso di supporto",
      subtitle: "Registra il supporto necessario e le barriere di accesso alle cure.",
      personDetails: "Dati della persona",
      supportNeeded: "Supporto necessario",
      caseTiming: "Tempistiche del caso",
      county: "Contea",
      selectCounty: "Seleziona una contea",
      fullName: "Nome completo",
      dateOfBirth: "Data di nascita",
      phone: "Telefono",
      address: "Indirizzo",
      email: "Indirizzo email",
      careCategory: "Categoria di cura",
      selectCategory: "Seleziona una categoria",
      urgency: "Urgenza",
      low: "Bassa",
      moderate: "Moderata",
      high: "Alta",
      urgent: "Urgente",
      targetDate: "Data obiettivo",
      barriers: "Barriere identificate",
      notes: "Note",
      notesPlaceholder: "Aggiungi contesto rilevante, supporto richiesto o dettagli di follow-up.",
      saving: "Salvataggio caso...",
      save: "Salva caso",
      categories: ["Visita di routine", "Cure dentali", "Vaccinazione", "Registrazione medico di base", "Consulto specialistico", "Assistenza materna", "Salute del bambino", "Gestione malattie croniche", "Supporto salute mentale", "Accesso ai farmaci", "Screening o test", "Invio urgente", "Altro"],
      barriersList: ["Nessun medico di base", "Nessuna assicurazione / diritti non chiari", "Documenti mancanti", "Barriera linguistica", "Barriera alfabetizzazione digitale", "Problema di trasporto", "Problema assistenza bambini", "Limitazione mobilita", "Barriera economica", "Rischio discriminazione", "Paura o mancanza di fiducia", "Esperienza negativa precedente", "Appuntamento mancato", "Alloggio instabile", "Mobilita transfrontaliera", "Nessun telefono o internet", "Difficolta nel comprendere i farmaci", "Altro"],
    },
  }[lang];
  const categoryOptions = categoryKeys.map((value, index) => ({
    value,
    label: t.categories[index] ?? value,
  }));
  const barrierOptions = barrierKeys.map((value, index) => ({
    value,
    label: t.barriersList[index] ?? value,
  }));
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
          lang,
          county: form.get("county"),
          fullName: form.get("fullName"),
          dateOfBirth: form.get("dateOfBirth"),
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
        setError(result.error || t.errSave);
        return;
      }

      formElement.reset();
      setSelectedBarriers([]);
      setSaved(true);
    } catch {
      setError(t.errSave);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AdminShell userEmail={userEmail} userRole={userRole} isAdmin={isAdmin}>
      <main id="main-content" className="min-h-screen py-5 sm:py-8 lg:py-10">
        <Container>
          <div className="mb-5 flex flex-col gap-4 border border-border border-l-4 border-l-primary bg-card px-5 py-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-primary">{t.eyebrow}</p>
              <h1 className="mt-1 text-2xl font-bold text-foreground sm:text-3xl">{t.title}</h1>
              <p className="mt-1 text-sm text-muted-foreground">{t.subtitle}</p>
            </div>
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
              <ClipboardCheckIcon className="h-6 w-6" />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="max-w-6xl space-y-4">
            {error ? <p className="border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-600" role="alert">{error}</p> : null}
            {saved ? <p className="flex items-center gap-2 border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-700" role="status"><CheckCircleIcon className="h-5 w-5" />{t.saved}</p> : null}

            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
              <div className="space-y-4">
                <section className="border border-border border-t-2 border-t-primary bg-card p-5 shadow-sm sm:p-6">
                  <div className="mb-5 border-b border-border pb-3">
                    <h2 className="text-base font-bold text-foreground">{t.personDetails}</h2>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="text-sm font-semibold text-foreground">{t.fullName}
                      <input name="fullName" required maxLength={200} className={inputClassName} />
                    </label>
                    <label className="text-sm font-semibold text-foreground">{t.county}
                      <select name="county" required defaultValue="" className={inputClassName}>
                        <option value="" disabled>{t.selectCounty}</option>
                        {counties.map((county) => <option key={county} value={county}>{county}</option>)}
                      </select>
                    </label>
                    <label className="text-sm font-semibold text-foreground">{t.dateOfBirth}
                      <input name="dateOfBirth" type="date" className={inputClassName} />
                    </label>
                    <label className="text-sm font-semibold text-foreground">{t.phone}
                      <input name="phone" type="tel" inputMode="tel" required maxLength={50} className={inputClassName} />
                    </label>
                    <label className="text-sm font-semibold text-foreground">{t.email}
                      <input name="email" type="email" inputMode="email" autoComplete="email" required maxLength={320} className={inputClassName} />
                    </label>
                    <label className="text-sm font-semibold text-foreground sm:col-span-2">{t.address}
                      <input name="address" maxLength={500} autoComplete="street-address" className={inputClassName} />
                    </label>
                  </div>
                </section>

                <section className="border border-border border-t-2 border-t-primary bg-card p-5 shadow-sm sm:p-6">
                  <div className="mb-5 border-b border-border pb-3">
                    <h2 className="text-base font-bold text-foreground">{t.supportNeeded}</h2>
                  </div>
                  <label className="text-sm font-semibold text-foreground">{t.careCategory}
                    <select name="careCategory" required defaultValue="" className={inputClassName}>
                      <option value="" disabled>{t.selectCategory}</option>
                      {categoryOptions.map((category) => <option key={category.value} value={category.value}>{category.label}</option>)}
                    </select>
                  </label>
                </section>
              </div>

              <aside className="h-fit border border-border border-t-2 border-t-amber-500 bg-amber-50/40 p-5 shadow-sm">
                <div className="border-b border-border pb-3">
                  <h2 className="text-base font-bold text-foreground">{t.caseTiming}</h2>
                </div>
                <div className="mt-4 space-y-4">
                  <label className="block text-sm font-semibold text-foreground">{t.urgency}
                    <select name="urgency" defaultValue="moderate" className={inputClassName}>
                      <option value="low">{t.low}</option><option value="moderate">{t.moderate}</option><option value="high">{t.high}</option><option value="urgent">{t.urgent}</option>
                    </select>
                  </label>
                  <label className="block text-sm font-semibold text-foreground">{t.targetDate}
                    <input name="targetDate" type="date" className={inputClassName} />
                  </label>
                </div>
              </aside>
            </div>

            <fieldset className="border border-border border-t-2 border-t-foreground bg-card p-5 shadow-sm sm:p-6">
              <legend className="px-1 text-base font-bold text-foreground">{t.barriers}</legend>
              <div className="mt-4 grid gap-x-6 gap-y-1 sm:grid-cols-2 lg:grid-cols-3">
                {barrierOptions.map((barrier) => <label key={barrier.value} className="flex min-h-10 items-center gap-2 border-b border-border/70 px-2 text-sm text-foreground transition-colors hover:bg-muted"><input type="checkbox" checked={selectedBarriers.includes(barrier.value)} onChange={() => toggleBarrier(barrier.value)} className="h-4 w-4 rounded border-border text-primary focus:ring-primary" />{barrier.label}</label>)}
              </div>
            </fieldset>

            <label className="block border border-border border-t-2 border-t-foreground bg-card p-5 text-sm font-semibold text-foreground shadow-sm sm:p-6">{t.notes}
              <textarea name="notes" rows={5} maxLength={4000} className="mt-2 block w-full rounded-lg border border-border bg-background p-3 text-sm font-normal text-foreground transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder={t.notesPlaceholder} />
            </label>

            <div className="sticky bottom-0 flex justify-end border-t border-border bg-muted/95 py-4 backdrop-blur-sm">
              <button type="submit" disabled={isSubmitting} className="min-h-11 w-full rounded-lg bg-primary px-6 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-hover disabled:opacity-60 sm:w-auto">{isSubmitting ? t.saving : t.save}</button>
            </div>
          </form>
        </Container>
      </main>
    </AdminShell>
  );
}