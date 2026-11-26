import LandingPage from "@/components/LandingPage";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { detectLocaleFromAcceptLanguage, localeCookieName, localePaths, normalizeLocale } from "@/i18n/locales";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const cookieStore = await cookies();
  const savedLocale = normalizeLocale(cookieStore.get(localeCookieName)?.value);
  const locale = savedLocale ?? detectLocaleFromAcceptLanguage((await headers()).get("accept-language"));
  if (locale !== "es") {
    const query = new URLSearchParams();
    for (const [name, values] of Object.entries(await searchParams)) {
      for (const value of [values].flat()) {
        if (value !== undefined) query.append(name, value);
      }
    }
    redirect(query.size ? `${localePaths[locale]}?${query}` : localePaths[locale]);
  }
  return <LandingPage />;
}
