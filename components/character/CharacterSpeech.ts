/**
 * CharacterSpeech - AI 없는 템플릿 기반 대사 시스템
 * 상황별 랜덤 대사 출력
 */

export type SpeechContext =
  | "page_load"
  | "button_hover"
  | "save_click"
  | "save_before_click"
  | "idle"
  | "scroll"
  | "random_walk"
  | "peek"
  | "point"
  | "arms_crossed"
  | "jump"
  | "fall"
  | "disappear";

const PHRASES: Record<SpeechContext, string[]> = {
  page_load: [
    "야야야 잠깐만!! 저장 안 눌렀다!!",
    "이거 안 저장하면 나 울어 진짜",
    "오... 지금 좋은 느낌인데?",
    "잠깐. 이거 한번 더 확인하자.",
    "음... 뭔가 이상한데?",
    "좋아 좋아 지금 흐름 좋다",
    "드디어 왔네! 뭐 할 거야?",
    "오케이 오케이. 준비됐어.",
  ],
  button_hover: [
    "어? 그거 눌러봐.",
    "오 그 버튼 좋은데?",
    "저기 뭔가 있네?",
    "호버했네. 클릭까지 갈 수 있지?",
  ],
  save_click: [
    "저장! Nice!",
    "저장 완료. 오늘도 WIN.",
    "Saved! 좋다.",
    "저장 눌렀다. 만족.",
  ],
  save_before_click: [
    "저장 버튼 좀 눌러줘!!",
    "저장!! 제발!!",
    "저장 안 하면 다 날아가!!",
    "야 저장해!!",
  ],
  idle: [
    "뭔가 해볼래?",
    "쉬는 중? 괜찮아.",
    "편해. 근데 너무 오래 쉬진 마.",
    "나 여기 있어. 필요하면 불러.",
  ],
  scroll: [
    "스크롤 중이네?",
    "많이 적었네.",
    "내용 많다. 좋아.",
  ],
  random_walk: [
    "산책 중~",
    "여기저기 와봤어.",
    "움직이는 게 좋아.",
  ],
  peek: [
    "... 뭐해?",
    "나 여기 있어.",
    "빼꼼.",
  ],
  point: [
    "저기 봐!",
    "여기! 여기!",
    "이거!!",
  ],
  arms_crossed: [
    "음... 괜찮은데?",
    "뭔가 만족스럽다.",
    "이 정도면 인정.",
  ],
  jump: [
    "와!!",
    "좋아!!",
    "점프!!",
  ],
  fall: [
    "으악!!",
    "떨어진다!!",
    "챵!",
  ],
  disappear: [
    "잠깐 나 갔다 올게.",
    "...",
    "뿅.",
  ],
};

export function getRandomPhrase(context: SpeechContext): string {
  const list = PHRASES[context];
  if (!list.length) return "...";
  return list[Math.floor(Math.random() * list.length)]!;
}
