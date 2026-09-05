"use client";

import { useState } from "react";
import { AdminShell } from "./AdminShell";
import { Container } from "@/components/ui/Container";
import { CheckCircleIcon } from "@/components/ui/icons";
import { useLanguage } from "@/lib/i18n/language-context";

const counties = ["Alba", "Arad", "Arges", "Bacau", "Bihor", "Bistrita-Nasaud", "Botosani", "Brasov", "Braila", "Bucuresti", "Buzau", "Caras-Severin", "Calarasi", "Cluj", "Constanta", "Covasna", "Dambovita", "Dolj", "Galati", "Giurgiu", "Gorj", "Harghita", "Hunedoara", "Ialomita", "Iasi", "Ilfov", "Maramures", "Mehedinti", "Mures", "Neamt", "Olt", "Prahova", "Salaj", "Satu Mare", "Sibiu", "Suceava", "Teleorman", "Timis", "Tulcea", "Vaslui", "Valcea", "Vrancea"];
const categoryKeys = ["Routine examination", "Dental care", "Vaccination", "General practitioner registration", "Specialist consultation", "Maternal care", "Child health", "Chronic condition management", "Mental health support", "Medication access", "Screening or tests", "Emergency referral", "Other"];
const barrierKeys = ["No GP / family doctor", "No insurance / unclear entitlement", "Missing documents", "Language barrier", "Digital literacy barrier", "Transport problem", "Childcare problem", "Mobility limitation", "Financial barrier", "Discrimination concern", "Fear or lack of trust", "Previous negative experience", "Missed appointment", "Unstable housing", "Cross-border mobility", "No phone or internet", "Difficulty understanding medication", "Other"];

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
      county: "County",
      selectCounty: "Select a county",
      fullName: "Full name",
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
      county: "Judet",
      selectCounty: "Selecteaza un judet",
      fullName: "Nume complet",
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
      county: "Qarku",
      selectCounty: "Zgjidh nje qark",
      fullName: "Emri i plote",
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
      county: "Contea",
      selectCounty: "Seleziona una contea",
      fullName: "Nome completo",
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
          <div className="mb-6 border-b border-border pb-5 sm:mb-8 sm:pb-6">
            <p className="text-xs font-bold uppercase text-primary">{t.eyebrow}</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{t.title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{t.subtitle}</p>
          </div>

          <form onSubmit={handleSubmit} className="max-w-4xl space-y-5 sm:space-y-6">
            {error ? <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-600" role="alert">{error}</p> : null}
            {saved ? <p className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-700" role="status"><CheckCircleIcon className="h-5 w-5" />{t.saved}</p> : null}

            <section className="grid gap-5 rounded-lg border border-border bg-card p-4 sm:grid-cols-2 sm:p-6">
              <label className="text-sm font-semibold text-foreground">{t.county}
                <select name="county" required defaultValue="" className="mt-1.5 block h-11 w-full rounded-lg border border-border bg-background px-3 text-sm font-normal text-foreground">
                  <option value="" disabled>{t.selectCounty}</option>
                  {counties.map((county) => <option key={county} value={county}>{county}</option>)}
                </select>
              </label>
              <label className="text-sm font-semibold text-foreground">{t.fullName}
                <input name="fullName" required maxLength={200} className="mt-1.5 block h-11 w-full rounded-lg border border-border bg-background px-3 text-sm font-normal text-foreground" />
              </label>
              <label className="text-sm font-semibold text-foreground">{t.phone}
                <input name="phone" type="tel" inputMode="tel" required maxLength={50} className="mt-1.5 block h-11 w-full rounded-lg border border-border bg-background px-3 text-sm font-normal text-foreground" />
              </label>
              <label className="text-sm font-semibold text-foreground">{t.address}
                <input name="address" maxLength={500} autoComplete="street-address" className="mt-1.5 block h-11 w-full rounded-lg border border-border bg-background px-3 text-sm font-normal text-foreground" />
              </label>
              <label className="text-sm font-semibold text-foreground">{t.email}
                <input name="email" type="email" inputMode="email" autoComplete="email" required maxLength={320} className="mt-1.5 block h-11 w-full rounded-lg border border-border bg-background px-3 text-sm font-normal text-foreground" />
              </label>
              <label className="text-sm font-semibold text-foreground">{t.careCategory}
                <select name="careCategory" required defaultValue="" className="mt-1.5 block h-11 w-full rounded-lg border border-border bg-background px-3 text-sm font-normal text-foreground">
                  <option value="" disabled>{t.selectCategory}</option>
                  {categoryOptions.map((category) => <option key={category.value} value={category.value}>{category.label}</option>)}
                </select>
              </label>
              <label className="text-sm font-semibold text-foreground">{t.urgency}
                <select name="urgency" defaultValue="moderate" className="mt-1.5 block h-11 w-full rounded-lg border border-border bg-background px-3 text-sm font-normal text-foreground">
                  <option value="low">{t.low}</option><option value="moderate">{t.moderate}</option><option value="high">{t.high}</option><option value="urgent">{t.urgent}</option>
                </select>
              </label>
              <label className="text-sm font-semibold text-foreground sm:col-span-2">{t.targetDate}
                <input name="targetDate" type="date" className="mt-1.5 block h-11 w-full rounded-lg border border-border bg-background px-3 text-sm font-normal text-foreground sm:max-w-xs" />
              </label>
            </section>

            <fieldset className="rounded-lg border border-border bg-card p-4 sm:p-6">
              <legend className="px-1 text-sm font-semibold text-foreground">{t.barriers}</legend>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {barrierOptions.map((barrier) => <label key={barrier.value} className="flex items-start gap-2 text-sm text-foreground"><input type="checkbox" checked={selectedBarriers.includes(barrier.value)} onChange={() => toggleBarrier(barrier.value)} className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary" />{barrier.label}</label>)}
              </div>
            </fieldset>

            <label className="block rounded-lg border border-border bg-card p-4 text-sm font-semibold text-foreground sm:p-6">{t.notes}
              <textarea name="notes" rows={5} maxLength={4000} className="mt-2 block w-full rounded-lg border border-border bg-background p-3 text-sm font-normal text-foreground" placeholder={t.notesPlaceholder} />
            </label>

            <button type="submit" disabled={isSubmitting} className="w-full rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-primary-hover disabled:opacity-60 sm:w-auto sm:py-2.5">{isSubmitting ? t.saving : t.save}</button>
          </form>
        </Container>
      </main>
    </AdminShell>
  );
}