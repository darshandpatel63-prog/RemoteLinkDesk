import assert from "node:assert/strict";
import test from "node:test";
import { createEnvelope, createPermissionGrant, isAuthorized } from "../src/index.js";

test("permission grants are explicit and deny unlisted capabilities", () => {
  const grant = createPermissionGrant({
    deviceId: "phone-a",
    capabilities: ["files.transfer", "screen.view"],
    updatedAt: "2026-01-01T00:00:00.000Z"
  });

  assert.equal(isAuthorized(grant, "screen.view"), true);
  assert.equal(isAuthorized(grant, "input.control"), false);
  assert.deepEqual(grant.capabilities, ["files.transfer", "screen.view"]);
});

test("permission grants reject unknown or duplicate capabilities", () => {
  assert.throws(() => createPermissionGrant({ deviceId: "phone-a", capabilities: ["screen.view", "screen.view"] }));
  assert.throws(() => createPermissionGrant({ deviceId: "phone-a", capabilities: ["all.access"] }));
});

test("envelopes require a complete versioned message boundary", () => {
  const envelope = createEnvelope({
    sessionId: "session-1", messageId: "message-1", type: "pairing.request",
    sentAt: "2026-01-01T00:00:00Z", payload: { deviceName: "Phone" }
  });
  assert.equal(envelope.version, 1);
  assert.throws(() => createEnvelope({ sessionId: "s", messageId: "m", type: "t", sentAt: "invalid", payload: {} }));
});
