"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import {
  subscribeToCharacterEvents,
  setupIdleDetection,
} from "@/components/character/CharacterEvents";
import type { CharacterEventDetail } from "@/components/character/CharacterEvents";
import { getZone, clampToSafe, WALK_SPEED } from "./robotRoaming";
import { getPhrase } from "./robotDialogue";
import type { DialogueKey } from "./robotDialogue";
import type { ZoneKey } from "./robotRoaming";
import { getEventReaction } from "./robotActions";
import { pickVariation } from "./robotMotion";
import type { MotionVariation } from "./robotState";
import type { RobotMood } from "./robotState";
import RobotRenderer from "./RobotRenderer";

const CHAR_WIDTH = 120;
const CHAR_HEIGHT = 200;
const ARRIVAL_THRESHOLD = 8;
const WALK_FRAME_MS = 80;
const IDLE_DIALOGUE_MIN = 30000;
const IDLE_DIALOGUE_MAX = 90000;

function mapEventType(t: string): Parameters<typeof getEventReaction>[0] {
  if (t === "language_changed") return "lang_changed";
  if (["page_create", "page_delete", "save_click", "button_hover", "idle", "text_change", "page_selected", "typing_started", "typing_stopped"].includes(t))
    return t as Parameters<typeof getEventReaction>[0];
  return "page_load";
}

export interface RobotEngineState {
  x: number;
  y: number;
  facing: "left" | "right";
  speech: string | null;
  visible: boolean;
  action: string;
  walkFrame: number;
  mood: RobotMood;
  variation: MotionVariation;
}

const DEFAULT_VARIATION: MotionVariation = {
  speed: 1,
  duration: 1,
  pulseStrength: 1,
  headTilt: 0,
  armEmphasis: 1,
  pauseTiming: 1,
  mirrored: false,
  torsoSway: 1,
  stepAmplitude: 1,
  weightShift: 1,
};

export default function RobotEngine() {
  const { lang } = useLanguage();
  const [state, setState] = useState<RobotEngineState>({
    x: 140,
    y: 600,
    facing: "right",
    speech: null,
    visible: false,
    action: "idlePulse",
    walkFrame: 0,
    mood: "idle",
    variation: DEFAULT_VARIATION,
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

  const getViewport = useCallback(() => (typeof window === "undefined" ? { w: 1280, h: 800 } : { w: window.innerWidth, h: window.innerHeight }), []);
  const getClampedTarget = useCallback((zone: ZoneKey) => { const { w, h } = getViewport(); const t = getZone(zone, w, h); return clampToSafe(t.x, t.y, w, h); }, [getViewport]);

  const walkTo = useCallback((zone: ZoneKey, cb?: () => void) => {
    const t = getClampedTarget(zone);
    targetX.current = t.x;
    targetY.current = t.y;
    onArrive.current = cb ?? null;
    const p = posRef.current;
    const dist = Math.hypot(t.x - p.x, t.y - p.y);
    if (dist < ARRIVAL_THRESHOLD) {
      posRef.current = { x: t.x, y: t.y };
      setState((s) => ({ ...s, x: t.x, y: t.y, action: "idlePulse", walkFrame: 0, variation: pickVariation("idlePulse") }));
      cb?.();
      return;
    }
    const dirX = (t.x - p.x) / dist;
    const dirY = (t.y - p.y) / dist;
    vx.current = dirX * WALK_SPEED;
    vy.current = dirY * WALK_SPEED;
    setState((s) => ({ ...s, action: "walk", facing: dirX >= 0 ? "right" : "left", walkFrame: 0, mood: "walking", variation: pickVariation("walk") }));
    walkFrameAcc.current = 0;
  }, [getClampedTarget]);

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
        setTimeout(() => cb?.(), 0);
        posRef.current = { x: targetX.current, y: targetY.current };
        return { ...s, x: targetX.current, y: targetY.current, action: "idlePulse", walkFrame: 0, mood: "idle", variation: pickVariation("idlePulse") };
      }
      const ease = Math.min(1, dist / 50);
      const newX = s.x + vx.current * dt * ease;
      const newY = s.y + vy.current * dt * ease;
      if (Math.hypot(newX - targetX.current, newY - targetY.current) < WALK_SPEED * dt * ease) {
        vx.current = 0;
        vy.current = 0;
        const cb = onArrive.current;
        onArrive.current = null;
        setTimeout(() => cb?.(), 0);
        posRef.current = { x: targetX.current, y: targetY.current };
        return { ...s, x: targetX.current, y: targetY.current, action: "idlePulse", walkFrame: 0, mood: "idle", variation: pickVariation("idlePulse") };
      }
      posRef.current = { x: newX, y: newY };
      walkFrameAcc.current += dt * 1000;
      const newFrame = walkFrameAcc.current >= WALK_FRAME_MS ? (s.walkFrame + 1) % 8 : s.walkFrame;
      if (walkFrameAcc.current >= WALK_FRAME_MS) walkFrameAcc.current = 0;
      return { ...s, x: newX, y: newY, walkFrame: newFrame };
    });
    rafId.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => { rafId.current = requestAnimationFrame(tick); return () => { if (rafId.current) cancelAnimationFrame(rafId.current); }; }, [tick]);

  const runFlow = useCallback(() => {
    const flows: { zone: ZoneKey; action: string; speech?: DialogueKey; duration: number }[][] = [
      [
        { zone: "bottomLeft", action: "idlePulse", speech: "intro", duration: 2200 },
        { zone: "bottomLeft", action: "lookLeft", duration: 1000 },
        { zone: "pageList", action: "walk", duration: 0 },
        { zone: "pageList", action: "point", speech: "page_selected", duration: 2000 },
        { zone: "editorCenter", action: "walk", duration: 0 },
        { zone: "editorCenter", action: "idlePulse", duration: 1600 },
        { zone: "editorCenter", action: "think", duration: 1800 },
        { zone: "editorCenter", action: "recoverNeutral", duration: 700 },
        { zone: "saveArea", action: "walk", duration: 0 },
        { zone: "saveArea", action: "point", speech: "page_selected", duration: 2000 },
        { zone: "bottomRight", action: "walk", duration: 0 },
        { zone: "bottomRight", action: "proudStance", duration: 2100 },
        { zone: "bottomRight", action: "recoverNeutral", duration: 500 },
      ],
      [
        { zone: "bottomCenter", action: "idlePulse", duration: 1400 },
        { zone: "bottomCenter", action: "suspiciousLook", duration: 1600 },
        { zone: "pageList", action: "walk", duration: 0 },
        { zone: "pageList", action: "crossArms", duration: 2000 },
        { zone: "pageList", action: "think", duration: 1800 },
        { zone: "pageList", action: "recoverNeutral", duration: 700 },
        { zone: "logoutArea", action: "walk", duration: 0 },
        { zone: "logoutArea", action: "wave", speech: "near_logout", duration: 2600 },
        { zone: "bottomCenter", action: "walk", duration: 0 },
        { zone: "bottomCenter", action: "idlePulse", duration: 3200 },
      ],
      [
        { zone: "bottomLeft", action: "warmUp", duration: 1500 },
        { zone: "bottomLeft", action: "recoverNeutral", duration: 500 },
        { zone: "editorCenter", action: "walk", duration: 0 },
        { zone: "editorCenter", action: "inspect", duration: 1800 },
        { zone: "editorCenter", action: "chinTouch", duration: 1600 },
        { zone: "saveArea", action: "walk", duration: 0 },
        { zone: "saveArea", action: "handsOnWaist", duration: 1800 },
        { zone: "bottomRight", action: "walk", duration: 0 },
        { zone: "bottomRight", action: "heroPose", duration: 2000 },
        { zone: "bottomRight", action: "recoverNeutral", duration: 700 },
      ],
      [
        { zone: "bottomCenter", action: "inspect", speech: "idle", duration: 1800 },
        { zone: "pageList", action: "walk", duration: 0 },
        { zone: "pageList", action: "recoverNeutral", duration: 2000 },
        { zone: "center", action: "walk", duration: 0 },
        { zone: "center", action: "slightCrouch", duration: 1100 },
        { zone: "center", action: "jump", duration: 700 },
        { zone: "center", action: "land", duration: 500 },
        { zone: "center", action: "recoverNeutral", duration: 900 },
        { zone: "bottomLeft", action: "walk", duration: 0 },
        { zone: "bottomLeft", action: "idlePulse", duration: 3600 },
      ],
    ];
    const flow = flows[flowIndex.current % flows.length]!;
    const step = flow[flowStep.current];
    if (!step) {
      flowStep.current = 0;
      flowIndex.current++;
      timers.current.push(setTimeout(runFlow, 2200));
      return;
    }
    const t = getClampedTarget(step.zone);
    const dist = Math.hypot(t.x - posRef.current.x, t.y - posRef.current.y);
    const doPose = () => {
      setState((s) => ({
        ...s, x: t.x, y: t.y, action: step.action,
        speech: step.speech ? getPhrase(lang, step.speech) : null,
        mood: step.action === "idlePulse" ? "idle" : "focused",
        variation: pickVariation(step.action as import("./robotState").BaseAction),
      }));
      if (step.speech) timers.current.push(setTimeout(() => setState((s) => ({ ...s, speech: null })), 2000));
      flowStep.current++;
      timers.current.push(setTimeout(runFlow, step.duration));
    };
    if (step.action === "walk" && dist > ARRIVAL_THRESHOLD) {
      walkTo(step.zone, () => runFlow());
      if (step.speech) {
        timers.current.push(setTimeout(() => setState((s) => ({ ...s, speech: step.speech ? getPhrase(lang, step.speech) : null })), 350));
        timers.current.push(setTimeout(() => setState((s) => ({ ...s, speech: null })), 2400));
      }
      flowStep.current++;
      return;
    }
    if (step.action === "walk" && dist <= ARRIVAL_THRESHOLD) { flowStep.current++; runFlow(); return; }
    dist > ARRIVAL_THRESHOLD ? walkTo(step.zone, doPose) : doPose();
  }, [getClampedTarget, lang, walkTo]);

  const scheduleIdleDialogue = useCallback(() => {
    const delay = IDLE_DIALOGUE_MIN + Math.random() * (IDLE_DIALOGUE_MAX - IDLE_DIALOGUE_MIN);
    timers.current.push(setTimeout(() => {
      setState((s) => {
        if (s.action !== "walk" && !s.speech && vx.current === 0 && vy.current === 0)
          return { ...s, action: "talk", speech: getPhrase(lang, "idle"), variation: pickVariation("talk") };
        return s;
      });
      timers.current.push(setTimeout(() => setState((s) => s.speech ? { ...s, speech: null, action: "idlePulse", variation: pickVariation("idlePulse") } : s), 2200));
      scheduleIdleDialogue();
    }, delay));
  }, [lang]);

  useEffect(() => {
    const t = getClampedTarget("bottomLeft");
    posRef.current = { x: t.x, y: t.y };
    setState((s) => ({ ...s, visible: true, x: t.x, y: t.y, speech: getPhrase(lang, "intro"), variation: pickVariation("idlePulse") }));
    vx.current = 0;
    vy.current = 0;
    timers.current.push(setTimeout(() => setState((s) => ({ ...s, speech: null })), 2200));
    timers.current.push(setTimeout(() => { flowStep.current = 1; runFlow(); }, 2400));
    scheduleIdleDialogue();
    const unsub = subscribeToCharacterEvents((d: CharacterEventDetail) => {
      if (d.type === "button_hover" || d.type === "idle" || d.type === "page_create") { timers.current.forEach((tt) => clearTimeout(tt)); timers.current = []; }
      const evType = mapEventType(d.type);
      const reaction = getEventReaction(evType);
      if (d.type === "page_create") {
        walkTo("pageList", () => {
          setState((s) => ({ ...s, action: reaction.action, mood: reaction.mood, speech: getPhrase(lang, "page_create"), facing: "right", variation: reaction.variation }));
          timers.current.push(setTimeout(() => { setState((s) => ({ ...s, speech: null, action: "idlePulse", mood: "idle", variation: pickVariation("idlePulse") })); runFlow(); }, 2000));
        });
        return;
      }
      if (d.type === "save_click") {
        setState((s) => ({ ...s, action: reaction.action, mood: reaction.mood, speech: getPhrase(lang, "save_click"), variation: reaction.variation }));
        timers.current.push(setTimeout(() => setState((s) => ({ ...s, speech: null, action: "idlePulse", mood: "idle", variation: pickVariation("idlePulse") })), 1800));
        return;
      }
      if (d.type === "button_hover") {
        walkTo("saveArea", () => {
          setState((s) => ({ ...s, action: reaction.action, mood: reaction.mood, speech: getPhrase(lang, "button_hover"), facing: "right", variation: reaction.variation }));
          timers.current.push(setTimeout(() => { setState((s) => ({ ...s, speech: null, action: "idlePulse", mood: "idle", variation: pickVariation("idlePulse") })); runFlow(); }, 1600));
        });
        return;
      }
      if (d.type === "language_changed") {
        setState((s) => ({ ...s, action: reaction.action, mood: reaction.mood, speech: getPhrase(d.lang ?? lang, "lang_changed"), variation: reaction.variation }));
        timers.current.push(setTimeout(() => setState((s) => ({ ...s, speech: null, action: "idlePulse", variation: pickVariation("idlePulse") })), 1600));
        return;
      }
      if (d.type === "idle") {
        walkTo("logoutArea", () => {
          setState((s) => ({ ...s, action: reaction.action, mood: reaction.mood, speech: getPhrase(lang, "near_logout"), facing: "left", variation: reaction.variation }));
          timers.current.push(setTimeout(() => { setState((s) => ({ ...s, speech: null, action: "idlePulse", mood: "idle", variation: pickVariation("idlePulse") })); runFlow(); }, 2600));
        });
        return;
      }
      if (d.type === "page_selected") {
        setState((s) => ({ ...s, action: reaction.action, mood: reaction.mood, speech: getPhrase(lang, "page_selected"), variation: reaction.variation }));
        timers.current.push(setTimeout(() => setState((s) => ({ ...s, speech: null, action: "idlePulse", variation: pickVariation("idlePulse") })), 1400));
        return;
      }
      if (d.type === "text_change" || d.type === "typing_started" || d.type === "typing_stopped") {
        setState((s) => ({ ...s, action: reaction.action, mood: reaction.mood, variation: reaction.variation }));
        timers.current.push(setTimeout(() => setState((s) => ({ ...s, action: "idlePulse", mood: "idle", variation: pickVariation("idlePulse") })), reaction.duration));
      }
    });
    setupIdleDetection(() => window.dispatchEvent(new CustomEvent("character:event", { detail: { type: "idle" } })), 28000);
    return () => { timers.current.forEach((tt) => clearTimeout(tt)); unsub(); };
  }, [getClampedTarget, lang, runFlow, scheduleIdleDialogue, walkTo]);

  if (!state.visible) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-visible" aria-hidden>
      <div
        className="absolute flex flex-col items-center bg-transparent"
        style={{
          left: state.x,
          top: state.y,
          width: CHAR_WIDTH,
          height: CHAR_HEIGHT,
          transform: "translate(-50%, -100%)",
          willChange: state.action === "walk" ? "left, top" : "auto",
          transition: state.action === "walk" ? "none" : "left 0.15s ease-out, top 0.15s ease-out",
        }}
      >
        <AnimatePresence>
          {state.speech && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1" style={{ minWidth: 120, maxWidth: 200 }}>
              <div className={`relative px-3 py-2 rounded-lg bg-white border-2 border-slate-700 shadow-lg ${state.facing === "right" ? "rounded-bl-md" : "rounded-br-md"}`}>
                <p className="text-sm font-semibold text-slate-800 leading-snug">{state.speech}</p>
                <div className="absolute left-1/2 -translate-x-1/2 top-full -mt-px w-0 h-0" style={{ borderLeft: "6px solid transparent", borderRight: "6px solid transparent", borderTop: "8px solid white" }} />
              </div>
            </div>
          )}
        </AnimatePresence>
        <div className="relative w-full h-full overflow-visible">
          <RobotRenderer facing={state.facing} action={state.action} walkFrame={state.walkFrame} variation={state.variation} mood={state.mood} />
        </div>
      </div>
    </div>
  );
}
