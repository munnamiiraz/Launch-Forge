export interface CreateWaitlistFormValues {
  name:        string;
  slug:        string;
  description: string;
  isOpen:      boolean;
  category?:   string;
  endDate?:    string;
}

export interface CreateWaitlistApiResponse {
  success: boolean;
  message: string;
  data?: {
    id:        string;
    name:      string;
    slug:      string;
    createdAt: string;
  };
}

/**
 * Mirrors WAITLIST_FIELD + WAITLIST_SLUG from the backend exactly.
 * Single source of truth for the frontend validation schema.
 */
export const FIELD_LIMITS = {
  NAME_MIN:        2,
  NAME_MAX:        120,
  DESCRIPTION_MAX: 5000,
  SLUG_MIN:        2,
  SLUG_MAX:        60,
  SLUG_PATTERN:    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
} as const;
