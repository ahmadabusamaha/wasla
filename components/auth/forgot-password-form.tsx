"use client";

import Link from "next/link";
import { useActionState } from "react";
import { MailCheckIcon, TriangleAlertIcon } from "lucide-react";
import { requestPasswordResetAction } from "@/features/auth/actions";
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

export function ForgotPasswordForm() {
  const t = useT();
  const [state, action, pending] = useActionState(
    requestPasswordResetAction,
    initialFormState
  );
  const fieldErrors = state.status === "error" ? state.fieldErrors : undefined;

  if (state.status === "success") {
    return (
      <div className="space-y-4 text-center">
        <div className="mx-auto grid size-14 place-items-center rounded-full bg-accent">
          <MailCheckIcon className="size-7 text-primary" />
        </div>
        <h2 className="text-lg font-bold">{t.auth.resetSentTitle}</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {t.auth.resetSentDesc}
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
          <AlertDescription>{t.auth.errors.generic}</AlertDescription>
        </Alert>
      ) : null}

      <FieldGroup>
        <Field data-invalid={fieldErrors?.email ? "true" : undefined}>
          <FieldLabel htmlFor="email">{t.auth.email}</FieldLabel>
          <Input
            id="email"
            name="email"
            type="email"
            dir="ltr"
            autoComplete="email"
            required
          />
          {fieldErrors?.email ? (
            <FieldError>{fieldErrors.email[0]}</FieldError>
          ) : null}
        </Field>
      </FieldGroup>

      <Button type="submit" className="w-full rounded-xl" disabled={pending}>
        {pending ? t.common.loading : t.auth.sendResetLink}
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
