"use client";

import Link from "next/link";
import {
  ArrowRightIcon,
  UsersIcon,
  VideoIcon,
  ShieldIcon,
} from "@/components/ui/icons";

export function HeroPortals() {
  return (
    <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Telemedicine Virtual Clinic Portal Card */}
      <div className="relative flex flex-col justify-between rounded-2xl border border-sapphire-border bg-gradient-to-br from-sapphire-soft/80 via-white to-surface-card p-4 sm:p-5 shadow-2xs transition hover:border-sapphire hover:shadow-md">
        <div>
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-sapphire px-2.5 py-1 text-[11px] font-semibold text-white shadow-2xs">
              <VideoIcon className="h-3.5 w-3.5" />
              Clinica virtuală
            </span>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
              <span className="micro-status-dot" aria-hidden="true" />
              Medic de gardă activ
            </span>
          </div>

          <h3 className="mt-3 text-sm sm:text-base font-bold tracking-tight text-foreground">
            Consultații medicale online pe înțelesul tău
          </h3>
          <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
            Discută prin apel video securizat cu medici de familie și medici specialiști, gratuit și confidențial.
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-border/60">
          <Link
            href="/get-help?mode=doctor"
            className="inline-flex w-full items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-primary-hover active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            Intră în clinica virtuală
          </Link>
        </div>
      </div>

      {/* Community Health Mediators Portal Card */}
      <div className="relative flex flex-col justify-between rounded-2xl border border-amber-care-border bg-gradient-to-br from-amber-care-soft/60 via-white to-surface-card p-4 sm:p-5 shadow-2xs transition hover:border-amber-care hover:shadow-md">
        <div>
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
              <UsersIcon className="h-3.5 w-3.5" />
              Pentru mediatori sanitari
            </span>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
              <ShieldIcon className="h-3.5 w-3.5 text-amber-care" />
              Spațiu de lucru teren
            </span>
          </div>

          <h3 className="mt-3 text-sm sm:text-base font-bold tracking-tight text-foreground">
            Ești mediator sanitar în comunitate?
          </h3>
          <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
            Accesează dosarele familiilor, înregistrează cazuri noi în teren și colaborează direct cu medicii din platformă.
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-border/60">
          <Link
            href="/panel"
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-amber-care-border bg-white px-4 py-2.5 text-xs font-bold text-amber-700 transition hover:bg-amber-care-soft active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-700"
          >
            Deschide panoul mediatorului
            <ArrowRightIcon className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
