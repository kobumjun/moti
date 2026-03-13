export type AppLanguage = "en" | "ko";

export const translations = {
  en: {
    save: "Save",
    delete: "Delete",
    newPage: "+ New Page",
    subPage: "Sub Page",
    todayWorkLog: "Today Work Log",
    logout: "Logout",
    oneMoreLine: "One more line",
    addSubpage: "Add subpage",
    titlePlaceholder: "Title",
    contentPlaceholder: "Enter content...",
    deleteConfirm: "Delete this page?",
    emptyStateMessage: "Select or create a page.",
    thinking: "Thinking...",
  },
  ko: {
    save: "저장",
    delete: "삭제",
    newPage: "+ 새 페이지",
    subPage: "하위 페이지",
    todayWorkLog: "오늘 일과 기록",
    logout: "로그아웃",
    oneMoreLine: "한마디 더 듣기",
    addSubpage: "하위 페이지 추가",
    titlePlaceholder: "제목",
    contentPlaceholder: "내용을 입력하세요...",
    deleteConfirm: "이 페이지를 삭제할까요?",
    emptyStateMessage: "페이지를 선택하거나 새로 만들어 보세요.",
    thinking: "생각 중...",
  },
} as const;

export type TranslationKeys = keyof (typeof translations)["en"];
