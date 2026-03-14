/**
 * mascotDialogue - bilingual EN/KO, repetition prevention
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

const PHRASES_EN: Record<DialogueKey, string[]> = {
  intro: [
    "Stop? That's a loser's choice!",
    "Come on, hero. History won't write itself.",
    "Keep moving, hero!",
  ],
  idle: [
    "Today's story won't write itself.",
    "Come on hero, drop a line.",
    "You lived today. Record it.",
    "History loves people who write.",
    "Write something worth remembering.",
    "Let's go. One line is enough.",
    "Great days deserve records.",
    "The page is waiting. What are you?",
    "Heroes don't watch. They write.",
    "One word changes everything.",
    "Come on, hero. History won't write itself.",
  ],
  save_click: [
    "Boom! Memory secured!",
    "Saved. Future you will thank you.",
    "Locked in. That's a good one.",
  ],
  page_create: [
    "Fresh page. Fresh story.",
    "New page, hero!",
    "Let's write something legendary.",
  ],
  page_delete: [
    "Deleted. Fresh start!",
    "Gone. Next!",
  ],
  button_hover: [
    "That one! Press it!",
    "Click it. You know you want to!",
  ],
  near_logout: [
    "Logout? Not yet, hero!",
    "Stay. One more line!",
    "Stop? That's a loser's choice!",
  ],
  page_selected: [
    "Good pick. Now write!",
    "Let's go!",
  ],
  typing_started: [
    "Yes! That's the spirit!",
    "Go, go, go!",
  ],
  typing_stopped: [
    "Pause? Okay. I'll wait.",
    "Taking a breath. Smart.",
  ],
  lang_changed: [
    "Language switched. Let's go!",
    "New language, same hero!",
  ],
};

const PHRASES_KO: Record<DialogueKey, string[]> = {
  intro: [
    "멈춘다고? 그건 패배자의 선택이지!",
    "좋아! 히어로. 역사는 저절로 쓰이지 않아.",
    "계속 가, 히어로!",
  ],
  idle: [
    "오늘 이야기가 저절로 쓰이진 않아.",
    "야, 히어로. 한 줄만 적어 봐.",
    "오늘 하루 살았잖아. 기록해.",
    "쓰는 사람을 역사가 좋아해.",
    "기억할 만한 걸 써.",
    "가자. 한 줄이면 돼.",
    "좋은 날은 기록이 필요해.",
    "페이지가 기다리고 있어. 뭐 하는 거야?",
    "히어로는 보고만 있지 않아. 쓴다.",
    "한 단어가 모든 걸 바꿔.",
  ],
  save_click: [
    "쾅! 기록 확보!",
    "저장됐어. 미래의 네가 고맙게 할 거야.",
    "완료. 좋은 한 줄이야.",
  ],
  page_create: [
    "새 페이지. 새 이야기.",
    "새 페이지, 히어로!",
    "전설적인 걸 써 보자.",
  ],
  page_delete: [
    "삭제. 새 시작!",
    "사라졌어. 다음!",
  ],
  button_hover: [
    "저거! 눌러!",
    "클릭해. 넌 하고 싶잖아!",
  ],
  near_logout: [
    "로그아웃? 아직이야, 히어로!",
    "있어. 한 줄만 더!",
    "멈춘다고? 그건 패배자의 선택이지!",
  ],
  page_selected: [
    "좋은 선택. 이제 써!",
    "가자!",
  ],
  typing_started: [
    "좋아! 그거야!",
    "가자, 가자!",
  ],
  typing_stopped: [
    "쉬는 중? 알겠어. 기다릴게.",
    "숨 고르기. 현명해.",
  ],
  lang_changed: [
    "언어 바뀜. 가자!",
    "새 언어, 같은 히어로!",
  ],
};

const AVOID_LAST = 5;
const lastUsed: string[] = [];

function pickFrom(list: string[], avoid: Set<string>): string {
  const candidates = list.filter((s) => !avoid.has(s));
  const arr = candidates.length > 0 ? candidates : list;
  return arr[Math.floor(Math.random() * arr.length)]!;
}

export function getPhrase(
  lang: "en" | "ko",
  key: DialogueKey,
  avoidRepetition = true
): string {
  const phrases = lang === "ko" ? PHRASES_KO : PHRASES_EN;
  const list = phrases[key] ?? phrases.intro;
  const avoid = avoidRepetition ? new Set(lastUsed) : new Set<string>();
  const chosen = pickFrom(list, avoid);
  if (avoidRepetition) {
    lastUsed.unshift(chosen);
    if (lastUsed.length > AVOID_LAST) lastUsed.pop();
  }
  return chosen;
}
