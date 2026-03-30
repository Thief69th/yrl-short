import { jsonError } from "@/lib/http";
import { recordAdImpression } from "@/lib/links";
import { parseTrackAdPayload } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const payload = parseTrackAdPayload(await request.json());
    const result = await recordAdImpression(payload.eventId);
    return Response.json(result);
  } catch (error) {
    return jsonError(error);
  }
}
