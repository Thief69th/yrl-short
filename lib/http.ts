import { AppError } from "@/lib/errors";

export function jsonError(error: unknown) {
  if (error instanceof AppError) {
    return Response.json({ error: error.message }, { status: error.status });
  }

  if (error instanceof SyntaxError) {
    return Response.json({ error: "Request body should be valid JSON." }, { status: 400 });
  }

  if (error instanceof Error) {
    return Response.json({ error: error.message }, { status: 400 });
  }

  return Response.json(
    { error: "Something went wrong while processing your request." },
    { status: 500 },
  );
}
