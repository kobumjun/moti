/**
 * CharacterEngine - 캐릭터 오케스트레이션
 * Brain, Animations, Speech, Events 통합
 * requestAnimationFrame 기반 경량 상태 관리
 */

import { getRandomBehavior, getNextRandomInterval, getEventReaction } from "./CharacterBrain";
import { getRandomPhrase } from "./CharacterSpeech";
import {
  subscribeToCharacterEvents,
  setupIdleDetection,
  setupScrollDetection,
} from "./CharacterEvents";
import type { CharacterEventType } from "./CharacterEvents";


export interface CharacterState {
  x: number;
  y: number;
  animation: string;
  speech: string | null;
  visible: boolean;
  scale: number;
}

export type StateCallback = (state: CharacterState) => void;

const INITIAL_STATE: CharacterState = {
  x: 85,
  y: 85,
  animation: "idle",
  speech: null,
  visible: true,
  scale: 1,
};

export class CharacterEngine {
  private state: CharacterState = { ...INITIAL_STATE };
  private listeners: Set<StateCallback> = new Set();
  private randomTimer: ReturnType<typeof setTimeout> | null = null;
  private unsubEvent: (() => void) | null = null;
  private unsubIdle: (() => void) | null = null;
  private unsubScroll: (() => void) | null = null;

  getState(): CharacterState {
    return { ...this.state };
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
    this.state = { ...this.state, ...partial };
    this.notify();
  }

  private runBehavior(behavior: ReturnType<typeof getRandomBehavior>): void {
    const { animation, speechContext, duration, targetX, targetY } = behavior;
    const phrase = getRandomPhrase(speechContext);

    this.setState({
      animation,
      speech: phrase,
      visible: animation !== "disappear",
    });

    if (targetX != null && targetY != null) {
      this.setState({ x: targetX, y: targetY });
    }

    setTimeout(() => {
      this.setState({ speech: null });
      if (animation === "disappear") {
        setTimeout(() => {
          this.setState({
            visible: true,
            x: 15 + Math.random() * 70,
            y: 15 + Math.random() * 70,
            animation: "idle",
          });
        }, 600);
      } else {
        this.setState({ animation: "idle" });
      }
    }, duration);
  }

  triggerEvent(eventType: CharacterEventType): void {
    const behavior = getEventReaction(eventType);
    this.runBehavior(behavior);
  }

  private scheduleRandom(): void {
    const delay = getNextRandomInterval();
    this.randomTimer = setTimeout(() => {
      this.runBehavior(getRandomBehavior());
      this.scheduleRandom();
    }, delay);
  }

  start(): void {
    this.triggerEvent("page_load");

    this.unsubEvent = subscribeToCharacterEvents((type) => {
      this.triggerEvent(type);
    });

    this.unsubIdle = setupIdleDetection(() => this.triggerEvent("idle"), 25000);
    this.unsubScroll = setupScrollDetection(() => this.triggerEvent("scroll"), 600);

    this.scheduleRandom();
  }

  stop(): void {
    if (this.randomTimer) {
      clearTimeout(this.randomTimer);
      this.randomTimer = null;
    }
    this.unsubEvent?.();
    this.unsubIdle?.();
    this.unsubScroll?.();
  }
}
