import { getLocaleMessages } from "@/i18n/messages";

export type UseCaseResultType = "listing" | "promotion" | "excel" | "gallery" | "diagnosis" | "price-range" | "priorities" | "performance" | "ads" | "accounts" | "sale" | "restock";

export type UseCaseCard = {
  id: string;
  category: string;
  prompt: string;
  resultType: UseCaseResultType;
  resultTitle: string;
  resultDescription?: string;
  preview: {
    label: string;
    items: { label: string; value?: string }[];
    status: string;
  };
};

export type LandingUi = { [key: string]: string };

type LandingContent = {
  hero: { eyebrow: string; description: string };
  useCases: UseCaseCard[];
  photoExamples: { eyebrow: string; image: string; alt: string; note: string }[];
  features: [string, string, string[]][];
  steps: [string, string, string][];
  plans: {
    name: string;
    audience: string;
    originalPrice: string;
    price: string;
    billingPeriod: string;
    featured: boolean;
    cta: string;
    items: string[];
  }[];
  trust: string[];
  faqs: [string, string][];
};

export function getLanding(locale: string): LandingContent {
  return getLocaleMessages(locale).landing as LandingContent;
}

export function getUi(locale: string): LandingUi {
  return getLocaleMessages(locale).ui as LandingUi;
}

export const landing = getLanding("es");
