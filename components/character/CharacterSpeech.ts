/**
 * CharacterSpeech - Hype-man / grindset 대사 시스템
 * Playful, sarcastic, motivational, dopamine-heavy
 */

export type SpeechContext =
  | "page_load"
  | "button_hover"
  | "save_click"
  | "save_before_click"
  | "idle"
  | "scroll"
  | "walking"
  | "peek"
  | "point"
  | "arms_crossed"
  | "lets_go"
  | "thinking";

const PHRASES: Record<SpeechContext, string[]> = {
  page_load: [
    "야 집중. 지금 흐름 좋잖아.",
    "멈추지 마. 지금 저장 안 하면 날린다.",
    "좋아. 이건 된다. 계속 밀어.",
    "지금 손 멈추면 텐션 죽는다.",
    "생각만 하지 말고 눌러. 저장.",
    "오케이. 이거 감 왔다. 바로 가자.",
    "지금 타이밍 좋다. 망설이지 마.",
    "계속 써. 오늘 뽑아야지.",
    "이 정도면 거의 잡았다.",
    "어이, 멈추지 마. 한 번 더.",
  ],
  button_hover: [
    "저기. 그거 눌러.",
    "그 버튼. 지금.",
    "어? 클릭까지 갈 수 있지?",
    "오. 눈에 보이네. 눌러.",
  ],
  save_click: [
    "Nice. 저장됐다.",
    "저장. 이거 땀이야.",
    "Saved. 계속 밀어.",
  ],
  save_before_click: [
    "저장. 지금 눌러.",
    "저장 안 하면 날린다. 진짜.",
    "저장 버튼. 클릭.",
  ],
  idle: [
    "멈추지 마.",
    "뭔가 해봐. 지금.",
    "쉬면 텐션 죽는다.",
    "한 번 더. 가.",
  ],
  scroll: [
    "많이 썼네. 계속.",
    "내용 쌓인다. 좋아.",
    "스크롤? 계속 밀어.",
  ],
  walking: [
    "움직인다. good.",
    "여기저기 확인 중.",
    "계속 가. 멈추지 마.",
  ],
  peek: [
    "뭐해. 저장했어?",
    "여기 있어. 눈 감추지 마.",
    "봤다. 계속 해.",
  ],
  point: [
    "저기. 여기.",
    "저 버튼. 눌러.",
    "이거. 지금.",
  ],
  arms_crossed: [
    "이 정도면 인정.",
    "괜찮다. 계속 가.",
  ],
  lets_go: [
    "가자. let's go.",
    "바로 여기서 밀어.",
    "지금. go.",
  ],
  thinking: [
    "음... 이건 될 것 같은데.",
    "괜찮아. 밀어.",
  ],
};

export function getRandomPhrase(context: SpeechContext): string {
  const list = PHRASES[context];
  if (!list.length) return "가.";
  return list[Math.floor(Math.random() * list.length)]!;
}
