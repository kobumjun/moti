/**
 * heroDialogue - bilingual EN/KO, superhero sidekick tone
 * Playful, dramatic, motivational, confident - not goofy or childish
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
    "가자, 히어로. 역사는 스스로 쓰이지 않아.",
    "계속 나아가!",
  ],
  idle: [
    "오늘 이야기는 스스로 쓰이지 않아.",
    "한 줄만 적어봐.",
    "오늘 살았잖아. 기록해.",
    "역사는 쓰는 사람을 사랑해.",
    "기억할 만한 걸 써.",
    "한 줄이면 돼. 가자.",
    "좋은 날은 기록이 필요해.",
    "페이지가 기다리고 있어.",
    "히어로는 바라만 보지 않아. 써.",
    "한 단어가 모든 걸 바꿔.",
  ],
  save_click: [
    "쾅! 기록 완료!",
    "저장됐어. 미래의 네가 고마워할 거야.",
    "락 인. 잘했어.",
  ],
  page_create: [
    "새 페이지, 새 이야기.",
    "새 페이지다!",
    "전설적인 걸 써보자.",
  ],
  page_delete: [
    "삭제됐어. 새로 시작!",
    "없어졌어. 다음!",
  ],
  button_hover: [
    "그거! 눌러!",
    "눌러. 하고 싶잖아!",
  ],
  near_logout: [
    "로그아웃? 아직이야!",
    "있어. 한 줄만 더!",
    "멈추지 마!",
  ],
  page_selected: [
    "좋은 선택. 이제 써!",
    "가자!",
  ],
  typing_started: [
    "그래! 그게 정신이지!",
    "가자!",
  ],
  typing_stopped: [
    "쉬는 거야? 알겠어.",
    "한숨 돌리는군. 똑똒해.",
  ],
  lang_changed: [
    "언어 전환. 가자!",
    "새 언어, 같은 히어로!",
  ],
};

let lastKey: DialogueKey | null = null;
let lastIndex = -1;

export function getPhrase(lang: "en" | "ko", key: DialogueKey): string {
  const phrases = lang === "ko" ? PHRASES_KO[key]! : PHRASES_EN[key]!;
  let idx: number;
  if (key === lastKey && phrases.length > 1) {
    idx = (lastIndex + 1) % phrases.length;
  } else {
    idx = Math.floor(Math.random() * phrases.length);
  }
  lastKey = key;
  lastIndex = idx;
  return phrases[idx]!;
}
