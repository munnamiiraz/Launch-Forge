import type { FooterLinkGroup } from "../_types";

export const FOOTER_LINK_GROUPS: FooterLinkGroup[] = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "/#features" },
      { label: "Pricing", href: "/pricing" },
      { label: "About Us", href: "/about" },
    ],
  },
  {
    title: "Developers",
    links: [
      { label: "Documentation", href: "/support" },
      {
        label: "GitHub",
        href: "https://github.com/launchforge",
        external: true,
      },
    ],
  },
  {
    title: "Support & Legal",
    links: [
      { label: "Help Center", href: "/support" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
    ],
  },
];

export const FOOTER_BOTTOM_LINKS = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
];
