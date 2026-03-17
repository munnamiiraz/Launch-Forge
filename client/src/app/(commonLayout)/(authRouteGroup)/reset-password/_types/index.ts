export type ResetStep = "request" | "sent" | "reset" | "done";

export interface ForgotPasswordActionResult {
  success: boolean;
  error?: string;
  fieldError?: string; // email field error
}

export interface ResetPasswordActionResult {
  success: boolean;
  error?: string;
  fieldErrors?: {
    password?: string;
    confirmPassword?: string;
  };
}
