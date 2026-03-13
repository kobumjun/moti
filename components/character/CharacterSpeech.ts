/**
 * CharacterSpeech - 시퀀스/이벤트/키워드 대사
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
  | "workout"
  | "completion"
  | "tired"
  | "planning"
  | "generic"
  | "reactingToText";

const PHRASES: Record<SpeechContext, string[]> = {
  intro: [
    "이 사이트 내가 소개한다. 따라와.",
    "좋아, 여기 흐름 잡혔다.",
    "계속 가. 지금 끊으면 텐션 죽는다.",
  ],
  pageList: [
    "저기 봐. 페이지 여기 있다.",
    "이 리스트. 잘 정리해봐.",
  ],
  nextZone: [
    "좋아. 다음 구역 간다.",
    "저기 에디터. 가보자.",
  ],
  editor: [
    "여기 적어. 계속.",
    "쓰는 거다. 멈추지 마.",
  ],
  toSave: [
    "좋아, 이제 저장 쪽으로 간다.",
    "저장 버튼 쪽으로.",
  ],
  pointSave: [
    "저기 봐. 다음은 저 버튼이다.",
    "저장. 여기.",
  ],
  peek: [
    "뭐해. 저장했어?",
    "여기 있어. 눈 감추지 마.",
  ],
  shrug: [
    "음... 괜찮은데?",
    "이 정도면 됐어.",
  ],
  nearLogout: [
    "절대 로그아웃 누르지 마. 아직 안 끝났어.",
    "로그아웃? 아니다. 계속 해.",
  ],
  flow: [
    "좋아, 여기 흐름 잡혔다.",
    "계속 가.",
  ],
  keepGoing: [
    "좋아. 계속 가.",
    "멈추지 마.",
  ],
  button_hover: [
    "저기. 그거 눌러.",
    "클릭. 지금.",
  ],
  save_click: [
    "저장. 이거 땀이야.",
    "Nice. 저장됐다.",
  ],
  workout: [
    "운동했어? 좋네.",
    "헬스? 가자.",
  ],
  completion: [
    "저장. 지금 하면 된다.",
    "정리 잘했다.",
  ],
  tired: [
    "피곤해? 한 줄만 더.",
    "졸리면 손 먼저 움직여.",
  ],
  planning: [
    "목표 세웠어? 실행해.",
    "계획만 하지 말고 해.",
  ],
  generic: [
    "좋아. 한 줄 더.",
    "지금 저장 안 하면 손해다.",
    "계속 써.",
  ],
  reactingToText: [
    "좋아. 계속.",
    "이거 된다.",
  ],
};

const KEYWORD_MAP: { pattern: RegExp; context: SpeechContext }[] = [
  { pattern: /운동|헬스|스쿼트|러닝|벌크|다이어트|gym|workout/i, context: "workout" },
  { pattern: /저장|완료|끝|정리|done|finish/i, context: "completion" },
  { pattern: /피곤|졸림|지침|힘듦|tired|sleepy/i, context: "tired" },
  { pattern: /계획|목표|루틴|plan|goal|routine/i, context: "planning" },
];

export function getPhrase(key: SpeechContext): string {
  const list = PHRASES[key];
  if (!list?.length) return PHRASES.generic[Math.floor(Math.random() * PHRASES.generic.length)]!;
  return list[Math.floor(Math.random() * list.length)]!;
}

export function getPhraseFromText(text: string): string | null {
  const t = (text || "").trim();
  if (t.length < 3) return null;
  for (const { pattern, context } of KEYWORD_MAP) {
    if (pattern.test(t)) return getPhrase(context);
  }
  return null;
}
