import { type Metadata } from "next";
import { ProductPreviewSection } from "@/src/components/module/product/_components/ProductPreviewSection";

export const metadata: Metadata = {
  title: "Product Preview — LaunchForge",
  description:
    "See the real LaunchForge dashboard — analytics, waitlist management, referral tracking, and more.",
};

/**
 * /product-preview  →  src/app/modules/product-preview/page.tsx
 *
 * Pure Server Component — all data is static.
 * Embed in your landing page:
 *
 *   import { ProductPreviewSection } from
 *     "@/app/modules/product-preview/_components/ProductPreviewSection";
 *
 *   <ProductPreviewSection />
 */
export default function ProductPreviewPage() {
  return <ProductPreviewSection />;
}
