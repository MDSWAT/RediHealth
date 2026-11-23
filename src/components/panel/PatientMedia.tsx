/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { ChevronLeftIcon, ChevronRightIcon, CloseIcon, DownloadIcon, ImageIcon, TrashIcon } from "@/components/ui/icons";
import { useLanguage } from "@/lib/i18n/language-context";
import { patientDesignTranslations } from "@/lib/i18n/patient-design-translations";
import { crmTranslations } from "@/lib/i18n/crm-translations";
import { langToLocale } from "@/lib/i18n/panel-translations";
import { formatPanelDate } from "@/lib/panel-dates";
import type { PatientPhoto } from "@/lib/types/patient";
import "./patient-media.css";

function MediaImage({ src, alt, className = "" }: { src: string; alt: string; className?: string }) {
  const { lang } = useLanguage();
  const [failedSource, setFailedSource] = useState<string | null>(null);
  return failedSource === src ? <span className="patient-media-unavailable" role="img" aria-label={alt}><ImageIcon className="h-6 w-6" aria-hidden="true" /><span>{patientDesignTranslations[lang].unavailable}</span></span>
    : <img src={src} alt={alt} className={className} loading="lazy" onError={() => setFailedSource(src)} />;
}

export function PatientAvatar({ name, src, large = false, onPreview }: { name: string; src?: string | null; large?: boolean; onPreview?: () => void }) {
  const { lang } = useLanguage();
  const initials = name.trim().split(/\s+/).slice(0, 2).map((part) => part.charAt(0)).join("").toUpperCase();
  const content = src ? <MediaImage src={src} alt={crmTranslations[lang].profilePhoto} /> : <span aria-hidden="true">{initials}</span>;
  const className = `patient-avatar${large ? " patient-avatar-large" : ""}`;
  return src && onPreview ? <button type="button" className={className} onClick={onPreview} aria-label={`${patientDesignTranslations[lang].view}: ${name}`}>{content}</button>
    : <div className={className} aria-hidden={!src || undefined}>{content}</div>;
}

export function PatientImageViewer({ images, index, onClose }: { images: PatientPhoto[]; index: number; onClose: () => void }) {
  const { lang } = useLanguage();
  const t = patientDesignTranslations[lang];
  const titleId = useId();
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const stage = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(index);
  const [zoomed, setZoomed] = useState(false);
  const image = images[Math.min(current, images.length - 1)];
  useEffect(() => {
    const element = dialog.current;
    opener.current = document.activeElement as HTMLElement | null;
    element?.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { element?.close(); document.body.style.overflow = previousOverflow; opener.current?.focus(); };
  }, []);
  function move(direction: number) {
    setCurrent((value) => (value + direction + images.length) % images.length);
    setZoomed(false);
    stage.current?.scrollTo(0, 0);
  }
  if (!image) return null;
  return <dialog ref={dialog} className="patient-image-viewer" aria-labelledby={titleId} onCancel={(event) => { event.preventDefault(); onClose(); }} onKeyDown={(event) => {
    if ((event.target as HTMLElement).matches("input, textarea, select")) return;
    if (images.length > 1 && ["ArrowLeft", "ArrowRight"].includes(event.key)) { event.preventDefault(); move(event.key === "ArrowLeft" ? -1 : 1); }
  }}>
    <header className="patient-viewer-header"><div className="min-w-0"><h2 id={titleId}>{image.name}</h2><p aria-live="polite">{Math.min(current + 1, images.length)} / {images.length}</p></div><button type="button" className="patient-media-button" onClick={onClose} aria-label={t.close} autoFocus><CloseIcon className="h-5 w-5" aria-hidden="true" /></button></header>
    <div ref={stage} className={`patient-viewer-stage${zoomed ? " is-zoomed" : ""}`}><MediaImage key={image.id} src={image.data_url} alt={image.name} /></div>
    <footer className="patient-viewer-footer">
      <div className="patient-viewer-controls">{images.length > 1 && <><button type="button" className="patient-media-button" onClick={() => move(-1)} aria-label={t.previous}><ChevronLeftIcon className="h-5 w-5" aria-hidden="true" /></button><button type="button" className="patient-media-button" onClick={() => move(1)} aria-label={t.next}><ChevronRightIcon className="h-5 w-5" aria-hidden="true" /></button></>}<button type="button" className="patient-media-button" aria-pressed={zoomed} onClick={() => { setZoomed(!zoomed); stage.current?.scrollTo(0, 0); }}>{zoomed ? t.fit : t.zoom}</button><a className="patient-media-button" href={image.data_url} download={image.name}><DownloadIcon className="h-4 w-4" aria-hidden="true" /><span>{t.download}</span></a></div>
      {image.notes && <p className="patient-viewer-note">{image.notes}</p>}
    </footer>
  </dialog>;
}

export function PatientPhotoGallery({ photos, onDelete, busy = false }: { photos: PatientPhoto[]; onDelete?: (id: string) => void; busy?: boolean }) {
  const { lang } = useLanguage();
  const [preview, setPreview] = useState<number | null>(null);
  const t = patientDesignTranslations[lang];
  return <>
    <div className="patient-photo-gallery">{photos.map((photo, index) => <figure key={photo.id} className="patient-photo-tile">
      <button type="button" className="patient-photo-thumbnail" onClick={() => setPreview(index)} aria-label={`${t.view}: ${photo.name}`}><MediaImage src={photo.data_url} alt={photo.name} /><span className="patient-photo-open"><ImageIcon className="h-4 w-4" aria-hidden="true" />{t.view}</span></button>
      <figcaption><div className="patient-photo-caption"><div className="min-w-0"><p>{photo.name}</p>{photo.date && <time dateTime={photo.date}>{formatPanelDate(photo.date.length === 10 ? `${photo.date}T12:00:00` : photo.date, langToLocale[lang], "date")}</time>}</div>{onDelete && <button type="button" className="patient-media-button patient-photo-delete" disabled={busy} onClick={() => onDelete(photo.id)} aria-label={`${crmTranslations[lang].delete}: ${photo.name}`}><TrashIcon className="h-4 w-4" aria-hidden="true" /></button>}</div>{photo.notes && <p className="patient-photo-note">{photo.notes}</p>}</figcaption>
    </figure>)}</div>
    {preview !== null && photos.length > 0 && <PatientImageViewer images={photos} index={preview} onClose={() => setPreview(null)} />}
  </>;
}

export function PatientPhotoTrigger({ photo, children }: { photo: PatientPhoto; children?: ReactNode }) {
  const [open, setOpen] = useState(false);
  const { lang } = useLanguage();
  return <><button type="button" className="patient-photo-inline" onClick={() => setOpen(true)} aria-label={`${patientDesignTranslations[lang].view}: ${photo.name}`}>{children || <MediaImage src={photo.data_url} alt={photo.name} />}</button>{open && <PatientImageViewer images={[photo]} index={0} onClose={() => setOpen(false)} />}</>;
}
