/**
 * CharacterSpeech - playful motivational superhero personality
 */

export type SpeechContext =
  | "intro"
  | "pageList"
  | "nextZone"
  | "editor"
  | "toSave"
  | "pointSave"
  | "peek"
  | "shrug"
  | "nearLogout"
  | "flow"
  | "keepGoing"
  | "button_hover"
  | "save_click"
  | "page_create"
  | "workout"
  | "completion"
  | "tired"
  | "planning"
  | "generic"
  | "reactingToText"
  | "idle";

const PHRASES: Record<SpeechContext, string[]> = {
  intro: [
    "Stop? That's a loser's choice!",
    "Keep moving, hero!",
    "Today we write history. Let's go!",
  ],
  pageList: [
    "Your pages. Your story.",
    "Organize like a champ!",
  ],
  nextZone: [
    "To the editor we go!",
    "Next stop: greatness!",
  ],
  editor: [
    "Today we write history.",
    "Greatness starts with one line!",
    "Come on! Record the day!",
  ],
  toSave: [
    "Save button incoming!",
    "Let's lock this in!",
  ],
  pointSave: [
    "That one! Press it!",
    "Save. Right there. Go!",
  ],
  peek: [
    "I see you, hero.",
    "Still here. Still waiting!",
  ],
  shrug: [
    "Hmm. Your call!",
    "Whatever works, champ!",
  ],
  nearLogout: [
    "Logout? Not yet, hero!",
    "Stay. One more line!",
  ],
  flow: [
    "Keep moving, hero!",
    "Today we write history.",
  ],
  keepGoing: [
    "Don't stop now!",
    "One line is enough. Go!",
  ],
  button_hover: [
    "That one! Press it!",
    "Click it. You know you want to!",
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
  workout: [
    "Write like you train. Go!",
    "Momentum! Keep it!",
  ],
  completion: [
    "That's how it's done!",
    "Locked in. Nice!",
  ],
  tired: [
    "One more line, hero!",
    "Tired? Heroes push through!",
  ],
  planning: [
    "Plans are good. Action is better!",
    "Write it down. Make it real!",
  ],
  generic: [
    "Greatness starts with one line.",
    "Come on hero, drop a line.",
  ],
  reactingToText: [
    "Yes! That's the spirit!",
    "Keep going! I see you!",
  ],
  idle: [
    "Today's story won't write itself.",
    "Come on hero, drop a line.",
    "You lived today. Record it.",
    "History loves people who write.",
    "Write something worth remembering.",
    "Let's go. One line is enough.",
    "Great days deserve records.",
    "Stop? That's a loser's choice!",
    "Keep moving, hero!",
    "Today we write history.",
    "The page is waiting. What are you?",
    "Heroes don't watch. They write.",
    "One word changes everything.",
  ],
};

const IDLE_PHRASES = PHRASES.idle;
const IDLE_AVOID_RECENT = 5;

let lastUsedIdle: string[] = [];

export function getPhrase(key: SpeechContext): string {
  const list = PHRASES[key];
  if (!list?.length) return PHRASES.generic[Math.floor(Math.random() * PHRASES.generic.length)]!;
  return list[Math.floor(Math.random() * list.length)]!;
}

export function getRandomIdlePhrase(): string {
  const avoid = new Set(lastUsedIdle);
  const candidates = IDLE_PHRASES.filter((p) => !avoid.has(p));
  const list = candidates.length > 0 ? candidates : IDLE_PHRASES;
  const chosen = list[Math.floor(Math.random() * list.length)]!;
  lastUsedIdle = [chosen, ...lastUsedIdle.slice(0, IDLE_AVOID_RECENT - 1)];
  return chosen;
}

const KEYWORD_MAP: { pattern: RegExp; context: SpeechContext }[] = [
  { pattern: /운동|헬스|스쿼트|러닝|벌크|다이어트|gym|workout/i, context: "workout" },
  { pattern: /저장|완료|끝|정리|done|finish/i, context: "completion" },
  { pattern: /피곤|졸림|지침|힘듦|tired|sleepy/i, context: "tired" },
  { pattern: /계획|목표|루틴|plan|goal|routine/i, context: "planning" },
];

export function getPhraseFromText(text: string): string | null {
  const t = (text || "").trim();
  if (t.length < 3) return null;
  for (const { pattern, context } of KEYWORD_MAP) {
    if (pattern.test(t)) return getPhrase(context);
  }
  return null;
}
