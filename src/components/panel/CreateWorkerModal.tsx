"use client";

import { useState } from "react";
import { CheckCircleIcon, CloseIcon, StethoscopeIcon } from "@/components/ui/icons";
import { useLanguage } from "@/lib/i18n/language-context";
import type { CreateWorkerPayload, WorkerItem, WorkerStatus } from "@/lib/types/worker";

interface CreateWorkerModalProps {
  worker?: WorkerItem;
  defaultRole?: string;
  defaultDepartment?: string;
  onClose: () => void;
  onSuccess: (savedWorker: WorkerItem) => void;
}

export function CreateWorkerModal({
  worker,
  defaultRole,
  defaultDepartment,
  onClose,
  onSuccess,
}: CreateWorkerModalProps) {
  const { lang } = useLanguage();
  const t = {
    en: {
      healthcareWorker: "Healthcare Worker",
      errSave: "Failed to save worker profile.",
      errUnexpected: "An unexpected error occurred while saving.",
      titleEdit: "Edit Staff Worker",
      titleMediator: "Add New Mediator",
      titleWorker: "Add New Staff Worker",
      subtitleMediator: "Sets up a mediator workspace with access to New Mediator Case",
      subtitleWorker: "Healthcare worker profile and role details",
      success: "Worker profile saved successfully!",
      fullName: "Full Name",
      fullNamePh: "e.g. Dr. Alex Munteanu",
      email: "Email Address",
      emailPh: "worker@redihealth.org",
      phone: "Phone Number",
      phonePh: "e.g. 0722 123 456",
      role: "Role / Title",
      doctor: "Doctor / Physician",
      mediator: "Mediator",
      nurse: "Nurse Specialist",
      caseWorker: "Case Worker",
      gp: "General Practitioner",
      admin: "Administrator",
      department: "Department / Specialty",
      deptPh: "e.g. Cardiology, Primary Care",
      accountStatus: "Account Status",
      activeStaff: "Active Staff",
      inactiveStaff: "Inactive Staff",
      cancel: "Cancel",
      saving: "Saving...",
      update: "Update Worker",
      create: "Create Worker",
    },
    ro: {
      healthcareWorker: "Lucrator medical",
      errSave: "Salvarea profilului lucratorului a esuat.",
      errUnexpected: "A aparut o eroare neasteptata la salvare.",
      titleEdit: "Editeaza lucrator",
      titleMediator: "Adauga mediator nou",
      titleWorker: "Adauga lucrator nou",
      subtitleMediator: "Configureaza un spatiu de lucru mediator cu acces la Caz nou mediator",
      subtitleWorker: "Profil lucrator medical si detalii de rol",
      success: "Profilul lucratorului a fost salvat!",
      fullName: "Nume complet",
      fullNamePh: "ex. Dr. Alex Munteanu",
      email: "Adresa email",
      emailPh: "lucrator@redihealth.org",
      phone: "Numar telefon",
      phonePh: "ex. 0722 123 456",
      role: "Rol / Titlu",
      doctor: "Medic",
      mediator: "Mediator",
      nurse: "Asistent specialist",
      caseWorker: "Lucrator de caz",
      gp: "Medic de familie",
      admin: "Administrator",
      department: "Departament / Specialitate",
      deptPh: "ex. Cardiologie, Medicina de familie",
      accountStatus: "Status cont",
      activeStaff: "Personal activ",
      inactiveStaff: "Personal inactiv",
      cancel: "Anuleaza",
      saving: "Se salveaza...",
      update: "Actualizeaza lucrator",
      create: "Creeaza lucrator",
    },
    sq: {
      healthcareWorker: "Punonjes shendetesor",
      errSave: "Ruajtja e profilit te punonjesit deshtoi.",
      errUnexpected: "Ndodhi nje gabim i papritur gjate ruajtjes.",
      titleEdit: "Ndrysho punonjesin",
      titleMediator: "Shto mediator te ri",
      titleWorker: "Shto punonjes te ri",
      subtitleMediator: "Krijon hapesire pune per mediator me akses te rastit te ri",
      subtitleWorker: "Profili i punonjesit dhe detajet e rolit",
      success: "Profili i punonjesit u ruajt me sukses!",
      fullName: "Emri i plote",
      fullNamePh: "p.sh. Dr. Alex Munteanu",
      email: "Adresa email",
      emailPh: "punonjes@redihealth.org",
      phone: "Numri i telefonit",
      phonePh: "p.sh. 0722 123 456",
      role: "Roli / Titulli",
      doctor: "Mjek",
      mediator: "Mediator",
      nurse: "Infermier specialist",
      caseWorker: "Punonjes rasti",
      gp: "Mjek i pergjithshem",
      admin: "Administrator",
      department: "Departamenti / Specialiteti",
      deptPh: "p.sh. Kardiologji, Kujdes paresor",
      accountStatus: "Statusi i llogarise",
      activeStaff: "Staf aktiv",
      inactiveStaff: "Staf joaktiv",
      cancel: "Anulo",
      saving: "Duke ruajtur...",
      update: "Perditeso punonjesin",
      create: "Krijo punonjes",
    },
    it: {
      healthcareWorker: "Operatore sanitario",
      errSave: "Salvataggio profilo operatore non riuscito.",
      errUnexpected: "Si e verificato un errore imprevisto durante il salvataggio.",
      titleEdit: "Modifica operatore",
      titleMediator: "Aggiungi nuovo mediatore",
      titleWorker: "Aggiungi nuovo operatore",
      subtitleMediator: "Configura uno spazio mediatore con accesso al nuovo caso",
      subtitleWorker: "Profilo operatore sanitario e dettagli ruolo",
      success: "Profilo operatore salvato con successo!",
      fullName: "Nome completo",
      fullNamePh: "es. Dr. Alex Munteanu",
      email: "Indirizzo email",
      emailPh: "operatore@redihealth.org",
      phone: "Numero di telefono",
      phonePh: "es. 0722 123 456",
      role: "Ruolo / Titolo",
      doctor: "Medico",
      mediator: "Mediatore",
      nurse: "Infermiere specialista",
      caseWorker: "Case worker",
      gp: "Medico di base",
      admin: "Amministratore",
      department: "Reparto / Specialita",
      deptPh: "es. Cardiologia, Cure primarie",
      accountStatus: "Stato account",
      activeStaff: "Staff attivo",
      inactiveStaff: "Staff inattivo",
      cancel: "Annulla",
      saving: "Salvataggio...",
      update: "Aggiorna operatore",
      create: "Crea operatore",
    },
  }[lang];

  const isEditing = Boolean(worker);

  const [fullName, setFullName] = useState(worker?.full_name || "");
  const [email, setEmail] = useState(worker?.email || "");
  const [phone, setPhone] = useState(worker?.phone || "");
  const [role, setRole] = useState(worker?.role || defaultRole || t.healthcareWorker);
  const [department, setDepartment] = useState(worker?.department || defaultDepartment || "");
  const [status, setStatus] = useState<WorkerStatus>(worker?.status || "active");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    setSaveSuccess(false);

    const payload: CreateWorkerPayload = {
      id: worker?.id,
      full_name: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim() || undefined,
      role: role.trim() || t.healthcareWorker,
      department: department.trim() || undefined,
      status,
    };

    try {
      const url = "/api/workers";
      const method = isEditing ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as {
        error?: string;
        id?: number;
        success?: boolean;
      };

      if (!response.ok) {
        setErrorMessage(data.error || t.errSave);
        return;
      }

      setSaveSuccess(true);

      const savedWorker: WorkerItem = {
        id: String(data.id || worker?.id || "0"),
        full_name: payload.full_name,
        email: payload.email,
        phone: payload.phone || null,
        role: payload.role || t.healthcareWorker,
        department: payload.department || null,
        status: payload.status || "active",
        assigned_patients_count: worker?.assigned_patients_count || 0,
        created_at: worker?.created_at || new Date().toISOString(),
      };

      onSuccess(savedWorker);

      setTimeout(() => {
        onClose();
      }, 1000);
    } catch {
      setErrorMessage(t.errUnexpected);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-soft text-primary">
              <StethoscopeIcon className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-foreground">
                {isEditing ? t.titleEdit : defaultRole === "Mediator" ? t.titleMediator : t.titleWorker}
              </h2>
              <p className="text-xs text-muted-foreground">
                {!isEditing && defaultRole === "Mediator"
                  ? t.subtitleMediator
                  : t.subtitleWorker}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        {errorMessage ? (
          <div className="mt-4 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-600 dark:text-red-400">
            {errorMessage}
          </div>
        ) : null}

        {saveSuccess ? (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs text-emerald-600 dark:text-emerald-400">
            <CheckCircleIcon className="h-4 w-4" />
            <span>{t.success}</span>
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-xs">
          <div>
            <label className="font-semibold text-foreground mb-1 block">
              {t.fullName} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={t.fullNamePh}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-foreground mb-1 block">
                {t.email} <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.emailPh}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            <div>
              <label className="font-semibold text-foreground mb-1 block">
                {t.phone}
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={t.phonePh}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-foreground mb-1 block">
                {t.role}
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="Healthcare Worker">{t.healthcareWorker}</option>
                <option value="Doctor">{t.doctor}</option>
                <option value="Mediator">{t.mediator}</option>
                <option value="Nurse">{t.nurse}</option>
                <option value="Case Worker">{t.caseWorker}</option>
                <option value="General Practitioner">{t.gp}</option>
                <option value="Administrator">{t.admin}</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-foreground mb-1 block">
                {t.department}
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder={t.deptPh}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-foreground mb-1 block">
              {t.accountStatus}
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as WorkerStatus)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="active">{t.activeStaff}</option>
              <option value="inactive">{t.inactiveStaff}</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-primary px-5 py-2 text-xs font-semibold text-white hover:bg-primary-hover disabled:opacity-60"
            >
              {isSubmitting
                ? t.saving
                : isEditing
                ? t.update
                : t.create}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
