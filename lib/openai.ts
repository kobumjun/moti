/**
 * RUSH - OpenAI 연동
 * 페이지 제목 + 본문을 읽고, UI 언어에 맞게 글록식 말투로 반응
 */

import type { AppLanguage } from "@/lib/translations";

function getSystemPrompt(lang: AppLanguage): string {
  if (lang === "en") {
    return `You are RUSH, an AI character in a memo app. Grok-style tone:
- SHORT. 1-2 sentences. Period.
- SHARP. Punchy, cut to the chase.
- PLAYFUL. Light mischief.
- WITTY. Slightly cocky but still supportive.
- CHEEKY, not rude.

DO NOT: therapy-bot, overexplain, generic motivational clichés, cute/childish, formal coach tone.

DO: React SPECIFICALLY to what the user wrote. Mention concrete items (exercise, payment, dev work, client requests, etc). Say it with style.

Examples: "Today's log hits different." / "Workout, payment, dev in one flow? Nice." / "This much done today? Alright, respect."

ALWAYS respond in English only. Keep it to 1-2 sentences.`;
  }

  return `You are RUSH, an AI character in a memo app. 글록식(Grok-style) 말투:
- SHORT. 1~2문장. 끝.
- SHARP. 칼처럼 딱 자르는 느낌.
- PLAYFUL. 장난기 있음.
- MISCHIEVOUS. 약간 건방지지만 미운 맛은 아님.
- WITTY. 재치 있게.
- Slightly cocky. 잘난 척 살짝.
- Still supportive. 그래도 응원해주는 느낌.
- CHEEKY, not rude.

DO NOT: 상담사 톤, 과한 설명, 진부한 자기계발 말, 귀엽/유치, 공식 코치 톤.

DO: 사용자가 쓴 내용에 구체적으로 반응. 운동, 결제, 개발, 고객 요청 등 언급. 인상에 남게.

Examples: "오, 오늘 로그 좀 사는데?" / "운동 넣고, 결제 받고, 개발까지? 흐름 좋네."

ALWAYS respond in Korean only. 영어 15~25% 자연스럽게 섞기. 1~2문장으로 끝내.`;
}

function getUserMessages(
  lang: AppLanguage,
  pageTitle: string,
  contentText: string,
  hasContent: boolean,
  requestAnother: boolean
): string {
  if (lang === "en") {
    if (requestAnother) {
      return hasContent
        ? `Same page, different phrasing. Reply in English.\nTitle: "${pageTitle}"\nContent:\n${contentText}`
        : `Title-only page. One-liner in English.\nTitle: "${pageTitle}"`;
    }
    return hasContent
      ? `Page title: "${pageTitle}"\nContent:\n${contentText}\n\nRead and reply in English. Mention specific items from the content. Grok-style.`
      : `Page title: "${pageTitle}"\n(empty)\n\nShort one-liner in English for a new/empty page.`;
  }

  if (requestAnother) {
    return hasContent
      ? `같은 내용인데 다른 각도/표현으로 한마디 더 해줘. (한국어로)\n제목: "${pageTitle}"\n본문:\n${contentText}`
      : `제목만 있는 페이지. 다른 표현으로 한마디 해줘. (한국어로)\n제목: "${pageTitle}"`;
  }
  return hasContent
    ? `페이지 제목: "${pageTitle}"\n본문 내용:\n${contentText}\n\n이거 읽고 한마디 해줘. (한국어로) 본문에 나온 것들 구체적으로 언급. 글록식으로.`
    : `페이지 제목: "${pageTitle}"\n(본문 비어있음)\n\n새 페이지에 맞게 짧게 한마디. (한국어로)`;
}

function getFallbackMessage(lang: AppLanguage, noApiKey: boolean): string {
  if (noApiKey) {
    return lang === "en" ? "No API key. Keep going anyway. Local mode." : "OpenAI 키 없음. 그냥 가. 로컬 모드야.";
  }
  return lang === "en" ? "Let's go." : "가. ㅋ";
}

export async function getRushAIComment(
  pageTitle: string,
  content: string,
  options?: { requestAnother?: boolean; lang?: AppLanguage }
): Promise<string> {
  const lang = options?.lang ?? "ko";
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return getFallbackMessage(lang, true);
  }

  const { OpenAI } = await import("openai");
  const openai = new OpenAI({ apiKey });

  const contentText = (content || "").trim().slice(0, 1200);
  const hasContent = contentText.length > 0;
  const requestAnother = options?.requestAnother ?? false;

  const systemPrompt = getSystemPrompt(lang);
  const userMessage = getUserMessages(
    lang,
    pageTitle,
    contentText,
    hasContent,
    requestAnother
  );

  const res = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ],
    max_tokens: 100,
    temperature: 0.85,
  });

  const text = res.choices[0]?.message?.content?.trim();
  return text || getFallbackMessage(lang, false);
}
