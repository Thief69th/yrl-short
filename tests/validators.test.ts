import assert from "node:assert/strict";
import test from "node:test";

import {
  normalizeCode,
  normalizeUrl,
  parseShortenPayload,
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

test("parseShortenPayload normalizes url and alias", () => {
  const payload = parseShortenPayload({
    originalUrl: "openai.com",
    customAlias: "Launch-2026",
  });

  assert.deepEqual(payload, {
    originalUrl: "https://openai.com/",
    customAlias: "launch-2026",
  });
});
