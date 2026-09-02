"use client";

import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/lib/i18n/language-context";

const heroChatFrom = ["them", "us", "us", "us", "us"] as const;

const heroChatTypingSeconds = 1;
const heroChatTextDelaySeconds = 0.25;
const heroChatStepSeconds = heroChatTypingSeconds + heroChatTextDelaySeconds;
const heroFactcheckDelay = heroChatFrom.length * heroChatStepSeconds + 0.2;

export function Hero() {
  const { t } = useLanguage();
  const phone = t.hero.phone;

  return (
    <section className="relative overflow-hidden border-b border-border bg-muted/40">
      <Container className="relative py-16 sm:py-20 lg:py-24">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(24rem,40rem)] lg:gap-16">
          <div className="max-w-2xl">
          <h1 className="text-balance text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl">
            <span className="hero-text-in block" style={{ animationDelay: "0.05s" }}>{t.hero.titleLine1}</span>
            <span className="hero-text-in block" style={{ animationDelay: "0.2s" }}>{t.hero.titleLine2}</span>
            <span className="hero-text-in block text-primary" style={{ animationDelay: "0.35s" }}>{t.hero.titleLine3}</span>
          </h1>

          <p className="hero-text-in mt-5 text-lg leading-relaxed text-muted-foreground" style={{ animationDelay: "0.5s" }}>
            {t.hero.paragraph}
          </p>

          <div className="hero-text-in mt-8" style={{ animationDelay: "0.65s" }}>
            <Button href="/get-help" size="lg">
              {t.hero.cta}
            </Button>
            <a href="/health-assistant" className="ml-5 inline-flex min-h-11 items-center text-sm font-semibold text-foreground underline decoration-primary/60 underline-offset-4 hover:text-primary">
              Try the health assistant
            </a>
          </div>
          </div>

          <div className="relative flex min-h-72 items-center justify-center">
            <div className="relative aspect-[9/19] w-full max-w-[13rem] overflow-hidden rounded-[3rem] border-[10px] border-foreground/90 bg-foreground/90 shadow-2xl sm:max-w-[18rem]">
              <div className="absolute left-1/2 top-0 z-10 h-6 w-32 -translate-x-1/2 rounded-b-2xl bg-foreground/90" />

              <div className="flex h-full w-full flex-col overflow-hidden rounded-[2.25rem] bg-muted">
                <div className="flex items-center gap-3 bg-primary px-4 pb-3 pt-8 text-white">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-sm font-semibold">
                    ?
                  </div>
                  <div>
                    <p className="text-sm font-semibold leading-tight">Unknown number</p>
                    <p className="text-xs text-white/80 leading-tight">{phone.status}</p>
                  </div>
                </div>

                <div className="flex flex-1 flex-col gap-2 overflow-hidden px-3 py-4">
                  {heroChatFrom.map((from, index) => {
                    const typingDelay = index * heroChatStepSeconds;
                    const messageDelay = typingDelay + heroChatTypingSeconds + heroChatTextDelaySeconds;
                    const isOwn = from === "us";
                    const bubbleClasses = isOwn
                      ? "justify-self-end rounded-tr-none bg-primary text-white"
                      : "justify-self-start rounded-tl-none bg-white text-foreground";
                    const typingMotionClass = isOwn ? "hero-typing-bubble-slide" : "";

                    return (
                      <div key={index} className="grid">
                        <div
                          className={`hero-typing-bubble ${typingMotionClass} col-start-1 row-start-1 flex w-12 items-center gap-1 rounded-lg px-3 py-2 shadow-sm ${bubbleClasses}`}
                          style={{ animationDuration: `${heroChatTypingSeconds}s`, animationDelay: `${typingDelay}s` }}
                        >
                          <span className="hero-typing-dot h-1.5 w-1.5 rounded-full bg-current" />
                          <span className="hero-typing-dot h-1.5 w-1.5 rounded-full bg-current" />
                          <span className="hero-typing-dot h-1.5 w-1.5 rounded-full bg-current" />
                        </div>
                        <div
                          className={`hero-chat-message col-start-1 row-start-1 max-w-[80%] rounded-lg px-3 py-2 text-xs shadow-sm ${bubbleClasses}`}
                          style={{ animationDelay: `${messageDelay}s` }}
                        >
                          {phone.messages[index]}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div
                  className="hero-factcheck-card border-t border-border bg-card px-3 py-3 text-xs text-foreground"
                  style={{ animationDelay: `${heroFactcheckDelay}s` }}
                >
                  <p>
                    &quot;{phone.factcheckLine1}
                    <br />
                    {phone.factcheckLine2}&quot;
                  </p>
                  <p className="mt-1 text-muted-foreground">{phone.source}</p>
                  <Button href="/get-help" fullWidth className="mt-2 min-h-0 px-3 py-2 text-xs">
                    {phone.button}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
