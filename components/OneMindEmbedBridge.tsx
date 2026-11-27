"use client";

import { useEffect, type RefObject } from "react";

const chapters = new Set(["store", "booking", "chat", "video"]);

export function OneMindEmbedBridge({ sectionRef }: { sectionRef: RefObject<HTMLElement | null> }) {
  useEffect(() => {
    const section = sectionRef.current;
    if (!section || window.parent === window) return;
    let parentOrigin: string | undefined;

    const sendLayout = () => {
      if (!parentOrigin || document.fullscreenElement || section.hasAttribute("data-banner-expanded")) return;
      const { width, height, left } = section.getBoundingClientRect();
      window.parent.postMessage({
        type: "one-mind:layout",
        width,
        height,
        left,
      }, parentOrigin);
    };

    const receive = (event: MessageEvent) => {
      if (event.source !== window.parent || event.origin === "null") return;
      if (event.data?.type === "one-mind:connect" && (!parentOrigin || event.origin === parentOrigin)) {
        parentOrigin = event.origin;
        sendLayout();
      }
      if (event.origin !== parentOrigin || event.data?.type !== "one-mind:chapter" || !chapters.has(event.data.chapter)) return;
      section.dispatchEvent(new CustomEvent("one-mind-preview-chapter", { detail: event.data.chapter }));
    };

    const forwardContact = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return;
      const link = event.target.closest<HTMLAnchorElement>("a[href]");
      if (link) link.target = "_top";
    };

    const observer = new ResizeObserver(sendLayout);
    observer.observe(section);
    section.addEventListener("click", forwardContact, true);
    window.addEventListener("message", receive);
    window.addEventListener("resize", sendLayout);
    document.addEventListener("fullscreenchange", sendLayout);
    return () => {
      observer.disconnect();
      section.removeEventListener("click", forwardContact, true);
      window.removeEventListener("message", receive);
      window.removeEventListener("resize", sendLayout);
      document.removeEventListener("fullscreenchange", sendLayout);
    };
  }, [sectionRef]);

  return null;
}
