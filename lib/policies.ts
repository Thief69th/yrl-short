import type { Plan } from "@/lib/types";

export function canCreateAnotherLink(plan: Plan, activeLinkCount: number, limit: number) {
  if (plan === "paid") {
    return true;
  }

  return activeLinkCount < limit;
}

export function shouldServeInterstitial(plan: Plan) {
  return plan === "free";
}

export function supportsAdvancedAnalytics(plan: Plan) {
  return plan === "paid";
}
