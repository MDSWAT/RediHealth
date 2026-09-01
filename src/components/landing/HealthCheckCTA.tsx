import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { ClipboardCheckIcon } from "@/components/ui/icons";

export function HealthCheckCTA() {
  return (
    <section className="py-16 sm:py-20">
      <Container>
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="grid gap-8 p-8 sm:p-12 lg:grid-cols-[1.4fr_1fr] lg:items-center">
            <div className="max-w-xl">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-soft text-primary">
                <ClipboardCheckIcon className="h-6 w-6" />
              </span>
              <h2 className="mt-5 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                Not sure where to start?
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
                Answer a few simple questions about your health and we&apos;ll
                help you understand what your next step could be.
              </p>

              <div className="mt-8">
                <Button href="/health-check" size="lg">
                  Start Health Check
                </Button>
              </div>

              <p className="mt-6 rounded-lg bg-muted px-4 py-3 text-sm leading-relaxed text-muted-foreground">
                This tool provides health information and guidance. It does not
                provide a medical diagnosis.
              </p>
            </div>

            <div
              className="hidden rounded-xl bg-muted/60 p-8 lg:block"
              aria-hidden="true"
            >
              <ol className="space-y-4">
                {["A few simple questions", "Clear, plain-language guidance", "Suggested next steps"].map(
                  (step, index) => (
                    <li key={step} className="flex items-center gap-3">
                      <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-card text-sm font-semibold text-primary ring-1 ring-border">
                        {index + 1}
                      </span>
                      <span className="text-base font-medium text-foreground">
                        {step}
                      </span>
                    </li>
                  ),
                )}
              </ol>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
