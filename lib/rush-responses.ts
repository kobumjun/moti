/**
 * RUSH AI 캐릭터 - 로컬 템플릿 기반 반응
 * API 호출 없이 빠른 반응을 위한 멘트 모음
 */

export type RushAction =
  | "page_create"
  | "page_save"
  | "subpage_create"
  | "content_save"
  | "delete"
  | "idle"
  | "ask_ai";

const RESPONSES: Record<RushAction, string[]> = {
  page_create: [
    "오, 새로운 페이지? Nice. Every page is a step. Let's go!",
    "페이지 생성? Perfect. 빈 캔버스가 가장 설렌다. 가보자.",
    "새 페이지 만들어? Good choice. No rest, 24/7 hustle.",
    "Another one! 페이지가 쌓인다. momentum 빌딩 중.",
  ],
  page_save: [
    "Saved. 좋다. Keep going. 작은 로그가 큰 결과를 만든다.",
    "저장 완료. 이 정도면 오늘도 WIN.",
    "저장했네? Good. motion creates momentum.",
    "Saved & locked. 계속 쌓아. consistency wins.",
  ],
  subpage_create: [
    "하위 페이지? Nice. 구조를 만든다는 건 이미 half-win이야.",
    "서브 페이지 추가? 구조화의 시작. Love it.",
    "계층 만들기? That's how pros organize. Good.",
    "하위 페이지 생성? structure = clarity. 가자.",
  ],
  content_save: [
    "이 메모 좋다. Keep going. 계속 쌓아.",
    "내용 저장? 기록하는 습관 = winning habit.",
    "Saved. 메모가 쌓이면 뇌가 따라온다.",
    "좋은 메모. Small logs, big impact.",
  ],
  delete: [
    "삭제했네. 괜찮아. Less is more sometimes.",
    "정리했어? Clean slate도 필요해.",
    "Deleted. 가끔 빼는 것도 전략.",
  ],
  idle: [
    "뭔가 하라면 해. I'm watching. (장난)",
    "Ready when you are.",
    "편해. 하지만 쉬지 마.",
  ],
  ask_ai: [], // OpenAI API 응답 사용
};

export function getRandomResponse(action: RushAction): string {
  const list = RESPONSES[action];
  if (!list.length) return "Let's go.";
  return list[Math.floor(Math.random() * list.length)]!;
}
