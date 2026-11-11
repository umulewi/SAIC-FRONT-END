export interface LinkItem {
  label: string;
  href: string;
}

export interface SiteSettings {
  name: string;
  fullName: string;
  tagline: string;
  logoText: string;
  nav: LinkItem[];
  social: Record<string, string>;
}

export interface Hero {
  eyebrow: string;
  headline: string;
  subheadline: string;
  primaryCta: LinkItem;
  secondaryCta: LinkItem;
  image: string;
  video: string;
}

export interface AboutContent {
  eyebrow: string;
  headline: string;
  body: string;
  image: string;
  stats: { label: string; value: string }[];
}

export interface CtaContent {
  headline: string;
  body: string;
  primaryCta: LinkItem;
  secondaryCta: LinkItem;
}

export interface ContactContent {
  email: string;
  phone: string;
  address: string;
  mapEmbedUrl: string;
}

export interface FooterContent {
  about: string;
  companyLinks: LinkItem[];
  resourceLinks: LinkItem[];
  copyright: string;
}

export interface Sections {
  site: SiteSettings;
  hero: Hero;
  about: AboutContent;
  cta: CtaContent;
  contact: ContactContent;
  footer: FooterContent;
}

export interface BaseItem {
  id: number;
  order: number;
}

export interface Stat extends BaseItem {
  label: string;
  value: string;
}

export interface CoreValue extends BaseItem {
  title: string;
  description: string;
  icon: string;
}

export interface Service extends BaseItem {
  title: string;
  description: string;
  content?: string;
  offerings?: ServiceOffering[];
  image: string;
  href: string;
}

export interface ServiceOffering {
  title: string;
  description: string;
}

export interface ImpactArea extends BaseItem {
  title: string;
  description: string;
  image: string;
}

export interface Program extends BaseItem {
  name: string;
  acronym: string;
  description: string;
}

export interface Partner extends BaseItem {
  name: string;
  logo: string;
}

export interface TeamMember extends BaseItem {
  name: string;
  role: string;
  photo: string;
  bio: string;
  employeeOfTheYear?: boolean;
}

export interface SiteApp extends BaseItem {
  title: string;
  description: string;
  url: string;
  image: string;
}

export interface Story extends BaseItem {
  title: string;
  category: string;
  date: string;
  excerpt: string;
  content: string;
  image: string;
}

export interface JobOpening extends BaseItem {
  title: string;
  location: string;
  type: string;
  description: string;
}

export type CollectionMap = {
  stats: Stat;
  coreValues: CoreValue;
  services: Service;
  impactAreas: ImpactArea;
  programs: Program;
  partners: Partner;
  team: TeamMember;
  sitesApps: SiteApp;
  stories: Story;
  jobOpenings: JobOpening;
};

export type CollectionName = keyof CollectionMap;

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export interface Application {
  id: number;
  jobId: number;
  jobTitle: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  resumeUrl: string;
  status: string;
  createdAt: string;
}
