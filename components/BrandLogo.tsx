import { siteConfig } from "@/config/site";

type BrandLogoProps = {
  className?: string;
  ariaLabel?: string;
};

export function BrandLogo({ className = "", ariaLabel }: BrandLogoProps) {
  return (
    <span
      className={`brand-lockup ${className}`.trim()}
      role={ariaLabel ? "img" : undefined}
      aria-label={ariaLabel}
      aria-hidden={ariaLabel ? undefined : true}
    >
      <img className="brand-lockup-icon" src={siteConfig.brand.icon} alt="" width="48" height="48" />
      <span className="brand-lockup-wordmark" />
    </span>
  );
}
