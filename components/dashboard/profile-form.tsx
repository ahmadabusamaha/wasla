"use client";

import { useActionState } from "react";
import { useEffect } from "react";
import { CheckCircle2Icon, TriangleAlertIcon } from "lucide-react";
import { toast } from "sonner";
import { updateProfileAction } from "@/features/dashboard/actions";
import { initialProfileState } from "@/features/dashboard/form-state";
import { useT } from "@/components/providers/locale-provider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface ProfileFormProps {
  fullName: string;
  phone: string;
  bio: string;
  email: string;
}

export function ProfileForm({ fullName, phone, bio }: ProfileFormProps) {
  const t = useT();
  const [state, action, pending] = useActionState(
    updateProfileAction,
    initialProfileState
  );

  useEffect(() => {
    if (state.status === "success") toast.success(t.dashboard.profileSaved);
  }, [state.status, t.dashboard.profileSaved]);

  const fieldErrors = state.status === "error" ? state.fieldErrors : undefined;

  return (
    <form action={action} className="space-y-5" noValidate>
      {state.status === "error" && state.message && !fieldErrors ? (
        <Alert variant="destructive">
          <TriangleAlertIcon />
          <AlertDescription>{t.auth.errors.generic}</AlertDescription>
        </Alert>
      ) : null}
      {state.status === "success" ? (
        <Alert className="border-emerald-500/30 text-emerald-700 dark:text-emerald-400">
          <CheckCircle2Icon />
          <AlertDescription>{t.dashboard.profileSaved}</AlertDescription>
        </Alert>
      ) : null}

      <FieldGroup>
        <Field data-invalid={fieldErrors?.fullName ? "true" : undefined}>
          <FieldLabel htmlFor="fullName">{t.auth.fullName}</FieldLabel>
          <Input
            id="fullName"
            name="fullName"
            defaultValue={fullName}
            required
            minLength={2}
          />
          {fieldErrors?.fullName ? (
            <FieldError>{fieldErrors.fullName[0]}</FieldError>
          ) : null}
        </Field>

        <Field data-invalid={fieldErrors?.phone ? "true" : undefined}>
          <FieldLabel htmlFor="phone">
            {t.dashboard.phone}{" "}
            <span className="text-xs font-normal text-muted-foreground">
              ({t.common.optional})
            </span>
          </FieldLabel>
          <Input
            id="phone"
            name="phone"
            type="tel"
            dir="ltr"
            className="text-start"
            defaultValue={phone}
          />
          {fieldErrors?.phone ? (
            <FieldError>{fieldErrors.phone[0]}</FieldError>
          ) : null}
        </Field>

        <Field data-invalid={fieldErrors?.bio ? "true" : undefined}>
          <FieldLabel htmlFor="bio">{t.dashboard.bioField}</FieldLabel>
          <Textarea
            id="bio"
            name="bio"
            rows={4}
            maxLength={500}
            defaultValue={bio}
          />
          {fieldErrors?.bio ? (
            <FieldError>{fieldErrors.bio[0]}</FieldError>
          ) : null}
        </Field>
      </FieldGroup>

      <Button type="submit" disabled={pending} className="rounded-xl">
        {pending ? t.common.saving : t.common.save}
      </Button>
    </form>
  );
}
