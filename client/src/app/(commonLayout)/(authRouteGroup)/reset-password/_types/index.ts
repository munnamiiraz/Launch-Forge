export type ResetStep = "request" | "sent" | "reset" | "done";

export interface ForgotPasswordActionResult {
  success: boolean;
  error?: string;
  fieldError?: string;
}

export interface ResetPasswordActionResult {
  success: boolean;
  error?: string;
  fieldErrors?: {
    email?: string;
    otp?: string;
    password?: string;
    confirmPassword?: string;
  };
}
