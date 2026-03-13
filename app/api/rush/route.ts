import { NextResponse } from "next/server";
import { getRushAIComment } from "@/lib/openai";

export async function POST(request: Request) {
  try {
    const { pageTitle, contentPreview } = (await request.json()) as {
      pageTitle: string;
      contentPreview: string;
    };
    const comment = await getRushAIComment(
      pageTitle || "Untitled",
      contentPreview || ""
    );
    return NextResponse.json({ comment });
  } catch (e) {
    console.error("RUSH AI error:", e);
    return NextResponse.json(
      { error: "생각하다 에러 났어. 다음에 다시 시도해." },
      { status: 500 }
    );
  }
}
