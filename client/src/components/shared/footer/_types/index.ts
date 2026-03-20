export interface FooterLinkGroup {
  title: string;
  links: FooterLink[];
}

export interface FooterLink {
  label: string;
  href: string;
  badge?: string;
  external?: boolean;
  isNew?: boolean;
}

export interface FooterSocialLink {
  label: string;
  href: string;
  icon: React.ReactNode;
}
