/**
 * RUSH AI - Language-aware template responses
 * Used when API is not called (page create, delete, empty save, fallbacks)
 */

import type { AppLanguage } from "@/lib/translations";

export type RushAction =
  | "page_create"
  | "page_save"
  | "subpage_create"
  | "content_save"
  | "delete"
  | "idle"
  | "ask_ai";

const RESPONSES_EN: Record<RushAction, string[]> = {
  page_create: [
    "New page? Nice. Every page is a step. Let's go!",
    "New page? Perfect. Blank canvas hits different.",
    "Another one! Building momentum.",
    "Page created. Good choice. No rest, 24/7 hustle.",
  ],
  page_save: [
    "Saved. Keep going. Small logs build big results.",
    "Locked in. Today's a win.",
    "Saved. Motion creates momentum.",
    "Done. Consistency wins.",
  ],
  subpage_create: [
    "Subpage? Nice. Structure is half the win.",
    "Adding hierarchy? Love it. Pros organize.",
    "Structure = clarity. Let's go.",
    "Subpage added. Good move.",
  ],
  content_save: [
    "Good memo. Keep stacking.",
    "Saved. Logging habit = winning habit.",
    "Locked. Your brain will thank you.",
    "Small logs, big impact.",
  ],
  delete: [
    "Deleted. Less is more sometimes.",
    "Cleaned up. Fresh slate.",
    "Removed. Sometimes subtracting is the move.",
  ],
  idle: [
    "Ready when you are. I'm watching.",
    "Chill. But don't rest too long.",
    "Let's go.",
  ],
  ask_ai: [], // OpenAI API response
};

const RESPONSES_KO: Record<RushAction, string[]> = {
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
  ask_ai: [],
};

export function getRandomResponse(
  action: RushAction,
  lang: AppLanguage = "en"
): string {
  const responses = lang === "ko" ? RESPONSES_KO : RESPONSES_EN;
  const list = responses[action];
  if (!list.length) return lang === "ko" ? "가. ㅋ" : "Let's go.";
  return list[Math.floor(Math.random() * list.length)]!;
}
