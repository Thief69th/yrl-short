import { requireViewer } from "@/lib/auth";
import { jsonError } from "@/lib/http";
import { deleteLinkForUser, updateLinkForUser } from "@/lib/links";
import { getBaseUrlFromRequest } from "@/lib/request";
import { parseUpdateLinkPayload } from "@/lib/validators";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const viewer = await requireViewer();
    const { id } = await context.params;
    const payload = parseUpdateLinkPayload(await request.json());
    const link = await updateLinkForUser(
      viewer,
      id,
      payload,
      getBaseUrlFromRequest(request),
    );

    return Response.json({ link });
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const viewer = await requireViewer();
    const { id } = await context.params;
    await deleteLinkForUser(viewer, id);
    return Response.json({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}
