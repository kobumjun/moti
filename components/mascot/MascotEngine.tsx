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
          {/* ONLY mascot source: file-2.svg from public/mascot/ */}
          <img
            src="/mascot/file-2.svg"
            alt=""
            className="w-full h-full object-contain drop-shadow-xl"
            style={{ objectPosition: "center bottom" }}
          />
        </div>
      </div>
    </div>
  );
}
