"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { siteConfig } from "@/lib/site-config";
import {
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
  signupSchema,
} from "@/schemas/auth";
import type { FormState } from "./form-state";

type ZodFlattened = ReturnType<typeof z.flattenError>;

function toFormState(error?: string, fieldErrors?: ZodFlattened): FormState {
  return {
    status: "error",
    ...(error ? { message: error } : {}),
    ...(fieldErrors ? { fieldErrors: fieldErrors.fieldErrors } : {}),
  };
}

async function getOrigin(): Promise<string> {
  const headerList = await headers();
  return headerList.get("origin") ?? siteConfig.url;
}

/** Maps Supabase auth error codes to stable, localizable keys. */
function mapAuthError(code?: string): string {
  switch (code) {
    case "invalid_credentials":
      return "invalid_credentials";
    case "user_already_exists":
    case "email_exists":
      return "email_taken";
    case "weak_password":
      return "weak_password";
    default:
      return "generic";
  }
}

export async function logInAction(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return toFormState(undefined, z.flattenError(parsed.error));

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) return toFormState(mapAuthError(error.code));

  const next = formData.get("next");
  redirect(typeof next === "string" && next.startsWith("/") ? next : "/dashboard");
}

export async function signUpAction(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const parsed = signupSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return toFormState(undefined, z.flattenError(parsed.error));

  const supabase = await createClient();
  const origin = await getOrigin();

  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        full_name: parsed.data.fullName,
        referral_code: ((formData.get("ref") as string) || "").trim().toLowerCase() || undefined,
      },
      emailRedirectTo: `${origin}/auth/callback?next=/onboarding`,
    },
  });

  if (error) return toFormState(mapAuthError(error.code));

  // Email confirmation enabled → no session yet; ask the user to verify.
  if (!data.session) {
    return { status: "success" };
  }

  redirect("/onboarding");
}

export async function requestPasswordResetAction(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const parsed = forgotPasswordSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) return toFormState(undefined, z.flattenError(parsed.error));

  const supabase = await createClient();
  const origin = await getOrigin();

  // Always report success — never reveal whether the account exists.
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${origin}/auth/callback?next=/reset-password`,
  });

  return { status: "success" };
}

export async function updatePasswordAction(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const parsed = resetPasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) return toFormState(undefined, z.flattenError(parsed.error));

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) return toFormState(mapAuthError(error.code));

  redirect("/dashboard");
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
