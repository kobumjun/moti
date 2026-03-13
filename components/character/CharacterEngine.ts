/**
 * CharacterEngine - 시퀀스 기반 행동
 * 의미 있는 흐름, 부드러운 이동
 */

import {
  FLOWS,
  getZone,
  clampToSafe,
  type ZoneKey,
  type FlowStep,
  type PoseState,
} from "./CharacterAnimations";
import { getPhrase, getPhraseFromText } from "./CharacterSpeech";
import {
  subscribeToCharacterEvents,
  setupIdleDetection,
  setupScrollDetection,
} from "./CharacterEvents";
import type { CharacterEventDetail } from "./CharacterEvents";

export type MascotState = PoseState;

export interface CharacterState {
  state: MascotState;
  x: number;
  y: number;
  facing: "left" | "right";
  speech: string | null;
  visible: boolean;
  showFlame: boolean;
  /** 이동 애니메이션 지속시간 (ms) → sec for transition */
  moveDurationMs: number;
}

export type StateCallback = (s: CharacterState) => void;

const ENTRY_X = -120;
const WALK_MS_PER_100PX = 85;

export class CharacterEngine {
  private s: CharacterState = {
    state: "entering",
    x: ENTRY_X,
    y: 600,
    facing: "right",
    speech: null,
    visible: false,
    showFlame: false,
    moveDurationMs: 1300,
  };
  private listeners = new Set<StateCallback>();
  private flowIndex = 0;
  private stepIndex = 0;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private unsub: (() => void)[] = [];

  getState() {
    return { ...this.s };
  }

  subscribe(cb: StateCallback) {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  private notify() {
    this.listeners.forEach((cb) => cb(this.getState()));
  }

  private setState(partial: Partial<CharacterState>) {
    this.s = { ...this.s, ...partial };
    this.notify();
  }

  private getViewport() {
    if (typeof window === "undefined") return { w: 1280, h: 800 };
    return { w: window.innerWidth, h: window.innerHeight };
  }

  private getClampedTarget(zone: ZoneKey) {
    const { w, h } = this.getViewport();
    const t = getZone(zone, w, h);
    return clampToSafe(t.x, t.y, w, h);
  }

  private travelDuration(from: { x: number; y: number }, to: { x: number; y: number }) {
    const dist = Math.hypot(to.x - from.x, to.y - from.y);
    return Math.max(1200, (dist / 100) * WALK_MS_PER_100PX);
  }

  private runStep(step: FlowStep) {
    const target = this.getClampedTarget(step.zone);
    const from = { x: this.s.x, y: this.s.y };
    const duration = this.travelDuration(from, target);

    const isWalking = step.pose === "walkCycle" || step.pose === "exitWalk" || step.pose === "entering";
    const goingUp = target.y < from.y - 40;

    this.setState({
      facing: target.x > this.s.x ? "right" : "left",
      state: goingUp && isWalking ? "engineLift" : step.pose,
      showFlame: goingUp && isWalking,
      x: target.x,
      y: target.y,
      moveDurationMs: duration,
    });

    const speechDuration = step.speechKey ? 2400 : 0;
    if (step.speechKey) {
      setTimeout(() => {
        this.setState({ speech: getPhrase(step.speechKey as Parameters<typeof getPhrase>[0]) });
        setTimeout(() => this.setState({ speech: null }), speechDuration);
      }, duration * 0.3);
    }

    if (goingUp && isWalking) {
      setTimeout(() => this.setState({ showFlame: false }), duration * 0.8);
    }

    const poseDuration = step.pose === "walkCycle" || step.pose === "exitWalk" ? duration : step.duration;

    this.timer = setTimeout(() => {
      this.setState({ state: step.pose });
      this.timer = setTimeout(() => {
        this.runNextStep();
      }, poseDuration);
    }, duration);
  }

  private runNextStep() {
    const flow = FLOWS[this.flowIndex]!;
    const step = flow[this.stepIndex];
    if (step) {
      this.runStep(step);
      this.stepIndex++;
    } else {
      this.flowIndex = (this.flowIndex + 1) % FLOWS.length;
      this.stepIndex = 0;
      this.timer = setTimeout(() => this.runNextStep(), 2000);
    }
  }

  private runEntering() {
    const firstStep = FLOWS[0]![0]!;
    const target = this.getClampedTarget(firstStep.zone);

    this.setState({
      visible: true,
      state: "entering",
      x: ENTRY_X,
      y: target.y,
      facing: "right",
      speech: null,
      showFlame: false,
      moveDurationMs: 1300,
    });

    const duration = 2200;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this.setState({ x: target.x, moveDurationMs: duration });
      });
    });

    setTimeout(() => {
      this.setState({ speech: getPhrase("intro") });
      setTimeout(() => this.setState({ speech: null }), 2600);
    }, 1200);

    this.timer = setTimeout(() => {
      this.stepIndex = 1; // entering already done
      this.runNextStep();
    }, duration);
  }

  triggerEvent(detail: CharacterEventDetail) {
    if (detail.type === "text_change" && detail.content) {
      const phrase = getPhraseFromText(detail.content);
      if (phrase) {
        this.setState({ state: "reactingTyping", speech: phrase });
        setTimeout(() => this.setState({ speech: null, state: "idleBreathing" }), 2200);
      }
      return;
    }
    if (detail.type === "save_click") {
      this.setState({ state: "reactingSave", speech: getPhrase("save_click") });
      setTimeout(() => this.setState({ speech: null }), 2000);
      return;
    }
    if (detail.type === "button_hover") {
      const t = this.getClampedTarget("saveArea");
      this.setState({
        x: t.x,
        y: t.y,
        state: "pointingAtButton",
        speech: getPhrase("button_hover"),
        facing: "right",
        moveDurationMs: 1200,
      });
      setTimeout(() => this.setState({ speech: null, state: "idleBreathing" }), 1800);
      return;
    }
    if (detail.type === "idle") {
      const t = this.getClampedTarget("logoutArea");
      this.setState({
        x: t.x,
        y: t.y,
        state: "reactingLogout",
        speech: getPhrase("nearLogout"),
        facing: "left",
        moveDurationMs: 1800,
      });
      setTimeout(() => this.setState({ speech: null, state: "idleBreathing" }), 2800);
    }
  }

  start() {
    this.flowIndex = 0;
    this.stepIndex = 0;
    this.runEntering();

    this.unsub.push(
      subscribeToCharacterEvents((d) => this.triggerEvent(d)),
      setupIdleDetection(() => this.triggerEvent({ type: "idle" }), 30000),
      setupScrollDetection(() => this.triggerEvent({ type: "scroll" }), 600)
    );
  }

  stop() {
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
    this.unsub.forEach((f) => f());
  }
}
