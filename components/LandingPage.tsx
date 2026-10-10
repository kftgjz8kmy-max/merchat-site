"use client";
/* eslint-disable @next/next/no-img-element -- Vinext's local dev renderer is incompatible with next/image; fixed-dimension local HiDPI assets are intentional. */

import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { getLanding, getUi, landing as spanishLanding, type UseCaseCard } from "@/config/landing";
import { siteConfig } from "@/config/site";
import { BrandLogo } from "@/components/BrandLogo";
import { localeOptions, localePaths, type AppLocale } from "@/i18n/locales";

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

function LanguageSwitcher({ selectorLabel, currentLanguageLabel }: { selectorLabel: string; currentLanguageLabel: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedLanguage = useLocale() as LanguageCode;
  const switcherRef = useRef<HTMLDivElement>(null);
  const selected = languages.find((language) => language.code === selectedLanguage) ?? languages[0];

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

function Button({ children, outline = false, href = siteConfig.whatsappUrl, icon = false }: { children: React.ReactNode; outline?: boolean; href?: string; icon?: boolean }) {
  return <a className={`button ${outline ? "button-outline" : ""}`} href={href}>{children}{icon && <HeroIcon name="arrow" size={17} />}</a>;
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
  "/brand/illustrations/account.svg",
  "/brand/illustrations/connect.svg",
  "/brand/illustrations/assistant.svg",
  "/brand/illustrations/business.svg",
] as const;

const trustIconSources = [
  "/brand/illustrations/secure.svg",
  "/brand/illustrations/control.svg",
  "/brand/illustrations/separation.svg",
  "/brand/illustrations/confirm.svg",
] as const;

function StepIcon({ step }: { step: number }) {
  return <img className="step-icon-image" src={stepIconSources[step] ?? stepIconSources[0]} alt="" width="48" height="48" />;
}

const productPhotos = ["open", "keyboard", "side", "closed"] as const;

function ProductPhotos({ gallery = false }: { gallery?: boolean }) {
  return <div className={gallery ? "cap-gallery" : "cap-product-photos"} aria-hidden="true">
    {productPhotos.slice(0, gallery ? 4 : 3).map((photo, index) => <div key={photo}>
      <img src={`/images/products/macbook-${photo}.jpg`} alt="" width="160" height="100" loading="lazy" decoding="async" />
      {gallery && <span>{index + 1}</span>}
    </div>)}
  </div>;
}

function PreviewItems({ card }: { card: UseCaseCard }) {
  return <div className="cap-items">{card.preview.items.map((item, index) => <div key={item.label} className={`cap-item cap-item-${index}`}>
    {item.value && <b>{item.value}</b>}<span>{item.label}</span>
  </div>)}</div>;
}

function UseCaseResult({ card }: { card: UseCaseCard }) {
  const { label, status } = card.preview;
  return <div className={`cap-preview cap-${card.resultType}`}>
    <b className="cap-label">{label}</b>
    {card.resultType === "listing" && <><div className="cap-product-gallery"><img className="cap-product-main" src="/images/products/macbook-open.jpg" alt="MacBook Pro 14″" width="240" height="140" loading="lazy" decoding="async" /><ProductPhotos /></div></>}
    {card.resultType === "gallery" ? <><ProductPhotos gallery /><div className="cap-order" aria-hidden="true"><span>1 · 2 · 3 · 4</span><HeroIcon name="arrow" /><b>3 · 1 · 2 · 4</b></div></> : <PreviewItems card={card} />}
    {card.resultType === "price-range" && <div className="cap-range" aria-hidden="true"><span /><i /></div>}
    {card.resultType === "ads" && <div className="cap-ad-chart" aria-hidden="true"><div><i style={{ width: `${Math.min(100, Math.max(0, Number.parseFloat(card.preview.items[0].value ?? "0")))}%` }} /></div><span>0%</span><span>100%</span></div>}
    {card.resultType === "restock" && <div className="cap-stock" aria-hidden="true"><span /></div>}
    <span className="cap-status">{card.resultType === "promotion" && <HeroIcon name="check" size={15} />}{status}</span>
  </div>;
}

function UseCaseDemoCard({ card, onOpen }: { card: UseCaseCard; onOpen: (id: string) => void }) {
  return <article className={`example-card demo-card result-${card.resultType}`} data-capability={card.id}>
    <span>{card.category}</span><div className="example-bubble">{card.prompt}</div>
    <strong>{card.resultTitle}</strong>
    <button className="cap-open" type="button" aria-haspopup="dialog" onClick={() => onOpen(card.id)}>
      <span>{card.preview.label}</span><svg viewBox="0 0 20 20" aria-hidden="true"><path d="m7 4 6 6-6 6" /></svg>
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
  return <dialog ref={dialogRef} className="cap-dialog" aria-labelledby="cap-dialog-title" onCancel={onClose}>
    {card && <div className="cap-dialog-inner">
      <header className="cap-dialog-toolbar"><BrandLogo /><button className="cap-close" type="button" aria-label={ui.showcaseClose} onClick={onClose}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg></button></header>
      <div className="cap-dialog-content" key={card.id}>
        <div className="cap-conversation"><h2 id="cap-dialog-title">{card.category}</h2><blockquote>{card.prompt}</blockquote><p className="cap-answer"><HeroIcon name="sparkle" size={22} />{card.resultTitle}</p></div>
        <div className="cap-result"><UseCaseResult card={card} /><p className="cap-explanation">{card.resultDescription}</p></div>
      </div>
      <footer className="cap-dialog-footer"><p>{ui.showcaseDisclaimer}</p><div className="cap-dialog-nav"><button type="button" aria-label={ui.carouselPrevious} onClick={() => onMove(-1)}><svg viewBox="0 0 20 20" aria-hidden="true"><path d="m12 4-6 6 6 6" /></svg></button><span aria-live="polite" aria-atomic="true">{index + 1} / {total}</span><button type="button" aria-label={ui.carouselNext} onClick={() => onMove(1)}><svg viewBox="0 0 20 20" aria-hidden="true"><path d="m8 4 6 6-6 6" /></svg></button></div></footer>
    </div>}
  </dialog>;
}

function PhotoDemoCard({ demo }: { demo: (typeof spanishLanding.photoExamples)[number] }) { return <article className="example-card example-photo"><img src={demo.image} alt={demo.alt} width={1122} height={1402} loading="lazy" decoding="async" /><div className="photo-overlay"><span>{demo.eyebrow}</span><strong>{demo.note}</strong></div></article>; }
function ShowcaseCards({ content, duplicate = false, onOpen }: { content: ReturnType<typeof getLanding>; duplicate?: boolean; onOpen: (id: string) => void }) {
  // Lead with four workflows; distribute the six photo breaks across the full collection.
  const photoAfterCase = [3, 10, 17, 24, 31, 38];
  return <div className="carousel-set" aria-hidden={duplicate || undefined} inert={duplicate || undefined}>{content.useCases.flatMap((card, index) => {
    const photoIndex = photoAfterCase.indexOf(index);
    return [<UseCaseDemoCard card={card} key={card.id} onOpen={onOpen} />, ...(photoIndex >= 0 ? [<PhotoDemoCard demo={content.photoExamples[photoIndex]} key={`photo-${photoIndex}`} />] : [])];
  })}</div>;
}

function getShowcaseLoopWidth(carousel: HTMLDivElement) {
  const sets = carousel.querySelectorAll<HTMLElement>(".carousel-set");
  return sets.length > 1 ? sets[1].offsetLeft - sets[0].offsetLeft : carousel.scrollWidth / 2;
}

export default function LandingPage() {
  const locale = useLocale();
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
  const showcaseAutoScrollRef = useRef<number | null>(null);
  const showcaseResumeTimerRef = useRef<number | null>(null);
  const showcaseDragRef = useRef({ active: false, pointerId: 0, startX: 0, startScroll: 0 });
  const showcaseTouchRef = useRef({ active: false, startX: 0, startY: 0, lastX: 0, startScroll: 0 });
  const [isDraggingShowcase, setIsDraggingShowcase] = useState(false);
  const showcasePages = 4;
  const [activeShowcaseIndex, setActiveShowcaseIndex] = useState<number | null>(null);
  const closeShowcase = useCallback(() => setActiveShowcaseIndex(null), [setActiveShowcaseIndex]);
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
      if (carousel && (showcasePausedRef.current || !showcaseVisibleRef.current || activeShowcaseIndex !== null)) {
        showcaseAutoScrollRef.current = carousel.scrollLeft;
      } else if (carousel) {
        const loopWidth = getShowcaseLoopWidth(carousel);
        const currentPosition = showcaseAutoScrollRef.current ?? carousel.scrollLeft;
        const nextPosition = currentPosition + (time - previousTime) * 0.018;
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
    const observer = new IntersectionObserver(([entry]) => { showcaseVisibleRef.current = entry.isIntersecting; }, { threshold: 0 });
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
      <nav className={mobileMenuOpen ? "mobile-nav-open" : ""}>{[["#como-funciona", ui.navHow], ["#funciones", ui.navFeatures], ["#planes", ui.navPricing], ["#seguridad", ui.navTrust], ["#faq", ui.navFaq], ["#ia-negocios", ui.navSolutions]].map(([href, label]) => <a className={activeSection === href.slice(1) ? "is-active" : undefined} aria-current={activeSection === href.slice(1) ? "location" : undefined} key={href} href={href} onClick={navigateToSection}>{label}{href === "#ia-negocios" && <img className="nav-lightbulb" style={{ transform: "translateY(-2px)" }} src="/images/lightbulb-idea.png" alt="" aria-hidden="true" width="18" height="18" />}</a>)}</nav>
      <LanguageSwitcher selectorLabel={ui.languageSelector} currentLanguageLabel={ui.currentLanguage} />
      <Button href={siteConfig.trialUrl}>{ui.startFree}</Button>
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
        <p className="eyebrow"><HeroIcon name="sparkle" size={16} />{localizedLanding.hero.eyebrow}</p>
        <h1>{ui.heroTitle.split(/(Mercado Libre|Mercado Livre)/).map((part, index) => /^(Mercado Libre|Mercado Livre)$/.test(part) ? <span className="hero-marketplace-name" key={index}>{part}</span> : <Fragment key={index}>{part}</Fragment>)} <em>{ui.heroEmphasis}</em></h1>
        <p className="hero-description">{localizedLanding.hero.description}</p>
        <div className="button-row"><div className="primary-cta"><Button icon href={siteConfig.trialUrl}>{ui.startFree}</Button><p className="trial-note">{ui.trial} <span aria-hidden="true">-</span> {ui.noCard}</p></div><Button outline href="#como-funciona">{ui.howItWorks}</Button></div>
        <div className="quick-points"><span><img src="/images/quick-points/publish.png" alt="" width="28" height="28" /><span>{ui.quickPublish}</span></span><span><img src="/images/quick-points/clock.png" alt="" width="28" height="28" /><span>{ui.quickHoursLine1}<br className="quick-point-break" /> {ui.quickHoursLine2}</span></span><span><img src="/images/quick-points/language.png" alt="" width="28" height="28" /><span>{ui.quickNaturalLine1}<br className="quick-point-break" /> {ui.quickNaturalLine2}</span></span></div>
      </div>
      <div className="hero-visual hero-animation" aria-label={ui.animationLabel}>
        <iframe
          className="hero-animation-frame"
          sandbox="allow-scripts"
          src={`/animations/pregunta-viva/pregunta-viva.html?embed=hero&locale=${locale}`}
          title={ui.animationLabel}
        />
      </div>
    </section>

    <section id="funciones" className="functions-group">
      <section className="features shell"><SectionTitle>{ui.featuresTitle}</SectionTitle><div>{localizedLanding.features.map(([, title, items], featureIndex) => <article key={title}><span className="feature-icon"><img src={brandFeatureIcons[featureIndex]} alt="" width="96" height="96" /></span><h3>{title}</h3><ul>{items.map((item) => <li key={item}>{item}</li>)}</ul></article>)}</div></section>
      <section id="resultados" className="showcase shell" onFocusCapture={() => { showcaseFocusedRef.current = true; showcasePausedRef.current = true; }} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) { showcaseFocusedRef.current = false; scheduleShowcaseResume(); } }}><SectionTitle level="h3">{ui.showcaseTitle}</SectionTitle><p className="showcase-intro"><strong>{ui.showcaseToolCount}</strong> {ui.showcaseIntro}</p><div ref={showcaseRef} className={`showcase-carousel ${isDraggingShowcase ? "is-dragging" : ""}`} role="region" aria-roledescription={ui.carouselRole} aria-label={ui.showcaseAria} onPointerDown={startShowcaseDrag} onPointerMove={dragShowcase} onPointerUp={stopShowcaseDrag} onPointerCancel={stopShowcaseDrag} onTouchStart={startShowcaseTouch} onTouchMove={moveShowcaseTouch} onTouchEnd={stopShowcaseTouch} onTouchCancel={stopShowcaseTouch} onScroll={(event) => { const loopWidth = getShowcaseLoopWidth(event.currentTarget); setActiveShowcasePage(Math.min(showcasePages - 1, Math.floor((event.currentTarget.scrollLeft % loopWidth) / (loopWidth / showcasePages)))); }}><div className="carousel"><ShowcaseCards content={localizedLanding} onOpen={openShowcase} /><ShowcaseCards content={localizedLanding} duplicate onOpen={openShowcase} /></div></div><div className="showcase-controls"><button className="carousel-arrow" type="button" aria-label={ui.carouselPrevious} onFocus={() => { showcasePausedRef.current = true; }} onBlur={() => scheduleShowcaseResume()} onClick={() => moveShowcaseByView(-1)}><svg viewBox="0 0 20 20" aria-hidden="true"><path d="m12.5 4.5-5.5 5.5 5.5 5.5" /></svg></button><div className="dots" aria-label={ui.showcaseNavigation}>{Array.from({ length: showcasePages }, (_, index) => <button key={index} className={activeShowcasePage === index ? "active" : ""} onFocus={() => { showcasePausedRef.current = true; }} onBlur={() => scheduleShowcaseResume()} onClick={() => moveShowcase(index)} aria-label={`${ui.showcasePage} ${index + 1}`} aria-current={activeShowcasePage === index ? "page" : undefined} />)}</div><button className="carousel-arrow" type="button" aria-label={ui.carouselNext} onFocus={() => { showcasePausedRef.current = true; }} onBlur={() => scheduleShowcaseResume()} onClick={() => moveShowcaseByView(1)}><svg viewBox="0 0 20 20" aria-hidden="true"><path d="m7.5 4.5 5.5 5.5-5.5 5.5" /></svg></button></div><p className="showcase-disclaimer">{ui.showcaseDisclaimer}</p><CapabilityDialog card={activeShowcaseIndex === null ? null : localizedLanding.useCases[activeShowcaseIndex]} index={activeShowcaseIndex ?? 0} total={localizedLanding.useCases.length} ui={ui} onClose={closeShowcase} onMove={(direction) => setActiveShowcaseIndex((index) => index === null ? null : (index + direction + localizedLanding.useCases.length) % localizedLanding.useCases.length)} /></section>
    </section>

    <div className="post-pricing-background">
      <section id="como-funciona" className="steps shell"><SectionTitle>{ui.stepsTitle}</SectionTitle><p className="steps-intro">{ui.stepsIntro}</p><div>{localizedLanding.steps.map(([number, title, description], i) => <article key={number}><div className="step-symbol"><StepIcon step={i} /></div><div className="step-title"><h3>{title}</h3></div><p>{description}</p>{i === 2 && <a className="chatgpt-guide-link" href={siteConfig.chatgptGuideUrl} target="_blank" rel="noopener noreferrer">{ui.chatgptGuideLabel}<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h11M10 5l5 5-5 5" /></svg></a>}</article>)}</div></section>

      <section id="seguridad" className="trust shell"><SectionTitle>{ui.trustTitle}</SectionTitle><div>{localizedLanding.trust.map((item, i) => <article key={item}><span className="trust-icon"><img src={trustIconSources[i] ?? trustIconSources[0]} alt="" width="48" height="48" /></span>{item}</article>)}</div></section>

      <section id="planes" className="pricing shell"><SectionTitle>{ui.pricingTitle}</SectionTitle><p className="pricing-intro">{ui.pricingIntro}<br /><span>{ui.pricingOffer}</span></p><div className="pricing-grid">{localizedLanding.plans.map((plan, planIndex) => { const isTrialPlan = planIndex < 2; const savingsLabel = plan.featured ? ui.recommended : ui.planSavingsMonthly; return <article className={`price-card ${plan.featured ? 'featured' : ''}`} key={plan.name}><span className="plan-savings">{savingsLabel}</span><div className="plan-header"><h3 className="plan-name">{plan.name}</h3><p className="audience">{plan.audience}</p></div><ul>{plan.items.map((item, itemIndex) => <li className={planIndex > 0 && itemIndex === 0 ? "feature-inherited" : undefined} key={item}><svg className="feature-check" viewBox="0 0 20 20" aria-hidden="true"><path d="m4.2 10.2 3.5 3.5 8-8" /></svg><span>{item}</span></li>)}</ul><div className="price-block">{plan.featured && <span className="plan-savings-secondary">{ui.planSavingsAnnual}</span>}<p className="price"><span className="price-original"><del><span className="price-currency">$</span>{plan.originalPrice}</del></span><span className="price-current-group"><span className="price-current"><span className="price-currency">$</span>{plan.price}</span><small className="price-period">{plan.billingPeriod}</small></span></p></div><Button outline={!plan.featured} href={isTrialPlan ? siteConfig.trialUrl : siteConfig.whatsappUrl}>{plan.cta}</Button>{isTrialPlan && <span className="plan-note">{ui.planNoCard}</span>}</article>; })}</div></section>

      <section id="faq" className="faq shell"><SectionTitle>{ui.faqTitle}</SectionTitle><div className="faq-grid">{localizedLanding.faqs.map(([question, answer]) => <article key={question}><details name="faq"><summary><span>{question}</span><span className="faq-toggle" aria-hidden="true" /></summary><div className="faq-answer"><p><FaqAnswer answer={answer} /></p></div></details></article>)}</div></section>

      <section id="ia-negocios" className="closing shell"><div><h2>{ui.closingTitle} <em>{ui.closingEmphasis}</em></h2><p>{ui.closingBody}</p><Button>{ui.closingCta}</Button><small>{ui.closingTags}</small></div><div className="device-scene"><div className="laptop"><div className="screen"><b>{siteConfig.name}</b><strong>{ui.deviceCustomAi}</strong><div className="mini-line" /></div></div><div className="phone"><b>{ui.deviceProjects}</b><span>{ui.deviceActive}</span></div><i /><i /></div></section>
      <footer className="site-footer shell">
        <div className="footer-main">
          <div className="footer-brand-block">
            <BrandLogo className="footer-brand" ariaLabel={siteConfig.name} />
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
              <a href="#ia-negocios"><span>{ui.footerAi}</span></a>
              <a href={siteConfig.whatsappUrl}><span>{ui.footerContact}</span></a>
            </div>
            <div className="footer-column">
              <h2>{ui.footerLegal}</h2>
              <span className="footer-item"><span>{ui.footerTerms}</span></span>
              <span className="footer-item"><span>{ui.footerPrivacy}</span></span>
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
