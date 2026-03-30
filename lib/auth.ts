import { auth, currentUser } from "@clerk/nextjs/server";

import { AuthenticationError, ConfigurationError } from "@/lib/errors";
import { isClerkConfigured } from "@/lib/env";
import { upsertAppUser } from "@/lib/users";

function getPrimaryEmail(
  emails: Array<{ emailAddress: string }>,
  primaryEmailAddressId?: string | null,
  matches?: Array<{ id: string; emailAddress: string }>,
) {
  const primaryMatch = matches?.find((item) => item.id === primaryEmailAddressId);
  return primaryMatch?.emailAddress ?? emails[0]?.emailAddress ?? null;
}

export async function getOptionalViewer() {
  if (!isClerkConfigured()) {
    return null;
  }

  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  const clerkUser = await currentUser();

  if (!clerkUser) {
    return null;
  }

  const email = getPrimaryEmail(
    clerkUser.emailAddresses,
    clerkUser.primaryEmailAddressId,
    clerkUser.emailAddresses,
  );

  if (!email) {
    throw new AuthenticationError("Your account is missing a primary email address.");
  }

  return upsertAppUser({
    clerkUserId: userId,
    email,
  });
}

export async function requireViewer() {
  if (!isClerkConfigured()) {
    throw new ConfigurationError(
      "Clerk is not configured. Add Clerk environment variables to enable authentication.",
    );
  }

  const viewer = await getOptionalViewer();

  if (!viewer) {
    throw new AuthenticationError();
  }

  return viewer;
}
