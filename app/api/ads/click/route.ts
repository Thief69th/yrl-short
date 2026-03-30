import { jsonError } from "@/lib/http";
import { recordAdClick } from "@/lib/links";
import { parseTrackAdPayload } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const payload = parseTrackAdPayload(await request.json());
    const result = await recordAdClick(payload.eventId);
    return Response.json(result);
  } catch (error) {
    return jsonError(error);
  }
}
