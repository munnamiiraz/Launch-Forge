export interface RegisterFormValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface RegisterActionResult {
  success: boolean;
  error?: string;
  fieldErrors?: Partial<Record<keyof RegisterFormValues, string>>;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user" | "member";
  createdAt: Date;
}
