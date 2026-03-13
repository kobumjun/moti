/**
 * CharacterEvents - 앱 이벤트 수신 및 dispatch
 * CustomEvent 기반으로 앱과 캐릭터 분리
 */

export type CharacterEventType =
  | "page_load"
  | "page_create"
  | "page_delete"
  | "save_click"
  | "button_hover"
  | "idle"
  | "scroll";

const EVENT_NAME = "character:event";

export function dispatchCharacterEvent(type: CharacterEventType): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(EVENT_NAME, { detail: { type } })
  );
}

export function subscribeToCharacterEvents(
  callback: (type: CharacterEventType) => void
): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = (e: Event) => {
    const ev = e as CustomEvent<{ type: CharacterEventType }>;
    if (ev.detail?.type) callback(ev.detail.type);
  };
  window.addEventListener(EVENT_NAME, handler);
  return () => window.removeEventListener(EVENT_NAME, handler);
}

// Idle detection
let idleTimer: ReturnType<typeof setTimeout> | null = null;
const IDLE_THRESHOLD = 30000;

export function setupIdleDetection(
  onIdle: () => void,
  threshold = IDLE_THRESHOLD
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

// Scroll detection (throttled)
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
