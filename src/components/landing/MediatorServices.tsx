import { IconTile } from "@/components/ui/IconTile";
import { CalendarIcon, FileTextIcon, UsersIcon } from "@/components/ui/icons";
import type { NavIcon } from "@/components/layout/nav-links";
import type { HomeStep } from "@/lib/i18n/home-sections-copy";

const SERVICE_ICONS: readonly NavIcon[] = [CalendarIcon, FileTextIcon, UsersIcon];

/**
 * What a health mediator helps with, rendered as three crisp elevated cards on the ink ground.
 * Always visible on both mobile and desktop for predictable scanning without accordion clicks.
 */
export function MediatorServices({ services }: { services: HomeStep[] }) {
  return (
    <ul className="mt-10 grid gap-4 sm:grid-cols-3 sm:gap-6 lg:mt-14 lg:gap-8">
      {services.map((service, index) => {
        const Icon = SERVICE_ICONS[index] ?? UsersIcon;
        return (
          <li
            key={service.title}
            className="overflow-hidden rounded-(--radius-surface) border border-paper/15 bg-ink-900"
          >
            <span aria-hidden="true" className="block h-1 bg-amber-care-border" />
            <div className="p-5 sm:p-6">
              <div className="flex items-start gap-3.5">
                <IconTile icon={Icon} tone="amber" size={40} />
                <h3 className="min-w-0 flex-1 self-center text-balance text-title font-semibold text-paper">
                  {service.title}
                </h3>
              </div>
              <p className="mt-3 max-w-(--measure-reading) text-pretty text-body text-mist">
                {service.text}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
