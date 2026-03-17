export interface VerifyEmailActionResult {
  success: boolean;
  error?: string;
}

export interface ResendOtpActionResult {
  success: boolean;
  error?: string;
  cooldownSeconds?: number;
}

export type OtpDigit = string; // single "0"–"9" or ""
export type OtpValue = [OtpDigit, OtpDigit, OtpDigit, OtpDigit, OtpDigit, OtpDigit];
