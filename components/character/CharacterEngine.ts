/**
 * CharacterEngine - velocity-based walking, requestAnimationFrame
 * NEVER teleport or slide. Movement is ALWAYS walking.
 */

import {
  FLOWS,
  getZone,
  clampToSafe,
  WALK_SPEED,
  type ZoneKey,
  type FlowStep,
  type PoseState,
} from "./CharacterAnimations";
import { getPhrase, getPhraseFromText, getRandomIdlePhrase } from "./CharacterSpeech";
import {
  subscribeToCharacterEvents,
  setupIdleDetection,
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
  /** 0–3 for walk cycle sprite */
  walkFrame: number;
}

export type StateCallback = (s: CharacterState) => void;

const ARRIVAL_THRESHOLD = 8;
const WALK_FRAME_INTERVAL_MS = 120;

export class CharacterEngine {
  private s: CharacterState = {
    state: "idle",
    x: 120,
    y: 600,
    facing: "right",
    speech: null,
    visible: false,
    walkFrame: 0,
  };
  private vx = 0;
  private vy = 0;
  private targetX = 0;
  private targetY = 0;
  private onArrive: (() => void) | null = null;
  private listeners = new Set<StateCallback>();
  private flowIndex = 0;
  private stepIndex = 0;
  private rafId: number | null = null;
  private lastTime = 0;
  private walkFrameAcc = 0;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private idleDialogueTimer: ReturnType<typeof setTimeout> | null = null;
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

  /** Start walking toward target. Velocity-based, no teleport. */
  private walkTo(zone: ZoneKey) {
    const t = this.getClampedTarget(zone);
    this.targetX = t.x;
    this.targetY = t.y;

    const dx = this.targetX - this.s.x;
    const dy = this.targetY - this.s.y;
    const dist = Math.hypot(dx, dy);

    if (dist < ARRIVAL_THRESHOLD) {
      this.arrive();
      return;
    }

    const dirX = dx / dist;
    const dirY = dy / dist;

    this.vx = dirX * WALK_SPEED;
    this.vy = dirY * WALK_SPEED;
    this.setState({
      state: "walk",
      facing: dirX >= 0 ? "right" : "left",
      walkFrame: 0,
    });
    this.walkFrameAcc = 0;
  }

  private arrive() {
    this.vx = 0;
    this.vy = 0;
    this.setState({
      x: this.targetX,
      y: this.targetY,
      walkFrame: 0,
    });
    const cb = this.onArrive;
    this.onArrive = null;
    if (cb) cb();
    else this.runNextStep();
  }

  private tick(now: number) {
    const dt = Math.min((now - this.lastTime) / 1000, 0.1);
    this.lastTime = now;

    if (this.s.state === "walk" && (this.vx !== 0 || this.vy !== 0)) {
      const dx = this.targetX - this.s.x;
      const dy = this.targetY - this.s.y;
      const dist = Math.hypot(dx, dy);

      if (dist < ARRIVAL_THRESHOLD) {
        this.arrive();
        this.scheduleNextTick();
        return;
      }

      const moveDist = WALK_SPEED * dt;
      let newX = this.s.x + this.vx * dt;
      let newY = this.s.y + this.vy * dt;

      if (Math.hypot(newX - this.targetX, newY - this.targetY) < moveDist) {
        newX = this.targetX;
        newY = this.targetY;
        this.arrive();
        this.scheduleNextTick();
        return;
      }

      this.setState({ x: newX, y: newY });

      this.walkFrameAcc += dt * 1000;
      if (this.walkFrameAcc >= WALK_FRAME_INTERVAL_MS) {
        this.walkFrameAcc -= WALK_FRAME_INTERVAL_MS;
        this.setState({
          walkFrame: (this.s.walkFrame + 1) % 4,
        });
      }
    }

    this.scheduleNextTick();
  }

  private scheduleNextTick() {
    if (this.rafId != null) return;
    this.rafId = requestAnimationFrame((now) => {
      this.rafId = null;
      this.lastTime = this.lastTime || now;
      this.tick(now);
    });
  }

  private runStep(step: FlowStep) {
    const t = this.getClampedTarget(step.zone);
    const dist = Math.hypot(t.x - this.s.x, t.y - this.s.y);

    const doPose = () => {
      this.setState({ x: t.x, y: t.y, state: step.pose });
      if (step.speechKey) {
        this.setState({ speech: getPhrase(step.speechKey as Parameters<typeof getPhrase>[0]) });
        setTimeout(() => this.setState({ speech: null }), 2200);
      }
      this.timer = setTimeout(() => this.runNextStep(), step.duration);
    };

    if (step.pose === "walk" && dist > ARRIVAL_THRESHOLD) {
      this.onArrive = () => this.runNextStep();
      this.walkTo(step.zone);
      if (step.speechKey) {
        setTimeout(() => {
          this.setState({ speech: getPhrase(step.speechKey as Parameters<typeof getPhrase>[0]) });
          setTimeout(() => this.setState({ speech: null }), 2200);
        }, 400);
      }
      return;
    }

    if (step.pose === "walk" && dist <= ARRIVAL_THRESHOLD) {
      this.runNextStep();
      return;
    }

    if (dist > ARRIVAL_THRESHOLD) {
      this.onArrive = doPose;
      this.walkTo(step.zone);
      return;
    }

    doPose();
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
      this.timer = setTimeout(() => this.runNextStep(), 2500);
    }
  }

  private runEntering() {
    const firstStep = FLOWS[0]![0]!;
    const t = this.getClampedTarget(firstStep.zone);

    this.setState({
      visible: true,
      x: t.x,
      y: t.y,
      state: "idle",
      facing: "right",
      speech: getPhrase("intro"),
      walkFrame: 0,
    });
    this.vx = 0;
    this.vy = 0;

    setTimeout(() => this.setState({ speech: null }), 2400);
    this.timer = setTimeout(() => {
      this.stepIndex = 1;
      this.runNextStep();
    }, 2600);

    this.scheduleNextTick();
  }

  private scheduleIdleDialogue() {
    if (this.idleDialogueTimer) clearTimeout(this.idleDialogueTimer);
    const delay = 30000 + Math.random() * 60000;
    this.idleDialogueTimer = setTimeout(() => {
      if (this.s.state === "idle" && !this.s.speech && (this.vx === 0 && this.vy === 0)) {
        this.setState({ state: "talk", speech: getRandomIdlePhrase() });
        setTimeout(() => this.setState({ speech: null, state: "idle" }), 2400);
      }
      this.scheduleIdleDialogue();
    }, delay);
  }

  triggerEvent(detail: CharacterEventDetail) {
    if (detail.type === "button_hover" || detail.type === "idle" || detail.type === "page_create") {
      if (this.timer) clearTimeout(this.timer);
      this.timer = null;
    }
    if (detail.type === "page_create") {
      this.onArrive = () => {
        this.setState({
          state: "talk",
          speech: getPhrase("page_create"),
          facing: "right",
        });
        setTimeout(() => {
          this.setState({ speech: null, state: "idle" });
          this.runNextStep();
        }, 2200);
      };
      this.walkTo("pageList");
      return;
    }
    if (detail.type === "text_change" && detail.content) {
      const phrase = getPhraseFromText(detail.content);
      if (phrase) {
        this.setState({ state: "talk", speech: phrase });
        setTimeout(() => this.setState({ speech: null, state: "idle" }), 2200);
      }
      return;
    }
    if (detail.type === "save_click") {
      this.setState({ state: "talk", speech: getPhrase("save_click") });
      setTimeout(() => this.setState({ speech: null }), 2000);
      return;
    }
    if (detail.type === "button_hover") {
      this.onArrive = () => {
        const t = this.getClampedTarget("saveArea");
        this.setState({
          state: "point",
          speech: getPhrase("button_hover"),
          facing: "right",
        });
        setTimeout(() => {
          this.setState({ speech: null, state: "idle" });
          this.runNextStep();
        }, 1800);
      };
      this.walkTo("saveArea");
      return;
    }
    if (detail.type === "idle") {
      this.onArrive = () => {
        this.setState({
          state: "talk",
          speech: getPhrase("nearLogout"),
          facing: "left",
        });
        setTimeout(() => {
          this.setState({ speech: null, state: "idle" });
          this.runNextStep();
        }, 2800);
      };
      this.walkTo("logoutArea");
    }
  }

  start() {
    this.flowIndex = 0;
    this.stepIndex = 0;
    this.runEntering();
    this.scheduleIdleDialogue();

    this.unsub.push(
      subscribeToCharacterEvents((d) => this.triggerEvent(d)),
      setupIdleDetection(() => this.triggerEvent({ type: "idle" }), 30000)
    );
  }

  stop() {
    if (this.rafId != null) cancelAnimationFrame(this.rafId);
    this.rafId = null;
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
    if (this.idleDialogueTimer) clearTimeout(this.idleDialogueTimer);
    this.idleDialogueTimer = null;
    this.unsub.forEach((f) => f());
  }
}
