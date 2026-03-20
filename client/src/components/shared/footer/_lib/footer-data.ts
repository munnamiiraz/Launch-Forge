import type { FooterLinkGroup } from "../_types";

export const FOOTER_LINK_GROUPS: FooterLinkGroup[] = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#" },
      { label: "Pricing", href: "#" },
      { label: "Changelog", href: "#", isNew: true },
      { label: "Roadmap", href: "#" },
      { label: "Status", href: "https://status.launchforge.app", external: true },
    ],
  },
  {
    title: "Use Cases",
    links: [
      { label: "Viral Waitlists", href: "#" },
      { label: "Product Launches", href: "#" },
      { label: "Referral Programs", href: "#" },
      { label: "Beta Access", href: "#" },
      { label: "Community Builds", href: "#" },
    ],
  },
  {
    title: "Developers",
    links: [
      { label: "Documentation", href: "#" },
      { label: "API Reference", href: "#" },
      { label: "SDKs", href: "#" },
      { label: "Webhooks", href: "#" },
      {
        label: "GitHub",
        href: "https://github.com/launchforge",
        external: true,
      },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Careers", href: "#", badge: "Hiring" },
      { label: "Press Kit", href: "#" },
      { label: "Contact", href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "#" },
      { label: "Terms of Service", href: "#" },
      { label: "Cookie Policy", href: "#" },
      { label: "GDPR", href: "#" },
      { label: "Security", href: "#" },
    ],
  },
];

export const FOOTER_BOTTOM_LINKS = [
  { label: "Privacy", href: "#" },
  { label: "Terms", href: "#" },
  { label: "Cookies", href: "#" },
  { label: "Security", href: "#" },
];
