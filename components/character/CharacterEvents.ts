/**
 * CharacterEvents - 앱 이벤트
 * CustomEvent 기반
 */

export type CharacterEventType =
  | "page_load"
  | "page_create"
  | "page_delete"
  | "save_click"
  | "button_hover"
  | "idle"
  | "scroll"
  | "text_change"
  | "typing_started"
  | "typing_stopped"
  | "page_selected"
  | "language_changed";

export interface CharacterEventDetail {
  type: CharacterEventType;
  title?: string;
  content?: string;
  lang?: "en" | "ko";
}

const EVENT_NAME = "character:event";

export function dispatchCharacterEvent(
  type: CharacterEventType,
  extra?: { title?: string; content?: string; lang?: "en" | "ko" }
): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(EVENT_NAME, {
      detail: { type, ...(extra ?? {}) } as CharacterEventDetail,
    })
  );
}

export function subscribeToCharacterEvents(
  callback: (detail: CharacterEventDetail) => void
): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = (e: Event) => {
    const ev = e as CustomEvent<CharacterEventDetail>;
    if (ev.detail?.type) callback(ev.detail);
  };
  window.addEventListener(EVENT_NAME, handler);
  return () => window.removeEventListener(EVENT_NAME, handler);
}

let idleTimer: ReturnType<typeof setTimeout> | null = null;

export function setupIdleDetection(
  onIdle: () => void,
  threshold = 28000
): () => void {
  if (typeof window === "undefined") return () => {};
  const resetTimer = () => {
    if (idleTimer) clearTimeout(idleTimer);
    idleTimer = setTimeout(onIdle, threshold);
  };
  const events = ["mousedown", "mousemove", "keydown", "scroll", "touchstart"];
  events.forEach((e) => window.addEventListener(e, resetTimer));
  resetTimer();
  return () => {
    if (idleTimer) clearTimeout(idleTimer);
    events.forEach((e) => window.removeEventListener(e, resetTimer));
  };
}

let scrollTimeout: ReturnType<typeof setTimeout> | null = null;

export function setupScrollDetection(
  onScroll: () => void,
  throttleMs = 500
): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = () => {
    if (scrollTimeout) return;
    scrollTimeout = setTimeout(() => {
      onScroll();
      scrollTimeout = null;
    }, throttleMs);
  };
  window.addEventListener("scroll", handler, { passive: true });
  return () => {
    window.removeEventListener("scroll", handler);
    if (scrollTimeout) clearTimeout(scrollTimeout);
  };
}
