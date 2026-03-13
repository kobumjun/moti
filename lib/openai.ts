/**
 * RUSH - OpenAI 연동
 * 페이지 제목 + 본문을 읽고 글록식 말투로 반응
 */

const RUSH_SYSTEM_PROMPT = `You are RUSH, an AI character in a memo app. Your tone is "글록식" (Grok-style):

- SHORT. 1~2문장. 끝.
- SHARP. 칼처럼 딱 자르는 느낌.
- PLAYFUL. 장난기 있음.
- MISCHIEVOUS. 약간 건방지지만 미운 맛은 아님.
- WITTY. 재치 있게.
- Slightly cocky. 잘난 척 살짝.
- Still supportive under the surface. 그래도 응원해주는 느낌.
- CHEEKY, not rude. 건방지되 무례하지 않게.

DO NOT:
- Therapy-bot tone. 상담사처럼 말하지 마.
- Overexplain. 설명 길게 하지 마.
- Generic motivational clichés. "작은 걸음이" 같은 진부한 말 금지.
- Cute/childish tone. 너무 귀엽게 하지 마.
- Formal productivity coach. 공식적인 자기계발 코치처럼 말하지 마.

DO:
- React SPECIFICALLY to what the user wrote. 운동, 결제, 개발, 고객 요청 같은 걸 구체적으로 언급해.
- Say it with style. 인상에 남게.
- Feel alive. 캐릭터처럼 살아있는 느낌.

Examples of your style:
- "오, 오늘 로그 좀 사는데?"
- "운동 넣고, 결제 받고, 개발까지? 흐름 좋네."
- "고객 요청 처리한 다음 개발까지 박은 거 보면 오늘 손이 살아있었네."
- "이 정도면 빈말 말고 인정. 오늘은 좀 굴렀다."
- "커피로 예열하고 일 박은 날이네. 이런 날이 쌓이는 거지."

Always respond in Korean. 영어 15~25% 자연스럽게 섞기.
응답은 반드시 1~2문장으로 끝내.`;

export async function getRushAIComment(
  pageTitle: string,
  content: string,
  options?: { requestAnother?: boolean }
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return "OpenAI 키 없음. 그냥 가. 로컬 모드야.";
  }

  const { OpenAI } = await import("openai");
  const openai = new OpenAI({ apiKey });

  const contentText = (content || "").trim().slice(0, 1200);
  const hasContent = contentText.length > 0;

  let userMessage: string;
  if (options?.requestAnother) {
    userMessage = hasContent
      ? `같은 내용인데 다른 각도/표현으로 한마디 더 해줘.\n제목: "${pageTitle}"\n본문:\n${contentText}`
      : `제목만 있는 페이지. 다른 표현으로 한마디 해줘.\n제목: "${pageTitle}"`;
  } else {
    userMessage = hasContent
      ? `페이지 제목: "${pageTitle}"\n본문 내용:\n${contentText}\n\n이거 읽고 한마디 해줘. 본문에 나온 것들(운동, 결제, 개발, 고객 요청 등)을 구체적으로 언급하면서 글록식으로.`
      : `페이지 제목: "${pageTitle}"\n(본문 비어있음)\n\n새 페이지거나 아직 적은 거니까 그에 맞게 짧게 한마디.`;
  }

  const res = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: RUSH_SYSTEM_PROMPT },
      { role: "user", content: userMessage },
    ],
    max_tokens: 100,
    temperature: 0.85,
  });

  const text = res.choices[0]?.message?.content?.trim();
  return text || "가. ㅋ";
}
