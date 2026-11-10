"use client";

import { useRecaptcha } from "@/components/security/RecaptchaProvider";
/* eslint-disable @next/next/no-img-element -- preview is an object URL from user file */

import { useEffect, useRef, useState } from "react";
import { AlertCircleIcon, CameraIcon, CheckCircleIcon, ImageIcon, TrashIcon } from "@/components/ui/icons";
import { AssistantNavigation } from "@/components/health-assistant/AssistantNavigation";
import { PrescriptionStructuredResult } from "@/components/health-assistant/PrescriptionStructuredResult";
import { Container } from "@/components/ui/Container";
import { useLanguage } from "@/lib/i18n/language-context";
import { DEFAULT_LANG } from "@/lib/i18n/routing";
import type { Lang } from "@/lib/i18n/translations";

type ReviewResponse = {
  message: string;
  prescriptionText?: string;
  urgency?: "emergency" | "routine";
  careLevel?: "emergency" | "urgent" | "soon" | "routine";
};

class ReadError extends Error {}

export function PrescriptionReview() {
  const executeCaptcha = useRecaptcha();
  const { lang } = useLanguage();

  const dict = {
    en: {
      title: "Prescription review",
      subtitle: "Take a photo of your prescription. The assistant reads the text and explains it in plain words. Always check it with your pharmacist or doctor.",
      dropTitle: "Take a photo of your prescription",
      cameraCapture: "Take a photo",
      galleryUpload: "Choose from gallery",
      removePhoto: "Remove photo",
      tipFlat: "Lay the paper flat on a table",
      tipLight: "Use natural daylight without flash glare",
      tipFull: "Include the whole page and medicine names",
      skeletonHeading: "Preparing plain-language explanation…",
      hint: "A clear, well-lit photo of the whole prescription (JPEG, PNG or WebP, up to 8 MB)",
      qualityWarning:
        "The photo looks a little dark or blurry. Try again in daylight so the text is easy to read.",
      whyLabel: "Why was this prescribed? (optional)",
      whyHint: "This helps the assistant understand the prescription. You don't need to know the diagnosis.",
      whyPh: "For example: I got it after a doctor's visit for a sore throat and fever…",
      reviewButton: "Read the prescription",
      reviewing: "Reading your prescription…",
      reviewingHint: "This can take up to a minute. Keep this page open.",
      uploadReqErr: "Take or upload a photo of your prescription to continue.",
      fileErr: "Choose a JPEG, PNG or WebP image smaller than 8 MB.",
      readErr: "We could not read that image file. Try another photo.",
      reviewErr: "We could not read this prescription. Please try again in a few minutes.",
      rateLimitErr: "Too many requests in a short time. Please wait a little and try again.",
      previewAlt: "Photo of the prescription you selected",
    },
    ro: {
      title: "Verificarea rețetei",
      subtitle: "Fă o poză rețetei. Asistentul citește textul și ți-l explică pe înțeles. Verifică mereu cu farmacistul sau cu medicul.",
      dropTitle: "Fă o poză rețetei",
      cameraCapture: "Fă o poză",
      galleryUpload: "Alege din galerie",
      removePhoto: "Șterge poza",
      tipFlat: "Așază foaia întinsă pe o masă",
      tipLight: "Folosește lumină naturală fără bliț",
      tipFull: "Prinde toată pagina și numele medicamentelor",
      skeletonHeading: "Pregătim explicația pe înțeles…",
      hint: "O fotografie clară, bine luminată, a întregii rețete (JPEG, PNG sau WebP, maximum 8 MB)",
      qualityWarning:
        "Poza pare întunecată sau neclară. Încearcă din nou la lumina zilei, ca textul să se vadă bine.",
      whyLabel: "De ce ai primit rețeta? (opțional)",
      whyHint: "Ajută asistentul să înțeleagă rețeta. Nu trebuie să știi diagnosticul.",
      whyPh: "De exemplu: am primit rețeta după o vizită la medic pentru durere în gât și febră…",
      reviewButton: "Citește rețeta",
      reviewing: "Se citește rețeta…",
      reviewingHint: "Poate dura până la un minut. Lasă pagina deschisă.",
      uploadReqErr: "Fă sau încarcă o poză a rețetei ca să continui.",
      fileErr: "Alege o imagine JPEG, PNG sau WebP mai mică de 8 MB.",
      readErr: "Nu am putut deschide poza. Încearcă altă poză.",
      reviewErr: "Nu am putut citi această rețetă. Încearcă din nou peste câteva minute.",
      rateLimitErr: "Prea multe cereri într-un timp scurt. Așteaptă puțin și încearcă din nou.",
      previewAlt: "Poza rețetei alese",
    },
    sq: {
      title: "Verifikimi i recetës",
      subtitle: "Bëj një foto të recetës. Asistenti e lexon tekstin dhe ta shpjegon me fjalë të thjeshta. Kontrolloje gjithmonë me farmacistin ose mjekun.",
      dropTitle: "Fotografo recetën",
      cameraCapture: "Bëj një foto",
      galleryUpload: "Zgjidh nga galeria",
      removePhoto: "Hiq foton",
      tipFlat: "Vendose letrën të shtrirë mbi tavolinë",
      tipLight: "Përdor dritë natyrale pa shkëlqim blici",
      tipFull: "Përfshi të gjithë faqen dhe emrat e ilaçeve",
      skeletonHeading: "Po përgatitet shpjegimi me fjalë të thjeshta…",
      hint: "Një foto e qartë dhe e ndriçuar mirë e gjithë recetës (JPEG, PNG ose WebP, deri në 8 MB)",
      qualityWarning:
        "Fotoja duket pak e errët ose e paqartë. Provo përsëri në dritë natyrale, që teksti të lexohet mirë.",
      whyLabel: "Pse të është dhënë kjo recetë? (sipas dëshirës)",
      whyHint: "E ndihmon asistentin ta kuptojë recetën. Nuk të duhet ta dish diagnozën.",
      whyPh: "Për shembull: e mora pas një vizite te mjeku për dhimbje fyti dhe temperaturë…",
      reviewButton: "Lexo recetën",
      reviewing: "Po lexohet receta…",
      reviewingHint: "Mund të zgjasë deri në një minutë. Mbaje faqen të hapur.",
      uploadReqErr: "Bëj ose ngarko një foto të recetës për të vazhduar.",
      fileErr: "Zgjidh një imazh JPEG, PNG ose WebP më të vogël se 8 MB.",
      readErr: "Nuk mundëm ta hapim këtë foto. Provo një foto tjetër.",
      reviewErr: "Nuk mundëm ta lexojmë këtë recetë. Provo përsëri pas pak minutash.",
      rateLimitErr: "Shumë kërkesa në pak kohë. Prit pak dhe provo përsëri.",
      previewAlt: "Foto e recetës që zgjodhe",
    },
    it: {
      title: "Revisione della ricetta",
      subtitle: "Fai una foto alla ricetta. L'assistente legge il testo e te lo spiega in parole semplici. Verificalo sempre con il farmacista o con il medico.",
      dropTitle: "Fotografa la ricetta",
      cameraCapture: "Scatta una foto",
      galleryUpload: "Scegli dalla galleria",
      removePhoto: "Rimuovi foto",
      tipFlat: "Appoggia il foglio ben steso su un tavolo",
      tipLight: "Usa luce naturale senza riflessi del flash",
      tipFull: "Inquadra tutta la pagina e i nomi dei farmaci",
      skeletonHeading: "Preparazione della spiegazione in parole semplici…",
      hint: "Una foto nitida e ben illuminata di tutta la ricetta (JPEG, PNG o WebP, fino a 8 MB)",
      qualityWarning:
        "La foto sembra un po' scura o sfocata. Riprova con la luce naturale, così il testo si legge correttamente.",
      whyLabel: "Perché ti è stata prescritta? (facoltativo)",
      whyHint: "Aiuta l'assistente a capire la ricetta. Non serve conoscere la diagnosi.",
      whyPh: "Ad esempio: l'ho ricevuta dopo una visita per mal di gola e febbre…",
      reviewButton: "Leggi la ricetta",
      reviewing: "Lettura della ricetta in corso…",
      reviewingHint: "Può richiedere fino a un minuto. Tieni aperta questa pagina.",
      uploadReqErr: "Scatta o carica una foto della ricetta per continuare.",
      fileErr: "Scegli un'immagine JPEG, PNG o WebP più piccola di 8 MB.",
      readErr: "Non siamo riusciti a leggere il file dell'immagine. Prova con un'altra foto.",
      reviewErr: "Non siamo riusciti a leggere questa ricetta. Riprova tra qualche minuto.",
      rateLimitErr: "Troppe richieste in poco tempo. Attendi un po' e riprova.",
      previewAlt: "Foto della ricetta selezionata",
    },
    hr: {
      title: "Provjera recepta",
      subtitle: "Fotografiraj svoj recept. Asistent čita tekst i objašnjava ti ga jednostavnim riječima. Uvijek provjeri s ljekarnikom ili liječnikom.",
      dropTitle: "Fotografiraj recept",
      cameraCapture: "Snimi fotografiju",
      galleryUpload: "Odaberi iz galerije",
      removePhoto: "Ukloni fotografiju",
      tipFlat: "Položi papir ravno na stol",
      tipLight: "Koristi dnevno svjetlo bez odbljeska bljeskalice",
      tipFull: "Obuhvati cijelu stranicu i nazive lijekova",
      skeletonHeading: "Pripremamo objašnjenje jednostavnim riječima…",
      hint: "Jasna i dobro osvijetljena fotografija cijelog recepta (JPEG, PNG ili WebP, do 8 MB)",
      qualityWarning:
        "Fotografija izgleda pomalo tamno ili mutno. Pokušaj ponovno na dnevnom svjetlu kako bi tekst bio čitljiv.",
      whyLabel: "Zašto si dobio ili dobila ovaj recept? (nije obavezno)",
      whyHint: "To pomaže asistentu razumjeti recept. Ne moraš znati dijagnozu.",
      whyPh: "Na primjer: dobio sam ga nakon pregleda kod liječnika zbog grlobolje i vrućice…",
      reviewButton: "Pročitaj recept",
      reviewing: "Čitanje recepta u tijeku…",
      reviewingHint: "Ovo može potrajati do jedne minute. Ostavi ovu stranicu otvorenom.",
      uploadReqErr: "Snimi ili učitaj fotografiju recepta za nastavak.",
      fileErr: "Odaberi JPEG, PNG ili WebP sliku manju od 8 MB.",
      readErr: "Nismo uspjeli otvoriti tu slikovnu datoteku. Pokušaj s drugom fotografijom.",
      reviewErr: "Nismo uspjeli pročitati ovaj recept. Pokušaj ponovno za nekoliko minuta.",
      rateLimitErr: "Previše zahtjeva u kratkom vremenu. Pričekaj malo pa pokušaj ponovno.",
      previewAlt: "Fotografija odabranog recepta",
    },
    rom: {
      title: "Dikh i receta",
      subtitle: "Ker jekh poza chire recetake. O azhutitori ginavel o teksto thaj shpjeginel les tuke pe lokhe vorbe. Dikh les svako data le farmacistosa vaj le doktoresa.",
      dropTitle: "Ker poza e recetake",
      cameraCapture: "Ker poza",
      galleryUpload: "Alosar katar i galerija",
      removePhoto: "Khos i poza",
      tipFlat: "Thov o lil lungjardo pe jekh skafidi",
      tipLight: "Hasnisar divesko vudud bi blicosko",
      tipFull: "Le sasti rig thaj le anava le drabenge",
      skeletonHeading: "Pregatisaras o shpjegimos pe lokhe vorbe…",
      hint: "Jekh uzi thaj vududali poza katar sasti receta (JPEG, PNG vaj WebP, dji ko 8 MB)",
      qualityWarning:
        "I poza dikljol xantsi kali vaj na uzi. Zumav pale ko divesko vudud kaste ginavel pe o teksto mishto.",
      whyLabel: "Soske ljan kadaja receta? (te manges)",
      whyHint: "Kadava azhutinel o azhutitori te haljarel i receta. Na trebul te dzanes i diagnoza.",
      whyPh: "Misal: ljem la pala jekh drom ko doktori vash dukh and-o korr thaj tatipen…",
      reviewButton: "Ginav i receta",
      reviewing: "Ginavel pe i receta…",
      reviewingHint: "Shaj djal dji ko jekh minuto. Mekh kadaja rig puterdi.",
      uploadReqErr: "Ker vaj thov jekh poza e recetaki te djas maj dur.",
      fileErr: "Alosar jekh poza JPEG, PNG vaj WebP maj tikni katar 8 MB.",
      readErr: "Nashti phuterdas kadaja poza. Zumav aver poza.",
      reviewErr: "Nashti ginadas kadaja receta. Zumav pale pala nesave minutia.",
      rateLimitErr: "But mangimata and-o skurto vrama. Azhuker xantsi thaj zumav pale.",
      previewAlt: "Poza katar i alosardi receta",
    },
  } satisfies Record<Lang, Record<string, string>>;
  const t = dict[lang] || dict[DEFAULT_LANG];

  const cameraInput = useRef<HTMLInputElement>(null);
  const galleryInput = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [context, setContext] = useState("");
  const [result, setResult] = useState<ReviewResponse | null>(null);
  const [qualityWarning, setQualityWarning] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Client-side lighting and blur pre-check (Change 44)
  function checkImageQuality(imageUrl: string) {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = 160;
      canvas.height = 160;
      ctx.drawImage(img, 0, 0, 160, 160);

      try {
        const imageData = ctx.getImageData(0, 0, 160, 160);
        const data = imageData.data;
        const pixels = data.length / 4;
        let sum = 0;
        let sumSquares = 0;
        for (let i = 0; i < data.length; i += 4) {
          const brightness = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
          sum += brightness;
          sumSquares += brightness * brightness;
        }
        const mean = sum / pixels;
        const stdDev = Math.sqrt(Math.max(0, sumSquares / pixels - mean * mean));

        // Warn when the photo is too dark, or so uniform that no writing stands out.
        // A white prescription with dark text has low pixel-to-pixel change but a clear spread,
        // so it must not trigger the warning (the old neighbour-difference check did).
        setQualityWarning(mean < 60 || stdDev < 10);
      } catch {
        setQualityWarning(false);
      }
    };
    img.src = imageUrl;
  }

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  function handleRemovePhoto() {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview(null);
    setQualityWarning(false);
    setError("");
    setResult(null);
    if (cameraInput.current) cameraInput.current.value = "";
    if (galleryInput.current) galleryInput.current.value = "";
  }

  function handleFileSelected(selected: File | null) {
    setError("");
    setQualityWarning(false);
    if (!selected) return;

    if (!selected.type.startsWith("image/") || selected.size > 8 * 1024 * 1024) {
      if (preview) URL.revokeObjectURL(preview);
      setFile(null);
      setPreview(null);
      setError(t.fileErr);
      return;
    }

    if (preview) URL.revokeObjectURL(preview);
    const objectUrl = URL.createObjectURL(selected);
    setFile(selected);
    setPreview(objectUrl);
    checkImageQuality(objectUrl);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) {
      setError(t.uploadReqErr);
      return;
    }

    setError("");
    setResult(null);
    setIsSubmitting(true);

    try {
      const prescription = await new Promise<{ mimeType: string; data: string }>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const dataUrl = typeof reader.result === "string" ? reader.result : "";
          const data = dataUrl.split(",")[1];
          if (data) resolve({ mimeType: file.type, data });
          else reject(new ReadError());
        };
        reader.onerror = () => reject(new ReadError());
        reader.readAsDataURL(file);
      });

      const captchaToken = await executeCaptcha("health_assistant");
      const response = await fetch("/api/health-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prescriptionContext: context, prescription, lang, captchaToken }),
      });

      // Server errors are written in English; the person always sees a message in their language.
      if (!response.ok) {
        setError(response.status === 429 ? t.rateLimitErr : t.reviewErr);
        return;
      }
      setResult((await response.json()) as ReviewResponse);
    } catch (caughtError) {
      setError(caughtError instanceof ReadError ? t.readErr : t.reviewErr);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    // Same shell as /health-check and /health-assistant: tabs span the site container,
    // the page content sits in one max-w-2xl column under them.
    <main id="main-content" className="flex-1 pt-0.5 pb-10 sm:pt-2 sm:pb-14">
      <Container>
        <AssistantNavigation />

        <header className="max-w-2xl print:hidden">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground text-balance sm:text-3xl">
            {t.title}
          </h1>
          <p className="mt-2 max-w-prose text-base leading-relaxed text-muted-foreground">{t.subtitle}</p>
        </header>

        <section className="mt-6 max-w-2xl rounded-xl border border-border bg-card shadow-xs print:hidden sm:mt-8">
          <form onSubmit={handleSubmit} className="space-y-6 p-5 sm:p-7" aria-busy={isSubmitting}>
            {/* Separate inputs: one opens the camera directly on phones, the other the gallery. */}
            <input
              ref={cameraInput}
              type="file"
              accept="image/*"
              capture="environment"
              tabIndex={-1}
              aria-hidden="true"
              onChange={(e) => handleFileSelected(e.target.files?.[0] ?? null)}
              className="sr-only"
            />
            <input
              ref={galleryInput}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              tabIndex={-1}
              aria-hidden="true"
              onChange={(e) => handleFileSelected(e.target.files?.[0] ?? null)}
              className="sr-only"
            />

            {/* Desktop: a photo can also be dropped onto this area. */}
            <div
              onDragOver={(event) => {
                event.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(event) => {
                event.preventDefault();
                setIsDragging(false);
                handleFileSelected(event.dataTransfer.files?.[0] ?? null);
              }}
              className={`rounded-lg border border-dashed p-5 text-center transition-colors duration-[var(--dur-fast)] sm:p-8 ${
                isDragging ? "border-sapphire bg-sapphire-soft dark:bg-sapphire/10" : "border-border"
              }`}
            >
              {preview ? (
                <figure className="flex flex-col items-center">
                  <img
                    src={preview}
                    alt={t.previewAlt}
                    className="max-h-64 w-auto rounded-lg border border-border object-contain"
                  />
                  <figcaption className="mt-2 max-w-full truncate text-sm text-muted-foreground">{file?.name}</figcaption>
                </figure>
              ) : (
                <div>
                  <ImageIcon className="mx-auto h-7 w-7 text-muted-foreground" />
                  <h2 className="mt-3 text-base font-semibold text-foreground">{t.dropTitle}</h2>
                  <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">{t.hint}</p>
                  <ul className="mx-auto mt-4 grid max-w-md gap-2 text-left text-xs text-muted-foreground sm:grid-cols-3">
                    <li className="flex items-start gap-1.5 rounded-md border border-border bg-background/80 p-2.5">
                      <CheckCircleIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sapphire" />
                      <span>{t.tipFlat}</span>
                    </li>
                    <li className="flex items-start gap-1.5 rounded-md border border-border bg-background/80 p-2.5">
                      <CheckCircleIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sapphire" />
                      <span>{t.tipLight}</span>
                    </li>
                    <li className="flex items-start gap-1.5 rounded-md border border-border bg-background/80 p-2.5">
                      <CheckCircleIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sapphire" />
                      <span>{t.tipFull}</span>
                    </li>
                  </ul>
                </div>
              )}

              <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap">
                <button
                  type="button"
                  onClick={() => cameraInput.current?.click()}
                  // Filled until a photo is chosen; then "Read the prescription" becomes the one filled action.
                  className={`inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire sm:w-auto ${
                    preview
                      ? "border border-border bg-card text-foreground hover:bg-muted"
                      : "bg-sapphire text-white hover:bg-sapphire-light"
                  }`}
                >
                  <CameraIcon className="h-4 w-4" />
                  <span>{t.cameraCapture}</span>
                </button>

                <button
                  type="button"
                  onClick={() => galleryInput.current?.click()}
                  className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire sm:w-auto"
                >
                  <ImageIcon className="h-4 w-4" />
                  <span>{t.galleryUpload}</span>
                </button>

                {preview ? (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    disabled={isSubmitting}
                    className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                  >
                    <TrashIcon className="h-4 w-4 text-muted-foreground" />
                    <span>{t.removePhoto}</span>
                  </button>
                ) : null}
              </div>

              {qualityWarning && (
                <p className="mt-4 flex items-start gap-2.5 rounded-lg border border-amber-care-border bg-amber-care-soft/60 p-3.5 text-left text-sm leading-relaxed text-foreground dark:border-amber-care/40 dark:bg-amber-care/15">
                  <AlertCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-amber-care dark:text-amber-care-border" />
                  <span>{t.qualityWarning}</span>
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-semibold text-foreground" htmlFor="prescription-context">
                {t.whyLabel}
              </label>
              <p id="prescription-context-hint" className="mt-1 text-sm text-muted-foreground">
                {t.whyHint}
              </p>
              <textarea
                id="prescription-context"
                aria-describedby="prescription-context-hint"
                rows={3}
                maxLength={4000}
                value={context}
                onChange={(event) => setContext(event.target.value)}
                placeholder={t.whyPh}
                className="mt-2 w-full resize-none rounded-lg border border-border bg-background p-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire"
              />
            </div>

            {error && (
              <div
                role="alert"
                className="flex items-start gap-2.5 rounded-lg border border-amber-care-border bg-amber-care-soft/60 p-3.5 text-sm font-medium leading-relaxed text-foreground dark:border-amber-care/40 dark:bg-amber-care/15"
              >
                <AlertCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-amber-care dark:text-amber-care-border" />
                <span>{error}</span>
              </div>
            )}

            <div className="sticky bottom-0 z-10 -mx-5 border-t border-border bg-card/95 px-5 py-3.5 backdrop-blur-xs sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
              <button
                type="submit"
                disabled={isSubmitting || !file}
                className="inline-flex min-h-[48px] w-full items-center justify-center rounded-lg bg-sapphire px-7 text-base font-semibold text-white transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-sapphire-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground sm:w-auto"
              >
                {isSubmitting ? t.reviewing : t.reviewButton}
              </button>

              {/* Honest progress: a calm indeterminate line, no fake percentages or scanning effects. */}
              <div role="status" aria-live="polite" className={isSubmitting ? "mt-3" : ""}>
                {isSubmitting ? (
                  <>
                    <div className="h-1.5 w-full overflow-hidden rounded-md bg-muted sm:max-w-xs" aria-hidden="true">
                      <div className="assistant-reading-bar h-full w-2/5 rounded-md bg-sapphire dark:bg-sapphire-border" />
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{t.reviewingHint}</p>
                  </>
                ) : null}
              </div>
            </div>
          </form>
        </section>

        {isSubmitting && !result ? (
          <section
            aria-label={t.skeletonHeading}
            className="mt-6 max-w-2xl rounded-xl border border-border bg-card p-5 shadow-xs print:hidden sm:p-7"
          >
            <p className="text-sm font-semibold text-foreground">{t.skeletonHeading}</p>
            <div className="mt-4 space-y-3" aria-hidden="true">
              {[0, 1, 2].map((row) => (
                <div
                  key={row}
                  className="animate-pulse rounded-lg border border-border bg-background p-4 motion-reduce:animate-none"
                >
                  <div className="h-4 w-2/5 rounded-md bg-muted" />
                  <div className="mt-2.5 h-3.5 w-full rounded-md bg-muted/80" />
                  <div className="mt-2 h-3.5 w-4/5 rounded-md bg-muted/70" />
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {result && (
          <section className="assistant-step-in mt-6 max-w-2xl rounded-xl border border-border bg-card p-5 shadow-xs sm:p-7">
            <PrescriptionStructuredResult
              aiMessage={result.message}
              prescriptionText={result.prescriptionText}
              emergency={result.urgency === "emergency" || result.careLevel === "emergency"}
            />
          </section>
        )}
      </Container>
    </main>
  );
}
