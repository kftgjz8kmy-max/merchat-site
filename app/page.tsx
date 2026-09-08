"use client";
/* eslint-disable @next/next/no-img-element -- Vinext's local dev renderer is incompatible with next/image; fixed-dimension local HiDPI assets are intentional. */

import { Fragment, useEffect, useRef, useState } from "react";
import { landing, type UseCaseCard } from "@/config/landing";
import { siteConfig } from "@/config/site";

type HeroIconName = "sparkle" | "arrow" | "shield" | "lock" | "check" | "publish" | "clock" | "confirm" | "send" | "double-check";

function HeroIcon({ name, size = 18 }: { name: HeroIconName; size?: number }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 1.9, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (name === "sparkle") return <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true"><path {...common} d="m12 3-1.7 5.3L5 10l5.3 1.7L12 17l1.7-5.3L19 10l-5.3-1.7z"/><path {...common} d="m19 15-.7 2.3L16 18l2.3.7L19 21l.7-2.3L22 18l-2.3-.7z"/></svg>;
  if (name === "arrow") return <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true"><path {...common} d="M5 12h14M13 6l6 6-6 6"/></svg>;
  if (name === "shield") return <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true"><path {...common} d="M12 3 5 6v5c0 4.6 2.9 8.4 7 10 4.1-1.6 7-5.4 7-10V6z"/><path {...common} d="m8.8 12 2.1 2.1 4.3-4.4"/></svg>;
  if (name === "lock") return <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true"><rect {...common} x="5" y="10" width="14" height="10" rx="2"/><path {...common} d="M8 10V7a4 4 0 0 1 8 0v3M12 14v2"/></svg>;
  if (name === "check") return <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true"><circle {...common} cx="12" cy="12" r="8.5"/><path {...common} d="m8.5 12 2.3 2.3 4.7-4.8"/></svg>;
  if (name === "publish") return <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 4.5h7l4 4v11h-11z" fill="currentColor"/><path d="M13.5 4.5v4h4" fill="none" stroke="#FFF8EC" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 17V10m-3 3 3-3 3 3" fill="none" stroke="#FFF8EC" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
  if (name === "clock") return <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true"><circle cx="11.5" cy="12.5" r="8.5" fill="currentColor"/><path d="M11.5 8.5v4l2.8 1.8" fill="none" stroke="#FFF8EC" strokeWidth="2.2" strokeLinecap="round"/><circle cx="18.3" cy="5.8" r="2" fill="#FBBF24"/></svg>;
  if (name === "confirm") return <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true"><rect x="4.5" y="5" width="15" height="14" rx="3.5" fill="currentColor"/><path d="m8 12.5 2.5 2.5 5.5-5.5" fill="none" stroke="#FFF8EC" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="18.2" cy="17.8" r="3.1" fill="#FBBF24"/><path d="M17.4 16.6v2.4m1.6-2.4v2.4" stroke="#2563EB" strokeWidth="1.2" strokeLinecap="round"/></svg>;
  if (name === "send") return <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true"><path {...common} d="m4 4 16 8-16 8 3-8z"/><path {...common} d="M7 12h13"/></svg>;
  return <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true"><path {...common} d="m4 12 3 3 6-7"/><path {...common} d="m11 12 3 3 6-7"/></svg>;
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

const stepIconSources = [
  "/images/step-icons/create-account-v2.png",
  "/images/step-icons/mercado-libre-connect-v3.png",
  "/images/step-icons/choose-assistant-v2.png",
  "/images/step-icons/manage-business-v2.png",
] as const;

const trustIconSources = [
  "/images/secondary-icons/secure-connection.png",
  "/images/secondary-icons/account-control.png",
  "/images/secondary-icons/data-separation.png",
  "/images/secondary-icons/confirm-before-action.png",
] as const;

function StepIcon({ step }: { step: number }) {
  return <img className="step-icon-image" src={stepIconSources[step] ?? stepIconSources[0]} alt="" width="48" height="48" />;
}

function UseCaseResult({ card }: { card: UseCaseCard }) {
  switch (card.resultType) {
    case "listing": return <div className="listing-preview"><i /><div><b>Samsung Galaxy A56 256 GB</b><small>Nuevo · Stock: 3 unidades</small></div></div>;
    case "photo-identification": return <div className="identified-product"><i>⌁</i><div><b>Xiaomi Redmi Note 14</b><small>✓ Modelo identificado</small></div></div>;
    case "technical": return <div className="technical-list"><span>Marca <b>Samsung</b></span><span>Memoria <b>256 GB</b></span><span>Pantalla <b>6.7″</b></span></div>;
    case "price-range": return <div className="price-insight"><small>RANGO COMPETITIVO</small><div><i /><b /></div><span>S/ 1,249 — S/ 1,349</span></div>;
    case "discount": return <div className="metric-pairs"><span>Precio actual <b>S/ 599</b></span><span>Mínimo rentable <b>S/ 529</b></span></div>;
    case "promotion": return <div className="promotion-summary"><b>Oferta de la semana</b><span><strong>10%</strong><small>8 productos · 7 días</small></span></div>;
    case "eligibility": return <div className="status-list"><span>✓ 5 agregados</span><span>! 1 requiere ajuste de precio</span></div>;
    case "excel": return <div className="excel-preview"><i>↙</i><div><b>Ganancias.xlsx</b><small>Precio · Comisión · Envío</small></div><span>Excel generado</span></div>;
    case "bulk-update": return <div className="metric-grid"><span><b>62</b> precios</span><span><b>18</b> stocks</span><span><b>4</b> revisar</span></div>;
    case "sale": return <div className="sale-summary"><b>Nintendo Switch OLED</b><span><i>✓</i> Pago aprobado</span><small>Listo para despachar</small></div>;
    case "ranking": return <div className="ranking"><span><b>Más vendidos</b> Audífonos · 48</span><span><b>Menos vendidos</b> Cámara web · 1</span></div>;
    case "restock": return <div className="restock-list"><span>Audífonos <b>+20</b></span><span>Smartwatch <b>+12</b></span><span>Freidora <b>+8</b></span></div>;
    case "stagnant": return <div className="alert-summary"><b>S/ 12,480</b><span>inmovilizados en stock</span><small>3 con precio sobre el mercado</small></div>;
    case "performance": return <div className="performance-list"><span>Ajustar precio</span><span>Completar atributos</span><span>Revisar fotos</span></div>;
    case "dashboard": return <div className="mini-dashboard"><div><i /><i /><i /></div><span><b>326</b> ventas este trimestre</span></div>;
  }
}

function UseCaseDemoCard({ card }: { card: UseCaseCard }) { return <article className={`example-card demo-card result-${card.resultType}`}><span>{card.category}</span><div className="example-bubble">{card.prompt}</div><UseCaseResult card={card} /><strong>{card.resultTitle}</strong>{card.resultDescription && <small>{card.resultDescription}</small>}</article>; }
function PhotoDemoCard({ demo }: { demo: (typeof landing.photoExamples)[number] }) { return <article className="example-card example-photo"><img src={demo.image} alt={demo.alt} width={1122} height={1402} loading="lazy" decoding="async" /><div className="photo-overlay"><span>{demo.eyebrow}</span><strong>{demo.note}</strong></div></article>; }
function ShowcaseCards({ duplicate = false }: { duplicate?: boolean }) {
  const photoAfterCase = [1, 3, 5, 7, 9];
  const leadPhoto = landing.photoExamples[2];
  return <div className="carousel-set" aria-hidden={duplicate || undefined}>{[<PhotoDemoCard demo={leadPhoto} key={leadPhoto.eyebrow} />, ...landing.useCases.flatMap((card, index) => [<UseCaseDemoCard card={card} key={card.id} />, ...(photoAfterCase.includes(index) && index !== 5 ? [<PhotoDemoCard demo={landing.photoExamples[photoAfterCase.indexOf(index)]} key={landing.photoExamples[photoAfterCase.indexOf(index)].eyebrow} />] : [])])]}</div>;
}

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [activeShowcasePage, setActiveShowcasePage] = useState(0);
  const showcaseRef = useRef<HTMLDivElement>(null);
  const showcasePausedRef = useRef(false);
  const showcaseAutoScrollRef = useRef<number | null>(null);
  const showcaseResumeTimerRef = useRef<number | null>(null);
  const showcaseDragRef = useRef({ active: false, pointerId: 0, startX: 0, startScroll: 0 });
  const showcaseTouchRef = useRef({ active: false, startX: 0, startY: 0, lastX: 0, startScroll: 0 });
  const [isDraggingShowcase, setIsDraggingShowcase] = useState(false);
  const showcasePages = 4;
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
    let previousTime = Date.now();
    const interval = window.setInterval(() => {
      const time = Date.now();
      const carousel = showcaseRef.current;
      if (carousel && showcasePausedRef.current) {
        showcaseAutoScrollRef.current = carousel.scrollLeft;
      } else if (carousel) {
        const loopWidth = carousel.scrollWidth / 2;
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
  }, []);
  const moveShowcase = (page: number) => {
    const carousel = showcaseRef.current;
    if (!carousel) return;
    const loopWidth = carousel.scrollWidth / 2;
    showcasePausedRef.current = true;
    carousel.scrollLeft = (loopWidth * page) / showcasePages;
    setActiveShowcasePage(page);
    if (showcaseResumeTimerRef.current) window.clearTimeout(showcaseResumeTimerRef.current);
    showcaseResumeTimerRef.current = window.setTimeout(() => { showcasePausedRef.current = false; }, 700);
  };
  const scheduleShowcaseResume = (delay = 900) => {
    if (showcaseResumeTimerRef.current) window.clearTimeout(showcaseResumeTimerRef.current);
    showcaseResumeTimerRef.current = window.setTimeout(() => { showcasePausedRef.current = false; }, delay);
  };
  const startShowcaseDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse" || event.button !== 0) return;
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
    showcasePausedRef.current = false;
  };
  const startShowcaseTouch = (event: React.TouchEvent<HTMLDivElement>) => {
    const touch = event.touches[0];
    if (!touch) return;
    const carousel = event.currentTarget;
    showcasePausedRef.current = true;
    showcaseTouchRef.current = { active: true, startX: touch.clientX, startY: touch.clientY, lastX: touch.clientX, startScroll: carousel.scrollLeft };
    scheduleShowcaseResume(1800);
  };
  const moveShowcaseTouch = (event: React.TouchEvent<HTMLDivElement>) => {
    const touch = event.touches[0];
    const drag = showcaseTouchRef.current;
    if (!drag.active || !touch) return;
    const distanceX = touch.clientX - drag.startX;
    const distanceY = touch.clientY - drag.startY;
    if (Math.abs(distanceY) > Math.abs(distanceX)) {
      drag.active = false;
      showcasePausedRef.current = false;
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
      carousel.scrollTo({ left: target, behavior: "smooth" });
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
      <a href="#inicio" className="brand" aria-label={siteConfig.name}><img className="brand-logo-full" src={siteConfig.brand.logo} alt={siteConfig.name} width="190" height="56" /><img className="brand-logo-icon" src={siteConfig.brand.icon} alt="" width="48" height="48" /></a>
      <nav className={mobileMenuOpen ? "mobile-nav-open" : ""}>{siteConfig.navigation.map((item) => <a className={activeSection === item.href.slice(1) ? "is-active" : undefined} aria-current={activeSection === item.href.slice(1) ? "location" : undefined} key={item.href} href={item.href} onClick={navigateToSection}>{item.label}{"icon" in item && item.icon === "lightbulb" && <img className="nav-lightbulb" style={{ transform: "translateY(-2px)" }} src="/images/lightbulb-idea.png" alt="" aria-hidden="true" width="18" height="18" />}</a>)}</nav>
      <Button href={siteConfig.trialUrl}>Comienza Gratis</Button>
      <button className="mobile-menu" type="button" aria-label="Abrir menú" aria-expanded={mobileMenuOpen} onClick={() => setMobileMenuOpen((open) => !open)}><span /><span /><span /></button>
    </header>

    <section id="inicio" className="hero shell">
      <div className="hero-background" aria-hidden="true">
        <div className="hero-glow" />
        <div className="hero-panel" />
        <div className="hero-dots hero-dots-top" />
        <div className="hero-dots hero-dots-bottom" />
      </div>
      <div className="hero-copy">
        <p className="eyebrow"><HeroIcon name="sparkle" size={16} />{landing.hero.eyebrow}</p>
        <h1>Gestiona Mercado Libre hablando con una IA que <em>entiende tu negocio.</em></h1>
        <p className="hero-description">{landing.hero.description}</p>
        <div className="button-row"><div className="primary-cta"><Button icon href={siteConfig.trialUrl}>Comienza Gratis</Button><p className="trial-note">14 días gratis <span aria-hidden="true">-</span> Sin tarjeta</p></div><Button outline href="#como-funciona">Ver cómo funciona</Button></div>
        <div className="quick-points"><span><img src="/images/quick-points/publish.png" alt="" width="28" height="28" /><span>Publica sin complicaciones</span></span><span><img src="/images/quick-points/clock.png" alt="" width="28" height="28" /><span>Ahorra horas<br className="quick-point-break" /> de trabajo manual</span></span><span><img src="/images/quick-points/language.png" alt="" width="28" height="28" /><span>Gestiona tu cuenta con<br className="quick-point-break" /> lenguaje natural</span></span></div>
      </div>
      <div className="hero-visual hero-animation" aria-label={`Ejemplo animado de una conversación con ${siteConfig.name}`}>
        <iframe
          className="hero-animation-frame"
          src="/animations/pregunta-viva/pregunta-viva.html?embed=hero"
          title={`Ejemplo animado de una conversación con ${siteConfig.name}`}
        />
      </div>
    </section>

    <section id="funciones" className="functions-group">
      <section className="features shell"><SectionTitle>Lo que puedes hacer con merchat</SectionTitle><div>{landing.features.map(([icon, title, items]) => <article key={title}><span className="feature-icon"><img src={icon} alt="" width="96" height="96" /></span><h3>{title}</h3><ul>{items.map((item) => <li key={item}>{item}</li>)}</ul></article>)}</div></section>
      <section id="resultados" className="showcase shell"><SectionTitle level="h3">Pídele a merchat lo que necesitas</SectionTitle><div ref={showcaseRef} className={`showcase-carousel ${isDraggingShowcase ? "is-dragging" : ""}`} aria-label={`Ejemplos de conversaciones y resultados en ${siteConfig.name}`} onPointerDown={startShowcaseDrag} onPointerMove={dragShowcase} onPointerUp={stopShowcaseDrag} onPointerCancel={stopShowcaseDrag} onTouchStart={startShowcaseTouch} onTouchMove={moveShowcaseTouch} onTouchEnd={stopShowcaseTouch} onTouchCancel={stopShowcaseTouch} onScroll={(event) => { const loopWidth = event.currentTarget.scrollWidth / 2; setActiveShowcasePage(Math.min(showcasePages - 1, Math.floor((event.currentTarget.scrollLeft % loopWidth) / (loopWidth / showcasePages)))); }}><div className="carousel"><ShowcaseCards /><ShowcaseCards duplicate /></div></div><div className="dots" aria-label="Navegación de ejemplos">{Array.from({ length: showcasePages }, (_, index) => <button key={index} className={activeShowcasePage === index ? "active" : ""} onClick={() => moveShowcase(index)} aria-label={`Ver ejemplos ${index + 1}`} aria-current={activeShowcasePage === index} />)}</div></section>
    </section>

    <div className="post-pricing-background">
      <section id="como-funciona" className="steps shell"><SectionTitle>Cómo funciona</SectionTitle><p className="steps-intro">Crea tu cuenta, conecta Mercado Libre y usa merchat como tu asistente desde la herramienta de IA que prefieras.</p><div>{landing.steps.map(([number, title, description], i) => <article key={number}><div className="step-symbol"><StepIcon step={i} /></div><div className="step-title"><h3>{title}</h3></div><p>{description}</p></article>)}</div></section>

      <section id="seguridad" className="trust shell"><SectionTitle>Tu cuenta y tus datos permanecen protegidos</SectionTitle><div>{landing.trust.map((item, i) => <article key={item}><span className="trust-icon"><img src={trustIconSources[i] ?? trustIconSources[0]} alt="" width="48" height="48" /></span>{item}</article>)}</div></section>

      <section id="planes" className="pricing shell"><SectionTitle>Planes para cada tipo de operación</SectionTitle><p className="pricing-intro">Empieza con 14 días gratis. Descubre todo lo que merchat puede hacer por tu operación y elige tu plan cuando estés listo.<br /><span>Obtén 50% de descuento en todos los planes.</span></p><div className="pricing-grid">{landing.plans.map((plan) => <article className={`price-card ${plan.featured ? 'featured' : ''}`} key={plan.name}>{plan.featured && <span className="popular">RECOMENDADO</span>}<div className="plan-header"><h3>{plan.name}</h3><p className="audience">{plan.audience}</p></div><p className="price"><del>S/{plan.originalPrice}</del><small>{plan.prefix}</small>S/{plan.price}<small> /mes</small><span className="price-discount">50% OFF</span></p><p className="setup">{plan.setup}</p><ul>{plan.items.map((item) => <li className={item.startsWith("Todo lo incluido") ? "feature-inherited" : undefined} key={item}><svg className="feature-check" viewBox="0 0 20 20" aria-hidden="true"><path d="m4.2 10.2 3.5 3.5 8-8" /></svg><span>{item}</span></li>)}</ul><Button outline={!plan.featured} href={plan.name === "Vendedor" || plan.name === "Vendedor Pro" ? siteConfig.trialUrl : siteConfig.whatsappUrl}>{plan.cta}</Button>{(plan.name === "Vendedor" || plan.name === "Vendedor Pro") && <p className="plan-note">Sin tarjeta</p>}</article>)}</div></section>

      <section id="faq" className="faq shell"><SectionTitle>Preguntas frecuentes</SectionTitle><div className="faq-grid">{landing.faqs.map(([question, answer]) => <article key={question}><details name="faq"><summary><span>{question}</span><span className="faq-toggle" aria-hidden="true" /></summary><p><FaqAnswer answer={answer} /></p></details></article>)}</div></section>

      <section id="ia-negocios" className="closing shell"><div><h2>¿Necesitas una <em>solución de IA para tu empresa?</em></h2><p>Diseñamos asistentes, automatizaciones y herramientas inteligentes para reducir trabajo manual y mejorar la forma en que trabaja tu equipo.</p><Button>Cuéntanos qué quieres automatizar</Button><small>Asistentes IA · Automatizaciones · Herramientas internas</small></div><div className="device-scene"><div className="laptop"><div className="screen"><b>{siteConfig.name}</b><strong>IA a medida</strong><div className="mini-line" /></div></div><div className="phone"><b>Proyectos</b><span>Activos</span></div><i /><i /></div></section>
      <footer className="site-footer shell">
        <div className="footer-main">
          <div className="footer-brand-block">
            <img className="footer-brand" src={siteConfig.brand.logo} alt={siteConfig.name} width={280} height={90} />
          </div>
          <nav className="footer-nav" aria-label="Enlaces del pie de página">
            <div className="footer-column">
              <h2>Producto</h2>
              <a href="#funciones"><span>Funciones</span></a>
              <a href="#planes"><span>Precios</span></a>
              <a href="#faq"><span>Preguntas frecuentes</span></a>
            </div>
            <div className="footer-column">
              <h2>Soluciones</h2>
              <a href="#ia-negocios"><span>IA para empresas</span></a>
              <a href={siteConfig.whatsappUrl}><span>Contacto</span></a>
            </div>
            <div className="footer-column">
              <h2>Legal</h2>
              <span className="footer-item"><span>Términos y condiciones</span></span>
              <span className="footer-item"><span>Política de privacidad</span></span>
            </div>
          </nav>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} {siteConfig.name}. Todos los derechos reservados.</span>
          <span>{siteConfig.name} es un servicio independiente y no está afiliado a Mercado Libre.</span>
        </div>
      </footer>
    </div>
  </main>;
}
