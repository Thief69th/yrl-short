import QRCode from "qrcode";
import { NextResponse } from "next/server";

import {
  DatabaseNotConfiguredError,
  LinkConflictError,
  createShortLink,
} from "@/lib/links";
import { getBaseUrlFromRequest } from "@/lib/request";
import { parseShortenPayload } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const payload = parseShortenPayload(await request.json());
    const baseUrl = getBaseUrlFromRequest(request);
    const link = await createShortLink(payload, baseUrl);
    const qrDataUrl = await QRCode.toDataURL(link.shortUrl, {
      errorCorrectionLevel: "M",
      margin: 1,
      width: 320,
      color: {
        dark: "#0b7de4",
        light: "#ffffff",
      },
    });

    return NextResponse.json({
      ...link,
      qrDataUrl,
    });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Request body should be valid JSON." },
        { status: 400 },
      );
    }

    if (error instanceof LinkConflictError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    if (error instanceof DatabaseNotConfiguredError) {
      return NextResponse.json(
        { error: "Add a DATABASE_URL to enable link storage." },
        { status: 503 },
      );
    }

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Something went wrong while creating the short link." },
      { status: 500 },
    );
  }
}
