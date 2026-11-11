import {
  Award,
  Banknote,
  Briefcase,
  BookOpen,
  ClipboardCheck,
  ClipboardList,
  Coins,
  Droplets,
  FileBarChart2,
  FileCheck2,
  FileSignature,
  Gauge,
  Globe,
  GraduationCap,
  HandCoins,
  Handshake,
  Landmark,
  Laptop,
  Leaf,
  LineChart,
  MapPin,
  Microscope,
  Network,
  Recycle,
  Scale,
  Search,
  Sparkles,
  Sprout,
  Sun,
  Tractor,
  TreePine,
  TrendingUp,
  UserCheck,
  Users2,
  Wallet,
  Warehouse,
  Workflow,
  type LucideIcon,
} from "lucide-react";

export const mainServiceIcons: Record<string, LucideIcon> = {
  "transaction-advisory": Scale,
  "farm-production-carbon-credits": Globe,
  "training-incubation": Award,
};

export const subServiceIcons: Record<string, LucideIcon> = {
  // Transaction Advisory (Brokerage)
  "feasibility-studies-business-plan-development": FileBarChart2,
  "loan-application-financial-documentation-support": Landmark,
  "grant-writing-application": FileSignature,
  "investment-facilitation-pitch-preparation": TrendingUp,
  "b2b-b2c-market-linkage": Network,
  "mergers-acquisitions-business-sales": Handshake,
  "agricultural-land-transactions-lease-facilitation": MapPin,
  "financial-advisory-budgeting-cash-flow": Wallet,
  "strategic-partnership-mou-development": FileCheck2,
  "due-diligence-coordination": Search,
  "funds-grant-management": Coins,
  "internal-organizational-assessment-sops-development": ClipboardList,

  // Farm Production Management & Carbon Credits Services
  "farm-operations-management": Tractor,
  "climate-smart-agriculture-advisory": Sprout,
  "carbon-footprint-assessment-auditing": Gauge,
  "carbon-credit-project-development": Leaf,
  "mrv-measurement-reporting-verification": ClipboardCheck,
  "agroforestry-reforestation-programmes": TreePine,
  "soil-carbon-sequestration-advisory": Recycle,
  "irrigation-water-management-design": Droplets,
  "crop-livestock-technical-support": Microscope,
  "greenhouse-construction": Warehouse,
  "climate-finance-green-fund-advisory": HandCoins,

  // Training and Incubation Services
  "certified-agribusiness-incubation": GraduationCap,
  "cooperative-enterprise-capacity-building": Users2,
  "entrepreneurship-business-plan-training": Briefcase,
  "climate-smart-agriculture-training": Sun,
  "extension-on-farm-demonstrations": UserCheck,
  "online-hybrid-learning-programmes": Laptop,
  "access-to-finance-investment-readiness-training": LineChart,
  "curriculum-development-consultancy": BookOpen,
  "sub-contracting-training-capacity-building": Workflow,
};

export function getMainServiceIcon(slug: string): LucideIcon {
  return mainServiceIcons[slug] ?? Banknote;
}

export function getSubServiceIcon(slug: string): LucideIcon {
  return subServiceIcons[slug] ?? Sparkles;
}
