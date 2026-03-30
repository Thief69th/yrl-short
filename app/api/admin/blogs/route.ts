import { requireViewer } from "@/lib/auth";
import { createBlogPostForAdmin, listAdminBlogPosts } from "@/lib/blogs";
import { jsonError } from "@/lib/http";
import { requireAdmin } from "@/lib/users";
import { parseBlogPayload } from "@/lib/validators";

export async function GET() {
  try {
    const viewer = await requireViewer();
    await requireAdmin(viewer);
    const posts = await listAdminBlogPosts();
    return Response.json({ posts });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    const viewer = await requireViewer();
    await requireAdmin(viewer);
    const payload = parseBlogPayload(await request.json());
    const post = await createBlogPostForAdmin(viewer, payload);
    return Response.json({ post }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
