"use client";

import { useActionState, useState } from "react";
import { Building2, UserRoundIcon } from "lucide-react";
import { completeOnboardingAction } from "@/features/onboarding/actions";
import { initialOnboardingState } from "@/features/onboarding/form-state";
import { useT } from "@/components/providers/locale-provider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type AccountType = "creator" | "company";

export function OnboardingForm({
  initialType,
}: {
  initialType?: AccountType;
}) {
  const t = useT();
  const [accountType, setAccountType] = useState<AccountType>(
    initialType ?? "creator"
  );
  const [state, action, pending] = useActionState(
    completeOnboardingAction,
    initialOnboardingState
  );

  const fieldErrors = state.status === "error" ? state.fieldErrors : undefined;

  const options: Array<{
    value: AccountType;
    label: string;
    desc: string;
    icon: typeof UserRoundIcon;
  }> = [
    {
      value: "creator",
      label: t.onboarding.creator,
      desc: t.onboarding.creatorDesc,
      icon: UserRoundIcon,
    },
    {
      value: "company",
      label: t.onboarding.company,
      desc: t.onboarding.companyDesc,
      icon: Building2,
    },
  ];

  return (
    <form action={action} className="space-y-6" noValidate>
      <input type="hidden" name="accountType" value={accountType} />

      <FieldGroup>
        <Field>
          <FieldLegend>{t.onboarding.title}</FieldLegend>
          <FieldDescription>{t.onboarding.subtitle}</FieldDescription>
        </Field>

        <div className="grid gap-3 sm:grid-cols-2">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setAccountType(option.value)}
              aria-pressed={accountType === option.value}
              className={cn(
                "cursor-pointer rounded-2xl border p-4 text-start transition-all hover:border-primary/40",
                accountType === option.value
                  ? "border-primary bg-accent/60 ring-2 ring-primary/25"
                  : "bg-card"
              )}
            >
              <option.icon
                className={cn(
                  "size-6",
                  accountType === option.value ? "text-primary" : "text-muted-foreground"
                )}
              />
              <span className="mt-2.5 block font-semibold">{option.label}</span>
              <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                {option.desc}
              </span>
            </button>
          ))}
        </div>

        {state.status === "error" && !fieldErrors && state.message ? (
          <Alert variant="destructive">
            <AlertDescription>{t.auth.errors.generic}</AlertDescription>
          </Alert>
        ) : null}

        <Field data-invalid={fieldErrors?.orgName ? "true" : undefined}>
          <FieldLabel htmlFor="orgName">{t.onboarding.orgName}</FieldLabel>
          <Input
            id="orgName"
            name="orgName"
            required
            minLength={2}
            placeholder={t.onboarding.orgNamePlaceholder}
          />
          {fieldErrors?.orgName ? (
            <FieldError>{fieldErrors.orgName[0]}</FieldError>
          ) : null}
        </Field>

        {accountType === "creator" ? (
          <Field data-invalid={fieldErrors?.displayName ? "true" : undefined}>
            <FieldLabel htmlFor="displayName">
              {t.onboarding.displayName}
            </FieldLabel>
            <Input
              id="displayName"
              name="displayName"
              placeholder={t.onboarding.displayNamePlaceholder}
            />
            {fieldErrors?.displayName ? (
              <FieldError>{fieldErrors.displayName[0]}</FieldError>
            ) : null}
          </Field>
        ) : null}

        <Field data-invalid={fieldErrors?.slug ? "true" : undefined}>
          <FieldLabel htmlFor="slug">{t.onboarding.slug}</FieldLabel>
          <div
            dir="ltr"
            className="flex items-center overflow-hidden rounded-lg border bg-muted/40 focus-within:ring-2 focus-within:ring-ring/50"
          >
            <span className="shrink-0 border-e bg-muted px-3 py-2 text-sm text-muted-foreground">
              wasla.com/
            </span>
            <input
              id="slug"
              name="slug"
              autoComplete="off"
              spellCheck={false}
              className="w-full bg-background px-3 py-2 text-sm outline-none"
              placeholder="your-name"
              dir="ltr"
              required
            />
          </div>
          {fieldErrors?.slug ? (
            <FieldError>
              {fieldErrors.slug[0] === "slug_taken"
                ? t.onboarding.slugTaken
                : fieldErrors.slug[0]}
            </FieldError>
          ) : null}
        </Field>
      </FieldGroup>

      <Button type="submit" size="lg" className="w-full rounded-xl" disabled={pending}>
        {pending ? t.onboarding.creating : t.onboarding.finish}
      </Button>
    </form>
  );
}
