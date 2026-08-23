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
import { Badge } from "@/components/ui/badge";
import { MousePointerClickIcon } from "lucide-react";

const DEMO_ACCOUNTS = [
  {
    role: "admin",
    email: "admin@wasla.app",
    password: "demo1234",
    label: "admin",
    description: "صلاحيات كاملة للمنصة",
    color: "bg-red-100 text-red-700 border-red-200",
  },
  {
    role: "creator",
    email: "creator@wasla.app",
    password: "demo1234",
    label: "creator",
    description: "صانع محتوى",
    color: "bg-green-100 text-green-700 border-green-200",
  },
  {
    role: "company",
    email: "company@wasla.app",
    password: "demo1234",
    label: "company",
    description: "شركة/علامة تجارية",
    color: "bg-blue-100 text-blue-700 border-blue-200",
  },
];

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

      {/* Demo Accounts Section */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            {t.auth.demoAccounts || "تجربة سريعة"}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        {DEMO_ACCOUNTS.map((account) => (
          <button
            type="button"
            key={account.role}
            onClick={() => {
              const emailInput = document.getElementById("email") as HTMLInputElement;
              const passwordInput = document.getElementById("password") as HTMLInputElement;
              if (emailInput && passwordInput) {
                emailInput.value = account.email;
                emailInput.dispatchEvent(new Event("input", { bubbles: true }));
                passwordInput.value = account.password;
                passwordInput.dispatchEvent(new Event("input", { bubbles: true }));
              }
            }}
            className={`w-full flex items-center justify-between p-3 rounded-xl border-2 border-dashed transition-all hover:bg-accent/50 ${
              account.color
            }`}
            aria-label={`تسجيل دخول كـ ${account.label}: ${account.description}`}
          >
            <div className="flex items-center gap-2">
              <MousePointerClickIcon className="size-4 text-muted-foreground" />
              <span className="font-medium text-sm">{account.label}</span>
              <Badge variant="secondary" className="text-xs">
                {account.description}
              </Badge>
            </div>
            <span className="text-xs font-mono text-muted-foreground">
              {account.email}
            </span>
          </button>
        ))}
      </div>

      <p className="text-center text-sm text-muted-foreground">
        {t.auth.noAccount}{" "}
        <Link href="/signup" className="font-semibold text-primary hover:underline">
          {t.auth.signUp}
        </Link>
      </p>
    </form>
  );
}
