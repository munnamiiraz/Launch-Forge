export interface ForgotPasswordActionResult {
  success: boolean;
  error?: string;
  fieldError?: string;
}

export interface ResendLinkActionResult {
  success: boolean;
  error?: string;
}

export type ForgotPasswordView = "request" | "sent";
