"use client";

import { useActionState } from "react";
import { TriangleAlertIcon } from "lucide-react";
import { updatePasswordAction } from "@/features/auth/actions";
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

export function ResetPasswordForm() {
  const t = useT();
  const [state, action, pending] = useActionState(
    updatePasswordAction,
    initialFormState
  );
  const fieldErrors = state.status === "error" ? state.fieldErrors : undefined;

  return (
    <form action={action} className="space-y-5" noValidate>
      {state.status === "error" && state.message && !fieldErrors ? (
        <Alert variant="destructive">
          <TriangleAlertIcon />
          <AlertDescription>{t.auth.errors.weakPassword}</AlertDescription>
        </Alert>
      ) : null}

      <FieldGroup>
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
          />
          {fieldErrors?.password ? (
            <FieldError>{fieldErrors.password[0]}</FieldError>
          ) : null}
        </Field>

        <Field data-invalid={fieldErrors?.confirmPassword ? "true" : undefined}>
          <FieldLabel htmlFor="confirmPassword">{t.auth.confirmPassword}</FieldLabel>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            dir="ltr"
            autoComplete="new-password"
            required
            minLength={8}
          />
          {fieldErrors?.confirmPassword ? (
            <FieldError>{fieldErrors.confirmPassword[0]}</FieldError>
          ) : null}
        </Field>
      </FieldGroup>

      <Button type="submit" className="w-full rounded-xl" disabled={pending}>
        {pending ? t.common.loading : t.auth.updatePassword}
      </Button>
    </form>
  );
}
