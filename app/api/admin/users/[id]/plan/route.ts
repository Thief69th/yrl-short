import { requireViewer } from "@/lib/auth";
import { jsonError } from "@/lib/http";
import { requireAdmin, updateUserPlan } from "@/lib/users";
import { parsePlanUpdatePayload } from "@/lib/validators";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(request: Request, context: RouteContext) {
  try {
    const viewer = await requireViewer();
    await requireAdmin(viewer);
    const { id } = await context.params;
    const payload = parsePlanUpdatePayload(await request.json());
    const user = await updateUserPlan(id, payload.plan);
    return Response.json({ user });
  } catch (error) {
    return jsonError(error);
  }
}
