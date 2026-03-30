import { requireViewer } from "@/lib/auth";
import { jsonError } from "@/lib/http";
import { getLinkAnalytics } from "@/lib/links";
import { getBaseUrlFromRequest } from "@/lib/request";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(request: Request, context: RouteContext) {
  try {
    const viewer = await requireViewer();
    const { id } = await context.params;
    const analytics = await getLinkAnalytics(
      viewer,
      id,
      getBaseUrlFromRequest(request),
    );

    return Response.json({ analytics });
  } catch (error) {
    return jsonError(error);
  }
}
