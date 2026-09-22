import assert from "node:assert/strict";
import test from "node:test";
import { createDeviceIdentity, DeviceIdentityService, MemoryKeyStore, publicIdentity } from "../src/index.js";

const DEVICE = "desktop_alpha";

test("device identities create Ed25519 key material and expose only public data", () => {
  const identity = createDeviceIdentity(DEVICE);
  const published = publicIdentity(identity);
  assert.equal(identity.algorithm, "Ed25519");
  assert.equal(published.deviceId, DEVICE);
  assert.equal("privateKey" in published, false);
  assert.match(published.fingerprint, /^[a-f0-9]{64}$/);
});

test("identity service stores private material through the injected adapter", async () => {
  const store = new MemoryKeyStore();
  const service = new DeviceIdentityService(store);
  const created = await service.create(DEVICE);
  assert.deepEqual(await service.getPublic(DEVICE), created);
  await assert.rejects(() => service.create(DEVICE), /already exists/);
  assert.equal(await service.revoke(DEVICE), true);
  assert.equal(await service.getPublic(DEVICE), null);
});

test("public identity rejects malformed keys and identifiers", () => {
  assert.throws(() => createDeviceIdentity("short"), /deviceId/);
  assert.throws(() => publicIdentity({ deviceId: DEVICE, publicKey: "not-a-key" }), /Error|TypeError/);
});
