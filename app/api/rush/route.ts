import { NextResponse } from "next/server";
import { getRushAIComment } from "@/lib/openai";
import type { AppLanguage } from "@/lib/translations";

export async function POST(request: Request) {
  let lang: AppLanguage = "en";
  try {
    const body = (await request.json()) as {
      pageTitle: string;
      contentPreview?: string;
      content?: string;
      requestAnother?: boolean;
      lang?: AppLanguage;
    };
    lang = body.lang === "ko" || body.lang === "en" ? body.lang : "en";
    const pageTitle = body.pageTitle ?? "Untitled";
    const content = body.content ?? body.contentPreview ?? "";
    const requestAnother = body.requestAnother === true;

    const comment = await getRushAIComment(pageTitle, content, {
      requestAnother,
      lang,
    });

    return NextResponse.json({ comment });
  } catch (e) {
    console.error("RUSH AI error:", e);
    const errorMsg =
      lang === "ko"
        ? "생각하다 에러 났어. 다음에 다시 시도해."
        : "Something went wrong. Try again.";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
