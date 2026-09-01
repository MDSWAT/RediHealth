import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import Image from "next/image";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border bg-muted/40">
      <Container className="relative py-16 sm:py-20 lg:py-24">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(24rem,40rem)] lg:gap-16">
          <div className="max-w-2xl">
          <h1 className="text-balance text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl">
            <span className="block">Better Health</span>
            <span className="block">starts with you.</span>
            <span className="block text-primary">Health mediators better supported.</span>
          </h1>

          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
            REDI Health helps families, including Roma communities, understand health information and equips mediators with digital tools to educate, guide, refer, and follow up.
          </p>

          <div className="mt-8">
            <Button href="/get-help" size="lg">
              Request Medical Help
            </Button>
          </div>
          </div>

          <div
            className="pointer-events-none hidden min-h-72 items-center justify-center lg:flex"
            aria-hidden="true"
          >
            <Image
              className="h-auto w-full max-w-[40rem]"
              src="/Icons/Family.svg"
              alt=""
              width={1024}
              height={700}
              priority
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
