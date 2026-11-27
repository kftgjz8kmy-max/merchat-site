"use client";
/* eslint-disable @next/next/no-img-element -- Vinext's local dev renderer is incompatible with next/image; fixed-dimension local HiDPI assets are intentional. */

import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { getLanding, getUi, landing as spanishLanding, type UseCaseCard } from "@/config/landing";
import { siteConfig } from "@/config/site";
import { BrandLogo } from "@/components/BrandLogo";
import { ClosingHeadline, OneMindShowcase, oneMindHeadlineTiming } from "@/components/OneMindShowcase";
import { localeCookieMaxAge, localeCookieName, localeOptions, localePaths, type AppLocale } from "@/i18n/locales";

const socialIcons = {
  Facebook: "M14 22v-9h3l.5-3.5H14V7.3c0-1 .3-1.8 1.8-1.8H18V2.3c-.4-.1-1.5-.3-2.7-.3C12.4 2 10.5 3.7 10.5 7v2.5H7V13h3.5v9H14Z",
  X: "M17.3 3h3.1l-6.8 7.8 8 10.2h-6.3l-4.9-6.3L4.9 21H1.8l7.2-8.3L1.4 3h6.4l4.4 5.8L17.3 3ZM16 19.2h1.7L6.9 4.7H5.1L16 19.2Z",
  Instagram: "M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7Zm5 3a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm5.5-3.5a1 1 0 1 1 0 2 1 1 0 0 1 0-2Z",
  TikTok: "M14 2h3.5c.2 2.6 1.7 4.2 4.5 4.4V10a9 9 0 0 1-4.5-1.5v7.2a6.3 6.3 0 1 1-6.3-6.3c.4 0 .7 0 1.1.1v3.6a2.9 2.9 0 1 0 1.7 2.6V2Z",
} satisfies Record<keyof typeof siteConfig.socials, string>;

function useOneMindBanner() {
  const sectionRef = useRef<HTMLElement>(null);
  const [introFinished, setIntroFinished] = useState(false);
  const [introActive, setIntroActive] = useState(false);
  const [introPaused, setIntroPaused] = useState(false);
  const [introRun, setIntroRun] = useState(0);
  const introToggle = useRef<(() => void) | null>(null);

  const restartIntro = useCallback(() => {
    // A replay opens on the static title card when the viewer requests reduced motion.
    setIntroFinished(window.matchMedia("(prefers-reduced-motion: reduce)").matches || !sectionRef.current?.animate);
    setIntroActive(true);
    setIntroPaused(false);
    setIntroRun(run => run + 1);
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    const frame = section?.querySelector<HTMLIFrameElement>(".one-mind-intro");
    const slot = section?.querySelector<HTMLElement>(".one-mind-logo-slot");
    const headline = section?.querySelector<HTMLElement>(".closing-headline");
    if (!section || !frame || !slot || !headline || !("IntersectionObserver" in window)) return;

    const options = new URLSearchParams(window.location.search);
    const mode = options.get("one-mind");
    const original = mode === "original";
    const timeline = mode === "timeline";
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const entrance = options.get("entrada");
    const ideaEntrance = options.get("idea");
    section.dataset.ideaEntrance =
      ideaEntrance === "lift" || ideaEntrance === "soft" || ideaEntrance === "focus" || ideaEntrance === "typing"
        ? ideaEntrance
        : original ? "lift" : "focus";
    section.dataset.headlineEntrance =
      entrance === "soft" || entrance === "focus" || entrance === "rise" || entrance === "typing"
        ? entrance
        : original ? "soft" : "typing";

    if (mode === "sequence" || mode === "fullscreen" || timeline) section.dataset.bannerPreview = mode;
    if (mode === "compare") {
      section.dataset.bannerPreview = "compare";
      frame.src = "/animations/one-mind/index.html?static=1";
      let timer: number | undefined;
      const play = () => {
        window.clearTimeout(timer);
        section.dataset.bannerPhase = "comparison-reset";
        timer = window.setTimeout(() => {
          section.dataset.bannerPhase = "comparison";
        }, 200);
      };
      const replay = (event: MessageEvent) => {
        if (event.source === window.parent && event.origin === window.location.origin && event.data === "one-mind:replay") play();
      };
      if (!motion.matches || options.get("play") === "1") play();
      window.addEventListener("message", replay);
      return () => {
        window.clearTimeout(timer);
        window.removeEventListener("message", replay);
        delete section.dataset.bannerPhase;
        delete section.dataset.bannerPreview;
        delete section.dataset.headlineEntrance;
        delete section.dataset.ideaEntrance;
      };
    }

    if (motion.matches || !frame.animate) {
      if (timeline) section.setAttribute("data-preview-intro-ready", "");
      if (introRun === 0) return;
      introToggle.current = () => setIntroPaused(paused => !paused);
      return () => { introToggle.current = null; };
    }

    section.dataset.bannerPhase = "intro";
    let dock: Animation | undefined;
    let fallback: Animation | undefined;
    let paused = introRun === 0 && (mode === "fullscreen" || (timeline && options.get("play") !== "1"));
    section.toggleAttribute("data-intro-paused", paused);
    const animations = new Set<Animation>();

    const track = (animation: Animation) => {
      animations.add(animation);
      if (paused) animation.pause();
      return animation;
    };

    const wait = (duration: number, next: () => void) => {
      const timer = track(section.animate([], duration));
      void timer.finished.then(() => {
        animations.delete(timer);
        next();
      }, () => undefined);
      return timer;
    };

    const tellLogo = () => {
      frame.contentWindow?.postMessage(paused ? "one-mind:pause" : "one-mind:resume", "*");
    };

    introToggle.current = () => {
      paused = !paused;
      section.toggleAttribute("data-intro-paused", paused);
      for (const animation of animations) {
        if (paused && animation.playState === "running") animation.pause();
        if (!paused && animation.playState === "paused") animation.play();
      }
      tellLogo();
      setIntroPaused(paused);
    };

    const cancelAnimations = () => {
      for (const animation of animations) animation.cancel();
      animations.clear();
    };

    const complete = (phase: "revealed" | "settled" | "static") => {
      section.dataset.bannerPhase = phase;
      cancelAnimations();
      section.style.removeProperty("--one-title-offset");
      section.removeAttribute("data-intro-paused");
      setIntroActive(false);
      setIntroPaused(false);
    };

    const measureDock = () => {
      const stage = section.getBoundingClientRect();
      const frameParent = frame.offsetParent?.getBoundingClientRect() ?? stage;
      const titleParent = headline.offsetParent?.getBoundingClientRect() ?? stage;
      const target = slot.getBoundingClientRect();
      const width = frame.offsetWidth;
      const height = frame.offsetHeight;
      const logoScale = (width: number, height: number) => Math.min(width / 648, height * 0.864 / 668);
      const scale = logoScale(target.width, target.height) / logoScale(width, height);
      const dx = target.left + target.width / 2 - frameParent.left - frame.offsetLeft - width / 2;
      const dy = target.top + target.height / 2 - frameParent.top - frame.offsetTop - height / 2;
      const titleOffset = stage.top + stage.height / 2 - titleParent.top - headline.offsetTop - headline.offsetHeight / 2;
      return {
        finalPose: `translate(${dx}px, ${dy}px) scale(${scale})`,
        featurePose: `translate(${dx}px, ${dy + titleOffset}px) scale(${scale * 1.26})`,
        titleOffset,
      };
    };
    const dockKeyframes = ({ finalPose, featurePose }: ReturnType<typeof measureDock>): Keyframe[] => [
      { transform: "translate(0px, 0px) scale(1)" },
      { transform: original ? finalPose : featurePose },
    ];
    let titleLift: Animation | undefined;
    const resizeDock = new ResizeObserver(() => {
      const phase = section.dataset.bannerPhase;
      if (!(dock?.effect instanceof KeyframeEffect) || section.dataset.showcaseOpen === "true") return;
      if (phase !== "docking" && phase !== "title" && phase !== "lifting") return;
      const geometry = measureDock();
      const { finalPose, featurePose, titleOffset } = geometry;
      if (phase === "lifting") {
        dock.effect.setKeyframes([{ transform: featurePose }, { transform: finalPose }]);
        if (titleLift?.effect instanceof KeyframeEffect) {
          titleLift.effect.setKeyframes([{ translate: `0 ${titleOffset}px` }, { translate: "0 0" }]);
        }
      } else {
        dock.effect.setKeyframes(dockKeyframes(geometry));
      }
      if (phase !== "docking") section.style.setProperty("--one-title-offset", `${titleOffset}px`);
    });
    resizeDock.observe(section);
    resizeDock.observe(frame);
    resizeDock.observe(headline);

    const startTitle = () => {
      const { titleOffset } = measureDock();
      section.style.setProperty("--one-title-offset", `${titleOffset}px`);
      section.dataset.bannerPhase = "title";
      wait(oneMindHeadlineTiming.hold, () => {
        if (mode !== "sequence") {
          if (fallback) {
            fallback.cancel();
            animations.delete(fallback);
          }
          setIntroFinished(true);
          return;
        }
        section.dataset.bannerPhase = "lifting";
        const { finalPose, featurePose, titleOffset } = measureDock();
        const liftOptions = { duration: oneMindHeadlineTiming.lift, easing: "cubic-bezier(.38,.04,.23,1)", fill: "forwards" } as const;
        const previousDock = dock;
        dock = track(frame.animate([{ transform: featurePose }, { transform: finalPose }], liftOptions));
        if (previousDock) {
          previousDock.cancel();
          animations.delete(previousDock);
        }
        titleLift = track(headline.animate([{ translate: `0 ${titleOffset}px` }, { translate: "0 0" }], liftOptions));
        void dock.finished.then(() => complete("settled"), () => undefined);
      });
    };

    const receive = (event: MessageEvent) => {
      if (event.source !== frame.contentWindow) return;
      const phase = section.dataset.bannerPhase;
      if (event.data === "one-mind:ready") {
        if (timeline) section.setAttribute("data-preview-intro-ready", "");
        if (phase === "intro") setIntroActive(true);
        setIntroPaused(paused);
        tellLogo();
        return;
      }
      if (event.data !== "one-mind:complete" || phase !== "intro") return;

      const geometry = measureDock();
      section.dataset.bannerPhase = "docking";
      dock = track(frame.animate(dockKeyframes(geometry), {
        duration: original ? 860 : 1120,
        easing: original ? "cubic-bezier(.34,.04,.18,1)" : "cubic-bezier(.42,0,.65,1)",
        fill: "forwards",
      }));
      if (original) {
        void dock.finished.then(() => complete("revealed"), () => undefined);
        return;
      }
      void dock.finished.then(() => {
        if (section.dataset.bannerPhase !== "docking") return;
        wait(oneMindHeadlineTiming.leadIn, startTitle);
      }, () => undefined);
    };

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.intersectionRatio < 0.45) return;
      observer.disconnect();
      if (section.dataset.bannerPhase === "intro") {
        setIntroActive(true);
        fallback = wait(14000, () => complete("static"));
      }
    }, { threshold: 0.45 });

    const onMotionChange = () => {
      if (motion.matches) complete("static");
    };
    window.addEventListener("message", receive);
    motion.addEventListener("change", onMotionChange);
    observer.observe(frame);
    return () => {
      observer.disconnect();
      resizeDock.disconnect();
      window.removeEventListener("message", receive);
      motion.removeEventListener("change", onMotionChange);
      introToggle.current = null;
      cancelAnimations();
      section.removeAttribute("data-intro-paused");
      section.removeAttribute("data-preview-intro-ready");
      section.style.removeProperty("--one-title-offset");
      delete section.dataset.bannerPhase;
      delete section.dataset.bannerPreview;
      delete section.dataset.headlineEntrance;
      delete section.dataset.ideaEntrance;
    };
  }, [introRun]);

  return { sectionRef, introFinished, introActive, introPaused, introRun, introToggle, restartIntro };
}

type HeroIconName = "sparkle" | "arrow" | "shield" | "lock" | "check" | "publish" | "clock" | "confirm" | "send" | "double-check" | "globe";

function HeroIcon({ name, size = 18 }: { name: HeroIconName; size?: number }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 1.9, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (name === "sparkle") return <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true"><path {...common} d="m12 3-1.7 5.3L5 10l5.3 1.7L12 17l1.7-5.3L19 10l-5.3-1.7z"/><path {...common} d="m19 15-.7 2.3L16 18l2.3.7L19 21l.7-2.3L22 18l-2.3-.7z"/></svg>;
  if (name === "arrow") return <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true"><path {...common} d="M5 12h14M13 6l6 6-6 6"/></svg>;
  if (name === "shield") return <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true"><path {...common} d="M12 3 5 6v5c0 4.6 2.9 8.4 7 10 4.1-1.6 7-5.4 7-10V6z"/><path {...common} d="m8.8 12 2.1 2.1 4.3-4.4"/></svg>;
  if (name === "lock") return <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true"><rect {...common} x="5" y="10" width="14" height="10" rx="2"/><path {...common} d="M8 10V7a4 4 0 0 1 8 0v3M12 14v2"/></svg>;
  if (name === "check") return <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true"><circle {...common} cx="12" cy="12" r="8.5"/><path {...common} d="m8.5 12 2.3 2.3 4.7-4.8"/></svg>;
  if (name === "publish") return <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 4.5h7l4 4v11h-11z" fill="currentColor"/><path d="M13.5 4.5v4h4" fill="none" stroke="#FFF8EC" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 17V10m-3 3 3-3 3 3" fill="none" stroke="#FFF8EC" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
  if (name === "clock") return <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true"><circle cx="11.5" cy="12.5" r="8.5" fill="currentColor"/><path d="M11.5 8.5v4l2.8 1.8" fill="none" stroke="#FFF8EC" strokeWidth="2.2" strokeLinecap="round"/><circle cx="18.3" cy="5.8" r="2" fill="#FFD21A"/></svg>;
  if (name === "confirm") return <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true"><rect x="4.5" y="5" width="15" height="14" rx="3.5" fill="currentColor"/><path d="m8 12.5 2.5 2.5 5.5-5.5" fill="none" stroke="#FFF8EC" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="18.2" cy="17.8" r="3.1" fill="#FFD21A"/><path d="M17.4 16.6v2.4m1.6-2.4v2.4" stroke="#2563EB" strokeWidth="1.2" strokeLinecap="round"/></svg>;
  if (name === "send") return <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true"><path {...common} d="m4 4 16 8-16 8 3-8z"/><path {...common} d="M7 12h13"/></svg>;
  if (name === "globe") return <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true"><circle {...common} cx="12" cy="12" r="8.5"/><path {...common} d="M3.8 12h16.4M12 3.5c2.1 2.3 3.2 5.1 3.2 8.5S14.1 18.2 12 20.5C9.9 18.2 8.8 15.4 8.8 12S9.9 5.8 12 3.5"/></svg>;
  return <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true"><path {...common} d="m4 12 3 3 6-7"/><path {...common} d="m11 12 3 3 6-7"/></svg>;
}

const languages = localeOptions;

type LanguageCode = AppLocale;

function saveLocalePreference(locale: LanguageCode) {
  document.cookie = `${localeCookieName}=${encodeURIComponent(locale)}; Path=/; Max-Age=${localeCookieMaxAge}; SameSite=Lax${window.location.protocol === "https:" ? "; Secure" : ""}`;
}

function LanguageSwitcher({ selectorLabel, currentLanguageLabel }: { selectorLabel: string; currentLanguageLabel: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedLanguage = useLocale() as LanguageCode;
  const switcherRef = useRef<HTMLDivElement>(null);
  const selected = languages.find((language) => language.code === selectedLanguage) ?? languages[0];

  useEffect(() => {
    saveLocalePreference(selectedLanguage);
  }, [selectedLanguage]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!switcherRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const selectLanguage = (language: (typeof languages)[number]) => {
    const hash = window.location.hash;
    saveLocalePreference(language.code);
    setIsOpen(false);
    window.location.assign(`${localePaths[language.code]}${hash}`);
  };

  return <div className="language-switcher" ref={switcherRef}>
    <button className="language-trigger" type="button" aria-label={`${currentLanguageLabel}: ${selected.label}`} aria-haspopup="true" aria-controls="language-menu" aria-expanded={isOpen} onClick={() => setIsOpen((open) => !open)}>
      <HeroIcon name="globe" size={18} />
      <span>{selected.shortLabel}</span>
    </button>
    {isOpen && <div className="language-menu" id="language-menu" role="group" aria-label={selectorLabel}>
      {languages.map((language) => <button className={language.code === selectedLanguage ? "is-selected" : undefined} key={language.code} type="button" aria-pressed={language.code === selectedLanguage} onClick={() => selectLanguage(language)}>
        <span>{language.label}</span>{language.code === selectedLanguage && <HeroIcon name="check" size={15} />}
      </button>)}
    </div>}
  </div>;
}

function mlAutomationHref(href: string, locale: AppLocale) {
  const target = new URL(href);
  target.searchParams.set("locale", locale);
  return target.toString();
}

function Button({ children, outline = false, href, icon = false, animated = false, hoverEffect = false }: { children: React.ReactNode; outline?: boolean; href: string; icon?: boolean; animated?: boolean; hoverEffect?: boolean }) {
  return <a className={`button ${outline ? "button-outline" : ""} ${animated ? "button-animated" : ""} ${hoverEffect ? "button-hover-effect" : ""}`} href={href}>{animated ? <span className="button-animated-content">{children}{icon && <HeroIcon name="arrow" size={17} />}</span> : <>{children}{icon && <HeroIcon name="arrow" size={17} />}</>}</a>;
}

function SectionTitle({ children, id, level = "h2" }: { children: React.ReactNode; id?: string; level?: "h2" | "h3" }) {
  const Heading = level;
  return <Heading id={id} className="section-title">{children}</Heading>;
}

function FaqAnswer({ answer }: { answer: string }) {
  const paragraphs = answer.split("\n\n");
  return <>{paragraphs.map((paragraph, paragraphIndex) => <Fragment key={`${paragraphIndex}-${paragraph}`}>
    {paragraph.split(/(\*\*[^*]+\*\*)/g).map((part, partIndex) => part.startsWith("**") && part.endsWith("**") ? <strong key={`${paragraphIndex}-${partIndex}`}>{part.slice(2, -2)}</strong> : part)}
    {paragraphIndex < paragraphs.length - 1 && <><br /><br /></>}
  </Fragment>)}</>;
}

const brandFeatureIcons = [
  "/brand/illustrations/publish.svg",
  "/brand/illustrations/prices.svg",
  "/brand/illustrations/operations.svg",
  "/brand/illustrations/sales.svg",
] as const;

const stepIconSources = [
  "/brand/illustrations/onboarding-create-account-premium.webp",
  "/brand/illustrations/onboarding-connect-marketplace-premium.webp",
  "/brand/illustrations/onboarding-connect-ai-premium.webp",
  "/brand/illustrations/onboarding-manage-business-premium.webp",
] as const;

const trustIconSources = [
  "/brand/illustrations/secure.svg",
  "/brand/illustrations/control.svg",
  "/brand/illustrations/separation.svg",
  "/brand/illustrations/confirm.svg",
] as const;

function StepIcon({ step }: { step: number }) {
  return (
    <>
      {step === 0 && (
        <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true" focusable="false">
          <defs>
            <filter id="merchat-onboarding-palette" colorInterpolationFilters="sRGB">
              {/* Use channel differences to isolate the colored enamel and retain the shading. */}
              <feColorMatrix in="SourceGraphic" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -4 0 4 0 -.42" result="blueMask" />
              <feComposite in="blueMask" in2="SourceAlpha" operator="in" result="blueCoverage" />
              {/* Map the light and shadow to the same ramp as the capabilities icons. */}
              <feColorMatrix in="SourceGraphic" values="0 0 1.9 0 -.64  0 0 1.9 0 -.64  0 0 1.9 0 -.64  0 0 0 0 1" result="blueTone" />
              <feComponentTransfer in="blueTone" result="brandBlue">
                <feFuncR type="table" tableValues=".063 .09 .255" />
                <feFuncG type="table" tableValues=".227 .408 .596" />
                <feFuncB type="table" tableValues=".898 1 1" />
              </feComponentTransfer>
              <feComposite in="brandBlue" in2="blueCoverage" operator="in" result="blueEnamel" />
              <feComposite in="blueEnamel" in2="SourceGraphic" operator="atop" result="withBlue" />
              <feColorMatrix in="SourceGraphic" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 4 -4 0 -.65" result="yellowMask" />
              <feComposite in="yellowMask" in2="SourceAlpha" operator="in" result="yellowCoverage" />
              <feColorMatrix in="SourceGraphic" values="0 2.4 0 0 -1.11  0 2.4 0 0 -1.11  0 2.4 0 0 -1.11  0 0 0 0 1" result="yellowTone" />
              <feComponentTransfer in="yellowTone" result="brandYellow">
                <feFuncR type="table" tableValues="1 1 1" />
                <feFuncG type="table" tableValues=".647 .855 .941" />
                <feFuncB type="table" tableValues=".067 .141 .443" />
              </feComponentTransfer>
              <feComposite in="brandYellow" in2="yellowCoverage" operator="in" result="yellowEnamel" />
              <feComposite in="yellowEnamel" in2="withBlue" operator="atop" />
            </filter>
          </defs>
        </svg>
      )}
      <img className="onboarding-glyph" src={stepIconSources[step] ?? stepIconSources[0]} alt="" width="80" height="80" style={{ filter: "url(#merchat-onboarding-palette)" }} />
    </>
  );
}

const productPhotos = ["open", "keyboard", "side", "closed"] as const;

function ProductPhotos({ count = 4 }: { count?: number }) {
  return <div className="cap-gallery" aria-hidden="true">
    {productPhotos.slice(0, count).map((photo, index) => <div key={photo}>
      <img src={`/images/products/macbook-${photo}.jpg`} alt="" width="160" height="100" loading="lazy" decoding="async" />
      <span>{index + 1}</span>
    </div>)}
  </div>;
}

function UseCaseResult({ card, ui }: { card: UseCaseCard; ui: ReturnType<typeof getUi> }) {
  const { label, status, example } = card.preview;
  const isNumericCell = (value: string) => /^(?:[+−-]\s*)?(?:(?:S\/|R\$)\s*)?\d[\d.,]*(?:\s*(?:%|GB|unidades?|units?|件))?(?:\s*(?:→|\/)\s*(?:(?:S\/|R\$)\s*)?\d[\d.,]*(?:\s*(?:%|GB|unidades?|units?|件))?)*$/u.test(value.trim());
  return <section className="cap-output" aria-label={label}>
    <div className="cap-output-heading"><HeroIcon name="confirm" size={24} /><h3>{label}</h3></div>
    {example.media === "product" && <img className="cap-output-product" src="/images/products/macbook-open.jpg" alt="MacBook Pro 14″" width="560" height="320" loading="lazy" decoding="async" />}
    {example.media === "gallery" && <ProductPhotos count={card.id === "photo-order" ? 4 : 3} />}
    {card.id === "photo-listing" && <ProductPhotos count={3} />}
    <table className="cap-table">
      <caption>{ui.showcaseIllustrative}</caption>
      <thead><tr>{example.columns.map((column, columnIndex) => <th key={column} scope="col" data-numeric={columnIndex > 0 && example.rows.every((row) => isNumericCell(row[columnIndex])) || undefined}>{column}</th>)}</tr></thead>
      <tbody>{example.rows.map((row, index) => <tr key={index}>{row.map((cell, columnIndex) => columnIndex === 0 ? <th key={columnIndex} scope="row">{cell}</th> : <td key={columnIndex} data-numeric={isNumericCell(cell) || undefined}>{cell}</td>)}</tr>)}</tbody>
    </table>
    <p className="cap-takeaway"><HeroIcon name="arrow" size={18} />{example.conclusion}</p>
    <p className="cap-output-status"><HeroIcon name="shield" size={16} />{status}</p>
  </section>;
}

function UseCaseDemoCard({ card, ui, onOpen }: { card: UseCaseCard; ui: ReturnType<typeof getUi>; onOpen: (id: string) => void }) {
  return <article className={`example-card demo-card result-${card.resultType}`} data-capability={card.id}>
    <h4 className="cap-card-title">{card.category}</h4><div className="example-bubble">{card.prompt}</div>
    <strong>{card.resultTitle}</strong>
    <button className="cap-open" type="button" aria-haspopup="dialog" aria-label={`${ui.showcaseOpen}: ${card.category}`} onClick={() => onOpen(card.id)}>
      <span>{ui.showcaseOpen}</span><svg viewBox="0 0 20 20" aria-hidden="true"><path d="m7 4 6 6-6 6" /></svg>
    </button>
  </article>;
}

function CapabilityDialog({ card, index, total, ui, onClose, onMove }: { card: UseCaseCard | null; index: number; total: number; ui: ReturnType<typeof getUi>; onClose: () => void; onMove: (direction: -1 | 1) => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const isOpen = card !== null;
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !isOpen) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.showModal();
    dialog.querySelector<HTMLButtonElement>(".cap-close")?.focus();
    const closeOnBackdrop = (event: MouseEvent) => {
      const bounds = dialog.getBoundingClientRect();
      if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) onClose();
    };
    dialog.addEventListener("click", closeOnBackdrop);
    return () => {
      dialog.removeEventListener("click", closeOnBackdrop);
      dialog.close();
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus({ preventScroll: true });
    };
  }, [isOpen, onClose]);
  useEffect(() => {
    dialogRef.current?.scrollTo({ top: 0 });
    dialogRef.current?.querySelector<HTMLElement>(".cap-dialog-content")?.scrollTo({ top: 0 });
  }, [card?.id]);
  return <dialog ref={dialogRef} className="cap-dialog" aria-labelledby="cap-dialog-title" onCancel={onClose}>
    {card && <div className="cap-dialog-inner">
      <header className="cap-dialog-toolbar"><BrandLogo /><button className="cap-close" type="button" aria-label={ui.showcaseClose} onClick={onClose}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg></button></header>
      <div className="cap-dialog-content" key={card.id}>
        <h2 className="cap-dialog-title" id="cap-dialog-title">{card.category}</h2><div className="cap-conversation"><div className="cap-question"><span className="cap-speaker">{ui.showcaseQuestion}</span><blockquote>{card.prompt}</blockquote></div><div className="cap-response"><span className="cap-speaker"><HeroIcon name="sparkle" size={16} />{siteConfig.name}</span><p className="cap-answer">{card.resultTitle}</p></div>{card.resultDescription && <details className="cap-method"><summary>{ui.showcaseHow}</summary><p>{card.resultDescription}</p></details>}</div>
        <div className="cap-result"><UseCaseResult card={card} ui={ui} /></div>
      </div>
      <footer className="cap-dialog-footer"><p>{ui.showcaseDataNote}</p><div className="cap-dialog-nav"><button type="button" aria-label={ui.carouselPrevious} onClick={() => onMove(-1)}><svg viewBox="0 0 20 20" aria-hidden="true"><path d="m12 4-6 6 6 6" /></svg></button><span aria-live="polite" aria-atomic="true">{index + 1} / {total}</span><button type="button" aria-label={ui.carouselNext} onClick={() => onMove(1)}><svg viewBox="0 0 20 20" aria-hidden="true"><path d="m8 4 6 6-6 6" /></svg></button></div></footer>
    </div>}
  </dialog>;
}

function PhotoDemoCard({ demo }: { demo: (typeof spanishLanding.photoExamples)[number] }) { return <article className="example-card example-photo"><img src={demo.image} alt={demo.alt} width={1122} height={1402} loading="lazy" decoding="async" /><div className="photo-overlay"><span>{demo.eyebrow}</span><strong>{demo.note}</strong></div></article>; }
function ShowcaseCards({ content, ui, duplicate = false, onOpen }: { content: ReturnType<typeof getLanding>; ui: ReturnType<typeof getUi>; duplicate?: boolean; onOpen: (id: string) => void }) {
  // Lead with four workflows; distribute the six photo breaks across the full collection.
  const photoAfterCase = [3, 10, 17, 24, 31, 38];
  return <div className="carousel-set" aria-hidden={duplicate || undefined} inert={duplicate || undefined}>{content.useCases.flatMap((card, index) => {
    const photoIndex = photoAfterCase.indexOf(index);
    return [<UseCaseDemoCard card={card} ui={ui} key={card.id} onOpen={onOpen} />, ...(photoIndex >= 0 ? [<PhotoDemoCard demo={content.photoExamples[photoIndex]} key={`photo-${photoIndex}`} />] : [])];
  })}</div>;
}

function getShowcaseLoopWidth(carousel: HTMLDivElement) {
  const sets = carousel.querySelectorAll<HTMLElement>(".carousel-set");
  return sets.length > 1 ? sets[1].offsetLeft - sets[0].offsetLeft : carousel.scrollWidth / 2;
}

export default function LandingPage() {
  const { sectionRef: oneMindBannerRef, introFinished, introActive, introPaused, introRun, introToggle, restartIntro } = useOneMindBanner();
  const [oneMindShowcaseOpen, setOneMindShowcaseOpen] = useState(false);
  const openOneMindShowcase = useCallback(() => setOneMindShowcaseOpen(true), []);
  const replayOneMind = useCallback(() => {
    setOneMindShowcaseOpen(false);
    restartIntro();
  }, [restartIntro]);
  const startOneMindWithAudio = useCallback(() => {
    if (introToggle.current) introToggle.current();
    else restartIntro();
  }, [introToggle, restartIntro]);
  const locale = useLocale() as AppLocale;
  const localizedLanding = getLanding(locale);
  const ui = getUi(locale);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [activeShowcasePage, setActiveShowcasePage] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const showcaseRef = useRef<HTMLDivElement>(null);
  const showcasePausedRef = useRef(false);
  const showcaseHoveredRef = useRef(false);
  const showcaseFocusedRef = useRef(false);
  const showcaseVisibleRef = useRef(false);
  const showcaseAutoStartRef = useRef(0);
  const showcaseResumeOnCloseRef = useRef(false);
  const showcaseAutoScrollRef = useRef<number | null>(null);
  const showcaseResumeTimerRef = useRef<number | null>(null);
  const showcaseDragRef = useRef({ active: false, pointerId: 0, startX: 0, startScroll: 0 });
  const showcaseTouchRef = useRef({ active: false, startX: 0, startY: 0, lastX: 0, startScroll: 0 });
  const countryDragRef = useRef<{ active: boolean; pointerId: number; startX: number; startTime: number; duration: number; loopWidth: number; startScroll: number; animation: Animation | null }>({ active: false, pointerId: 0, startX: 0, startTime: 0, duration: 0, loopWidth: 0, startScroll: 0, animation: null });
  const [isDraggingShowcase, setIsDraggingShowcase] = useState(false);
  const showcasePages = 4;
  const [activeShowcaseIndex, setActiveShowcaseIndex] = useState<number | null>(null);
  const closeShowcase = useCallback(() => {
    showcaseResumeOnCloseRef.current = true;
    setActiveShowcaseIndex(null);
  }, [setActiveShowcaseIndex]);
  useEffect(() => {
    if (activeShowcaseIndex !== null || !showcaseResumeOnCloseRef.current) return;
    // Resume after the dialog restores focus to its opener.
    const frame = window.requestAnimationFrame(() => {
      showcaseResumeOnCloseRef.current = false;
      if (showcaseResumeTimerRef.current) window.clearTimeout(showcaseResumeTimerRef.current);
      showcaseResumeTimerRef.current = null;
      showcaseAutoStartRef.current = 0;
      showcaseAutoScrollRef.current = showcaseRef.current?.scrollLeft ?? null;
      showcaseFocusedRef.current = false;
      showcaseHoveredRef.current = false;
      showcasePausedRef.current = false;
    });
    return () => window.cancelAnimationFrame(frame);
  }, [activeShowcaseIndex]);
  const openShowcase = (id: string) => {
    const index = localizedLanding.useCases.findIndex((card) => card.id === id);
    if (index >= 0) setActiveShowcaseIndex(index);
  };
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);
    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);
    return () => mediaQuery.removeEventListener("change", updatePreference);
  }, []);
  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>("main section[id]"));
    const updateActiveSection = () => {
      const anchor = 110;
      const active = sections.find((section) => {
        const bounds = section.getBoundingClientRect();
        return bounds.top <= anchor && bounds.bottom > anchor;
      });
      setActiveSection(active?.id ?? "");
    };
    updateActiveSection();
    window.addEventListener("scroll", updateActiveSection, { passive: true });
    window.addEventListener("resize", updateActiveSection);
    return () => {
      window.removeEventListener("scroll", updateActiveSection);
      window.removeEventListener("resize", updateActiveSection);
    };
  }, []);
  useEffect(() => {
    if (prefersReducedMotion) return;
    let previousTime = Date.now();
    const interval = window.setInterval(() => {
      const time = Date.now();
      const carousel = showcaseRef.current;
      if (carousel && (showcasePausedRef.current || !showcaseVisibleRef.current || time < showcaseAutoStartRef.current || activeShowcaseIndex !== null)) {
        showcaseAutoScrollRef.current = carousel.scrollLeft;
      } else if (carousel) {
        const loopWidth = getShowcaseLoopWidth(carousel);
        const currentPosition = showcaseAutoScrollRef.current ?? carousel.scrollLeft;
        const nextPosition = currentPosition + (time - previousTime) * 0.012;
        showcaseAutoScrollRef.current = nextPosition >= loopWidth ? nextPosition - loopWidth : nextPosition;
        // Keep fractional progress in memory, but assign whole pixels for
        // WebKit versions that round element.scrollLeft values.
        carousel.scrollLeft = Math.floor(showcaseAutoScrollRef.current);
      }
      previousTime = time;
    }, 32);
    return () => window.clearInterval(interval);
  }, [prefersReducedMotion, activeShowcaseIndex]);
  useEffect(() => {
    const carousel = showcaseRef.current;
    if (!carousel) return;
    const observer = new IntersectionObserver(([entry]) => {
      const visible = entry.isIntersecting && entry.intersectionRatio >= .35;
      if (visible && !showcaseVisibleRef.current) showcaseAutoStartRef.current = Date.now() + 3000;
      showcaseVisibleRef.current = visible;
    }, { threshold: .35 });
    observer.observe(carousel);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const carousel = showcaseRef.current;
    if (!carousel) return;
    const pause = () => { showcaseHoveredRef.current = true; showcasePausedRef.current = true; };
    const resume = () => { showcaseHoveredRef.current = false; showcasePausedRef.current = showcaseFocusedRef.current || showcaseDragRef.current.active || showcaseTouchRef.current.active; };
    const handleVisibility = () => { showcasePausedRef.current = document.hidden || showcaseHoveredRef.current || showcaseFocusedRef.current; };
    carousel.addEventListener("pointerenter", pause);
    carousel.addEventListener("pointerleave", resume);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      carousel.removeEventListener("pointerenter", pause);
      carousel.removeEventListener("pointerleave", resume);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);
  useEffect(() => () => {
    if (showcaseResumeTimerRef.current) window.clearTimeout(showcaseResumeTimerRef.current);
  }, []);
  const moveShowcase = (page: number) => {
    const carousel = showcaseRef.current;
    if (!carousel) return;
    const loopWidth = getShowcaseLoopWidth(carousel);
    showcasePausedRef.current = true;
    carousel.scrollLeft = (loopWidth * page) / showcasePages;
    setActiveShowcasePage(page);
    if (showcaseResumeTimerRef.current) window.clearTimeout(showcaseResumeTimerRef.current);
    showcaseResumeTimerRef.current = window.setTimeout(() => { showcasePausedRef.current = showcaseHoveredRef.current || showcaseFocusedRef.current; }, 900);
  };
  const scheduleShowcaseResume = (delay = 900) => {
    if (showcaseResumeTimerRef.current) window.clearTimeout(showcaseResumeTimerRef.current);
    showcaseResumeTimerRef.current = window.setTimeout(() => { showcasePausedRef.current = document.hidden || showcaseHoveredRef.current || showcaseFocusedRef.current || showcaseTouchRef.current.active || showcaseDragRef.current.active; }, delay);
  };
  const moveShowcaseByView = (direction: -1 | 1) => {
    const carousel = showcaseRef.current;
    const set = carousel?.querySelector<HTMLElement>(".carousel-set");
    const card = set?.querySelector<HTMLElement>(".example-card");
    if (!carousel || !set || !card) return;
    const setStyle = window.getComputedStyle(set);
    const columnWidth = card.offsetWidth + Number.parseFloat(setStyle.columnGap);
    const staggerWidth = setStyle.gridTemplateRows.split(" ").length > 1 ? columnWidth / 2 : 0;
    const visibleColumns = Math.max(1, Math.floor((carousel.clientWidth - staggerWidth) / columnWidth));
    const loopWidth = getShowcaseLoopWidth(carousel);
    showcasePausedRef.current = true;
    carousel.scrollLeft = ((carousel.scrollLeft + direction * visibleColumns * columnWidth) % loopWidth + loopWidth) % loopWidth;
    scheduleShowcaseResume();
  };
  const startShowcaseDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse" || event.button !== 0) return;
    if ((event.target as Element).closest("button")) return;
    event.preventDefault();
    const carousel = event.currentTarget;
    showcasePausedRef.current = true;
    showcaseDragRef.current = { active: true, pointerId: event.pointerId, startX: event.clientX, startScroll: carousel.scrollLeft };
    carousel.setPointerCapture(event.pointerId);
  };
  const dragShowcase = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = showcaseDragRef.current;
    if (!drag.active || drag.pointerId !== event.pointerId) return;
    const distance = event.clientX - drag.startX;
    if (Math.abs(distance) > 2) setIsDraggingShowcase(true);
    event.currentTarget.scrollLeft = drag.startScroll - distance;
  };
  const stopShowcaseDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = showcaseDragRef.current;
    if (!drag.active || drag.pointerId !== event.pointerId) return;
    showcaseDragRef.current.active = false;
    setIsDraggingShowcase(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    scheduleShowcaseResume();
  };
  const startShowcaseTouch = (event: React.TouchEvent<HTMLDivElement>) => {
    const touch = event.touches[0];
    if (!touch) return;
    const carousel = event.currentTarget;
    showcasePausedRef.current = true;
    showcaseTouchRef.current = { active: true, startX: touch.clientX, startY: touch.clientY, lastX: touch.clientX, startScroll: carousel.scrollLeft };
    if (showcaseResumeTimerRef.current) window.clearTimeout(showcaseResumeTimerRef.current);
  };
  const moveShowcaseTouch = (event: React.TouchEvent<HTMLDivElement>) => {
    const touch = event.touches[0];
    const drag = showcaseTouchRef.current;
    if (!drag.active || !touch) return;
    const distanceX = touch.clientX - drag.startX;
    const distanceY = touch.clientY - drag.startY;
    if (Math.abs(distanceY) > Math.abs(distanceX)) {
      drag.active = false;
      setIsDraggingShowcase(false);
      scheduleShowcaseResume();
      return;
    }
    event.preventDefault();
    drag.lastX = touch.clientX;
    if (Math.abs(distanceX) > 2) setIsDraggingShowcase(true);
    event.currentTarget.scrollLeft = drag.startScroll - distanceX;
  };
  const stopShowcaseTouch = (event: React.TouchEvent<HTMLDivElement>) => {
    if (!showcaseTouchRef.current.active) return;
    const drag = showcaseTouchRef.current;
    const distanceX = drag.lastX - drag.startX;
    const carousel = event.currentTarget;
    if (Math.abs(distanceX) > 12) {
      const direction = distanceX < 0 ? 1 : -1;
      const step = Math.max(carousel.clientWidth * 0.82, 220);
      const steps = Math.max(1, Math.round(Math.abs(distanceX) / step));
      const target = Math.max(0, Math.min(carousel.scrollWidth - carousel.clientWidth, drag.startScroll + direction * steps * step));
      carousel.scrollTo({ left: target, behavior: prefersReducedMotion ? "auto" : "smooth" });
    }
    drag.active = false;
    setIsDraggingShowcase(false);
    scheduleShowcaseResume(900);
  };
  const startCountryDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    const track = event.currentTarget.querySelector<HTMLElement>(".country-track");
    if (!track) return;
    const animation = track.getAnimations()[0] ?? null;
    const timingDuration = animation?.effect?.getTiming().duration;
    const duration = typeof timingDuration === "number" ? timingDuration : 0;
    const drag = countryDragRef.current;
    drag.active = true;
    drag.pointerId = event.pointerId;
    drag.startX = event.clientX;
    drag.duration = duration;
    drag.loopWidth = track.scrollWidth / 2;
    drag.startTime = duration > 0 && typeof animation?.currentTime === "number"
      ? ((animation.currentTime % duration) + duration) % duration
      : 0;
    drag.startScroll = event.currentTarget.scrollLeft;
    drag.animation = animation;
    event.currentTarget.classList.add("is-dragging");
    event.currentTarget.setPointerCapture(event.pointerId);
    if (event.pointerType === "mouse") event.preventDefault();
  };
  const dragCountries = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = countryDragRef.current;
    if (!drag.active || drag.pointerId !== event.pointerId) return;
    const distance = event.clientX - drag.startX;
    if (drag.animation && drag.duration > 0 && drag.loopWidth > 0) {
      const time = drag.startTime - (distance / drag.loopWidth) * drag.duration;
      drag.animation.currentTime = ((time % drag.duration) + drag.duration) % drag.duration;
    } else {
      event.currentTarget.scrollLeft = drag.startScroll - distance;
    }
  };
  const stopCountryDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = countryDragRef.current;
    if (!drag.active || drag.pointerId !== event.pointerId) return;
    drag.active = false;
    drag.animation = null;
    event.currentTarget.classList.remove("is-dragging");
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };
  const scrollCountriesWithWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    const distance = event.deltaX || (event.shiftKey ? event.deltaY : 0);
    if (!distance) return;
    const track = event.currentTarget.querySelector<HTMLElement>(".country-track");
    if (!track) return;
    const animation = track.getAnimations()[0];
    const timingDuration = animation?.effect?.getTiming().duration;
    const duration = typeof timingDuration === "number" ? timingDuration : 0;
    const loopWidth = track.scrollWidth / 2;
    if (animation && duration > 0 && loopWidth > 0 && typeof animation.currentTime === "number") {
      const time = animation.currentTime + (distance / loopWidth) * duration;
      animation.currentTime = ((time % duration) + duration) % duration;
    } else {
      event.currentTarget.scrollLeft += distance;
    }
    event.preventDefault();
  };
  const navigateToSection = (event: React.MouseEvent<HTMLAnchorElement>) => {
    const href = event.currentTarget.getAttribute("href");
    const id = href?.startsWith("#") ? href.slice(1) : "";
    const section = id ? document.getElementById(id) : null;
    if (!section) return;
    event.preventDefault();
    const anchor = section.querySelector<HTMLElement>(".section-title") ?? section;
    const headerOffset = 98;
    const top = anchor.getBoundingClientRect().top + window.scrollY - headerOffset;
    window.history.pushState(null, "", href);
    setActiveSection(id);
    window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
    setMobileMenuOpen(false);
  };
  return <main>
    <header className="header shell">
      <a href="#inicio" className="brand" aria-label={siteConfig.name}><BrandLogo className="brand-logo-full" /></a>
      <nav className={mobileMenuOpen ? "mobile-nav-open" : ""}>{[["#funciones", ui.navFeatures], ["#como-funciona", ui.navHow], ["#planes", ui.navPricing], ["#seguridad", ui.navTrust], ["#faq", ui.navFaq], ["#ia-a-la-medida", ui.navSolutions]].map(([href, label]) => <a className={activeSection === href.slice(1) ? "is-active" : undefined} aria-current={activeSection === href.slice(1) ? "location" : undefined} key={href} href={href} onClick={navigateToSection}>{label}{href === "#ia-a-la-medida" && <img className="nav-lightbulb" style={{ transform: "translateY(-2px)" }} src="/images/lightbulb-idea.png" alt="" aria-hidden="true" width="18" height="18" />}</a>)}</nav>
      <LanguageSwitcher selectorLabel={ui.languageSelector} currentLanguageLabel={ui.currentLanguage} />
      <Button hoverEffect href={mlAutomationHref(`${siteConfig.trialUrl}?plan=starter`, locale)}>{ui.startFree}</Button>
      <button className="mobile-menu" type="button" aria-label={ui.menu} aria-expanded={mobileMenuOpen} onClick={() => setMobileMenuOpen((open) => !open)}><span /><span /><span /></button>
    </header>

    <section id="inicio" className="hero shell">
      <div className="hero-background" aria-hidden="true">
        <div className="hero-glow" />
        <div className="hero-panel" />
        <div className="hero-dots hero-dots-top" />
        <div className="hero-dots hero-dots-bottom" />
      </div>
      <div className="hero-copy">
        <h1>{ui.heroTitle.split(/(Mercado Libre|Mercado Livre)/).map((part, index) => /^(Mercado Libre|Mercado Livre)$/.test(part) ? <span className="hero-marketplace-name" key={index}>{part}</span> : <Fragment key={index}>{part}</Fragment>)} <em>{ui.heroEmphasis}</em></h1>
        <p className="hero-description">{localizedLanding.hero.description}</p>
        <p className="hero-tools">{ui.heroTools}</p>
        <div className="button-row"><div className="primary-cta"><Button animated hoverEffect icon href={mlAutomationHref(`${siteConfig.trialUrl}?plan=starter`, locale)}>{ui.startFree}</Button><p className="trial-note">{ui.trial} <span aria-hidden="true">-</span> {ui.noCard}</p></div><Button outline href="#resultados">{ui.howItWorks}</Button></div>
      </div>
      <div className="hero-demo">
        <div className="hero-visual hero-animation" aria-label={ui.animationLabel}>
          <iframe
            className="hero-animation-frame"
            sandbox="allow-scripts"
            src={`/animations/pregunta-viva/pregunta-viva.html?embed=hero&locale=${locale}`}
            title={ui.animationLabel}
          />
        </div>
      </div>
      <div className="country-compatibility">
        <p>{ui.countryCompatibility}</p>
        <div className="country-marquee" role="region" aria-label={ui.countryCompatibility} onPointerDown={startCountryDrag} onPointerMove={dragCountries} onPointerUp={stopCountryDrag} onPointerCancel={stopCountryDrag} onWheel={scrollCountriesWithWheel}>
          <div className="country-track">
            {[false, true].map((duplicate) => <ul key={String(duplicate)} aria-hidden={duplicate || undefined}>
              {localizedLanding.countries.map((country) => <li key={country.code}>
                <span className="country-flag" aria-hidden="true">{Array.from(country.code).map((letter) => String.fromCodePoint(127397 + letter.charCodeAt(0))).join("")}</span>
                <span>{locale === "es" ? country.name : new Intl.DisplayNames([locale], { type: "region" }).of(country.code)}</span>
              </li>)}
            </ul>)}
          </div>
        </div>
      </div>
    </section>

    <section id="funciones" className="functions-group">
      <a className="hero-scroll-cue" href="#capacidades">
        <span>{ui.exploreFeatures}</span>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </a>
      <section id="capacidades" className="features shell"><SectionTitle>{ui.featuresTitle}</SectionTitle><p className="features-intro">{ui.featuresDescription}</p><div>{localizedLanding.features.map(([, title, items], featureIndex) => <article key={title}><span className="feature-icon"><img src={brandFeatureIcons[featureIndex]} alt="" width="96" height="96" /></span><h3>{title}</h3><ul>{items.map((item) => <li key={item}>{item}</li>)}</ul></article>)}</div></section>
      <section id="resultados" className="showcase shell" onFocusCapture={() => { showcaseFocusedRef.current = true; showcasePausedRef.current = true; }} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) { showcaseFocusedRef.current = false; scheduleShowcaseResume(); } }}><SectionTitle level="h3">{ui.showcaseTitle}</SectionTitle><p className="showcase-intro"><strong>{ui.showcaseToolCount}</strong> {ui.showcaseIntro}</p><div ref={showcaseRef} className={`showcase-carousel ${isDraggingShowcase ? "is-dragging" : ""}`} role="region" aria-roledescription={ui.carouselRole} aria-label={ui.showcaseAria} onPointerDown={startShowcaseDrag} onPointerMove={dragShowcase} onPointerUp={stopShowcaseDrag} onPointerCancel={stopShowcaseDrag} onTouchStart={startShowcaseTouch} onTouchMove={moveShowcaseTouch} onTouchEnd={stopShowcaseTouch} onTouchCancel={stopShowcaseTouch} onScroll={(event) => { const loopWidth = getShowcaseLoopWidth(event.currentTarget); setActiveShowcasePage(Math.min(showcasePages - 1, Math.floor((event.currentTarget.scrollLeft % loopWidth) / (loopWidth / showcasePages)))); }}><div className="carousel"><ShowcaseCards content={localizedLanding} ui={ui} onOpen={openShowcase} /><ShowcaseCards content={localizedLanding} ui={ui} duplicate onOpen={openShowcase} /></div></div><div className="showcase-controls"><button className="carousel-arrow" type="button" aria-label={ui.carouselPrevious} onFocus={() => { showcasePausedRef.current = true; }} onBlur={() => scheduleShowcaseResume()} onClick={() => moveShowcaseByView(-1)}><svg viewBox="0 0 20 20" aria-hidden="true"><path d="m12.5 4.5-5.5 5.5 5.5 5.5" /></svg></button><div className="dots" aria-label={ui.showcaseNavigation}>{Array.from({ length: showcasePages }, (_, index) => <button key={index} className={activeShowcasePage === index ? "active" : ""} onFocus={() => { showcasePausedRef.current = true; }} onBlur={() => scheduleShowcaseResume()} onClick={() => moveShowcase(index)} aria-label={`${ui.showcasePage} ${index + 1}`} aria-current={activeShowcasePage === index ? "page" : undefined} />)}</div><button className="carousel-arrow" type="button" aria-label={ui.carouselNext} onFocus={() => { showcasePausedRef.current = true; }} onBlur={() => scheduleShowcaseResume()} onClick={() => moveShowcaseByView(1)}><svg viewBox="0 0 20 20" aria-hidden="true"><path d="m7.5 4.5 5.5 5.5-5.5 5.5" /></svg></button></div><p className="showcase-disclaimer">{ui.showcaseDisclaimer}</p><CapabilityDialog card={activeShowcaseIndex === null ? null : localizedLanding.useCases[activeShowcaseIndex]} index={activeShowcaseIndex ?? 0} total={localizedLanding.useCases.length} ui={ui} onClose={closeShowcase} onMove={(direction) => setActiveShowcaseIndex((index) => index === null ? null : (index + direction + localizedLanding.useCases.length) % localizedLanding.useCases.length)} /></section>
    </section>

    <div className="post-pricing-background">
      <section id="como-funciona" className="steps shell"><SectionTitle>{ui.stepsTitle}</SectionTitle><p className="steps-intro">{ui.stepsIntro}</p><div>{localizedLanding.steps.map(([number, title, description], i) => <article key={number}><div className="step-symbol"><StepIcon step={i} /></div><div className="step-title"><h3>{title}</h3></div><p>{description}</p>{i === 2 && <a className="chatgpt-guide-link" href={mlAutomationHref(siteConfig.chatgptGuideUrl, locale)} target="_blank" rel="noopener noreferrer">{ui.chatgptGuideLabel}</a>}</article>)}</div></section>

      <section id="seguridad" className="trust shell"><SectionTitle>{ui.trustTitle}</SectionTitle><div>{localizedLanding.trust.map((item, i) => <article key={item}><span className="trust-icon"><img src={trustIconSources[i] ?? trustIconSources[0]} alt="" width="48" height="48" /></span>{item}</article>)}</div></section>

      <section id="planes" className="pricing shell"><SectionTitle>{ui.pricingTitle}</SectionTitle><p className="pricing-intro">{ui.pricingIntro}</p><div className="pricing-grid">{localizedLanding.plans.map((plan, planIndex) => { const isTrialPlan = planIndex < 2; const savingsLabel = plan.featured ? ui.annualHeadline : planIndex === 1 ? ui.planSavingsPro : ui.planSavingsMonthly; const card = <article className={`price-card ${plan.featured ? 'featured' : ''}`} key={plan.name}><span className="plan-savings">{savingsLabel}</span><div className="plan-header"><h3 className="plan-name">{plan.name}</h3><p className="audience">{plan.audience}</p></div><ul>{plan.items.map((item, itemIndex) => <li className={plan.featured && itemIndex === 1 ? "annual-account-feature" : planIndex === 1 && itemIndex === 1 ? "feature-inherited" : undefined} key={item}><svg className="feature-check" viewBox="0 0 20 20" aria-hidden="true"><path d="m4.2 10.2 3.5 3.5 8-8" /></svg><span>{item}</span></li>)}</ul><div className="price-block">{plan.featured ? <><p className="annual-savings">{ui.annualSavingsLabel}</p><div className="annual-value"><p className="price"><span className="price-original"><del><span className="price-currency">$</span>{plan.originalPrice}</del></span><span className="price-current-group"><span className="price-current"><span className="price-currency">$</span>{plan.price}</span><small className="price-period">{plan.billingPeriod}</small></span></p><p className="annual-monthly">{ui.annualMonthlyEquivalent}</p><Button animated href={mlAutomationHref(`${siteConfig.trialUrl}?plan=pro-annual`, locale)}>{plan.cta}</Button></div></> : <p className="price"><span className="price-original"><del><span className="price-currency">$</span>{plan.originalPrice}</del></span><span className="price-current-group"><span className="price-current"><span className="price-currency">$</span>{plan.price}</span><small className="price-period">{plan.billingPeriod}</small></span></p>}</div>{!plan.featured && <Button animated={planIndex === 1} outline={!plan.featured} href={mlAutomationHref(`${siteConfig.trialUrl}?plan=${["starter", "pro", "pro-annual"][planIndex]}`, locale)}>{plan.cta}</Button>}{isTrialPlan && <span className="plan-note">{ui.planNoCard}</span>}{plan.featured && <p className="annual-trial">{ui.annualTrialPrompt} <a href={mlAutomationHref(`${siteConfig.trialUrl}?plan=pro`, locale)}>{ui.annualTrialLink}</a></p>}</article>; return plan.featured ? <div className="annual-plan-column" key={plan.name}>{card}<p className="annual-comparison-note">{ui.annualComparisonNote}</p></div> : card; })}</div></section>

      <section id="faq" className="faq shell"><SectionTitle>{ui.faqTitle}</SectionTitle><div className="faq-grid">{localizedLanding.faqs.map(([question, answer]) => <article key={question}><details name="faq"><summary><span>{question}</span><span className="faq-toggle" aria-hidden="true" /></summary><div className="faq-answer"><p><FaqAnswer answer={answer} /></p></div></details></article>)}</div></section>

      <section id="ia-a-la-medida" className="one-mind-services shell" aria-labelledby="one-mind-services-title">
        <SectionTitle id="one-mind-services-title">{ui.oneMindServicesTitle}</SectionTitle>
        <p>{ui.oneMindServicesDescription}</p>
      </section>

      <section id="ia-negocios" className="closing shell" ref={oneMindBannerRef} data-showcase-open={oneMindShowcaseOpen}>
        <OneMindShowcase
          sectionRef={oneMindBannerRef}
          open={oneMindShowcaseOpen}
          introFinished={introFinished}
          introActive={introActive}
          introPaused={introPaused}
          onToggleIntro={() => introToggle.current?.()}
          onStartWithAudio={startOneMindWithAudio}
          onReplay={replayOneMind}
          onOpen={openOneMindShowcase}
          ui={ui}
          locale={locale}
          contactUrl={mlAutomationHref(siteConfig.contactUrl, locale)}
        >
          <iframe
            key={introRun}
            className="one-mind-intro"
            src="/animations/one-mind/index.html?banner=1"
            title="ONE MIND"
            sandbox="allow-scripts"
            loading="lazy"
          />
          <div className="closing-content">
            <div className="one-mind-logo-slot" aria-hidden="true" />
            <ClosingHeadline title={ui.closingTitle} emphasis={ui.closingEmphasis} />
            <p>{ui.closingBody}</p>
            <Button href={mlAutomationHref(siteConfig.contactUrl, locale)}>{ui.closingCta} <HeroIcon name="arrow" size={22} /></Button>
          </div>
        </OneMindShowcase>
      </section>
      <footer className="site-footer shell">
        <div className="footer-main">
          <div className="footer-brand-block">
            <BrandLogo className="footer-brand" ariaLabel={siteConfig.name} />
            <div className="footer-socials">
              {(Object.keys(socialIcons) as Array<keyof typeof socialIcons>).map((name) => {
                const href = siteConfig.socials[name];
                const icon = <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d={socialIcons[name]} /></svg>;

                return href ? (
                  <a key={name} href={href} aria-label={name}>{icon}</a>
                ) : (
                  <span key={name} role="img" aria-label={name}>{icon}</span>
                );
              })}
            </div>
          </div>
          <nav className="footer-nav" aria-label={ui.footerNav}>
            <div className="footer-column">
              <h2>{ui.footerProduct}</h2>
              <a href="#funciones"><span>{ui.footerFeatures}</span></a>
              <a href="#planes"><span>{ui.footerPricing}</span></a>
              <a href="#faq"><span>{ui.footerFaq}</span></a>
            </div>
            <div className="footer-column">
              <h2>{ui.footerSolutions}</h2>
              <a href="#ia-a-la-medida"><span>{ui.footerAi}</span></a>
              <a href={mlAutomationHref(siteConfig.contactUrl, locale)}><span>{ui.footerContact}</span></a>
            </div>
            <div className="footer-column">
              <h2>{ui.footerLegal}</h2>
              <a href={siteConfig.termsUrl} target="_blank" rel="noopener noreferrer"><span>{ui.footerTerms}</span></a>
              <a href={siteConfig.privacyUrl} target="_blank" rel="noopener noreferrer"><span>{ui.footerPrivacy}</span></a>
            </div>
          </nav>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} {siteConfig.name}. {ui.footerRights}</span>
          <span>{ui.footerDisclosure}</span>
        </div>
      </footer>
    </div>
  </main>;
}
