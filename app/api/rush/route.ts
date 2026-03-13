import { NextResponse } from "next/server";
import { getRushAIComment } from "@/lib/openai";
import type { AppLanguage } from "@/lib/translations";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      pageTitle: string;
      contentPreview?: string;
      content?: string;
      requestAnother?: boolean;
      lang?: AppLanguage;
    };
    const pageTitle = body.pageTitle ?? "Untitled";
    const content = body.content ?? body.contentPreview ?? "";
    const requestAnother = body.requestAnother === true;
    const lang = body.lang === "ko" || body.lang === "en" ? body.lang : "en";

    const comment = await getRushAIComment(pageTitle, content, {
      requestAnother,
      lang,
    });

    return NextResponse.json({ comment });
  } catch (e) {
    console.error("RUSH AI error:", e);
    return NextResponse.json(
      { error: "생각하다 에러 났어. 다음에 다시 시도해." },
      { status: 500 }
    );
  }
}
