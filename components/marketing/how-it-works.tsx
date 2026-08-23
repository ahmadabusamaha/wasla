import { Building2, Gift, LayoutDashboard, Link2, Megaphone, MousePointerClick, Search, Wallet } from "lucide-react";
import { getDictionary } from "@/lib/i18n/server";
import { Card, CardContent } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

const CREATOR_ICONS: LucideIcon[] = [Link2, MousePointerClick, Wallet];
const COMPANY_ICONS: LucideIcon[] = [Search, Gift, LayoutDashboard];

export async function HowItWorks() {
  const t = await getDictionary();

  const groups = [
    {
      title: t.landing.creatorsTitle,
      steps: t.landing.creatorsSteps,
      icons: CREATOR_ICONS,
      icon: Megaphone,
      accent: false,
    },
    {
      title: t.landing.companiesTitle,
      steps: t.landing.companiesSteps,
      icons: COMPANY_ICONS,
      icon: Building2,
      accent: true,
    },
  ];

  return (
    <section id="how-it-works" className="scroll-mt-20 py-16 md:py-24">
      <div className="mx-auto w-full max-w-6xl px-4">
        <h2 className="text-center text-3xl font-bold tracking-tight md:text-4xl">
          {t.landing.howTitle}
        </h2>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {groups.map((group) => (
            <Card
              key={group.title}
              className={group.accent ? "border-amber-500/20 bg-card" : "bg-card"}
            >
              <CardContent className="p-6 md:p-8">
                <div className="flex items-center gap-3">
                  <div
                    className={
                      group.accent
                        ? "grid size-11 place-items-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400"
                        : "grid size-11 place-items-center rounded-xl bg-accent text-primary"
                    }
                  >
                    <group.icon className="size-5" />
                  </div>
                  <h3 className="text-xl font-bold">{group.title}</h3>
                </div>

                <ol className="mt-7 space-y-6">
                  {group.steps.map((step, index) => {
                    const Icon = group.icons[index];
                    return (
                      <li key={step.title} className="flex items-start gap-4">
                        <div className="relative grid size-10 shrink-0 place-items-center rounded-full border border-border bg-background text-sm font-bold text-primary">
                          {index + 1}
                          <Icon className="absolute -bottom-1 -end-1 size-4 rounded-full bg-primary p-0.5 text-primary-foreground" />
                        </div>
                        <div>
                          <h4 className="font-semibold leading-snug">{step.title}</h4>
                          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                            {step.desc}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
