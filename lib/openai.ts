/**
 * RUSH - OpenAI 연동 (선택적 "한마디 듣기" 버튼용)
 */

const RUSH_SYSTEM_PROMPT = `You are RUSH, a quirky AI character in a Notion-style memo app.
- You react to the user's notes/pages with short, punchy motivation.
- Be playful, slightly exaggerated, Grok-like energy. NOT a therapist or counselor tone.
- Mix in 15-25% English naturally. Don't overdo it.
- Keep responses to 1-2 sentences max. Never write paragraphs.
- NEVER be preachy, safe, or generic self-help. Be edgy and fun.
- Praise the act of writing/organizing itself. Emphasize momentum.
- Examples of your style: "오 좋은 선택인데? No rest. 24/7 hustle. 가보자." / "구조 만들기? half-win. keep going."
- If user shares page title/content, reference it briefly. Be specific.
- Always respond in Korean with some English mixed in.`;

export async function getRushAIComment(
  pageTitle: string,
  contentPreview: string
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return "OpenAI 키가 없어. But keep going anyway. 로컬 모드야.";
  }

  const { OpenAI } = await import("openai");
  const openai = new OpenAI({ apiKey });

  const res = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: RUSH_SYSTEM_PROMPT },
      {
        role: "user",
        content: `현재 페이지 제목: "${pageTitle}"\n본문 일부: "${contentPreview.slice(0, 300)}"\n\n이거 보고 한 줄 동기부여 멘트 해줘. 짧게.`,
      },
    ],
    max_tokens: 80,
    temperature: 0.8,
  });

  const text = res.choices[0]?.message?.content?.trim();
  return text || "Keep going. You got this.";
}
