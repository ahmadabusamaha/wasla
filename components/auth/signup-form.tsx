"use client";

import { useActionState } from "react";
import Link from "next/link";
import { MailCheckIcon, TriangleAlertIcon } from "lucide-react";
import { signUpAction } from "@/features/auth/actions";
import { initialFormState } from "@/features/auth/form-state";
import { useT } from "@/components/providers/locale-provider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function SignupForm() {
  const t = useT();
  const [state, action, pending] = useActionState(signUpAction, initialFormState);
  const fieldErrors = state.status === "error" ? state.fieldErrors : undefined;

  if (state.status === "success") {
    return (
      <div className="space-y-4 text-center">
        <div className="mx-auto grid size-14 place-items-center rounded-full bg-accent">
          <MailCheckIcon className="size-7 text-primary" />
        </div>
        <h2 className="text-lg font-bold">{t.auth.checkEmailTitle}</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {t.auth.checkEmailDesc}
        </p>
        <Button asChild variant="outline" className="w-full rounded-xl">
          <Link href="/login">{t.auth.signIn}</Link>
        </Button>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-5" noValidate>
      {state.status === "error" && state.message && !fieldErrors ? (
        <Alert variant="destructive">
          <TriangleAlertIcon />
          <AlertDescription>
            {state.message === "email_taken"
              ? t.auth.errors.emailTaken
              : state.message === "weak_password"
                ? t.auth.errors.weakPassword
                : t.auth.errors.generic}
          </AlertDescription>
        </Alert>
      ) : null}

      <FieldGroup>
        <Field data-invalid={fieldErrors?.fullName ? "true" : undefined}>
          <FieldLabel htmlFor="fullName">{t.auth.fullName}</FieldLabel>
          <Input
            id="fullName"
            name="fullName"
            autoComplete="name"
            required
            aria-invalid={Boolean(fieldErrors?.fullName)}
          />
          {fieldErrors?.fullName ? (
            <FieldError>{fieldErrors.fullName[0]}</FieldError>
          ) : null}
        </Field>

        <Field data-invalid={fieldErrors?.email ? "true" : undefined}>
          <FieldLabel htmlFor="email">{t.auth.email}</FieldLabel>
          <Input
            id="email"
            name="email"
            type="email"
            dir="ltr"
            autoComplete="email"
            required
            aria-invalid={Boolean(fieldErrors?.email)}
          />
          {fieldErrors?.email ? (
            <FieldError>{fieldErrors.email[0]}</FieldError>
          ) : null}
        </Field>

        <Field data-invalid={fieldErrors?.password ? "true" : undefined}>
          <FieldLabel htmlFor="password">{t.auth.password}</FieldLabel>
          <Input
            id="password"
            name="password"
            type="password"
            dir="ltr"
            autoComplete="new-password"
            required
            minLength={8}
            aria-invalid={Boolean(fieldErrors?.password)}
          />
          {fieldErrors?.password ? (
            <FieldError>{fieldErrors.password[0]}</FieldError>
          ) : null}
        </Field>
      </FieldGroup>

      <Button type="submit" className="w-full rounded-xl" disabled={pending}>
        {pending ? t.common.loading : t.auth.signUp}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        {t.auth.haveAccount}{" "}
        <Link href="/login" className="font-semibold text-primary hover:underline">
          {t.auth.signIn}
        </Link>
      </p>
    </form>
  );
}
