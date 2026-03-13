import { NextResponse } from "next/server";
import { getRushAIComment } from "@/lib/openai";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      pageTitle: string;
      contentPreview?: string;
      content?: string;
      requestAnother?: boolean;
    };
    const pageTitle = body.pageTitle ?? "Untitled";
    const content = body.content ?? body.contentPreview ?? "";
    const requestAnother = body.requestAnother === true;

    const comment = await getRushAIComment(pageTitle, content, {
      requestAnother,
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
