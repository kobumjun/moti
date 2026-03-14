"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import {
  subscribeToCharacterEvents,
  setupIdleDetection,
} from "@/components/character/CharacterEvents";
import type { CharacterEventDetail } from "@/components/character/CharacterEvents";
import { getZone, clampToSafe, WALK_SPEED } from "./mascotZones";
import { getPhrase } from "./mascotDialogue";
import type { DialogueKey } from "./mascotDialogue";
import type { ZoneKey } from "./mascotActions";

const CHAR_WIDTH = 72;
const CHAR_HEIGHT = 110;
const ARRIVAL_THRESHOLD = 8;
const WALK_FRAME_MS = 120;
const IDLE_DIALOGUE_MIN = 30000;
const IDLE_DIALOGUE_MAX = 90000;

export interface MascotState {
  x: number;
  y: number;
  facing: "left" | "right";
  speech: string | null;
  visible: boolean;
  action: string;
  walkFrame: number;
  /** For transform-based animation */
  headTilt: number;
  breathing: number;
}

export default function MascotEngine() {
  const { lang } = useLanguage();
  const [state, setState] = useState<MascotState>({
    x: 140,
    y: 600,
    facing: "right",
    speech: null,
    visible: false,
    action: "idleBreathing",
    walkFrame: 0,
    headTilt: 0,
    breathing: 1,
  });

  const vx = useRef(0);
  const vy = useRef(0);
  const targetX = useRef(0);
  const targetY = useRef(0);
  const onArrive = useRef<(() => void) | null>(null);
  const rafId = useRef<number | null>(null);
  const lastTime = useRef(0);
  const walkFrameAcc = useRef(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const flowStep = useRef(0);
  const flowIndex = useRef(0);
  const posRef = useRef({ x: 140, y: 600 });

  const getViewport = useCallback(() => {
    if (typeof window === "undefined") return { w: 1280, h: 800 };
    return { w: window.innerWidth, h: window.innerHeight };
  }, []);

  const getClampedTarget = useCallback(
    (zone: ZoneKey) => {
      const { w, h } = getViewport();
      const t = getZone(zone, w, h);
      return clampToSafe(t.x, t.y, w, h);
    },
    [getViewport]
  );

  const walkTo = useCallback(
    (zone: ZoneKey, cb?: () => void) => {
      const t = getClampedTarget(zone);
      targetX.current = t.x;
      targetY.current = t.y;
      onArrive.current = cb ?? null;

      const p = posRef.current;
      const dx = t.x - p.x;
      const dy = t.y - p.y;
      const dist = Math.hypot(dx, dy);

      if (dist < ARRIVAL_THRESHOLD) {
        posRef.current = { x: t.x, y: t.y };
        setState((s) => ({ ...s, x: t.x, y: t.y, action: "idleBreathing", walkFrame: 0 }));
        cb?.();
        return;
      }

      const dirX = dx / dist;
      const dirY = dy / dist;
      vx.current = dirX * WALK_SPEED;
      vy.current = dirY * WALK_SPEED;
      setState((s) => ({
        ...s,
        action: "walk",
        facing: dirX >= 0 ? "right" : "left",
        walkFrame: 0,
      }));
      walkFrameAcc.current = 0;
    },
    [getClampedTarget]
  );

  const tick = useCallback(() => {
    const now = performance.now();
    const dt = Math.min((now - lastTime.current) / 1000, 0.1);
    lastTime.current = now;

    setState((s) => {
      if (s.action !== "walk" || (vx.current === 0 && vy.current === 0)) return s;

      const dx = targetX.current - s.x;
      const dy = targetY.current - s.y;
      const dist = Math.hypot(dx, dy);

      if (dist < ARRIVAL_THRESHOLD) {
        vx.current = 0;
        vy.current = 0;
        const cb = onArrive.current;
        onArrive.current = null;
        posRef.current = { x: targetX.current, y: targetY.current };
        setTimeout(() => cb?.(), 0);
        return {
          ...s,
          x: targetX.current,
          y: targetY.current,
          action: "idleBreathing",
          walkFrame: 0,
        };
      }

      const moveDist = WALK_SPEED * dt;
      let newX = s.x + vx.current * dt;
      let newY = s.y + vy.current * dt;

      if (Math.hypot(newX - targetX.current, newY - targetY.current) < moveDist) {
        vx.current = 0;
        vy.current = 0;
        const cb = onArrive.current;
        onArrive.current = null;
        posRef.current = { x: targetX.current, y: targetY.current };
        setTimeout(() => cb?.(), 0);
        return {
          ...s,
          x: targetX.current,
          y: targetY.current,
          action: "idleBreathing",
          walkFrame: 0,
        };
      }

      posRef.current = { x: newX, y: newY };
      walkFrameAcc.current += dt * 1000;
      const newFrame =
        walkFrameAcc.current >= WALK_FRAME_MS
          ? ((s.walkFrame + 1) % 4)
          : s.walkFrame;
      if (walkFrameAcc.current >= WALK_FRAME_MS) walkFrameAcc.current = 0;

      return {
        ...s,
        x: newX,
        y: newY,
        walkFrame: newFrame,
      };
    });

    rafId.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    rafId.current = requestAnimationFrame(tick);
    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [tick]);

  const runFlow = useCallback(() => {
    const flows: { zone: ZoneKey; action: string; speech?: DialogueKey; duration: number }[][] = [
      [
        { zone: "bottomLeft", action: "idleBreathing", speech: "intro", duration: 2500 },
        { zone: "pageList", action: "walk", duration: 0 },
        { zone: "pageList", action: "point", speech: "page_selected", duration: 2200 },
        { zone: "editorCenter", action: "walk", duration: 0 },
        { zone: "editorCenter", action: "idleBreathing", duration: 2800 },
        { zone: "saveArea", action: "walk", duration: 0 },
        { zone: "saveArea", action: "point", duration: 2200 },
        { zone: "bottomRight", action: "walk", duration: 0 },
        { zone: "bottomRight", action: "idleBreathing", duration: 3000 },
      ],
      [
        { zone: "bottomCenter", action: "peekFromEdge", speech: "idle", duration: 2000 },
        { zone: "pageList", action: "walk", duration: 0 },
        { zone: "pageList", action: "shrug", duration: 2200 },
        { zone: "logoutArea", action: "walk", duration: 0 },
        { zone: "logoutArea", action: "wave", speech: "near_logout", duration: 2800 },
        { zone: "bottomCenter", action: "walk", duration: 0 },
        { zone: "bottomCenter", action: "idleBreathing", duration: 4000 },
      ],
    ];

    const flow = flows[flowIndex.current % flows.length]!;
    const step = flow[flowStep.current];

    if (!step) {
      flowStep.current = 0;
      flowIndex.current++;
      const t = setTimeout(runFlow, 2500);
      timers.current.push(t);
      return;
    }

    const t = getClampedTarget(step.zone);
    const p = posRef.current;
    const dist = Math.hypot(t.x - p.x, t.y - p.y);

    const doPose = () => {
      setState((s) => ({
        ...s,
        x: t.x,
        y: t.y,
        action: step.action,
        speech: step.speech ? getPhrase(lang, step.speech) : null,
      }));
      if (step.speech) {
        const t2 = setTimeout(() => setState((s) => ({ ...s, speech: null })), 2200);
        timers.current.push(t2);
      }
      flowStep.current++;
      const t3 = setTimeout(runFlow, step.duration);
      timers.current.push(t3);
    };

    if (step.action === "walk" && dist > ARRIVAL_THRESHOLD) {
      walkTo(step.zone, () => runFlow());
      if (step.speech) {
        const t2 = setTimeout(() => {
          setState((s) => ({ ...s, speech: step.speech ? getPhrase(lang, step.speech) : null }));
          setTimeout(() => setState((s) => ({ ...s, speech: null })), 2200);
        }, 400);
        timers.current.push(t2);
      }
      flowStep.current++;
      return;
    }

    if (step.action === "walk" && dist <= ARRIVAL_THRESHOLD) {
      flowStep.current++;
      runFlow();
      return;
    }

    if (dist > ARRIVAL_THRESHOLD) {
      walkTo(step.zone, doPose);
    } else {
      doPose();
    }
  }, [getClampedTarget, lang, walkTo]);

  const scheduleIdleDialogue = useCallback(() => {
    const delay = IDLE_DIALOGUE_MIN + Math.random() * (IDLE_DIALOGUE_MAX - IDLE_DIALOGUE_MIN);
    const t = setTimeout(() => {
      setState((s) => {
        if (s.action !== "walk" && !s.speech && vx.current === 0 && vy.current === 0) {
          return {
            ...s,
            action: "talk",
            speech: getPhrase(lang, "idle"),
          };
        }
        return s;
      });
      const t2 = setTimeout(
        () => setState((s) => (s.speech ? { ...s, speech: null, action: "idleBreathing" } : s)),
        2400
      );
      timers.current.push(t2);
      scheduleIdleDialogue();
    }, delay);
    timers.current.push(t);
  }, [lang]);

  useEffect(() => {
    const t = getClampedTarget("bottomLeft");
    posRef.current = { x: t.x, y: t.y };
    setState((s) => ({
      ...s,
      visible: true,
      x: t.x,
      y: t.y,
      speech: getPhrase(lang, "intro"),
    }));
    vx.current = 0;
    vy.current = 0;

    const t1 = setTimeout(() => setState((s) => ({ ...s, speech: null })), 2400);
    const t2 = setTimeout(() => {
      flowStep.current = 1;
      runFlow();
    }, 2600);
    scheduleIdleDialogue();
    timers.current.push(t1, t2);

    const unsub = subscribeToCharacterEvents((d: CharacterEventDetail) => {
      if (d.type === "button_hover" || d.type === "idle" || d.type === "page_create") {
        timers.current.forEach((tt) => clearTimeout(tt));
        timers.current = [];
      }

      if (d.type === "page_create") {
        walkTo("pageList", () => {
          setState((s) => ({
            ...s,
            action: "heroPose",
            speech: getPhrase(lang, "page_create"),
            facing: "right",
          }));
          const tt = setTimeout(() => {
            setState((s) => ({ ...s, speech: null, action: "idleBreathing" }));
            runFlow();
          }, 2200);
          timers.current.push(tt);
        });
        return;
      }
      if (d.type === "save_click") {
        setState((s) => ({
          ...s,
          action: "celebrate",
          speech: getPhrase(lang, "save_click"),
        }));
        const tt = setTimeout(() => setState((s) => ({ ...s, speech: null, action: "idleBreathing" })), 2000);
        timers.current.push(tt);
        return;
      }
      if (d.type === "button_hover") {
        walkTo("saveArea", () => {
          setState((s) => ({
            ...s,
            action: "point",
            speech: getPhrase(lang, "button_hover"),
            facing: "right",
          }));
          const tt = setTimeout(() => {
            setState((s) => ({ ...s, speech: null, action: "idleBreathing" }));
            runFlow();
          }, 1800);
          timers.current.push(tt);
        });
        return;
      }
      if (d.type === "language_changed") {
        const phraseLang = d.lang ?? lang;
        setState((s) => ({
          ...s,
          action: "wave",
          speech: getPhrase(phraseLang, "lang_changed"),
        }));
        const tt = setTimeout(() => setState((s) => ({ ...s, speech: null, action: "idleBreathing" })), 1800);
        timers.current.push(tt);
        return;
      }
      if (d.type === "idle") {
        walkTo("logoutArea", () => {
          setState((s) => ({
            ...s,
            action: "wave",
            speech: getPhrase(lang, "near_logout"),
            facing: "left",
          }));
          const tt = setTimeout(() => {
            setState((s) => ({ ...s, speech: null, action: "idleBreathing" }));
            runFlow();
          }, 2800);
          timers.current.push(tt);
        });
      }
    });

    setupIdleDetection(
      () =>
        window.dispatchEvent(
          new CustomEvent("character:event", { detail: { type: "idle" } })
        ),
      28000
    );

    return () => {
      timers.current.forEach((tt) => clearTimeout(tt));
      unsub();
    };
  }, [getClampedTarget, lang, runFlow, scheduleIdleDialogue, walkTo]);

  if (!state.visible) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none z-40 overflow-visible"
      aria-hidden
    >
      <div
        className="absolute flex flex-col items-center"
        style={{
          left: state.x,
          top: state.y,
          width: CHAR_WIDTH,
          height: CHAR_HEIGHT,
          transform: `translate(-50%, -100%)`,
          willChange: state.action === "walk" ? "left, top" : "auto",
        }}
      >
        <AnimatePresence>
          {state.speech && (
            <div
              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1"
              style={{ minWidth: 140, maxWidth: 220 }}
            >
              <div
                className={`
                  relative px-4 py-2.5 rounded-xl bg-white border-2 border-slate-800
                  shadow-[4px_4px_0_0_rgba(15,23,42,0.4)]
                  ${state.facing === "right" ? "rounded-bl-md" : "rounded-br-md"}
                `}
              >
                <p className="text-sm font-bold text-slate-900 leading-snug">
                  {state.speech}
                </p>
                <div
                  className="absolute left-1/2 -translate-x-1/2 top-full -mt-px w-0 h-0"
                  style={{
                    borderLeft: "8px solid transparent",
                    borderRight: "8px solid transparent",
                    borderTop: "10px solid white",
                    filter: "drop-shadow(0 2px 0 rgb(30 41 59))",
                  }}
                />
              </div>
            </div>
          )}
        </AnimatePresence>

        <div
          className="relative w-full h-full"
          style={{
            transform: state.facing === "left" ? "scaleX(-1)" : "scaleX(1)",
          }}
        >
          <MascotSVG
            action={state.action}
            walkFrame={state.walkFrame}
            headTilt={state.headTilt}
            breathing={state.breathing}
          />
        </div>
      </div>
    </div>
  );
}

function MascotSVG({
  action,
  walkFrame,
  headTilt,
  breathing,
}: {
  action: string;
  walkFrame: number;
  headTilt: number;
  breathing: number;
}) {
  const isWalk = action === "walk";
  const isPoint = action === "point";
  const isShrug = action === "shrug";
  const isPeek = action === "peekFromEdge" || action === "peek";
  const isTalk = action === "talk" || action === "wave" || action === "celebrate";
  const frame = walkFrame % 4;

  return (
    <svg
      viewBox="0 0 72 110"
      fill="none"
      className="w-full h-full drop-shadow-xl"
      preserveAspectRatio="xMidYMax meet"
    >
      <defs>
        <linearGradient id="m-body" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="35%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>
        <linearGradient id="m-body-shade" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#1e40af" stopOpacity="0.25" />
          <stop offset="50%" stopColor="transparent" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.3" />
        </linearGradient>
        <linearGradient id="m-cape" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#6d28d9" />
        </linearGradient>
        <linearGradient id="m-mask" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#334155" />
          <stop offset="100%" stopColor="#1e293b" />
        </linearGradient>
        <linearGradient id="m-belt" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fcd34d" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
        <linearGradient id="m-glove" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#f8fafc" />
          <stop offset="100%" stopColor="#cbd5e1" />
        </linearGradient>
        <linearGradient id="m-boot" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#475569" />
          <stop offset="100%" stopColor="#1e293b" />
        </linearGradient>
      </defs>

      <g transform={`translate(0, 0)`}>
        <path
          d="M 20 40 Q 12 58 16 78 L 24 76 L 24 52 Z M 52 40 Q 60 58 56 78 L 48 76 L 48 52 Z"
          fill="url(#m-cape)"
          stroke="#5b21b6"
          strokeWidth="1"
        />
        <path
          d="M 26 30 Q 26 32 28 38 L 30 68 Q 32 76 36 78 Q 40 76 42 68 L 44 38 Q 46 32 46 30 Q 40 26 36 26 Q 32 26 26 30 Z"
          fill="url(#m-body)"
          stroke="#2563eb"
          strokeWidth="1.5"
        />
        <path
          d="M 30 35 Q 34 50 36 70 L 36 74 Q 34 72 32 68 L 30 45 Z"
          fill="url(#m-body-shade)"
        />
        <path d="M 26 72 L 46 72 L 46 76 L 26 76 Z" fill="url(#m-belt)" stroke="#d97706" strokeWidth="1" />
        <circle cx="36" cy="74" r="2.5" fill="#fef3c7" stroke="#d97706" strokeWidth="0.5" />

        <g transform={`rotate(${headTilt})`} style={{ transformOrigin: "36px 20px" }}>
          <ellipse cx="36" cy="20" rx="13" ry="15" fill="#fcd5b0" stroke="#e8a87c" strokeWidth="1" />
          <path
            d="M 23 17 Q 36 11 49 17 L 49 24 Q 36 28 23 24 Z"
            fill="url(#m-mask)"
            stroke="#0f172a"
            strokeWidth="1"
          />
          <ellipse cx="30" cy="20" rx="2.5" ry="3" fill="white" />
          <ellipse cx="42" cy="20" rx="2.5" ry="3" fill="white" />
          <circle cx="30.5" cy="20" r="1" fill="#0f172a" />
          <circle cx="42.5" cy="20" r="1" fill="#0f172a" />
        </g>

        {isPoint ? (
          <g>
            <path d="M 24 46 Q 18 40 12 34" stroke="#3b82f6" strokeWidth="6" strokeLinecap="round" fill="none" />
            <ellipse cx="11" cy="33" rx="5" ry="6" fill="url(#m-glove)" stroke="#94a3b8" strokeWidth="1" />
            <path d="M 48 46 L 54 54" stroke="#3b82f6" strokeWidth="6" strokeLinecap="round" fill="none" />
            <ellipse cx="55" cy="55" rx="4" ry="5" fill="url(#m-glove)" stroke="#94a3b8" strokeWidth="1" />
          </g>
        ) : isShrug ? (
          <g>
            <path d="M 22 45 Q 28 38 36 45" stroke="#3b82f6" strokeWidth="6" fill="none" strokeLinecap="round" />
            <ellipse cx="20" cy="48" rx="5" ry="6" fill="url(#m-glove)" stroke="#94a3b8" strokeWidth="1" />
            <path d="M 50 45 Q 44 38 36 45" stroke="#3b82f6" strokeWidth="6" fill="none" strokeLinecap="round" />
            <ellipse cx="52" cy="48" rx="5" ry="6" fill="url(#m-glove)" stroke="#94a3b8" strokeWidth="1" />
          </g>
        ) : isPeek ? (
          <g>
            <path d="M 22 46 L 18 58" stroke="#3b82f6" strokeWidth="6" strokeLinecap="round" fill="none" />
            <ellipse cx="17" cy="59" rx="5" ry="6" fill="url(#m-glove)" stroke="#94a3b8" strokeWidth="1" />
            <path d="M 50 46 L 52 60" stroke="#3b82f6" strokeWidth="6" strokeLinecap="round" fill="none" />
            <ellipse cx="53" cy="61" rx="4" ry="5" fill="url(#m-glove)" stroke="#94a3b8" strokeWidth="1" />
          </g>
        ) : isTalk ? (
          <g>
            <path d="M 24 46 L 20 60" stroke="#3b82f6" strokeWidth="6" strokeLinecap="round" fill="none" />
            <ellipse cx="19" cy="61" rx="5" ry="6" fill="url(#m-glove)" stroke="#94a3b8" strokeWidth="1" />
            <path d="M 48 46 L 52 58" stroke="#3b82f6" strokeWidth="6" strokeLinecap="round" fill="none" />
            <ellipse cx="53" cy="59" rx="4" ry="5" fill="url(#m-glove)" stroke="#94a3b8" strokeWidth="1" />
          </g>
        ) : isWalk ? (
          <g>
            {frame === 0 && (
              <>
                <path d="M 22 46 L 16 62" stroke="#3b82f6" strokeWidth="6" strokeLinecap="round" fill="none" />
                <ellipse cx="15" cy="63" rx="5" ry="6" fill="url(#m-glove)" stroke="#94a3b8" strokeWidth="1" />
                <path d="M 50 46 L 56 60" stroke="#3b82f6" strokeWidth="6" strokeLinecap="round" fill="none" />
                <ellipse cx="57" cy="61" rx="4" ry="5" fill="url(#m-glove)" stroke="#94a3b8" strokeWidth="1" />
              </>
            )}
            {frame === 1 && (
              <>
                <path d="M 22 46 L 24 62" stroke="#3b82f6" strokeWidth="6" strokeLinecap="round" fill="none" />
                <ellipse cx="23" cy="63" rx="5" ry="6" fill="url(#m-glove)" stroke="#94a3b8" strokeWidth="1" />
                <path d="M 50 46 L 50 60" stroke="#3b82f6" strokeWidth="6" strokeLinecap="round" fill="none" />
                <ellipse cx="51" cy="61" rx="4" ry="5" fill="url(#m-glove)" stroke="#94a3b8" strokeWidth="1" />
              </>
            )}
            {frame === 2 && (
              <>
                <path d="M 22 46 L 28 60" stroke="#3b82f6" strokeWidth="6" strokeLinecap="round" fill="none" />
                <ellipse cx="29" cy="61" rx="5" ry="6" fill="url(#m-glove)" stroke="#94a3b8" strokeWidth="1" />
                <path d="M 50 46 L 44 62" stroke="#3b82f6" strokeWidth="6" strokeLinecap="round" fill="none" />
                <ellipse cx="43" cy="63" rx="4" ry="5" fill="url(#m-glove)" stroke="#94a3b8" strokeWidth="1" />
              </>
            )}
            {frame === 3 && (
              <>
                <path d="M 22 46 L 24 62" stroke="#3b82f6" strokeWidth="6" strokeLinecap="round" fill="none" />
                <ellipse cx="23" cy="63" rx="5" ry="6" fill="url(#m-glove)" stroke="#94a3b8" strokeWidth="1" />
                <path d="M 50 46 L 50 60" stroke="#3b82f6" strokeWidth="6" strokeLinecap="round" fill="none" />
                <ellipse cx="51" cy="61" rx="4" ry="5" fill="url(#m-glove)" stroke="#94a3b8" strokeWidth="1" />
              </>
            )}
          </g>
        ) : (
          <g>
            <path d="M 24 46 L 22 62" stroke="#3b82f6" strokeWidth="6" strokeLinecap="round" fill="none" />
            <ellipse cx="21" cy="63" rx="5" ry="6" fill="url(#m-glove)" stroke="#94a3b8" strokeWidth="1" />
            <path d="M 48 46 L 50 62" stroke="#3b82f6" strokeWidth="6" strokeLinecap="round" fill="none" />
            <ellipse cx="51" cy="63" rx="4" ry="5" fill="url(#m-glove)" stroke="#94a3b8" strokeWidth="1" />
          </g>
        )}

        {isWalk ? (
          <g>
            {frame === 0 && (
              <>
                <path d="M 28 78 L 26 100 L 30 100 L 32 78 Z" fill="#2563eb" stroke="#1d4ed8" strokeWidth="1" />
                <path d="M 26 98 L 24 108 L 32 108 L 32 98 Z" fill="url(#m-boot)" stroke="#0f172a" strokeWidth="1" />
                <path d="M 44 78 L 44 100 L 48 100 L 46 78 Z" fill="#2563eb" stroke="#1d4ed8" strokeWidth="1" />
                <path d="M 40 98 L 40 108 L 48 108 L 46 98 Z" fill="url(#m-boot)" stroke="#0f172a" strokeWidth="1" />
              </>
            )}
            {frame === 1 && (
              <>
                <path d="M 30 78 L 30 100 L 34 100 L 34 78 Z" fill="#2563eb" stroke="#1d4ed8" strokeWidth="1" />
                <path d="M 28 98 L 28 108 L 36 108 L 36 98 Z" fill="url(#m-boot)" stroke="#0f172a" strokeWidth="1" />
                <path d="M 42 78 L 42 100 L 46 100 L 46 78 Z" fill="#2563eb" stroke="#1d4ed8" strokeWidth="1" />
                <path d="M 40 98 L 40 108 L 48 108 L 46 98 Z" fill="url(#m-boot)" stroke="#0f172a" strokeWidth="1" />
              </>
            )}
            {frame === 2 && (
              <>
                <path d="M 32 78 L 34 100 L 38 100 L 36 78 Z" fill="#2563eb" stroke="#1d4ed8" strokeWidth="1" />
                <path d="M 32 98 L 32 108 L 40 108 L 40 98 Z" fill="url(#m-boot)" stroke="#0f172a" strokeWidth="1" />
                <path d="M 40 78 L 38 100 L 42 100 L 42 78 Z" fill="#2563eb" stroke="#1d4ed8" strokeWidth="1" />
                <path d="M 36 98 L 36 108 L 44 108 L 42 98 Z" fill="url(#m-boot)" stroke="#0f172a" strokeWidth="1" />
              </>
            )}
            {frame === 3 && (
              <>
                <path d="M 30 78 L 30 100 L 34 100 L 34 78 Z" fill="#2563eb" stroke="#1d4ed8" strokeWidth="1" />
                <path d="M 28 98 L 28 108 L 36 108 L 36 98 Z" fill="url(#m-boot)" stroke="#0f172a" strokeWidth="1" />
                <path d="M 42 78 L 42 100 L 46 100 L 46 78 Z" fill="#2563eb" stroke="#1d4ed8" strokeWidth="1" />
                <path d="M 40 98 L 40 108 L 48 108 L 46 98 Z" fill="url(#m-boot)" stroke="#0f172a" strokeWidth="1" />
              </>
            )}
          </g>
        ) : (
          <g>
            <path d="M 28 78 L 28 100 L 32 100 L 34 78 Z" fill="#2563eb" stroke="#1d4ed8" strokeWidth="1" />
            <path d="M 26 98 L 26 108 L 34 108 L 34 98 Z" fill="url(#m-boot)" stroke="#0f172a" strokeWidth="1" />
            <path d="M 40 78 L 40 100 L 44 100 L 46 78 Z" fill="#2563eb" stroke="#1d4ed8" strokeWidth="1" />
            <path d="M 38 98 L 38 108 L 46 108 L 46 98 Z" fill="url(#m-boot)" stroke="#0f172a" strokeWidth="1" />
          </g>
        )}
      </g>
    </svg>
  );
}
