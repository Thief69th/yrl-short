import assert from "node:assert/strict";
import test from "node:test";

import {
  normalizeCode,
  normalizeUrl,
  parseCreateLinkPayload,
  parsePlanUpdatePayload,
  parseTrackAdPayload,
  validateCustomAlias,
} from "../lib/validators";

test("normalizeUrl adds https when missing", () => {
  assert.equal(normalizeUrl("example.com/path"), "https://example.com/path");
});

test("normalizeCode trims and lowercases short codes", () => {
  assert.equal(normalizeCode("  Team-Launch  "), "team-launch");
});

test("validateCustomAlias accepts friendly aliases", () => {
  assert.equal(validateCustomAlias("Team_Launch"), "team_launch");
});

test("validateCustomAlias rejects reserved aliases", () => {
  assert.throws(() => validateCustomAlias("api"), /reserved/i);
});

test("parseCreateLinkPayload normalizes url and alias", () => {
  const payload = parseCreateLinkPayload({
    longUrl: "openai.com",
    customAlias: "Launch-2026",
  });

  assert.deepEqual(payload, {
    longUrl: "https://openai.com/",
    customAlias: "launch-2026",
  });
});

test("parseTrackAdPayload requires a uuid event id", () => {
  const payload = parseTrackAdPayload({
    eventId: "7f735e5f-c2f5-4fa4-89d6-b72e2a0dd9c2",
  });

  assert.equal(payload.eventId, "7f735e5f-c2f5-4fa4-89d6-b72e2a0dd9c2");
});

test("parsePlanUpdatePayload accepts free and paid", () => {
  assert.deepEqual(parsePlanUpdatePayload({ plan: "paid" }), { plan: "paid" });
  assert.deepEqual(parsePlanUpdatePayload({ plan: "free" }), { plan: "free" });
});
