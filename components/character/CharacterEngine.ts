/**
 * CharacterEngine - 전체 페이지 로밍
 * UP=engineLift, DOWN=jumpDown
 */

import {
  getRandomPose,
  getRandomInterval,
  getEventReaction,
  getZone,
  getRandomZone,
  getZoneForArea,
  needsLiftUp,
  needsJumpDown,
} from "./CharacterBrain";
import { getRandomPhrase, getPhraseFromText } from "./CharacterSpeech";
import {
  subscribeToCharacterEvents,
  setupIdleDetection,
  setupScrollDetection,
} from "./CharacterEvents";
import type { CharacterEventDetail } from "./CharacterEvents";
import { OFFSCREEN_LEFT } from "./CharacterAnimations";
import type { ZoneKey } from "./CharacterAnimations";

export type MascotState =
  | "hidden"
  | "entering"
  | "roaming"
  | "idle"
  | "observing"
  | "speaking"
  | "peeking"
  | "pointing"
  | "engineLift"
  | "jumpingDown"
  | "landing"
  | "inspecting"
  | "reactingToText"
  | "reactingToSave"
  | "reactingToIdle"
  | "exiting"
  | "shrug"
  | "lookAround"
  | "armsCrossed"
  | "letsGo"
  | "thinking"
  | "hype"
  | "frustrated"
  | "cheering"
  | "peekSide"
  | "peekBottom"
  | "walking"
  | "running";

export interface CharacterState {
  state: MascotState;
  x: number;
  y: number;
  facing: "left" | "right";
  speech: string | null;
  visible: boolean;
  showFlame: boolean;
}

export type StateCallback = (s: CharacterState) => void;

export class CharacterEngine {
  private s: CharacterState = {
    state: "hidden",
    x: OFFSCREEN_LEFT,
    y: 480,
    facing: "right",
    speech: null,
    visible: false,
    showFlame: false,
  };
  private currentZone: ZoneKey = "center";
  private listeners = new Set<StateCallback>();
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
    const state = this.getState();
    this.listeners.forEach((cb) => cb(state));
  }

  private setState(partial: Partial<CharacterState>) {
    this.s = { ...this.s, ...partial };
    this.notify();
  }

  private runEntering(targetZone: ZoneKey) {
    const t = getZone(targetZone);
    this.currentZone = targetZone;
    this.setState({
      state: "entering",
      visible: true,
      x: OFFSCREEN_LEFT,
      y: 480,
      facing: "right",
      speech: null,
      showFlame: false,
    });
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this.setState({ x: t.x, y: t.y });
      });
    });
  }

  private moveToZone(targetZone: ZoneKey) {
    const from = getZone(this.currentZone);
    const to = getZone(targetZone);

    const goUp = needsLiftUp(from.y, to.y);
    const goDown = needsJumpDown(from.y, to.y);

    this.setState({ facing: to.x > this.s.x ? "right" : "left" });

    if (goUp) {
      this.setState({ state: "engineLift", showFlame: true });
      setTimeout(() => {
        this.setState({ x: to.x, y: to.y, state: "landing", showFlame: false });
        this.currentZone = targetZone;
        setTimeout(() => this.setState({ state: "idle" }), 400);
      }, 1000);
    } else if (goDown) {
      this.setState({ state: "jumpingDown" });
      setTimeout(() => {
        this.setState({ x: to.x, y: to.y, state: "landing" });
        this.currentZone = targetZone;
        setTimeout(() => this.setState({ state: "idle" }), 500);
      }, 700);
    } else {
      this.setState({ state: "walking" });
      this.setState({ x: to.x, y: to.y });
      this.currentZone = targetZone;
      setTimeout(() => this.setState({ state: "idle" }), 900);
    }
  }

  private runAction(action: ReturnType<typeof getEventReaction>, detail?: CharacterEventDetail) {
    const { state, speechContext, targetZone, duration } = action;

    if (state === "entering" && targetZone) {
      this.runEntering(targetZone);
      if (speechContext) {
        setTimeout(() => {
          this.setState({ speech: getRandomPhrase(speechContext) });
          setTimeout(() => this.setState({ speech: null }), 2800);
        }, 1000);
      }
      return;
    }

    if (state === "reactingToText" && detail?.content) {
      const phrase = getPhraseFromText(detail.content);
      if (phrase) {
        this.setState({ state: "reactingToText", speech: phrase });
        setTimeout(() => this.setState({ speech: null, state: "idle" }), 2200);
      }
      return;
    }

    const phrase = speechContext ? getRandomPhrase(speechContext) : null;
    this.setState({ state, speech: phrase ?? null });

    setTimeout(() => {
      this.setState({ speech: null });
      if (!["idle", "walking", "engineLift", "jumpingDown", "landing"].includes(state)) {
        this.setState({ state: "idle" });
      }
    }, duration);
  }

  private runPose() {
    const action = getRandomPose();
    this.setState({
      state: action.state,
      speech: action.speechContext ? getRandomPhrase(action.speechContext) : null,
    });
    setTimeout(() => {
      this.setState({ speech: null, state: "idle" });
    }, action.duration);
  }

  private scheduleNext() {
    this.timer = setTimeout(() => {
      const st = this.s.state;
      const idleLike = ["idle", "lookAround", "shrug", "armsCrossed", "letsGo", "thinking", "peekBottom", "peekSide", "landing"].includes(st);
      if (idleLike) {
        if (Math.random() < 0.7) {
          const next = getRandomZone();
          if (next !== this.currentZone) this.moveToZone(next);
          else this.runPose();
        } else {
          this.runPose();
        }
      }
      this.scheduleNext();
    }, getRandomInterval());
  }

  triggerEvent(detail: CharacterEventDetail) {
    const action = getEventReaction(detail.type);
    if (detail.type === "text_change" && (detail.title || detail.content)) {
      this.runAction(action, detail);
      return;
    }
    if (detail.type === "button_hover") {
      this.moveToZone("saveArea");
      this.runAction(action);
      return;
    }
    if (detail.type === "save_click") {
      this.runAction(action);
      return;
    }
    if (detail.type === "idle") {
      this.moveToZone(getZoneForArea("logout"));
      this.runAction(action);
      return;
    }
    this.runAction(action);
  }

  start() {
    this.runEntering("center");
    setTimeout(() => {
      this.setState({ speech: getRandomPhrase("page_load") });
      setTimeout(() => this.setState({ speech: null }), 2600);
    }, 900);
    setTimeout(() => {
      this.setState({ state: "idle" });
      this.scheduleNext();
    }, 1800);

    this.unsub.push(
      subscribeToCharacterEvents((d) => this.triggerEvent(d)),
      setupIdleDetection(() => this.triggerEvent({ type: "idle" }), 25000),
      setupScrollDetection(() => this.triggerEvent({ type: "scroll" }), 500)
    );
  }

  stop() {
    if (this.timer) clearTimeout(this.timer);
    this.unsub.forEach((f) => f());
  }
}
