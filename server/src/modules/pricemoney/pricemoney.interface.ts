/* ─────────────────────────────────────────────────────────────────
   Prize type
   A prize is tied to a waitlist and awarded to subscribers who
   reach a specific rank range on the leaderboard.
   ──────────────────────────────────────────────────────────────── */

export type PrizeStatus = "ACTIVE" | "AWARDED" | "CANCELLED";

export type PrizeType =
  | "CASH"          // monetary reward (amount + currency)
  | "GIFT_CARD"     // digital gift card
  | "PRODUCT"       // physical or digital product
  | "LIFETIME_ACCESS" // free lifetime access to the product
  | "DISCOUNT"      // percentage or fixed discount
  | "CUSTOM";       // owner-defined freeform prize

/* ─────────────────────────────────────────────────────────────────
   Service-layer payloads
   ──────────────────────────────────────────────────────────────── */

export interface CreatePrizePayload {
  waitlistId:        string;
  workspaceId:       string;
  requestingUserId:  string;
  ownerEmail?:       string;
  title:             string;
  description?:      string;
  prizeType:         PrizeType;
  /** Monetary value if applicable (CASH, GIFT_CARD, DISCOUNT) */
  value?:            number;
  currency?:         string;      // ISO 4217 e.g. "USD"
  /** Inclusive rank range — e.g. rankFrom: 1, rankTo: 1 = #1 only */
  rankFrom:          number;
  rankTo:            number;
  imageUrl?:         string;
  /** ISO-8601 deadline after which the prize expires */
  expiresAt?:        Date;
}

export interface UpdatePrizePayload {
  prizeId:           string;
  waitlistId:        string;
  workspaceId:       string;
  requestingUserId:  string;
  ownerEmail?:       string;
  title?:            string;
  description?:      string;
  prizeType?:        PrizeType;
  value?:            number | null;
  currency?:         string  | null;
  rankFrom?:         number;
  rankTo?:           number;
  imageUrl?:         string  | null;
  expiresAt?:        Date    | null;
  status?:           PrizeStatus;
}

export interface DeletePrizePayload {
  prizeId:           string;
  waitlistId:        string;
  workspaceId:       string;
  requestingUserId:  string;
  ownerEmail?:       string;
}

export interface GetPrizesPayload {
  waitlistId:        string;
  workspaceId:       string;
  requestingUserId:  string;
  ownerEmail?:       string;
}

/** Public — no auth required */
export interface GetPublicPrizesPayload {
  waitlistId: string;
}

/* ─────────────────────────────────────────────────────────────────
   Response shapes
   ──────────────────────────────────────────────────────────────── */

/** Full prize row — returned to workspace members */
export interface PrizeRow {
  id:          string;
  waitlistId:  string;
  title:       string;
  description: string | null;
  prizeType:   PrizeType;
  value:       number | null;
  currency:    string | null;
  rankFrom:    number;
  rankTo:      number;
  imageUrl:    string | null;
  status:      PrizeStatus;
  expiresAt:   Date   | null;
  createdAt:   Date;
  updatedAt:   Date;
}

/** Public prize — no internal metadata, just enough to display */
export interface PublicPrizeRow {
  id:          string;
  title:       string;
  description: string | null;
  prizeType:   PrizeType;
  value:       number | null;
  currency:    string | null;
  rankFrom:    number;
  rankTo:      number;
  imageUrl:    string | null;
  expiresAt:   Date   | null;
  /** Human-readable rank label, e.g. "#1" or "#2–#3" */
  rankLabel:   string;
}

export interface DeletedPrizeAck {
  id:        string;
  title:     string;
  deletedAt: Date;
}