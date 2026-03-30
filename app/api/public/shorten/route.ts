import { createPublicLink } from "@/lib/links";
import { getBaseUrlFromRequest } from "@/lib/request";
import { jsonError } from "@/lib/http";
import { parseCreateLinkPayload } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const payload = parseCreateLinkPayload(await request.json());
    const link = await createPublicLink(payload, getBaseUrlFromRequest(request));
    return Response.json({ link }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
