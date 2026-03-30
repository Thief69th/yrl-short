import { requireViewer } from "@/lib/auth";
import { jsonError } from "@/lib/http";
import { getDashboardOverview } from "@/lib/links";
import { getBaseUrlFromRequest } from "@/lib/request";

export async function GET(request: Request) {
  try {
    const viewer = await requireViewer();
    const overview = await getDashboardOverview(
      viewer,
      getBaseUrlFromRequest(request),
    );

    return Response.json({ overview });
  } catch (error) {
    return jsonError(error);
  }
}
