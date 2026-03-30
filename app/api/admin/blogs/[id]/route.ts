import { requireViewer } from "@/lib/auth";
import { deleteBlogPostForAdmin, updateBlogPostForAdmin } from "@/lib/blogs";
import { jsonError } from "@/lib/http";
import { requireAdmin } from "@/lib/users";
import { parseBlogPayload } from "@/lib/validators";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const viewer = await requireViewer();
    await requireAdmin(viewer);
    const { id } = await context.params;
    const payload = parseBlogPayload(await request.json());
    const post = await updateBlogPostForAdmin(id, payload);
    return Response.json({ post });
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(_: Request, context: RouteContext) {
  try {
    const viewer = await requireViewer();
    await requireAdmin(viewer);
    const { id } = await context.params;
    await deleteBlogPostForAdmin(id);
    return Response.json({ success: true });
  } catch (error) {
    return jsonError(error);
  }
}
