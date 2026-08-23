export interface ProfileFormState {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: Record<string, string[]>;
}

export const initialProfileState: ProfileFormState = { status: "idle" };
