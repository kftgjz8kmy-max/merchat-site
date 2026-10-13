import LandingPage from "@/components/LandingPage";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { detectLocaleFromAcceptLanguage, localeCookieName, localePaths, normalizeLocale } from "@/i18n/locales";

export default async function Page() {
  const cookieStore = await cookies();
  const savedLocale = normalizeLocale(cookieStore.get(localeCookieName)?.value);
  const locale = savedLocale ?? detectLocaleFromAcceptLanguage((await headers()).get("accept-language"));
  if (locale !== "es") redirect(localePaths[locale]);
  return <LandingPage />;
}
