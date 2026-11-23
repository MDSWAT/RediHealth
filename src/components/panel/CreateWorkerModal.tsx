"use client";

import { useEffect, useId, useState } from "react";
import { CloseIcon } from "@/components/ui/icons";
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
  const baseId = useId();
  const t = {
    ru: {
      healthcareWorker: "Медицинский работник",
      errSave: "Не удалось сохранить сотрудника.",
      errUnexpected: "Не удалось сохранить. Попробуйте еще раз.",
      titleEdit: "Редактировать сотрудника",
      titleMediator: "Добавить медиатора",
      titleWorker: "Добавить сотрудника",
      subtitleMediator: "Медиатор может открывать новые дела медиации.",
      subtitleWorker: "Имя, контакт и роль.",
      success: "Сохранено.",
      fullName: "Полное имя",
      fullNamePh: "например, д-р Алекс Мунтяну",
      email: "Электронная почта",
      emailPh: "worker@redihealth.org",
      phone: "Телефон",
      phonePh: "например, 0722 123 456",
      role: "Роль",
      doctor: "Врач",
      mediator: "Медиатор",
      nurse: "Медсестра",
      caseWorker: "Специалист по случаю",
      gp: "Семейный врач",
      admin: "Администратор",
      superAdmin: "Суперадминистратор",
      department: "Специальность",
      deptPh: "например, кардиология, семейная медицина",
      accountStatus: "Статус аккаунта",
      activeStaff: "Активный",
      inactiveStaff: "Неактивный",
      cancel: "Отмена",
      close: "Закрыть",
      saving: "Сохранение...",
      update: "Сохранить изменения",
      create: "Добавить сотрудника",
      county: "Округ работы",
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
      deptPh: "e.g. Cardiology, family medicine",
      accountStatus: "Account",
      activeStaff: "Active",
      inactiveStaff: "Inactive",
      cancel: "Cancel",
      close: "Close",
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
      deptPh: "ex. Cardiologie, medicină de familie",
      accountStatus: "Cont",
      activeStaff: "Activ",
      inactiveStaff: "Inactiv",
      cancel: "Anulează",
      close: "Închide",
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
      deptPh: "p.sh. Kardiologji, mjekësi familjare",
      accountStatus: "Llogaria",
      activeStaff: "Aktiv",
      inactiveStaff: "Joaktiv",
      cancel: "Anulo",
      close: "Mbyll",
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
      deptPh: "es. Cardiologia, medicina generale",
      accountStatus: "Account",
      activeStaff: "Attivo",
      inactiveStaff: "Inattivo",
      cancel: "Annulla",
      close: "Chiudi",
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
      close: "Zatvori",
      saving: "Spremanje...",
      update: "Spremi promjene",
      create: "Dodaj osoblje",
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
      close: "Phandav",
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
  const [role, setRole] = useState(worker?.role || defaultRole || "Healthcare Worker");
  const [department, setDepartment] = useState(worker?.department || defaultDepartment || "");
  const [county, setCounty] = useState(worker?.county || "");
  const [status, setStatus] = useState<WorkerStatus>(worker?.status || "active");
  const countyRequired =
    isRomania && ["mediator", "doctor", "general practitioner"].includes(role.trim().toLowerCase());
  const countySelectionRequired =
    countyRequired && (!isEditing || role !== worker?.role || Boolean(worker?.county));

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isSubmitting) {
        onClose();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isSubmitting, onClose]);

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
      role: role.trim() || "Healthcare Worker",
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
        role: payload.role || "Healthcare Worker",
        department: payload.department || null,
        county: payload.county || null,
        status: payload.status || "active",
        assigned_patients_count: worker?.assigned_patients_count || 0,
        created_at: worker?.created_at || new Date().toISOString(),
      };

      onSuccess(savedWorker);

      setTimeout(() => {
        onClose();
      }, 900);
    } catch {
      setErrorMessage(t.errUnexpected);
    } finally {
      setIsSubmitting(false);
    }
  }

  const fieldClass =
    "min-h-11 w-full rounded-lg border border-[var(--color-border-control)] dark:border-[var(--panel-line)] bg-[var(--panel-surface)] px-3.5 text-sm text-[var(--panel-ink)] placeholder:text-[var(--panel-muted)] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-sapphire)] dark:focus-visible:outline-[#bad7fa]";
  const labelClass = "mb-1.5 block text-sm font-medium text-[var(--panel-ink)]";

  return (
    <div
      className="panel-scrim fixed inset-0 z-50 flex items-end justify-center bg-[#0b132b]/60 p-0 sm:items-center sm:p-4"
      onClick={(event) => {
        if (event.target === event.currentTarget && !isSubmitting) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${baseId}-title`}
        className="app-sheet-slide-up relative max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-[var(--panel-line)] bg-[var(--panel-surface)] p-5 text-[var(--panel-ink)] shadow-[0_24px_80px_rgba(11,19,43,0.28)] sm:max-h-[90vh] sm:rounded-2xl sm:p-6 care-panel-bottom-bar"
      >
        <div className="flex items-start justify-between gap-3 border-b border-[var(--panel-line)] pb-4">
          <div className="min-w-0">
            <h2
              id={`${baseId}-title`}
              className="text-lg font-semibold leading-snug text-[var(--panel-ink)]"
            >
              {isEditing
                ? t.titleEdit
                : defaultRole === "Mediator"
                  ? t.titleMediator
                  : t.titleWorker}
            </h2>
            <p className="mt-0.5 text-xs text-[var(--panel-muted)]">
              {!isEditing && defaultRole === "Mediator"
                ? t.subtitleMediator
                : t.subtitleWorker}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.close}
            className="inline-flex h-11 w-11 min-h-11 min-w-11 shrink-0 items-center justify-center rounded-lg text-[var(--panel-muted)] transition-colors hover:bg-[var(--panel-selection)] hover:text-[var(--panel-ink)]"
          >
            <CloseIcon className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {errorMessage ? (
          <p
            role="alert"
            className="mt-4 rounded-lg border border-[#b91c1c]/30 bg-[#fef2f2] px-3.5 py-2.5 text-sm text-[#991b1b] dark:border-[#ffb4b4]/35 dark:bg-[#2c1519] dark:text-[#ffb4b4]"
          >
            {errorMessage}
          </p>
        ) : null}

        {saveSuccess ? (
          <p
            role="status"
            className="mt-4 rounded-lg border border-[var(--panel-line)] bg-[var(--panel-selection)] px-3.5 py-2.5 text-sm font-medium text-[var(--panel-ink)]"
          >
            {t.success}
          </p>
        ) : null}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label htmlFor={`${baseId}-name`} className={labelClass}>
              {t.fullName} <span aria-hidden="true" className="text-[#b91c1c] dark:text-[#ffb4b4]">*</span>
            </label>
            <input
              id={`${baseId}-name`}
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={t.fullNamePh}
              className={fieldClass}
            />
          </div>

          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <div>
              <label htmlFor={`${baseId}-email`} className={labelClass}>
                {t.email} <span aria-hidden="true" className="text-[#b91c1c] dark:text-[#ffb4b4]">*</span>
              </label>
              <input
                id={`${baseId}-email`}
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.emailPh}
                className={fieldClass}
              />
            </div>

            {isRomania && countyRequired ? (
              <div>
                <label htmlFor={`${baseId}-county`} className={labelClass}>
                  {t.county}{" "}
                  {countySelectionRequired ? (
                    <span aria-hidden="true" className="text-[#b91c1c] dark:text-[#ffb4b4]">*</span>
                  ) : null}
                </label>
                <select
                  id={`${baseId}-county`}
                  required={countySelectionRequired}
                  value={county}
                  onChange={(e) => setCounty(e.target.value)}
                  className={`${fieldClass} whitespace-nowrap`}
                >
                  <option value="">{t.selectCounty}</option>
                  {ROMANIAN_COUNTIES.map((countyName) => (
                    <option key={countyName} value={countyName}>
                      {countyName}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}

            <div>
              <label htmlFor={`${baseId}-phone`} className={labelClass}>
                {t.phone}
              </label>
              <input
                id={`${baseId}-phone`}
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={t.phonePh}
                className={fieldClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <div>
              <label htmlFor={`${baseId}-role`} className={labelClass}>
                {t.role}
              </label>
              <select
                id={`${baseId}-role`}
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className={`${fieldClass} whitespace-nowrap`}
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
              <label htmlFor={`${baseId}-department`} className={labelClass}>
                {t.department}
              </label>
              <input
                id={`${baseId}-department`}
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder={t.deptPh}
                className={fieldClass}
              />
            </div>
          </div>

          <div>
            <label htmlFor={`${baseId}-status`} className={labelClass}>
              {t.accountStatus}
            </label>
            <select
              id={`${baseId}-status`}
              value={status}
              onChange={(e) => setStatus(e.target.value as WorkerStatus)}
              className={`${fieldClass} whitespace-nowrap`}
            >
              <option value="active">{t.activeStaff}</option>
              <option value="inactive">{t.inactiveStaff}</option>
            </select>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2.5 border-t border-[var(--panel-line)] pt-4">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex min-h-11 shrink-0 items-center justify-center whitespace-nowrap rounded-lg border border-[var(--color-border-control)] dark:border-[var(--panel-line)] bg-[var(--panel-surface)] px-4 text-sm font-medium text-[var(--panel-ink)] transition-colors hover:bg-[var(--panel-selection)]"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex min-h-11 shrink-0 items-center justify-center whitespace-nowrap rounded-lg bg-[var(--color-sapphire)] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#28476f] disabled:cursor-default disabled:bg-[var(--panel-subtle)] disabled:text-[var(--panel-muted)]"
            >
              {isSubmitting ? t.saving : isEditing ? t.update : t.create}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
