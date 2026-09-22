import assert from "node:assert/strict";
import test from "node:test";
import { PairingService } from "../src/index.js";

const PHONE = "phone_alpha";
const DESKTOP = "desktop_beta";
const service = (options = {}) => new PairingService({ clock: () => 1_000, codeGenerator: () => "12345678", ...options });

test("pairing needs correct code and approval from both devices", () => {
  const pairing = service();
  const created = pairing.createRequest({ initiatorDeviceId: PHONE, responderDeviceId: DESKTOP, requestedCapabilities: ["screen.view"] });
  assert.equal(created.code, "12345678");
  assert.throws(() => pairing.approve({ requestId: created.id, deviceId: PHONE }), /responder approval/);
  assert.throws(() => pairing.submitCode({ requestId: created.id, deviceId: DESKTOP, code: "00000000" }), /invalid/);
  assert.equal(pairing.submitCode({ requestId: created.id, deviceId: DESKTOP, code: created.code }).status, "pending");
  const paired = pairing.approve({ requestId: created.id, deviceId: PHONE });
  assert.equal(paired.status, "paired");
  assert.deepEqual(paired.approvals, [DESKTOP, PHONE]);
  assert.equal("code" in paired, false);
});

test("expired and rate-limited requests cannot pair", () => {
  let now = 1_000;
  const pairing = new PairingService({ clock: () => now, codeGenerator: () => "12345678", ttlMs: 10, maxAttempts: 1 });
  const expired = pairing.createRequest({ initiatorDeviceId: PHONE, responderDeviceId: DESKTOP });
  now = 1_010;
  assert.throws(() => pairing.submitCode({ requestId: expired.id, deviceId: DESKTOP, code: "12345678" }), /expired/);
  const limiter = service({ maxAttempts: 1 });
  const request = limiter.createRequest({ initiatorDeviceId: PHONE, responderDeviceId: DESKTOP });
  assert.throws(() => limiter.submitCode({ requestId: request.id, deviceId: DESKTOP, code: "00000000" }), /invalid/);
  assert.throws(() => limiter.submitCode({ requestId: request.id, deviceId: DESKTOP, code: "00000000" }), /locked/);
});

test("pairing rejects unknown capabilities and invalid device identifiers", () => {
  const pairing = service();
  assert.throws(() => pairing.createRequest({ initiatorDeviceId: "short", responderDeviceId: DESKTOP }), /deviceId/);
  assert.throws(() => pairing.createRequest({ initiatorDeviceId: PHONE, responderDeviceId: DESKTOP, requestedCapabilities: ["all.access"] }), /capabilities/);
});
