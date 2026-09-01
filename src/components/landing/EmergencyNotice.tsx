import { Container } from "@/components/ui/Container";
import { PhoneIcon } from "@/components/ui/icons";

export function EmergencyNotice() {
  return (
    <section className="bg-primary-soft py-8">
      <Container>
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <span className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-primary text-white">
            <PhoneIcon className="h-6 w-6" />
          </span>
          <div>
            <h2 className="text-base font-semibold text-foreground">
              In a medical emergency
            </h2>
            <p className="mt-1 text-base leading-relaxed text-foreground/80">
              If you think you may be experiencing a medical emergency, contact
              your local emergency service immediately.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
