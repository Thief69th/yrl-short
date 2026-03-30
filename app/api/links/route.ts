import { requireViewer } from "@/lib/auth";
import { jsonError } from "@/lib/http";
import { createLinkForUser, listLinksForUser } from "@/lib/links";
import { getBaseUrlFromRequest } from "@/lib/request";
import { parseCreateLinkPayload } from "@/lib/validators";

export async function GET(request: Request) {
  try {
    const viewer = await requireViewer();
    const links = await listLinksForUser(viewer, getBaseUrlFromRequest(request));
    return Response.json({ links });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    const viewer = await requireViewer();
    const payload = parseCreateLinkPayload(await request.json());
    const link = await createLinkForUser(
      viewer,
      payload,
      getBaseUrlFromRequest(request),
    );

    return Response.json({ link }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
