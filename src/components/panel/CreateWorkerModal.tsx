"use client";

import { useState } from "react";
import { CheckCircleIcon, CloseIcon, StethoscopeIcon } from "@/components/ui/icons";
import { useLanguage } from "@/lib/i18n/language-context";
import type { CreateWorkerPayload, WorkerItem, WorkerStatus } from "@/lib/types/worker";
import { ROMANIAN_COUNTIES } from "@/lib/romanian-counties";

interface CreateWorkerModalProps {
  worker?: WorkerItem;
  isRomania: boolean;
  defaultRole?: string;
  defaultDepartment?: string;
  onClose: () => void;
  onSuccess: (savedWorker: WorkerItem) => void;
}

export function CreateWorkerModal({
  worker,
  isRomania,
  defaultRole,
  defaultDepartment,
  onClose,
  onSuccess,
}: CreateWorkerModalProps) {
  const { lang } = useLanguage();
  const t = {
  ru: {
      healthcareWorker: "Медицинский работник",
      errSave: "Спасти сотрудника не удалось.",
      errUnexpected: "Не удалось сохранить. Попробуйте еще раз.",
      titleEdit: "Изменить сотрудника",
      titleMediator: "Добавить посредника",
      titleWorker: "Добавить сотрудника",
      subtitleMediator: "Медиатор может открывать новые дела медиатора.",
      subtitleWorker: "Имя, контакт и роль.",
      success: "Сохранено.",
      fullName: "Полное имя",
      fullNamePh: "например Доктор Алекс Мунтяну",
      email: "Email",
      emailPh: "worker@redihealth.org",
      phone: "Phone",
      phonePh: "например 0722 123 456",
      role: "Role",
      doctor: "Доктор",
      mediator: "Посредник",
      nurse: "Медсестра",
      caseWorker: "Сотрудник дела",
      gp: "Семейный врач",
      admin: "Администратор",
      superAdmin: "Суперадминистратор",
      department: "Специальность",
      deptPh: "например Кардиология, Семейная медицина",
      accountStatus: "Аккаунт",
      activeStaff: "Активный",
      inactiveStaff: "Неактивный",
      cancel: "Отмена",
      saving: "Сохранение...",
      update: "Сохранить изменения",
      create: "Добавить сотрудника",
      county: "Округ, где они работают",
      selectCounty: "Выберите округ",
    },

    en: {
      healthcareWorker: "Health worker",
      errSave: "Could not save the staff member.",
      errUnexpected: "Could not save. Try again.",
      titleEdit: "Edit staff member",
      titleMediator: "Add a mediator",
      titleWorker: "Add a staff member",
      subtitleMediator: "The mediator can open new mediator cases.",
      subtitleWorker: "Name, contact and role.",
      success: "Saved.",
      fullName: "Full name",
      fullNamePh: "e.g. Dr. Alex Munteanu",
      email: "Email",
      emailPh: "worker@redihealth.org",
      phone: "Phone",
      phonePh: "e.g. 0722 123 456",
      role: "Role",
      doctor: "Doctor",
      mediator: "Mediator",
      nurse: "Nurse",
      caseWorker: "Case worker",
      gp: "Family doctor",
      admin: "Administrator",
      superAdmin: "Super admin",
      department: "Specialty",
      deptPh: "e.g. Cardiology, Family medicine",
      accountStatus: "Account",
      activeStaff: "Active",
      inactiveStaff: "Inactive",
      cancel: "Cancel",
      saving: "Saving...",
      update: "Save changes",
      create: "Add staff member",
      county: "County where they work",
      selectCounty: "Choose a county",
    },
    ro: {
      healthcareWorker: "Personal medical",
      errSave: "Nu s-a putut salva.",
      errUnexpected: "Nu s-a putut salva. Încearcă din nou.",
      titleEdit: "Editează datele",
      titleMediator: "Adaugă un mediator",
      titleWorker: "Adaugă o persoană în personal",
      subtitleMediator: "Mediatorul poate deschide cazuri noi de mediere.",
      subtitleWorker: "Nume, contact și rol.",
      success: "Salvat.",
      fullName: "Nume și prenume",
      fullNamePh: "ex. Dr. Alex Munteanu",
      email: "Email",
      emailPh: "lucrator@redihealth.org",
      phone: "Telefon",
      phonePh: "ex. 0722 123 456",
      role: "Rol",
      doctor: "Medic",
      mediator: "Mediator",
      nurse: "Asistent medical",
      caseWorker: "Responsabil de caz",
      gp: "Medic de familie",
      admin: "Administrator",
      superAdmin: "Super administrator",
      department: "Specialitate",
      deptPh: "ex. Cardiologie, Medicină de familie",
      accountStatus: "Cont",
      activeStaff: "Activ",
      inactiveStaff: "Inactiv",
      cancel: "Anulează",
      saving: "Se salvează...",
      update: "Salvează modificările",
      create: "Adaugă",
      county: "Județul în care lucrează",
      selectCounty: "Alege județul",
    },
    sq: {
      healthcareWorker: "Punonjës shëndetësor",
      errSave: "Nuk u ruajt.",
      errUnexpected: "Nuk u ruajt. Provo përsëri.",
      titleEdit: "Ndrysho punonjësin",
      titleMediator: "Shto një mediator",
      titleWorker: "Shto një punonjës",
      subtitleMediator: "Mediatori mund të hapë raste të reja.",
      subtitleWorker: "Emri, kontakti dhe roli.",
      success: "U ruajt.",
      fullName: "Emri dhe mbiemri",
      fullNamePh: "p.sh. Dr. Alex Munteanu",
      email: "Email",
      emailPh: "punonjes@redihealth.org",
      phone: "Telefoni",
      phonePh: "p.sh. 0722 123 456",
      role: "Roli",
      doctor: "Mjek",
      mediator: "Mediator",
      nurse: "Infermier",
      caseWorker: "Përgjegjës rasti",
      gp: "Mjek familje",
      admin: "Administrator",
      superAdmin: "Super administrator",
      department: "Specialiteti",
      deptPh: "p.sh. Kardiologji, Mjekësi familjare",
      accountStatus: "Llogaria",
      activeStaff: "Aktiv",
      inactiveStaff: "Joaktiv",
      cancel: "Anulo",
      saving: "Duke ruajtur...",
      update: "Ruaj ndryshimet",
      create: "Shto",
      county: "Qarku ku punon",
      selectCounty: "Zgjidh qarkun",
    },
    it: {
      healthcareWorker: "Operatore sanitario",
      errSave: "Impossibile salvare.",
      errUnexpected: "Impossibile salvare. Riprova.",
      titleEdit: "Modifica operatore",
      titleMediator: "Aggiungi un mediatore",
      titleWorker: "Aggiungi un operatore",
      subtitleMediator: "Il mediatore può aprire nuovi casi di mediazione.",
      subtitleWorker: "Nome, contatti e ruolo.",
      success: "Salvato.",
      fullName: "Nome e cognome",
      fullNamePh: "es. Dr. Alex Munteanu",
      email: "Email",
      emailPh: "operatore@redihealth.org",
      phone: "Telefono",
      phonePh: "es. 0722 123 456",
      role: "Ruolo",
      doctor: "Medico",
      mediator: "Mediatore",
      nurse: "Infermiere",
      caseWorker: "Referente del caso",
      gp: "Medico di base",
      admin: "Amministratore",
      superAdmin: "Super amministratore",
      department: "Specialità",
      deptPh: "es. Cardiologia, Medicina generale",
      accountStatus: "Account",
      activeStaff: "Attivo",
      inactiveStaff: "Inattivo",
      cancel: "Annulla",
      saving: "Salvataggio...",
      update: "Salva modifiche",
      create: "Aggiungi operatore",
      county: "Provincia in cui lavora",
      selectCounty: "Scegli la provincia",
    },
    hr: {
      healthcareWorker: "Zdravstveni radnik",
      errSave: "Spremanje člana osoblja nije uspjelo.",
      errUnexpected: "Spremanje nije uspjelo. Pokušaj ponovno.",
      titleEdit: "Uredi člana osoblja",
      titleMediator: "Dodaj zdravstvenog medijatora",
      titleWorker: "Dodaj člana osoblja",
      subtitleMediator: "Zdravstveni medijator može otvarati nove slučajeve medijacije.",
      subtitleWorker: "Ime, kontakt i uloga.",
      success: "Spremljeno.",
      fullName: "Ime i prezime",
      fullNamePh: "npr. dr. Ivan Kovačević",
      email: "Email",
      emailPh: "radnik@redihealth.org",
      phone: "Telefon",
      phonePh: "npr. 091 234 5678",
      role: "Uloga",
      doctor: "Liječnik",
      mediator: "Zdravstveni medijator",
      nurse: "Medicinska sestra",
      caseWorker: "Voditelj slučaja",
      gp: "Obiteljski liječnik",
      admin: "Administrator",
      superAdmin: "Super administrator",
      department: "Specijalizacija",
      deptPh: "npr. Kardiologija, obiteljska medicina",
      accountStatus: "Račun",
      activeStaff: "Aktivan",
      inactiveStaff: "Neaktivan",
      cancel: "Odustani",
      saving: "Spremanje...",
      update: "Spremi promjene",
      create: "Dodaj člana osoblja",
      county: "Županija u kojoj radi",
      selectCounty: "Odaberi županiju",
    },
    rom: {
      healthcareWorker: "Sastipnasko bukyarno",
      errSave: "Nashti arakhlo o manush e ekipako.",
      errUnexpected: "Nashti arakhlo. Zumav pale.",
      titleEdit: "Paruv e manushes e ekipako",
      titleMediator: "Tho ekh sastipnasko mediatori",
      titleWorker: "Tho ekh manush and-i ekipa",
      subtitleMediator: "O sastipnasko mediatori shaj te putarel neve kazurya.",
      subtitleWorker: "Anav, kontakto thaj rolo.",
      success: "Arakhlo.",
      fullName: "Anav thaj familijako anav",
      fullNamePh: "misal Dr. Alex Munteanu",
      email: "Email",
      emailPh: "bukyarno@redihealth.org",
      phone: "Telefono",
      phonePh: "misal 0722 123 456",
      role: "Rolo",
      doctor: "Doktori",
      mediator: "Sastipnasko mediatori",
      nurse: "Sastipnaski phen",
      caseWorker: "Manush e kazosko",
      gp: "Familijako doktori",
      admin: "Administratoro",
      superAdmin: "Super administratoro",
      department: "Specialiteto",
      deptPh: "misal Kardiologiya, familijaki medicina",
      accountStatus: "Konto",
      activeStaff: "Aktivno",
      inactiveStaff: "Bi-aktivno",
      cancel: "Mekh",
      saving: "Arakhel...",
      update: "Arakh le paruvimata",
      create: "Tho and-i ekipa",
      county: "Zhudeco kaj kerel buchi",
      selectCounty: "Alosar o zhudeco",
    },
  }[lang];

  const isEditing = Boolean(worker);

  const [fullName, setFullName] = useState(worker?.full_name || "");
  const [email, setEmail] = useState(worker?.email || "");
  const [phone, setPhone] = useState(worker?.phone || "");
  const [role, setRole] = useState(worker?.role || defaultRole || t.healthcareWorker);
  const [department, setDepartment] = useState(worker?.department || defaultDepartment || "");
  const [county, setCounty] = useState(worker?.county || "");
  const [status, setStatus] = useState<WorkerStatus>(worker?.status || "active");
  const countyRequired = isRomania && ["mediator", "doctor", "general practitioner"].includes(role.trim().toLowerCase());
  const countySelectionRequired = countyRequired && (!isEditing || role !== worker?.role || Boolean(worker?.county));

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
      county: isRomania && countyRequired && county ? county : undefined,
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

      if (!isEditing && !data.id) {
        setErrorMessage(t.errUnexpected);
        return;
      }

      setSaveSuccess(true);

      const savedWorker: WorkerItem = {
        id: String(isEditing ? worker?.id : data.id),
        full_name: payload.full_name,
        email: payload.email,
        phone: payload.phone || null,
        role: payload.role || t.healthcareWorker,
        department: payload.department || null,
        county: payload.county || null,
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
    <div className="panel-scrim fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/50 p-0 sm:p-4">
      <div className="app-sheet-slide-up relative w-full max-w-lg rounded-t-xl sm:rounded-xl border-t sm:border border-border bg-card p-5 sm:p-6 shadow-2xl max-h-[92dvh] sm:max-h-[90vh] overflow-y-auto care-panel-bottom-bar">
        {/* Mobile bottom sheet drag handle */}
        <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-border sm:hidden" />
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
              <StethoscopeIcon className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-foreground sm:text-lg">
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
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        {errorMessage ? (
          <div className="mt-4 rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-xs font-medium text-red-600 dark:text-red-400">
            {errorMessage}
          </div>
        ) : null}

        {saveSuccess ? (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs font-medium text-emerald-700 dark:text-emerald-400">
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
              required={countySelectionRequired}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={t.fullNamePh}
              className="w-full rounded-lg border border-border bg-background px-3.5 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
                className="w-full rounded-lg border border-border bg-background px-3.5 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            {isRomania && countyRequired ? (
              <div>
                <label className="font-semibold text-foreground mb-1 block">
                  {t.county} <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={county}
                  onChange={(e) => setCounty(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3.5 py-2 text-sm font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">{t.selectCounty}</option>
                  {ROMANIAN_COUNTIES.map((countyName) => <option key={countyName} value={countyName}>{countyName}</option>)}
                </select>
              </div>
            ) : null}

            <div>
              <label className="font-semibold text-foreground mb-1 block">
                {t.phone}
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={t.phonePh}
                className="w-full rounded-lg border border-border bg-background px-3.5 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
                className="w-full rounded-lg border border-border bg-background px-3.5 py-2 text-sm font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="Healthcare Worker">{t.healthcareWorker}</option>
                <option value="Doctor">{t.doctor}</option>
                <option value="Mediator">{t.mediator}</option>
                <option value="Nurse">{t.nurse}</option>
                <option value="Case Worker">{t.caseWorker}</option>
                <option value="General Practitioner">{t.gp}</option>
                <option value="Administrator">{t.admin}</option>
                <option value="Super Admin">{t.superAdmin}</option>
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
                className="w-full rounded-lg border border-border bg-background px-3.5 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
              className="w-full rounded-lg border border-border bg-background px-3.5 py-2 text-sm font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="active">{t.activeStaff}</option>
              <option value="inactive">{t.inactiveStaff}</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-primary px-5 py-2 text-xs font-bold text-white hover:bg-primary-hover disabled:bg-muted disabled:text-muted-foreground shadow-2xs transition-colors"
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
