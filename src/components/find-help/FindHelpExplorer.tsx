"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { medicalInstitutes } from "@/lib/medical-institutes";
import { PhoneIcon } from "@/components/ui/icons";

const InstitutesMap = dynamic(
  () => import("@/components/find-help/InstitutesMapInner"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full min-h-96 items-center justify-center rounded-2xl border border-border bg-muted text-sm text-muted-foreground">
        Loading map…
      </div>
    ),
  },
);

export function FindHelpExplorer() {
  const institutes = useMemo(() => medicalInstitutes, []);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr] lg:gap-10">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Medical institutes
        </h2>
        <p className="mt-2 text-base leading-relaxed text-muted-foreground">
          Select a place to highlight it on the map.
        </p>

        <ul className="mt-6 space-y-3">
          {institutes.map((institute) => {
            const { id, name, category, address, phone, hours, Icon } = institute;
            const active = id === selectedId;
            return (
              <li key={id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(id)}
                  aria-pressed={active}
                  className={`flex w-full items-start gap-4 rounded-xl border p-5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                    active
                      ? "border-primary bg-primary-soft"
                      : "border-border bg-card hover:border-primary/40"
                  }`}
                >
                  <span className="flex h-11 w-11 flex-none items-center justify-center rounded-lg bg-primary-soft text-primary">
                    <Icon className="h-6 w-6" />
                  </span>
                  <span className="min-w-0">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="text-lg font-semibold text-foreground">
                        {name}
                      </span>
                      <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                        {category}
                      </span>
                    </span>
                    <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
                      {address}
                    </span>
                    <span className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      <a
                        href={`tel:${phone.replace(/\s+/g, "")}`}
                        className="inline-flex items-center gap-1.5 font-medium text-primary hover:text-primary-hover"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <PhoneIcon className="h-4 w-4" />
                        {phone}
                      </a>
                      <span>{hours}</span>
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="lg:sticky lg:top-24 lg:self-start">
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="h-[28rem] w-full lg:h-[36rem]">
            <InstitutesMap
              institutes={institutes}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
          </div>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Map data © OpenStreetMap contributors © CARTO.
        </p>
      </div>
    </div>
  );
}
