export interface OnboardingFormState {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: Record<string, string[]>;
}

export const initialOnboardingState: OnboardingFormState = { status: "idle" };
