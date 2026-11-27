import { OneMindBanner } from "@/components/OneMindBanner";
import { normalizeLocale } from "@/i18n/locales";

export default async function BannerPage({ searchParams }: {
  searchParams: Promise<{ lang?: string | string[] }>;
}) {
  const { lang } = await searchParams;
  const locale = normalizeLocale(typeof lang === "string" ? lang : null) ?? "es";

  return (
    <main className="one-mind-embed" lang={locale}>
      <div className="post-pricing-background">
        <OneMindBanner locale={locale} embedded />
      </div>
    </main>
  );
}
