import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages, getTranslations } from "next-intl/server";
import "./globals.css";
import { siteConfig } from "@/config/site";
import { localePaths } from "@/i18n/locales";
import { routing } from "@/i18n/routing";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: "metadata" });
  const pathname = localePaths[locale as keyof typeof localePaths] ?? "/";
  return {
    metadataBase: new URL("https://merchat-site.vercel.app"),
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: pathname,
      languages: Object.fromEntries(routing.locales.map((availableLocale) => [availableLocale, localePaths[availableLocale]])),
    },
    openGraph: {
      title: t("title"),
      description: t("description"),
      locale,
      url: pathname,
      siteName: siteConfig.name,
    },
    icons: {
      icon: siteConfig.brand.icon,
      shortcut: siteConfig.brand.icon,
      apple: siteConfig.brand.icon,
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();
  return (
    <html lang={locale}>
      <body><NextIntlClientProvider locale={locale} messages={messages}>{children}</NextIntlClientProvider></body>
    </html>
  );
}
