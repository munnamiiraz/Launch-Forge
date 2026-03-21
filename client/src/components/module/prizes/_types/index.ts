export type PrizeType =
  | "CASH"
  | "GIFT_CARD"
  | "PRODUCT"
  | "LIFETIME_ACCESS"
  | "DISCOUNT"
  | "CUSTOM";

export type PrizeStatus = "ACTIVE" | "AWARDED" | "CANCELLED";

export interface Prize {
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
  expiresAt:   string | null;
  createdAt:   string;
  updatedAt:   string;
}

export interface PrizeWaitlist {
  id:          string;
  name:        string;
  slug:        string;
  isOpen:      boolean;
  subscribers: number;
  activePrizes: number;
  totalPrizePool: number; // sum of CASH prize values
}

export interface CreatePrizeForm {
  title:        string;
  description:  string;
  prizeType:    PrizeType;
  value:        string;
  currency:     string;
  rankFrom:     string;
  rankTo:       string;
  imageUrl:     string;
  expiresAt:    string;
}

export const PRIZE_TYPE_META: Record<PrizeType, {
  label:       string;
  emoji:       string;
  description: string;
  showValue:   boolean;
  accent:      string;
  iconBg:      string;
}> = {
  CASH: {
    label:       "Cash",
    emoji:       "💵",
    description: "Direct monetary reward",
    showValue:   true,
    accent:      "border-emerald-500/30 bg-emerald-500/12 text-emerald-400",
    iconBg:      "from-emerald-500 to-teal-600",
  },
  GIFT_CARD: {
    label:       "Gift Card",
    emoji:       "🎁",
    description: "Digital or physical gift card",
    showValue:   true,
    accent:      "border-amber-500/30 bg-amber-500/12 text-amber-400",
    iconBg:      "from-amber-500 to-orange-500",
  },
  PRODUCT: {
    label:       "Product",
    emoji:       "📦",
    description: "Physical or digital product",
    showValue:   false,
    accent:      "border-cyan-500/30 bg-cyan-500/12 text-cyan-400",
    iconBg:      "from-cyan-500 to-blue-600",
  },
  LIFETIME_ACCESS: {
    label:       "Lifetime Access",
    emoji:       "♾️",
    description: "Free lifetime access to your product",
    showValue:   false,
    accent:      "border-violet-500/30 bg-violet-500/12 text-violet-400",
    iconBg:      "from-violet-500 to-purple-600",
  },
  DISCOUNT: {
    label:       "Discount",
    emoji:       "🏷️",
    description: "Percentage or fixed discount",
    showValue:   true,
    accent:      "border-rose-500/30 bg-rose-500/12 text-rose-400",
    iconBg:      "from-rose-500 to-pink-600",
  },
  CUSTOM: {
    label:       "Custom",
    emoji:       "✨",
    description: "Any custom prize you define",
    showValue:   false,
    accent:      "border-indigo-500/30 bg-indigo-500/12 text-indigo-400",
    iconBg:      "from-indigo-500 to-violet-600",
  },
};

export const CURRENCIES = [
  { code: "USD", symbol: "$",  label: "US Dollar"    },
  { code: "EUR", symbol: "€",  label: "Euro"         },
  { code: "GBP", symbol: "£",  label: "British Pound"},
  { code: "BDT", symbol: "৳",  label: "Bangladeshi Taka" },
  { code: "INR", symbol: "₹",  label: "Indian Rupee" },
  { code: "CAD", symbol: "CA$",label: "Canadian Dollar"},
  { code: "AUD", symbol: "A$", label: "Australian Dollar"},
];

export function buildRankLabel(from: number, to: number): string {
  if (from === to) return `#${from}`;
  return `#${from} – #${to}`;
}

export function formatPrizeValue(prize: Prize): string {
  if (!prize.value) return "";
  const sym = CURRENCIES.find((c) => c.code === (prize.currency ?? "USD"))?.symbol ?? "$";
  return `${sym}${prize.value.toLocaleString()}`;
}