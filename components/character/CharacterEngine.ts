/**
 * CharacterEngine - 상태 기반 오케스트레이션
 * 지속적 움직임, 자주 전환
 */

import {
  getNextPoseBehavior,
  getRandomInterval,
  getEventReaction,
  getZonePx,
  getAdjacentZone,
} from "./CharacterBrain";
import { getRandomPhrase } from "./CharacterSpeech";
import {
  subscribeToCharacterEvents,
  setupIdleDetection,
  setupScrollDetection,
} from "./CharacterEvents";
import type { CharacterEventType } from "./CharacterEvents";
import { OFFSCREEN_LEFT, WALK_SPEED } from "./CharacterAnimations";
import type { Zone } from "./CharacterAnimations";

export type MascotState =
  | "hidden"
  | "entering"
  | "walking"
  | "idle"
  | "pointing"
  | "peeking"
  | "speaking"
  | "posing"
  | "exiting"
  | "shrug"
  | "lookAround"
  | "armsCrossed"
  | "letsGo"
  | "thinking";

export interface CharacterState {
  state: MascotState;
  x: number;
  facing: "left" | "right";
  speech: string | null;
  visible: boolean;
}

export type StateCallback = (s: CharacterState) => void;

export class CharacterEngine {
  private charState: CharacterState = {
    state: "hidden",
    x: OFFSCREEN_LEFT,
    facing: "right",
    speech: null,
    visible: false,
  };
  private currentZone: Zone = "center";
  private listeners = new Set<StateCallback>();
  private randomTimer: ReturnType<typeof setTimeout> | null = null;
  private unsubEvent: (() => void) | null = null;
  private unsubIdle: (() => void) | null = null;
  private unsubScroll: (() => void) | null = null;

  getState(): CharacterState {
    return { ...this.charState };
  }

  subscribe(cb: StateCallback): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  private notify(): void {
    this.listeners.forEach((cb) => cb(this.getState()));
  }

  private setState(partial: Partial<CharacterState>): void {
    this.charState = { ...this.charState, ...partial };
    this.notify();
  }

  private runEntering(targetZone: Zone): void {
    const targetX = getZonePx(targetZone);
    this.currentZone = targetZone;
    this.setState({
      state: "entering",
      visible: true,
      x: OFFSCREEN_LEFT,
      facing: "right",
      speech: null,
    });
    requestAnimationFrame(() => {
      requestAnimationFrame(() => this.setState({ x: targetX }));
    });
  }

  private runAction(action: ReturnType<typeof getEventReaction>): void {
    const { state, speechContext, targetZone, duration } = action;

    if (state === "entering" && targetZone) {
      this.runEntering(targetZone);
      if (speechContext) {
        setTimeout(() => {
          this.setState({ speech: getRandomPhrase(speechContext!) });
          setTimeout(() => this.setState({ speech: null }), 3000);
        }, 1100);
      }
      return;
    }

    const phrase = speechContext ? getRandomPhrase(speechContext) : null;
    this.setState({ state, speech: phrase ?? null });

    setTimeout(() => {
      this.setState({ speech: null });
      if (!["idle", "walking", "entering"].includes(state)) {
        this.setState({ state: "idle" });
      }
    }, duration);
  }

  private runPoseBehavior(): void {
    const action = getNextPoseBehavior();
    this.setState({
      state: action.state,
      speech: action.speechContext ? getRandomPhrase(action.speechContext) : null,
    });
    setTimeout(() => {
      this.setState({ speech: null, state: "idle" });
    }, action.duration);
  }

  private walkToZone(nextZone: Zone): void {
    const targetX = getZonePx(nextZone);
    const dist = Math.abs(targetX - this.charState.x);
    const duration = Math.max(1200, (dist / 100) * WALK_SPEED);
    this.currentZone = nextZone;
    this.setState({
      state: "walking",
      facing: targetX > this.charState.x ? "right" : "left",
      speech: null,
    });
    this.setState({ x: targetX });
    setTimeout(() => {
      this.setState({ state: "idle" });
    }, duration);
  }

  triggerEvent(type: CharacterEventType): void {
    const action = getEventReaction(type);
    this.runAction(action);
  }

  private scheduleNext(): void {
    this.randomTimer = setTimeout(() => {
      const s = this.charState.state;
      if (s === "idle" || s === "lookAround" || s === "shrug" || s === "armsCrossed" || s === "letsGo" || s === "thinking" || s === "peeking") {
        if (Math.random() < 0.6) {
          this.walkToZone(getAdjacentZone(this.currentZone));
        } else {
          this.runPoseBehavior();
        }
      }
      this.scheduleNext();
    }, getRandomInterval());
  }

  start(): void {
    this.runEntering("center");
    if (this.charState.visible) {
      setTimeout(() => {
        this.setState({ speech: getRandomPhrase("page_load") });
        setTimeout(() => this.setState({ speech: null }), 2800);
      }, 1000);
    }
    setTimeout(() => {
      this.setState({ state: "idle", speech: null });
      this.scheduleNext();
    }, 1700);

    this.unsubEvent = subscribeToCharacterEvents((type) => this.triggerEvent(type));
    this.unsubIdle = setupIdleDetection(() => this.triggerEvent("idle"), 28000);
    this.unsubScroll = setupScrollDetection(() => this.triggerEvent("scroll"), 600);
  }

  stop(): void {
    if (this.randomTimer) clearTimeout(this.randomTimer);
    this.randomTimer = null;
    this.unsubEvent?.();
    this.unsubIdle?.();
    this.unsubScroll?.();
  }
}
