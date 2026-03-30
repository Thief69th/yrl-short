import assert from "node:assert/strict";
import test from "node:test";

import { getVisitContext } from "../lib/request";

test("getVisitContext derives country, referrer, and mobile device", () => {
  const headers = new Headers({
    "user-agent":
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15",
    "x-vercel-ip-country": "in",
    referer: "https://example.com/source",
  });

  const context = getVisitContext(headers);

  assert.deepEqual(context, {
    countryCode: "IN",
    deviceType: "mobile",
    referrer: "https://example.com/source",
  });
});

test("getVisitContext falls back to unknown country and bot detection", () => {
  const headers = new Headers({
    "user-agent": "Googlebot/2.1",
  });

  const context = getVisitContext(headers);

  assert.equal(context.countryCode, "UN");
  assert.equal(context.deviceType, "bot");
  assert.equal(context.referrer, null);
});
