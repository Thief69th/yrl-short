import assert from "node:assert/strict";
import test from "node:test";

import {
  canCreateAnotherLink,
  shouldServeInterstitial,
  supportsAdvancedAnalytics,
} from "../lib/policies";

test("free plans stop at the active-link cap", () => {
  assert.equal(canCreateAnotherLink("free", 9, 10), true);
  assert.equal(canCreateAnotherLink("free", 10, 10), false);
});

test("paid plans ignore the active-link cap", () => {
  assert.equal(canCreateAnotherLink("paid", 99, 10), true);
});

test("policy helpers reflect free versus paid behavior", () => {
  assert.equal(shouldServeInterstitial("free"), true);
  assert.equal(shouldServeInterstitial("paid"), false);
  assert.equal(supportsAdvancedAnalytics("free"), false);
  assert.equal(supportsAdvancedAnalytics("paid"), true);
});
