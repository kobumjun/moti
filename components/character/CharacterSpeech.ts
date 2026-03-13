/**
 * CharacterSpeech - 하이브리드 대사
 * 1) 랜덤/아이들 2) 이벤트 기반 3) 키워드 기반 (AI 없음)
 */

export type SpeechContext =
  | "page_load"
  | "button_hover"
  | "save_click"
  | "idle"
  | "scroll"
  | "walking"
  | "peek"
  | "point"
  | "arms_crossed"
  | "lets_go"
  | "thinking"
  | "near_logout"
  | "workout"      // 운동/헬스/스쿼트 등
  | "completion"   // 저장/완료/끝 등
  | "tired"        // 피곤/졸림 등
  | "planning"     // 계획/목표/루틴
  | "generic"
  | "hype"
  | "frustrated"
  | "cheering";

const PHRASES: Record<SpeechContext, string[]> = {
  page_load: [
    "좋아. 지금부터 텐션 올린다.",
    "멈추지 마. 여기서 끊기면 아깝다.",
    "계속 써. 흐름 왔다.",
    "오케이, 이건 된다. 더 밀어.",
  ],
  button_hover: [
    "저기. 그거 눌러.",
    "클릭. 지금.",
    "저 버튼. 눈에 보이지?",
  ],
  save_click: [
    "저장. 이거 땀이야.",
    "Nice. 저장됐다.",
    "계속 밀어.",
  ],
  idle: [
    "멈추지 마.",
    "쉬면 텐션 죽는다.",
    "한 줄 더. 가.",
  ],
  scroll: [
    "많이 썼네. 계속.",
    "내용 쌓인다.",
  ],
  walking: [
    "움직인다. good.",
    "여기저기 확인 중.",
  ],
  peek: [
    "뭐해. 저장했어?",
    "여기 있어.",
    "봤다. 계속 해.",
  ],
  point: [
    "저기. 여기.",
    "저 버튼. 눌러.",
  ],
  arms_crossed: [
    "이 정도면 인정.",
    "괜찮다. 계속 가.",
  ],
  lets_go: [
    "가자. let's go.",
    "지금. go.",
  ],
  thinking: [
    "음... 이건 될 것 같은데.",
  ],
  near_logout: [
    "절대 로그아웃 누르지 마. keep going.",
    "로그아웃? 아니다. 계속 해.",
  ],
  workout: [
    "운동했어? 좋네. 그 기세 그대로 가.",
    "헬스? 벌크? 가자.",
    "다이어트 중이야? 잘하고 있어.",
    "스쿼트 한 번 더.",
  ],
  completion: [
    "저장. 지금 하면 된다.",
    "정리 잘했다.",
    "끝냈다? momentum 이거다.",
  ],
  tired: [
    "피곤해? 한 줄만 더.",
    "졸리면 손 먼저 움직여.",
    "지침? 5분만 더.",
  ],
  planning: [
    "목표 세웠어? 실행해.",
    "루틴 계획? 지금 시작해.",
    "계획만 하지 말고 해.",
  ],
  generic: [
    "좋아. 한 줄 더.",
    "이 타이밍 놓치면 다시 안 온다.",
    "지금 저장 안 하면 손해다.",
    "계속 써. 오늘 뽑아야지.",
  ],
  hype: [
    "와. 이거 된다.",
    "이거야. 이거.",
  ],
  frustrated: [
    "really? 저장해.",
    "야. 저장.",
  ],
  cheering: [
    "가자!",
    "이 정도면 잡았다.",
  ],
};

const KEYWORD_MAP: { pattern: RegExp; context: SpeechContext }[] = [
  { pattern: /운동|헬스|스쿼트|러닝|벌크|다이어트|짐|gym|workout/i, context: "workout" },
  { pattern: /저장|완료|끝|정리|done|finish/i, context: "completion" },
  { pattern: /피곤|졸림|지침|힘듦|tired|sleepy/i, context: "tired" },
  { pattern: /계획|목표|루틴|plan|goal|routine/i, context: "planning" },
];

export function getRandomPhrase(context: SpeechContext): string {
  const list = PHRASES[context];
  if (!list?.length) return PHRASES.generic[Math.floor(Math.random() * PHRASES.generic.length)]!;
  return list[Math.floor(Math.random() * list.length)]!;
}

export function getPhraseFromText(text: string): string | null {
  const combined = (text || "").trim();
  if (combined.length < 3) return null;
  for (const { pattern, context } of KEYWORD_MAP) {
    if (pattern.test(combined)) return getRandomPhrase(context);
  }
  return null;
}
