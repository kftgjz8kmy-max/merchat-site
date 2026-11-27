"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getUi } from "@/config/landing";
import { siteConfig } from "@/config/site";
import type { AppLocale } from "@/i18n/locales";
import { ClosingHeadline, OneMindShowcase, oneMindHeadlineTiming } from "./OneMindShowcase";
import { OneMindEmbedBridge } from "./OneMindEmbedBridge";

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

function mlAutomationHref(href: string, locale: AppLocale) {
  const target = new URL(href);
  target.searchParams.set("locale", locale);
  return target.toString();
}

function Button({ children, outline = false, href, icon = false, animated = false, hoverEffect = false }: { children: React.ReactNode; outline?: boolean; href: string; icon?: boolean; animated?: boolean; hoverEffect?: boolean }) {
  return <a className={`button ${outline ? "button-outline" : ""} ${animated ? "button-animated" : ""} ${hoverEffect ? "button-hover-effect" : ""}`} href={href}>{animated ? <span className="button-animated-content">{children}{icon && <HeroIcon name="arrow" size={17} />}</span> : <>{children}{icon && <HeroIcon name="arrow" size={17} />}</>}</a>;
}

function HeroIcon({ size }: { name: "arrow"; size: number }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 1.9, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true"><path {...common} d="M5 12h14M13 6l6 6-6 6"/></svg>;
}

export function OneMindBanner({ locale, embedded = false }: { locale: AppLocale; embedded?: boolean }) {
  const ui = getUi(locale);
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
  return (
    <>
      {embedded && <OneMindEmbedBridge sectionRef={oneMindBannerRef} />}
      <section id="ia-negocios" className="closing shell" ref={oneMindBannerRef} data-showcase-open={oneMindShowcaseOpen}>
        <OneMindShowcase
          sectionRef={oneMindBannerRef}
          embedded={embedded}
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
    </>
  );
}
