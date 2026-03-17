export type ForgotPasswordView = "request" | "verify" | "done";

export interface ForgotPasswordActionResult {
  success: boolean;
  error?: string;
  fieldError?: string;
}

export interface ResendOtpActionResult {
  success: boolean;
  error?: string;
}

export interface ResetPasswordActionResult {
  success: boolean;
  error?: string;
  fieldErrors?: {
    otp?: string;
    password?: string;
    confirmPassword?: string;
  };
}

// kept for backward compat with SentView (unused after refactor)
export interface ResendLinkActionResult {
  success: boolean;
  error?: string;
}
