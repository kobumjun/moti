/**
 * CharacterEngine - 상태 기반 캐릭터 오케스트레이션
 * 자연스러운 수평 이동만, 텔레포트 없음
 */

import {
  getNextIdleBehavior,
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
import { OFFSCREEN_LEFT, OFFSCREEN_RIGHT, WALK_SPEED } from "./CharacterAnimations";
import type { Zone } from "./CharacterAnimations";

export type MascotState =
  | "hidden"
  | "entering"
  | "idle"
  | "peeking"
  | "pointing"
  | "speaking"
  | "moving"
  | "exiting"
  | "shrug"
  | "lookAround";

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
  private currentZone: Zone = "left";
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
    const s = this.getState();
    this.listeners.forEach((cb) => cb(s));
  }

  private setState(partial: Partial<CharacterState>): void {
    this.charState = { ...this.charState, ...partial };
    this.notify();
  }

  private walkTo(targetX: number, duration: number): void {
    this.setState({ state: "moving" });
    this.setState({ x: targetX });
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
      requestAnimationFrame(() => {
        this.setState({ x: targetX });
      });
    });
  }

  private runAction(action: ReturnType<typeof getEventReaction>): void {
    const { state, speechContext, targetZone, duration } = action;
    const phrase = speechContext ? getRandomPhrase(speechContext) : null;

    if (state === "entering" && targetZone) {
      this.runEntering(targetZone);
      return;
    }

    this.setState({
      state,
      speech: phrase ?? this.charState.speech,
    });

    setTimeout(() => {
      this.setState({ speech: null });
      if (state !== "idle" && state !== "moving" && state !== "entering") {
        this.setState({ state: "idle" });
      }
    }, duration);
  }

  private runIdleBehavior(): void {
    const action = getNextIdleBehavior();
    this.setState({
      state: action.state,
      speech: action.speechContext ? getRandomPhrase(action.speechContext) : null,
    });
    setTimeout(() => {
      this.setState({ speech: null, state: "idle" });
    }, action.duration);
  }

  private maybeWalkToNewZone(): void {
    const nextZone = getAdjacentZone(this.currentZone);
    const targetX = getZonePx(nextZone);
    const dist = Math.abs(targetX - this.charState.x);
    const duration = Math.max(1000, (dist / 100) * WALK_SPEED);
    this.currentZone = nextZone;
    this.setState({ facing: targetX > this.charState.x ? "right" : "left" });
    this.walkTo(targetX, duration);
    setTimeout(() => this.setState({ state: "idle" }), duration);
  }

  triggerEvent(type: CharacterEventType): void {
    const action = getEventReaction(type);
    if (action.state === "entering") {
      this.runEntering(action.targetZone ?? "right");
      if (action.speechContext) {
        setTimeout(() => {
          this.setState({ speech: getRandomPhrase(action.speechContext!) });
          setTimeout(() => this.setState({ speech: null }), 2500);
        }, 1200);
      }
      return;
    }
    this.runAction(action);
  }

  private scheduleRandom(): void {
    this.randomTimer = setTimeout(() => {
      if (this.charState.state === "idle") {
        if (Math.random() < 0.4) {
          this.maybeWalkToNewZone();
        } else {
          this.runIdleBehavior();
        }
      }
      this.scheduleRandom();
    }, getRandomInterval());
  }

  start(): void {
    this.runEntering("right");
    setTimeout(() => {
      this.setState({ state: "idle", speech: null });
      this.scheduleRandom();
    }, 1500);

    this.unsubEvent = subscribeToCharacterEvents((type) => this.triggerEvent(type));
    this.unsubIdle = setupIdleDetection(() => this.triggerEvent("idle"), 35000);
    this.unsubScroll = setupScrollDetection(() => this.triggerEvent("scroll"), 700);
  }

  stop(): void {
    if (this.randomTimer) clearTimeout(this.randomTimer);
    this.randomTimer = null;
    this.unsubEvent?.();
    this.unsubIdle?.();
    this.unsubScroll?.();
  }
}
