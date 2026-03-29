import { NextResponse } from "next/server";

import { DatabaseNotConfiguredError, getLinksByCodes } from "@/lib/links";
import { getBaseUrlFromRequest } from "@/lib/request";
import { normalizeCode } from "@/lib/validators";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const rawCodes = searchParams.get("codes") ?? "";
    const codes = rawCodes
      .split(",")
      .map((value) => normalizeCode(value))
      .filter(Boolean);

    const links = await getLinksByCodes(codes, getBaseUrlFromRequest(request));

    return NextResponse.json({ links });
  } catch (error) {
    if (error instanceof DatabaseNotConfiguredError) {
      return NextResponse.json(
        { error: "Add a DATABASE_URL to load recent links." },
        { status: 503 },
      );
    }

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Unable to load saved short links." },
      { status: 500 },
    );
  }
}
