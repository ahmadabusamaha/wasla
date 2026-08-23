"use client";

import { useActionState } from "react";
import Link from "next/link";
import { TriangleAlertIcon } from "lucide-react";
import { logInAction } from "@/features/auth/actions";
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

export function LoginForm({ next }: { next?: string }) {
  const t = useT();
  const [state, action, pending] = useActionState(logInAction, initialFormState);
  const fieldErrors = state.status === "error" ? state.fieldErrors : undefined;

  return (
    <form action={action} className="space-y-5" noValidate>
      {state.status === "error" && state.message && !fieldErrors ? (
        <Alert variant="destructive">
          <TriangleAlertIcon />
          <AlertDescription>
            {state.message === "invalid_credentials"
              ? t.auth.errors.invalidCredentials
              : t.auth.errors.generic}
          </AlertDescription>
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

        <Field data-invalid={fieldErrors?.password ? "true" : undefined}>
          <div className="flex items-center justify-between">
            <FieldLabel htmlFor="password">{t.auth.password}</FieldLabel>
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-primary hover:underline"
            >
              {t.auth.forgotPassword}
            </Link>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            dir="ltr"
            autoComplete="current-password"
            required
          />
          {fieldErrors?.password ? (
            <FieldError>{fieldErrors.password[0]}</FieldError>
          ) : null}
        </Field>
      </FieldGroup>

      {next ? <input type="hidden" name="next" value={next} /> : null}

      <Button type="submit" className="w-full rounded-xl" disabled={pending}>
        {pending ? t.common.loading : t.auth.signIn}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        {t.auth.noAccount}{" "}
        <Link href="/signup" className="font-semibold text-primary hover:underline">
          {t.auth.signUp}
        </Link>
      </p>
    </form>
  );
}
