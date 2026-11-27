"use client";
/* eslint-disable @next/next/no-img-element -- Local video posters are already sized for this gallery. */

import { Fragment, useCallback, useEffect, useEffectEvent, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from "react";
import type { LandingUi } from "@/config/landing";
import { siteConfig } from "@/config/site";
import styles from "./OneMindShowcase.module.css";

const titleWrite = [1100, 1340, 1340];
const titleReadDuration = 1000;
const titleDock = titleWrite.map(spread => spread + 280 + titleReadDuration);
const wordTravel = 460;
const maxWordDelay = 32;
const demoStarts = titleDock.map(dock => dock + wordTravel + maxWordDelay + 18);
const clips = [
  { slug: "iphone-1", group: "avatar", name: "iPhone 14 Pro Max", part: 1 },
  { slug: "iphone-2", group: "avatar", name: "iPhone 14 Pro Max", part: 2 },
  { slug: "imac-1", group: "avatar", name: "iMac", part: 1 },
  { slug: "production-backstage", group: "production", nameKey: "oneMindBackstageClip", shortSource: true },
  { slug: "production-street", group: "production", nameKey: "oneMindStreetClip", shortSource: true },
  { slug: "production-cars", group: "production", nameKey: "oneMindCarsClip" },
] as const;
const clipDuration = 3000;
const lastClipDuration = 4500;
const galleryPortraitHold = 2500;
const galleryZoomDuration = 820;
const galleryOpeningDuration = galleryPortraitHold + galleryZoomDuration;
const galleryEnd = galleryOpeningDuration + (clips.length - 1) * clipDuration + lastClipDuration;
const clipEnds = clips.map((_, index) => index === clips.length - 1 ? galleryEnd : galleryOpeningDuration + (index + 1) * clipDuration);
const bookingStart = 3250;
const bookingSwipeDuration = 540;
const chapterFadeDuration = 440;
const chapterRowDelay = 650;
const storeViewChanged = 680;
const storeAdded = 1500;
const chatTyping = 420;
const chatTypingEnd = 2100;
const chatSend = 2250;
const chatReply = 3300;
const chatReplyEnd = 6100;
const chatTurn = 7350;
const chatHistoryStart = chatTurn + chatReplyEnd;
const chatReviewDuration = 2400;
const chatScrollDuration = 560;
const chatCharacterStep = 28;
const chatCues = [
  ...[0, chatTurn].flatMap(start => [
    start,
    ...Array.from({ length: (chatTypingEnd - chatTyping) / chatCharacterStep + 1 }, (_, index) => start + chatTyping + index * chatCharacterStep),
    start + chatSend,
    ...Array.from({ length: (chatReplyEnd - chatReply) / chatCharacterStep + 1 }, (_, index) => start + chatReply + index * chatCharacterStep),
  ]),
  ...Array.from({ length: chatScrollDuration / 16 }, (_, index) => chatTurn + (index + 1) * 16),
].sort((first, second) => first - second);
const demoCues = [[0, chapterRowDelay, storeViewChanged, storeAdded, bookingStart, bookingStart + bookingSwipeDuration, bookingStart + 950, bookingStart + 1900, bookingStart + 2860], chatCues, [0, ...clipEnds]];
const sceneStarts = [bookingStart + 4400 + chapterFadeDuration, chatHistoryStart + chatReviewDuration + chapterFadeDuration].reduce((starts, duration, index) => {
  starts.push(starts[index] + demoStarts[index] + duration);
  return starts;
}, [0]);
const sceneContentEnds = sceneStarts.slice(1).map(end => end - chapterFadeDuration);
const closingStart = sceneStarts[2] + demoStarts[2] + galleryEnd + 1000;
const closingGallerySlideStart = closingStart - 740;
const closingGallerySlideEnd = closingStart - 90;
// The opening renderer finishes lighting the contour at 6,200 ms.
const closingRebuildEnd = 6200;
const closingPlaceEnd = closingRebuildEnd + 540;
export const oneMindHeadlineTiming = { leadIn: 520, secondPhrase: 1180, hold: 2350, lift: 960 };
const closingHeadlineStart = closingPlaceEnd + oneMindHeadlineTiming.leadIn;
const closingLiftStart = closingHeadlineStart + oneMindHeadlineTiming.hold;
const closingLiftEnd = closingLiftStart + oneMindHeadlineTiming.lift;
const closingBodyStart = closingLiftEnd + 120;
const closingBodyEnd = closingBodyStart + 1500;
const closingActionStart = closingBodyEnd + 650;
const closingActionPeak = closingActionStart + 270;
const closingCopyEnd = closingActionStart + 480;
const closingPulseStart = closingCopyEnd + 200;
const closingPulseEnd = closingPulseStart + 1210;
const showcaseEnd = closingStart + closingPulseEnd + 1;
const closingGallerySlideCues = Array.from(
  { length: Math.ceil((closingGallerySlideEnd - closingGallerySlideStart) / 16) },
  (_, index) => closingGallerySlideStart + index * 16,
);
const closingCues = [
  ...Array.from({ length: Math.ceil(closingPulseEnd / 16) }, (_, index) => index * 16),
  closingPulseEnd,
];
const cues = [...demoCues.flatMap((beats, index) => [
  sceneStarts[index],
  sceneStarts[index] + titleDock[index],
  ...beats.map(beat => sceneStarts[index] + demoStarts[index] + beat),
  ...(index < 2 ? [sceneContentEnds[index]] : []),
]), ...closingGallerySlideCues, closingGallerySlideEnd, ...closingCues.map(at => closingStart + at)];
const mediaPath = "/animations/one-mind/showcase/";
const dates = Array.from({ length: 7 }, (_, index) => new Date(Date.UTC(2026, 4, 18 + index)));
const times = ["09:00", "10:30", "14:00"];

function useSceneClock(open: boolean, visible: boolean) {
  const elapsed = useRef(0);
  const [cue, setCue] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const [run, setRun] = useState(0);

  function seek(scene: number, reducedMotion: boolean, exampleOffset = 0) {
    const closing = scene === 3;
    const end = closing || scene === 2 ? showcaseEnd : sceneContentEnds[scene];
    elapsed.current = reducedMotion ? end - 1 : closing ? closingStart : sceneStarts[scene];
    if (!reducedMotion && !closing && exampleOffset) elapsed.current += demoStarts[scene] + exampleOffset;
    if (reducedMotion && scene === 0 && !exampleOffset) elapsed.current = demoStarts[0] + storeAdded;
    if (reducedMotion && scene === 2) elapsed.current = sceneStarts[2] + demoStarts[2];
    setCue(cues.findLast(at => at <= elapsed.current) ?? 0);
    setAtEnd(reducedMotion);
    setPlaying(!reducedMotion);
    setRun(previous => previous + 1);
  }

  useEffect(() => {
    if (!open || !visible || !playing) return;
    let frame: number;
    let previous: number | undefined;
    let previousCue = cues.findLast(at => at <= elapsed.current);

    function advance(now: number) {
      elapsed.current = Math.min(showcaseEnd - 1, elapsed.current + (previous === undefined ? 0 : now - previous));
      previous = now;
      const nextCue = cues.findLast(at => at <= elapsed.current);
      if (nextCue !== previousCue) {
        previousCue = nextCue;
        setCue(nextCue ?? 0);
      }
      if (elapsed.current >= showcaseEnd - 1) {
        setPlaying(false);
        setAtEnd(true);
      } else {
        frame = requestAnimationFrame(advance);
      }
    }

    frame = requestAnimationFrame(advance);
    return () => cancelAnimationFrame(frame);
  }, [open, visible, playing, run]);

  return { cue, elapsed, playing, atEnd, run, seek, setPlaying };
}

const storePhotos = [mediaPath + "urban-sneaker-profile.webp", mediaPath + "urban-sneaker-angle.webp"];

function PointerIcon() {
  return <svg viewBox="0 0 20 24"><path d="M2 2v17l4.5-4.3 3.4 7 3-1.5-3.4-6.7 6.4-.4Z" /></svg>;
}

function StoreScene({ ui, locale, cue, moving, onInteract }: { ui: LandingUi; locale: string; cue: number; moving: boolean; onInteract: () => void }) {
  const [selectedView, setSelectedView] = useState<number | null>(null);
  const [cartOverride, setCartOverride] = useState<boolean | null>(null);
  const storeRef = useRef<HTMLDivElement>(null);
  const viewTarget = useRef<HTMLButtonElement>(null);
  const cartTarget = useRef<HTMLButtonElement>(null);
  const view = selectedView ?? Number(cue >= storeViewChanged);
  const added = cartOverride ?? cue >= storeAdded;

  useLayoutEffect(() => {
    const store = storeRef.current;
    const thumbnail = viewTarget.current;
    const button = cartTarget.current;
    if (!store || !thumbnail || !button) return;
    const placePointer = () => {
      const origin = store.getBoundingClientRect();
      for (const [name, target] of [["view", thumbnail], ["cart", button]] as const) {
        const box = target.getBoundingClientRect();
        store.style.setProperty(`--store-${name}-x`, `${box.left - origin.left + Math.min(box.width / 2, 30)}px`);
        store.style.setProperty(`--store-${name}-y`, `${box.top - origin.top + box.height / 2}px`);
      }
    };
    placePointer();
    const observer = new ResizeObserver(placePointer);
    observer.observe(store);
    observer.observe(button);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={storeRef} className={styles.store} data-store-added={added}>
      <header>
        <strong>{ui.oneMindStoreTitle}</strong>
        <span className={styles.cart} aria-label={ui.oneMindCart + ": " + Number(added)}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8h14l1 12H4L5 8Zm4 1V6a3 3 0 0 1 6 0v3" /></svg>
          <b>{Number(added)}</b>
        </span>
      </header>
      <div className={styles.product}>
        <div className={styles.productMedia}>
          <img key={view} className={styles.productPhoto} src={storePhotos[view]} alt={ui.oneMindStoreProduct} width="640" height="512" />
          <div className={styles.productViews}>
            {storePhotos.map((photo, index) => (
              <button key={photo} ref={index === 1 ? viewTarget : undefined} type="button" aria-label={`${ui.oneMindProductView} ${index + 1}`} aria-pressed={view === index} onClick={() => {
                onInteract();
                setSelectedView(index);
              }}>
                <img src={photo} alt="" width="36" height="28" />
              </button>
            ))}
          </div>
        </div>
        <div>
          <strong>{ui.oneMindStoreProduct}</strong>
          <span>{new Intl.NumberFormat(locale, { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(79)}</span>
          <button ref={cartTarget} type="button" className={styles.cartAction} aria-pressed={added} onClick={() => {
            onInteract();
            setCartOverride(!added);
          }}>{added ? ui.oneMindAddedToCart : ui.oneMindAddToCart}</button>
        </div>
      </div>
      {selectedView === null && cartOverride === null && (
        <span className={`${styles.demoPointer} ${styles.storePointer}`} data-moving={moving} aria-hidden="true"><PointerIcon /></span>
      )}
    </div>
  );
}

function BookingScene({ locale, ui, cue, moving }: { locale: string; ui: LandingUi; cue: number; moving: boolean }) {
  const weekday = new Intl.DateTimeFormat(locale, { weekday: "short", timeZone: "UTC" });
  const month = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric", timeZone: "UTC" });
  return (
    <div className={styles.booking} data-booking-step={cue >= 2860 ? "confirmed" : cue >= 1900 ? "time" : cue >= 950 ? "date" : "start"}>
      <div className={styles.bookingHeader}>
        <span className={styles.appIcon} aria-hidden="true">
          <svg viewBox="0 0 24 24"><rect x="4" y="6" width="16" height="14" rx="2" /><path d="M8 4v4m8-4v4M4 10h16" /></svg>
        </span>
        <div><strong>{ui.oneMindBookingTitle}</strong><span>{month.format(dates[0])}</span></div>
      </div>
      <div className={styles.dateGrid}>
        {dates.map((date, index) => (
          <span key={date.toISOString()} data-selected={index === 3 && cue >= 950}>
            <small>{weekday.format(date)}</small><b>{date.getUTCDate()}</b>
          </span>
        ))}
      </div>
      <div className={styles.slots}>
        {cue >= 950 && <>
          <span>{ui.oneMindTimes}</span>
          <div>{times.map((time, index) => <b key={time} data-selected={index === 1 && cue >= 1900}>{time}</b>)}</div>
        </>}
      </div>
      <div className={styles.bookingAction} data-confirmed={cue >= 2860}>
        {cue >= 2860 && <span aria-hidden="true">✓</span>}
        {cue >= 2860 ? ui.oneMindConfirmed : ui.oneMindConfirm}
      </div>
      <span className={styles.demoPointer} data-moving={moving} aria-hidden="true">
        <PointerIcon />
      </span>
    </div>
  );
}

function revealChatText(text: string, progress: number) {
  const characters = Array.from(text);
  return characters.slice(0, Math.floor(characters.length * Math.max(0, Math.min(1, progress)))).join("");
}

function ChatScene({ ui, cue, onBrowse }: { ui: LandingUi; cue: number; onBrowse: () => void }) {
  const threadRef = useRef<HTMLDivElement>(null);
  const positioned = useRef(false);
  const secondTurn = cue >= chatTurn;
  const historyReady = cue >= chatHistoryStart;

  useLayoutEffect(() => {
    const thread = threadRef.current;
    const latestTurn = thread?.lastElementChild;
    if (!thread || !latestTurn || !secondTurn || (historyReady && positioned.current)) return;
    const target = latestTurn.getBoundingClientRect().top - thread.getBoundingClientRect().top + thread.scrollTop;
    const progress = Math.min(1, (cue - chatTurn) / chatScrollDuration);
    thread.scrollTop = target * (progress * progress * (3 - 2 * progress));
    positioned.current = true;
  }, [cue, historyReady, secondTurn]);

  return (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- The history scrolls with the keyboard.
    <div tabIndex={historyReady ? 0 : undefined}
      ref={threadRef}
      className={styles.chatThread}
      role="region"
      aria-label={ui.oneMindMerchat}
      data-history={historyReady}
      onFocus={historyReady ? onBrowse : undefined}
      onWheel={historyReady ? onBrowse : undefined}
      onTouchMove={historyReady ? onBrowse : undefined}
    >
      <ChatTurn prompt={ui.oneMindPromotionPrompt} reply={ui.oneMindPromotionReply} thinking={ui.oneMindPromotionThinking}
        time={cue} />
      {secondTurn && (
        <ChatTurn prompt={ui.oneMindExcelPrompt} reply={ui.oneMindExcelReply} thinking={ui.oneMindExcelThinking}
          file={ui.oneMindExcelFile} time={cue - chatTurn} />
      )}
    </div>
  );
}

function ChatTurn({ prompt, reply, thinking, file, time }: {
  prompt: string; reply: string; thinking: string; file?: string; time: number;
}) {
  const question = revealChatText(prompt, (time - chatTyping) / (chatTypingEnd - chatTyping));
  const response = revealChatText(reply, (time - chatReply) / (chatReplyEnd - chatReply));

  return (
    <div className={styles.chatScrollItem}>
      <div className={styles.chat}>
        <div className={styles.chatPrompt}>
          {file && <span className={styles.chatFile}>{file}</span>}
          <span className={styles.chatMention}><img src={siteConfig.brand.icon} width="18" height="18" alt="" />merchat</span> {question}
          {time < chatTypingEnd && <span className={styles.chatCaret} aria-hidden="true" />}
        </div>
        {time >= chatSend && time < chatReply && (
          <div className={styles.chatThinking}>
            <span aria-hidden="true"><i /><i /><i /></span>{thinking}
          </div>
        )}
        {time >= chatReply && (
          <p className={styles.chatAnswer}>{response}{time < chatReplyEnd && <span className={styles.chatCaret} aria-hidden="true" />}</p>
        )}
      </div>
    </div>
  );
}

function SceneHeading({ title, spread, docked, showDemo }: {
  title: string; spread: number; docked: boolean; showDemo: boolean;
}) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const lineRef = useRef<HTMLSpanElement>(null);
  const lineScale = useRef(1);
  const letters = Array.from(title);
  const letterStyle = (index: number) => ({
    "--letter-delay": `${index * spread / Math.max(1, letters.length - 1)}ms`,
  } as CSSProperties);

  const parts = (title.includes(" ") ? title.split(/( +)/) : letters).map(part => Array.from(part));

  useLayoutEffect(() => {
    const line = lineRef.current;
    const viewport = line?.parentElement;
    if (!line || !viewport || showDemo) return;

    function fitLine() {
      if (!line || !viewport || !line.offsetWidth) return;
      lineScale.current = Math.min(1, (viewport.clientWidth - 8) / line.offsetWidth);
      line.style.setProperty("--line-scale", String(lineScale.current));
    }

    fitLine();
    const observer = new ResizeObserver(fitLine);
    observer.observe(viewport);
    observer.observe(line);
    return () => observer.disconnect();
  }, [title, showDemo]);

  useLayoutEffect(() => {
    if (!docked || showDemo || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const heading = headingRef.current;
    if (!heading) return;
    const source = heading.querySelectorAll<HTMLElement>("[data-written-word]");
    const destination = heading.querySelectorAll<HTMLElement>("[data-docked-word]");
    destination.forEach((word, index) => {
      const start = source[index].getBoundingClientRect();
      const end = word.getBoundingClientRect();
      word.style.setProperty("--word-x", `${start.left - end.left}px`);
      word.style.setProperty("--word-y", `${start.top - end.top}px`);
      word.style.setProperty("--word-scale", String(start.height / Math.max(1, end.height)));
      word.style.setProperty("--word-scale-x", String(lineScale.current * start.height / Math.max(1, end.height)));
      word.style.setProperty("--word-delay", `${Math.min(index * 5, maxWordDelay)}ms`);
    });
    heading.setAttribute("data-word-flight", "");
    return () => heading.removeAttribute("data-word-flight");
  }, [docked, showDemo]);

  return (
    <h2 ref={headingRef} aria-label={title} style={{ "--word-travel": `${wordTravel}ms` } as CSSProperties}>
      <span className={styles.dockedTitle} aria-hidden="true">
        {parts.map((glyphs, index) => glyphs[0] === " " ? glyphs.join("") : (
          <span key={index} data-docked-word>{glyphs.join("")}</span>
        ))}
      </span>
      <span className={styles.writtenTitle} aria-hidden="true">
        <span className={styles.writtenLine} ref={lineRef}>
          {parts.map((glyphs, index) => {
            if (glyphs[0] === " ") return glyphs.join("");
            const start = parts.slice(0, index).reduce((total, previous) => total + previous.length, 0);
            return (
              <span key={index} className={styles.pencilWord} data-written-word>
                {glyphs.map((letter, offset) => (
                  <span key={offset} className={styles.pencilLetter} data-glyph={letter} style={letterStyle(start + offset)}>
                    <span>{letter}</span>
                  </span>
                ))}
              </span>
            );
          })}
        </span>
      </span>
    </h2>
  );
}

type FullscreenVideo = HTMLVideoElement & {
  webkitSupportsFullscreen?: boolean;
  webkitEnterFullscreen?: () => void;
};

function VideoScene({ ui, active, visible, animateOpening, onSelect, onBrowse, onEnd, onExpand, run }: {
  ui: LandingUi; active: number; visible: boolean; animateOpening: boolean;
  onSelect: (index: number) => void; onBrowse: () => void; onEnd: () => void; onExpand: () => void; run: number;
}) {
  const showingAvatars = clips[active].group === "avatar";
  const [openingFinished, setOpeningFinished] = useState(false);
  const opening = animateOpening && !openingFinished && active === 0;
  const chapterRef = useRef<HTMLDivElement>(null);
  const openingClipRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<FullscreenVideo>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const positioned = useRef(false);
  const browsing = useRef(false);
  const scrollEnd = useRef<number | undefined>(undefined);

  useLayoutEffect(() => {
    const chapter = chapterRef.current;
    const clip = openingClipRef.current;
    if (!opening || !chapter || !clip) return;

    function measure() {
      if (!chapter || !clip) return;
      const area = chapter.getBoundingClientRect();
      const slot = clip.getBoundingClientRect();
      const focus = Number(getComputedStyle(clip).getPropertyValue("--avatar-focus"));
      chapter.style.setProperty("--opening-width", `${area.width / focus}px`);
      chapter.style.setProperty("--opening-height", `${area.height / focus}px`);
      chapter.style.setProperty("--opening-x", `${area.left + area.width / 2 - slot.left - slot.width / 2}px`);
      chapter.style.setProperty("--opening-y", `${area.top + area.height / 2 - slot.top - slot.height / 2}px`);
    }

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(chapter);
    observer.observe(clip);
    return () => observer.disconnect();
  }, [opening]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const center = (smooth: boolean) => {
      const selected = track.querySelector<HTMLButtonElement>('[data-selected="true"]');
      if (!selected) return;
      track.scrollTo({
        left: selected.offsetLeft + (selected.offsetWidth - track.clientWidth) / 2,
        behavior: smooth && !window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "smooth" : "instant",
      });
    };

    center(positioned.current);
    positioned.current = true;
    let width = track.clientWidth;
    const observer = new ResizeObserver(() => {
      if (track.clientWidth === width) return;
      width = track.clientWidth;
      center(false);
    });
    observer.observe(track);
    return () => observer.disconnect();
  }, [active, run]);

  useEffect(() => () => window.clearTimeout(scrollEnd.current), []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (visible) void video.play().catch(() => {});
    else video.pause();
  }, [active, visible, run]);

  function expandClip() {
    const video = videoRef.current;
    if (!video) return;

    if (document.fullscreenEnabled && video.requestFullscreen) {
      video.controls = true;
      void video.requestFullscreen().then(() => {
        const restoreInline = () => {
          if (document.fullscreenElement === video) return;
          video.controls = false;
          document.removeEventListener("fullscreenchange", restoreInline);
        };
        document.addEventListener("fullscreenchange", restoreInline);
        restoreInline();
      }, () => { video.controls = false; });
    } else if (video.webkitSupportsFullscreen && video.webkitEnterFullscreen) {
      video.webkitEnterFullscreen();
    } else {
      return;
    }
    onExpand();
    video.currentTime = 0;
    void video.play().catch(() => {});
  }

  function choose(index: number) {
    browsing.current = false;
    window.clearTimeout(scrollEnd.current);
    onSelect(index);
  }

  function handleScroll() {
    const track = trackRef.current;
    if (!track || !browsing.current) return;
    onBrowse();
    window.clearTimeout(scrollEnd.current);
    scrollEnd.current = window.setTimeout(() => {
      const center = track.scrollLeft + track.clientWidth / 2;
      const items = [...track.querySelectorAll<HTMLButtonElement>("[data-selected]")];
      const distance = (item: HTMLButtonElement) => Math.abs(item.offsetLeft + item.offsetWidth / 2 - center);
      const nearest = items.reduce((best, item, index) => distance(item) < distance(items[best]) ? index : best, 0);
      choose(nearest);
    }, 160);
  }

  return (
    <div ref={chapterRef} className={styles.videoChapter} data-gallery-opening={opening}
      style={opening ? {
        "--gallery-portrait-hold": `${galleryPortraitHold}ms`,
        "--gallery-zoom-duration": `${galleryZoomDuration}ms`,
      } as CSSProperties : undefined}>
      <div className={styles.videoLabels}>
        <h3 data-current={showingAvatars} aria-hidden={!showingAvatars}>{ui.oneMindAvatarTitle}</h3>
        <h3 data-current={!showingAvatars} aria-hidden={showingAvatars}>{ui.oneMindProductionTitle}</h3>
      </div>
      <div className={styles.carousel}>
        <button className={styles.avatarArrow} type="button" aria-label={ui.oneMindPreviousAvatar} inert={opening} disabled={active === 0} onClick={() => choose(active - 1)}>
          <svg viewBox="0 0 20 20" aria-hidden="true"><path d="m12 5-5 5 5 5" /></svg>
        </button>
        <div
          ref={trackRef}
          className={styles.gallery}
          inert={opening}
          role="group"
          aria-label={ui.oneMindVideos}
          onScroll={handleScroll}
          onTouchStart={() => { browsing.current = true; }}
          onWheel={event => { if (Math.abs(event.deltaX) > 0 || event.shiftKey) browsing.current = true; }}
        >
          {clips.map((clip, index) => {
            const source = mediaPath + clip.slug;
            const label = clip.group === "avatar" ? `${clip.name} · ${ui.oneMindPart} ${clip.part}` : ui[clip.nameKey];
            return (
              <div
                key={clip.slug}
                ref={index === 0 ? openingClipRef : undefined}
                className={styles.clip}
                data-selected={active === index}
              >
                <div className={styles.clipVisual} onAnimationEnd={opening && index === 0 ? event => {
                  if (event.target === event.currentTarget) setOpeningFinished(true);
                } : undefined}>
                  <button className={styles.clipSelect} type="button" aria-label={`${ui.oneMindPlayClip} ${label}`}
                    aria-pressed={active === index} onClick={() => choose(index)} />
                  {active === index ? (
                    <>
                      <video ref={videoRef} key={run} src={source + ("shortSource" in clip ? ".mp4" : "-10s.mp4")} poster={source + ".jpg"} muted playsInline preload="metadata" aria-label={label} onEnded={onEnd} />
                      <button className={styles.clipFullscreen} type="button" onClick={expandClip}
                        aria-label={ui.oneMindFullscreen} title={ui.oneMindFullscreen}>
                        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 4H4v5m11-5h5v5m0 6v5h-5m-6 0H4v-5" /></svg>
                      </button>
                    </>
                  ) : (
                    <img src={source + ".jpg"} alt="" loading="lazy" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <button className={styles.avatarArrow} type="button" aria-label={ui.oneMindNextAvatar} inert={opening} disabled={active === clips.length - 1} onClick={() => choose(active + 1)}>
          <svg viewBox="0 0 20 20" aria-hidden="true"><path d="m8 5 5 5-5 5" /></svg>
        </button>
      </div>
    </div>
  );
}

function closingProgress(time: number, start: number, end: number) {
  const progress = Math.max(0, Math.min(1, (time - start) / (end - start)));
  return progress * progress * (3 - 2 * progress);
}

function HeadlineLetters({ text, spread }: { text: string; spread: number }) {
  const letters = Array.from(text);
  return letters.map((letter, index) => letter === " " ? (
    <Fragment key={index}>{" "}</Fragment>
  ) : (
    <span key={index} style={{
      animationDelay: `calc(var(--one-phrase-delay, 0ms) + ${Math.round(spread * index / Math.max(1, letters.length - 1))}ms)`,
    }}>{letter}</span>
  ));
}

export function ClosingHeadline({ title, emphasis, className, headline, time }: {
  title: string; emphasis: string; className?: string; headline?: RefObject<HTMLHeadingElement | null>;
  time?: number;
}) {
  const animationTime = time === undefined ? undefined : Math.min(Math.max(0, time), oneMindHeadlineTiming.hold);
  useLayoutEffect(() => {
    if (animationTime === undefined || !headline?.current) return;
    for (const animation of headline.current.getAnimations({ subtree: true })) {
      animation.currentTime = animationTime;
    }
  }, [headline, animationTime]);

  return (
    <h2 ref={headline} className={`closing-headline${className ? ` ${className}` : ""}`}
      aria-label={`${title} ${emphasis}`} aria-hidden={time !== undefined && time < oneMindHeadlineTiming.secondPhrase}
      data-outro-headline={time === undefined ? undefined : true} data-headline-pending={time !== undefined && time < 0}>
      <span className="closing-headline-idea"><HeadlineLetters text={title} spread={530} /></span>
      {" "}
      <span className="closing-headline-result" style={{ "--one-phrase-delay": `${oneMindHeadlineTiming.secondPhrase}ms` } as CSSProperties}>
        <span><HeadlineLetters text={emphasis} spread={565} /></span>
      </span>
    </h2>
  );
}

function ClosingScene({ time, ui, contactUrl, chapterLogo }: {
  time: number; ui: LandingUi; contactUrl: string; chapterLogo: RefObject<HTMLImageElement | null>;
}) {
  const logo = useRef<HTMLIFrameElement>(null);
  const pose = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const headline = useRef<HTMLHeadingElement>(null);
  const [logoReady, setLogoReady] = useState(false);
  const started = time >= 0;
  const logoTime = time >= closingPlaceEnd && time < closingLiftStart ? closingPlaceEnd
    : time >= closingLiftEnd && time < closingPulseStart ? closingLiftEnd
    : time;
  const syncLogo = useEffectEvent(() => {
    if (!logoReady || !started || !stage.current || !pose.current || !chapterLogo.current) return;
    const area = stage.current.getBoundingClientRect();
    const mark = pose.current.getBoundingClientRect();
    const origin = chapterLogo.current.getBoundingClientRect();
    if (!area.width || !area.height) return;
    logo.current?.contentWindow?.postMessage({
      type: "one-mind:rebuild",
      progress: Math.min(1, time / closingRebuildEnd),
      pulse: Math.max(0, Math.min(1, (time - closingPulseStart) / (closingPulseEnd - closingPulseStart))),
      x: (mark.left + mark.width / 2 - area.left) / area.width,
      y: (mark.top + mark.height / 2 - area.top) / area.height,
      width: mark.width / area.width,
      originX: (origin.left + origin.width * .46 - area.left) / area.width,
      originY: (origin.top + origin.height * .39 - area.top) / area.height,
      originWidth: origin.width / area.width,
    }, "*");
  });
  useLayoutEffect(() => {
    const target = stage.current;
    const title = headline.current;
    if (!target || !title || !started) return;
    const measure = () => {
      target.style.setProperty("--slogan-space", `${title.offsetHeight / 2 + 10}px`);
      syncLogo();
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(target);
    observer.observe(title);
    return () => observer.disconnect();
  }, [started]);
  useLayoutEffect(() => {
    syncLogo();
  }, [logoReady, started, logoTime]);

  const bodyReveal = closingProgress(time, closingBodyStart, closingBodyEnd);
  const bodySweeping = bodyReveal > 0 && bodyReveal < 1;
  const bodyEdge = `${bodyReveal * 118 - 18}%`;
  const action = closingProgress(time, closingActionStart, closingActionStart + 190);
  const actionRise = closingProgress(time, closingActionStart, closingActionPeak);
  const actionSettle = closingProgress(time, closingActionPeak, closingCopyEnd);
  const actionScale = .84 + .245 * actionRise - .085 * actionSettle;
  const actionOffset = 12 - 15 * actionRise + 3 * actionSettle;

  return (
    <div ref={stage} className={styles.outro} data-one-mind-outro data-outro-started={started} inert={!started}
      style={{
        "--outro-place": closingProgress(time, closingRebuildEnd, closingPlaceEnd),
        "--outro-lift": closingProgress(time, closingLiftStart, closingLiftEnd),
      } as CSSProperties}>
      <div ref={pose} className={styles.outroMark} aria-hidden="true" />
      <iframe ref={logo} className={styles.outroLogo} src="/animations/one-mind/index.html?rebuild=1"
        title="ONE MIND" aria-hidden="true" tabIndex={-1} sandbox="allow-scripts" onLoad={() => setLogoReady(true)} />
      <div className={styles.outroCopy}>
        <ClosingHeadline title={ui.closingTitle} emphasis={ui.closingEmphasis} className={styles.outroHeadline}
          headline={headline} time={time - closingHeadlineStart} />
        <div className={styles.outroDetails}>
          <p className={styles.outroBody} data-sweeping={bodySweeping}
            style={{ visibility: bodyReveal === 0 ? "hidden" : undefined, "--body-edge": bodyEdge } as CSSProperties}
            aria-hidden={bodyReveal < 1}>
            <span className={styles.outroBodyInk}>{ui.closingBody}</span>
            {bodySweeping && <span className={styles.outroBodyTrace} aria-hidden="true">{ui.closingBody}</span>}
          </p>
          <div inert={time < closingCopyEnd} style={{ opacity: action, scale: actionScale, translate: `0 ${actionOffset}px` }}>
            <a href={contactUrl} className="button">{ui.closingCta}<span aria-hidden="true">→</span></a>
          </div>
        </div>
      </div>
    </div>
  );
}

export function OneMindShowcase({
  sectionRef, open, introFinished, introActive, introPaused, onToggleIntro, onStartWithAudio, onOpen, onReplay,
  ui, locale, contactUrl, children,
}: {
  sectionRef: RefObject<HTMLElement | null>;
  open: boolean;
  introFinished: boolean;
  introActive: boolean;
  introPaused: boolean;
  onToggleIntro: () => void;
  onStartWithAudio: () => void;
  onOpen: () => void;
  onReplay: () => void;
  ui: LandingUi;
  locale: string;
  contactUrl: string;
  children: ReactNode;
}) {
  const [visible, setVisible] = useState(false);
  const [activeTab, setActiveTab] = useState(true);
  const [manualClip, setManualClip] = useState<number | null>(null);
  const [clipPlayback, setClipPlayback] = useState<"playing" | "paused" | "ended">("paused");
  const [clipRun, setClipRun] = useState(0);
  const [examplesReady, setExamplesReady] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const soundtrack = useRef<HTMLAudioElement>(null);
  const musicChapterSeek = useRef(false);
  const chapterLogo = useRef<HTMLImageElement>(null);
  const [sound, setSound] = useState<"on" | "off" | "blocked">("on");
  const [sharedStart, setSharedStart] = useState<"normal" | "pending" | "blocked" | "started">("normal");
  const startingSharedAudio = useRef(false);
  const awaitingSharedAudio = sharedStart === "pending" || sharedStart === "blocked";
  const introHold = useRef(240);
  const { cue, elapsed, playing, atEnd, run, seek, setPlaying } = useSceneClock(open && examplesReady, visible && activeTab);
  const closing = open && cue >= closingStart;
  const gallerySliding = cue >= closingGallerySlideStart;
  const closingTime = cue - closingStart;
  const scene = cue >= sceneStarts[2] ? 2 : cue >= sceneStarts[1] ? 1 : 0;
  const chapterCue = cue - sceneStarts[scene];
  const demoCue = chapterCue - demoStarts[scene];
  const showDemo = demoCue >= 0;
  const showChapters = examplesReady && cue >= demoStarts[0] + chapterRowDelay;
  const advancing = examplesReady && visible && activeTab && playing;
  const booking = scene === 0 && demoCue >= bookingStart;
  const swiping = booking && demoCue < bookingStart + bookingSwipeDuration;
  const leaving = scene < 2 && cue >= sceneContentEnds[scene];
  const chapterLinks = [
    { id: "store", label: ui.oneMindStoreChapter, scene: 0, offset: 0, active: scene === 0 && !booking },
    { id: "booking", label: ui.oneMindAgenda, scene: 0, offset: bookingStart + bookingSwipeDuration, active: booking },
    { id: "chat", label: ui.oneMindAgentChapter, scene: 1, offset: 0, active: scene === 1 },
    { id: "video", label: ui.oneMindVideos, scene: 2, offset: 0, active: scene === 2 },
  ];
  const titles = [ui.oneMindDigital, ui.oneMindAutomation, ui.oneMindContent];
  const digitalTitleUnits = Array.from(ui.oneMindDigital).reduce((total, letter) => total + (/\p{Script=Han}/u.test(letter) ? 2 : 1), 0);
  const centeredTitleFactor = 1.53 / Math.max(1, digitalTitleUnits);
  const automaticClip = clipEnds.findLastIndex(end => end <= demoCue) + 1;
  const activeClip = manualClip ?? Math.min(clips.length - 1, automaticClip);
  const demoPlayback = manualClip !== null ? clipPlayback : atEnd ? "ended" : playing ? "playing" : "paused";
  const playback = open ? demoPlayback : introActive && !introPaused ? "playing" : "paused";
  const playbackLabel = playback === "playing" ? ui.oneMindPause
    : playback === "ended" ? ui.oneMindReplay
      : open || introActive ? ui.oneMindResume : ui.oneMindOpen;
  const soundLabel = sound === "on" ? ui.oneMindMuteMusic : ui.oneMindPlayWithMusic;
  const fullscreenLabel = fullscreen || expanded ? ui.oneMindExitFullscreen : ui.oneMindBannerFullscreen;
  const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const revealExamples = useCallback(() => {
    setExamplesReady(reducedMotion());
    onOpen();
  }, [onOpen]);

  useEffect(() => {
    const sync = () => setFullscreen(document.fullscreenElement === sectionRef.current);
    document.addEventListener("fullscreenchange", sync);
    return () => document.removeEventListener("fullscreenchange", sync);
  }, [sectionRef]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || !expanded) return;
    const exit = (event: KeyboardEvent) => {
      if (event.key === "Escape") setExpanded(false);
    };
    section.setAttribute("data-banner-expanded", "");
    document.documentElement.setAttribute("data-one-mind-expanded", "");
    document.addEventListener("keydown", exit);
    return () => {
      section.removeAttribute("data-banner-expanded");
      document.documentElement.removeAttribute("data-one-mind-expanded");
      document.removeEventListener("keydown", exit);
    };
  }, [expanded, sectionRef]);

  async function toggleFullscreen() {
    const section = sectionRef.current;
    if (!section) return;
    if (expanded) {
      setExpanded(false);
    } else if (document.fullscreenElement === section) {
      await document.exitFullscreen();
    } else if (document.fullscreenEnabled && section.requestFullscreen) {
      try {
        await section.requestFullscreen();
      } catch {
        setExpanded(true);
      }
    } else {
      setExpanded(true);
    }
  }

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    if (!("IntersectionObserver" in window)) return;
    const shared = new URLSearchParams(location.search).get("one-mind") === "fullscreen";
    const enterThreshold = 0.4;
    const exitThreshold = 0.25;
    let inView = false;
    const observer = new IntersectionObserver(([entry]) => {
      // The examples can make the banner taller without the viewer scrolling.
      inView = entry.intersectionRatio >= (inView ? exitThreshold : enterThreshold);
      if (inView && shared) setSharedStart(current => current === "normal" ? "pending" : current);
      setVisible(inView);
    }, { threshold: [exitThreshold, enterThreshold] });
    observer.observe(section);
    const tabVisibility = () => setActiveTab(!document.hidden);
    tabVisibility();
    document.addEventListener("visibilitychange", tabVisibility);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", tabVisibility);
    };
  }, [sectionRef]);

  const playMusic = useCallback((restart = false) => {
    const audio = soundtrack.current;
    if (!audio) return;
    if (restart) {
      audio.playbackRate = 1;
      audio.currentTime = 0;
    }
    void audio.play().catch(error => {
      if (error.name === "NotAllowedError") setSound(current => current === "on" ? "blocked" : current);
    });
  }, []);

  const startSharedAnimation = useCallback(() => {
    const audio = soundtrack.current;
    if (!audio || startingSharedAudio.current) return;

    startingSharedAudio.current = true;
    void audio.play().then(() => {
      onStartWithAudio();
      setSharedStart("started");
    }, () => {
      startingSharedAudio.current = false;
      setSharedStart("blocked");
    });
  }, [onStartWithAudio]);

  useEffect(() => {
    if (sharedStart === "pending" && visible && activeTab) startSharedAnimation();
  }, [sharedStart, visible, activeTab, startSharedAnimation]);

  const syncShowcaseMusic = useEffectEvent(() => {
    const audio = soundtrack.current;
    const remaining = (showcaseEnd - 1 - elapsed.current) / 1000;
    if (!audio || !Number.isFinite(audio.duration) || remaining <= 0) return;

    // A chapter jump can reposition the track. Automatic scene transitions keep playing through.
    if (musicChapterSeek.current) {
      musicChapterSeek.current = false;
      audio.currentTime = Math.max(0, audio.duration - remaining);
    }
    const rate = Math.min(1.15, Math.max(.85, (audio.duration - audio.currentTime) / remaining));
    if (Math.abs(audio.playbackRate - rate) > .001) audio.playbackRate = rate;
  });

  useEffect(() => {
    const audio = soundtrack.current;
    if (!audio || !open || !examplesReady || sound !== "on") return;
    const align = () => syncShowcaseMusic();
    align();
    audio.addEventListener("loadedmetadata", align);
    audio.addEventListener("playing", align);
    return () => {
      audio.removeEventListener("loadedmetadata", align);
      audio.removeEventListener("playing", align);
    };
  }, [open, examplesReady, run, sound]);

  useEffect(() => {
    if (awaitingSharedAudio) return;
    if (sound === "on" && visible && activeTab && playback === "playing") playMusic();
    else soundtrack.current?.pause();
  }, [awaitingSharedAudio, sound, visible, activeTab, playback, playMusic]);

  useEffect(() => {
    if (!introFinished || introPaused || open || !visible || !activeTab) return;
    const content = sectionRef.current?.querySelector(".closing-content");
    const began = performance.now();
    const onFocusOut = (event: Event) => {
      const nextFocus = (event as FocusEvent).relatedTarget;
      if (nextFocus instanceof Node && content?.contains(nextFocus)) return;
      revealExamples();
    };
    const timer = window.setTimeout(() => {
      if (content?.matches(":focus-within")) content.addEventListener("focusout", onFocusOut);
      else revealExamples();
    }, introHold.current);
    return () => {
      introHold.current = Math.max(0, introHold.current - (performance.now() - began));
      window.clearTimeout(timer);
      content?.removeEventListener("focusout", onFocusOut);
    };
  }, [introFinished, introPaused, open, visible, activeTab, revealExamples, sectionRef]);

  useEffect(() => {
    if (!open || examplesReady) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const revealWithoutMotion = (event: MediaQueryListEvent) => {
      if (event.matches) setExamplesReady(true);
    };
    preference.addEventListener("change", revealWithoutMotion);
    return () => preference.removeEventListener("change", revealWithoutMotion);
  }, [open, examplesReady]);

  function selectScene(index: number, instant = reducedMotion(), exampleOffset = 0) {
    musicChapterSeek.current = true;
    setManualClip(null);
    seek(index, instant, exampleOffset);
  }

  const selectPreviewChapter = useEffectEvent((id: string) => {
    const chapter = chapterLinks.find(link => link.id === id);
    if (!chapter && id !== "outro") return;
    if (!open && introActive && !introPaused) onToggleIntro();
    selectScene(chapter?.scene ?? 3, reducedMotion(), chapter?.offset);
    setExamplesReady(true);
    onOpen();
  });

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || new URLSearchParams(location.search).get("one-mind") !== "timeline") return;
    const jump = (event: Event) => selectPreviewChapter((event as CustomEvent<string>).detail);
    section.addEventListener("one-mind-preview-chapter", jump);
    section.setAttribute("data-preview-ready", "");
    return () => {
      section.removeEventListener("one-mind-preview-chapter", jump);
      section.removeAttribute("data-preview-ready");
    };
  }, [sectionRef]);

  function replayBanner() {
    introHold.current = reducedMotion() ? 900 : 240;
    setExamplesReady(false);
    selectScene(0, false);
    musicChapterSeek.current = false;
    onReplay();
  }

  function toggleSound() {
    if (sound === "on") {
      soundtrack.current?.pause();
      setSound("off");
      return;
    }
    setSound("on");
    playMusic(true);
    replayBanner();
  }

  function togglePlayback() {
    if (!open) {
      if (sound === "on" && playback === "paused") playMusic();
      if (introActive) onToggleIntro();
      else {
        selectScene(0);
        revealExamples();
      }
      return;
    }
    if (playback === "ended") {
      if (sound === "on") playMusic(true);
      replayBanner();
      return;
    }
    if (sound === "on" && playback === "paused") playMusic();
    if (manualClip !== null) {
      setClipPlayback(clipPlayback === "playing" ? "paused" : "playing");
      return;
    }
    setPlaying(!playing);
  }

  return (<>
    {/* eslint-disable-next-line jsx-a11y/media-has-caption -- Background music; the adjacent button controls playback. */}
    <audio ref={soundtrack} src="/animations/one-mind/soundtrack.m4a" preload="none" aria-hidden="true" />
    <div className={styles.screenViewport} style={{ "--centered-title-factor": centeredTitleFactor } as CSSProperties}>
      <div
        className={styles.screen}
        data-examples={open}
        data-ready={examplesReady}
        data-paused={playback === "paused"}
        data-outro-active={closing}
      >
        <div className={styles.front} inert={open} aria-hidden={open || undefined}>
          <div className={styles.frontContent} data-one-mind-front>{children}</div>
        </div>
        <div
          id="one-mind-examples"
          className={styles.panel}
          hidden={!open}
          inert={!examplesReady || gallerySliding}
          data-outro-sliding={gallerySliding}
          style={{
            "--chapter-fade-duration": `${chapterFadeDuration}ms`,
            ...(gallerySliding ? {
              "--outro-gallery-slide": closingProgress(cue, closingGallerySlideStart, closingGallerySlideEnd),
              "--outro-row-logo-opacity": 1 - closingProgress(closingTime, 525, 1425),
              "--outro-white": closingProgress(closingTime, 0, 650),
            } : {}),
          } as CSSProperties}
          onAnimationEnd={event => {
            if (event.target === event.currentTarget) setExamplesReady(true);
          }}
        >
          {open && <>
            <div
              className={styles.stage}
              data-chapter={scene}
              data-moving={advancing}
              data-leaving={leaving}
              inert={leaving}
              key={`${scene}-${run}`}
            >
              <div className={styles.stageCopy} data-docked={chapterCue >= titleDock[scene]} data-copy-ready={showDemo}>
                <SceneHeading title={titles[scene]} spread={titleWrite[scene]} docked={chapterCue >= titleDock[scene]} showDemo={showDemo} />
              </div>
              <div className={styles.window} data-visible={showDemo} inert={!showDemo}>
                {(showDemo || scene === 1) && <div className={styles.scene} data-scene={scene}>
                  {scene === 0 && (
                    <div
                      className={styles.exampleFrame}
                      data-swiping={swiping}
                      style={{ "--booking-swipe-duration": `${bookingSwipeDuration}ms` } as CSSProperties}
                    >
                      <div className={styles.exampleCard} data-example="store" data-active={!booking || swiping} inert={booking}>
                        <StoreScene ui={ui} locale={locale} cue={demoCue} moving={!booking && advancing} onInteract={() => setPlaying(false)} />
                      </div>
                      <div className={styles.exampleCard} data-example="booking" data-active={booking} inert={!booking}>
                        <BookingScene locale={locale} ui={ui} cue={demoCue - bookingStart} moving={booking && advancing} />
                      </div>
                    </div>
                  )}
                  {scene === 1 && <ChatScene ui={ui} cue={demoCue} onBrowse={() => setPlaying(false)} />}
                  {scene === 2 && (
                    <VideoScene
                      ui={ui}
                      active={activeClip}
                      animateOpening={!atEnd && !reducedMotion()}
                      visible={examplesReady && visible && activeTab && (manualClip === null ? playing && demoCue < galleryEnd : clipPlayback === "playing")}
                      run={clipRun}
                      onBrowse={() => setPlaying(false)}
                      onEnd={() => setClipPlayback("ended")}
                      onExpand={() => {
                        setPlaying(false);
                        setManualClip(activeClip);
                        setClipPlayback("playing");
                      }}
                      onSelect={index => {
                        setPlaying(false);
                        setManualClip(index);
                        setClipPlayback("playing");
                        setClipRun(previous => previous + 1);
                      }}
                    />
                  )}
                </div>}
              </div>
            </div>
            <div className={styles.controls} data-chapters-visible={showChapters} inert={!showChapters}>
              <div className={styles.chapters}>
                <img ref={chapterLogo} className={styles.chapterLogo} src="/animations/one-mind/logo.webp"
                  alt="" width={214} height={222} />
                {chapterLinks.map(({ id, label, scene: index, offset, active }) => (
                  <button key={id} type="button" data-preview-chapter={id} aria-pressed={active} onClick={() => selectScene(index, reducedMotion(), offset)}>{label}</button>
                ))}
              </div>
              {scene < 2 && atEnd && <a href={contactUrl} className={styles.contact}>{ui.closingCta}<span aria-hidden="true">→</span></a>}
            </div>
          </>}
        </div>
        {open && scene === 2 && <ClosingScene time={closingTime} ui={ui} contactUrl={contactUrl} chapterLogo={chapterLogo} />}
      </div>
    </div>
    {sharedStart === "blocked" && <div className={styles.sharedStart}>
      <button type="button" onClick={startSharedAnimation}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 11 7-11 7z" /></svg>
        {ui.oneMindPlayWithMusic}
      </button>
    </div>}
    <button type="button" className={`${styles.playback} ${styles.soundControl}`} aria-label={soundLabel} title={soundLabel} hidden={awaitingSharedAudio} onClick={toggleSound}>
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 9v6h4l5 4V5L8 9H4Z" />
        {sound === "on" ? <path d="M16 9a4 4 0 0 1 0 6m2-8a7 7 0 0 1 0 10" /> : <path d="m16 10 5 5m0-5-5 5" />}
      </svg>
    </button>
    <button
      type="button"
      className={styles.playback}
      data-playback={playback}
      hidden={awaitingSharedAudio}
      aria-controls="ia-negocios"
      aria-label={playbackLabel}
      title={playbackLabel}
      onClick={togglePlayback}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        {playback === "playing" ? <path d="M9 5v14m6-14v14" /> :
          playback === "ended" ? <path d="M4 5v5h5M4.4 10a8 8 0 1 1 1.5 7.2" /> :
            <path d="m9 5 11 7-11 7Z" />}
      </svg>
    </button>
    <button type="button" className={styles.playback}
      aria-label={fullscreenLabel} title={fullscreenLabel} onClick={toggleFullscreen}>
      <svg viewBox="0 0 24 24" aria-hidden="true">
        {fullscreen || expanded ? <path d="M4 9h5V4m6 0v5h5m0 6h-5v5m-6 0v-5H4" /> :
          <path d="M9 4H4v5m11-5h5v5m0 6v5h-5m-6 0H4v-5" />}
      </svg>
    </button>
  </>);
}
