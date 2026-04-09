export interface LoginFormValues {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginActionResult {
  success: boolean;
  error?: string;
  fieldErrors?: Partial<Record<keyof Omit<LoginFormValues, "rememberMe">, string>>;
}
