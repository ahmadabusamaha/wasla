/** Shared form state contract between auth Server Actions and client forms. */
export interface FormState {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: Record<string, string[]>;
}

export const initialFormState: FormState = { status: "idle" };
