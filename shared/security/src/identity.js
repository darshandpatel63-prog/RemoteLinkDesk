import { createHash, createPrivateKey, createPublicKey, generateKeyPairSync } from "node:crypto";

const DEVICE_ID = /^[a-zA-Z0-9_-]{8,128}$/;

function assertDeviceId(deviceId) {
  if (typeof deviceId !== "string" || !DEVICE_ID.test(deviceId)) {
    throw new TypeError("deviceId must be 8-128 URL-safe characters");
  }
}

function fingerprint(publicKey) {
  return createHash("sha256").update(publicKey).digest("hex");
}

function validatePublicKey(serializedKey) {
  if (typeof serializedKey !== "string" || serializedKey.length === 0) throw new TypeError("publicKey is required");
  const key = createPublicKey({ key: Buffer.from(serializedKey, "base64url"), format: "der", type: "spki" });
  if (key.asymmetricKeyType !== "ed25519") throw new TypeError("publicKey must be an Ed25519 key");
}

/** The public portion of a stable device identity; safe to exchange during pairing. */
export function createDeviceIdentity(deviceId) {
  assertDeviceId(deviceId);
  const { privateKey, publicKey } = generateKeyPairSync("ed25519");
  const serializedPublicKey = publicKey.export({ format: "der", type: "spki" }).toString("base64url");
  const serializedPrivateKey = privateKey.export({ format: "der", type: "pkcs8" }).toString("base64url");
  return Object.freeze({
    deviceId,
    publicKey: serializedPublicKey,
    privateKey: serializedPrivateKey,
    fingerprint: fingerprint(serializedPublicKey),
    algorithm: "Ed25519"
  });
}

export function publicIdentity(identity) {
  assertDeviceId(identity?.deviceId);
  validatePublicKey(identity.publicKey);
  return Object.freeze({
    deviceId: identity.deviceId,
    publicKey: identity.publicKey,
    fingerprint: fingerprint(identity.publicKey),
    algorithm: "Ed25519"
  });
}

/**
 * Storage contract for platform adapters. Implement this with Android Keystore,
 * Windows DPAPI/Credential Locker, macOS Keychain, or a Linux secret service.
 */
export class MemoryKeyStore {
  #records = new Map();

  async read(deviceId) { return this.#records.get(deviceId) ?? null; }
  async write(deviceId, identity) { this.#records.set(deviceId, identity); }
  async remove(deviceId) { return this.#records.delete(deviceId); }
}

/** Creates, loads, and removes device private keys through an injected secure-store adapter. */
export class DeviceIdentityService {
  constructor(keyStore) {
    if (!keyStore || typeof keyStore.read !== "function" || typeof keyStore.write !== "function" || typeof keyStore.remove !== "function") {
      throw new TypeError("keyStore must implement read, write, and remove");
    }
    this.keyStore = keyStore;
  }

  async create(deviceId) {
    assertDeviceId(deviceId);
    if (await this.keyStore.read(deviceId)) throw new Error("device identity already exists");
    const identity = createDeviceIdentity(deviceId);
    await this.keyStore.write(deviceId, identity);
    return publicIdentity(identity);
  }

  async getPublic(deviceId) {
    assertDeviceId(deviceId);
    const identity = await this.keyStore.read(deviceId);
    return identity ? publicIdentity(identity) : null;
  }

  async revoke(deviceId) {
    assertDeviceId(deviceId);
    return this.keyStore.remove(deviceId);
  }
}
