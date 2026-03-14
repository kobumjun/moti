/**
 * robotDialogue - bilingual EN/KO, confident playful tone
 */

export type DialogueKey =
  | "intro"
  | "idle"
  | "save_click"
  | "page_create"
  | "page_delete"
  | "button_hover"
  | "near_logout"
  | "page_selected"
  | "typing_started"
  | "typing_stopped"
  | "lang_changed";

const EN: Record<DialogueKey, string[]> = {
  intro: ["Let's go.", "Ready when you are.", "System online."],
  idle: ["Ready.", "Waiting for input.", "Standing by.", "Your move.", "Take your time."],
  save_click: ["Saved.", "Stored.", "Done."],
  page_create: ["New page.", "Created.", "Go."],
  page_delete: ["Deleted.", "Cleared."],
  button_hover: ["Press it.", "Right there."],
  near_logout: ["Stay.", "One more thing?"],
  page_selected: ["Good choice.", "Proceed."],
  typing_started: ["Go.", "Nice."],
  typing_stopped: ["Paused. OK."],
  lang_changed: ["Language updated.", "Switched."],
};

const KO: Record<DialogueKey, string[]> = {
  intro: ["가자.", "준비됐어.", "시스템 온라인."],
  idle: ["대기 중.", "입력 기다리는 중.", "스탠바이.", "당신 차례야.", "천천히."],
  save_click: ["저장됐어.", "기록됐어.", "완료."],
  page_create: ["새 페이지.", "생성됐어.", "가자."],
  page_delete: ["삭제됐어.", "정리됐어."],
  button_hover: ["눌러.", "거기."],
  near_logout: ["있어.", "한 가지만 더?"],
  page_selected: ["좋아.", "진행해."],
  typing_started: ["가자.", "좋아."],
  typing_stopped: ["멈췄어. 괜찮아."],
  lang_changed: ["언어 변경됐어.", "바뀌었어."],
};

let lastKey: DialogueKey | null = null;
let lastIdx = -1;

export function getPhrase(lang: "en" | "ko", key: DialogueKey): string {
  const arr = lang === "ko" ? KO[key]! : EN[key]!;
  const idx = key === lastKey && arr.length > 1 ? (lastIdx + 1) % arr.length : Math.floor(Math.random() * arr.length);
  lastKey = key;
  lastIdx = idx;
  return arr[idx]!;
}
