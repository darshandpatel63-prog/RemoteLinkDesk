import { randomInt, randomUUID } from "node:crypto";
import { isCapability } from "../../protocol/src/permissions.js";

const PAIRING_CODE_LENGTH = 8;

function assertDeviceId(deviceId) {
  if (typeof deviceId !== "string" || !/^[a-zA-Z0-9_-]{8,128}$/.test(deviceId)) {
    throw new TypeError("deviceId must be 8-128 URL-safe characters");
  }
}

function assertCapabilityList(capabilities) {
  if (!Array.isArray(capabilities) || !capabilities.every(isCapability)) {
    throw new TypeError("requestedCapabilities must contain only supported capabilities");
  }
  if (new Set(capabilities).size !== capabilities.length) {
    throw new TypeError("requestedCapabilities must not contain duplicates");
  }
}

function newCode() {
  return String(randomInt(0, 10 ** PAIRING_CODE_LENGTH)).padStart(PAIRING_CODE_LENGTH, "0");
}

/**
 * In-memory pairing state machine. Production platform adapters must persist only
 * approved device identities in OS secure storage; pairing codes are never persisted.
 */
export class PairingService {
  #requests = new Map();

  constructor({ clock = () => Date.now(), codeGenerator = newCode, ttlMs = 5 * 60_000, maxAttempts = 5 } = {}) {
    if (!Number.isSafeInteger(ttlMs) || ttlMs < 1) throw new TypeError("ttlMs must be a positive integer");
    if (!Number.isSafeInteger(maxAttempts) || maxAttempts < 1) throw new TypeError("maxAttempts must be a positive integer");
    this.clock = clock;
    this.codeGenerator = codeGenerator;
    this.ttlMs = ttlMs;
    this.maxAttempts = maxAttempts;
  }

  createRequest({ initiatorDeviceId, responderDeviceId, requestedCapabilities = [] }) {
    assertDeviceId(initiatorDeviceId);
    assertDeviceId(responderDeviceId);
    assertCapabilityList(requestedCapabilities);
    if (initiatorDeviceId === responderDeviceId) throw new TypeError("pairing requires two distinct devices");

    const now = this.clock();
    const request = {
      id: randomUUID(), initiatorDeviceId, responderDeviceId,
      requestedCapabilities: [...requestedCapabilities].sort(),
      code: this.codeGenerator(), attempts: 0, approvals: new Set(),
      createdAt: new Date(now).toISOString(), expiresAt: new Date(now + this.ttlMs).toISOString(), status: "pending"
    };
    if (!new RegExp(`^\\d{${PAIRING_CODE_LENGTH}}$`).test(request.code)) {
      throw new TypeError(`codeGenerator must return a ${PAIRING_CODE_LENGTH}-digit code`);
    }
    this.#requests.set(request.id, request);
    return this.#present(request, true);
  }

  submitCode({ requestId, deviceId, code }) {
    const request = this.#getActive(requestId);
    assertDeviceId(deviceId);
    if (deviceId !== request.responderDeviceId) throw new Error("only the requested responder can submit a pairing code");
    request.attempts += 1;
    if (request.attempts > this.maxAttempts) {
      request.status = "locked";
      throw new Error("pairing request is locked after too many attempts");
    }
    if (code !== request.code) throw new Error("invalid pairing code");
    request.approvals.add(deviceId);
    return this.#present(request, false);
  }

  approve({ requestId, deviceId }) {
    const request = this.#getActive(requestId);
    assertDeviceId(deviceId);
    if (deviceId !== request.initiatorDeviceId) throw new Error("only the initiator can give final pairing approval");
    if (!request.approvals.has(request.responderDeviceId)) throw new Error("responder approval is required first");
    request.approvals.add(deviceId);
    request.status = "paired";
    request.code = undefined;
    return this.#present(request, false);
  }

  revoke(requestId) {
    const request = this.#requests.get(requestId);
    if (!request) return false;
    if (request.status === "paired") throw new Error("paired devices must be revoked from the device registry");
    request.status = "revoked";
    request.code = undefined;
    return true;
  }

  #getActive(requestId) {
    const request = this.#requests.get(requestId);
    if (!request) throw new Error("pairing request was not found");
    if (request.status !== "pending") throw new Error(`pairing request is ${request.status}`);
    if (this.clock() >= Date.parse(request.expiresAt)) {
      request.status = "expired";
      request.code = undefined;
      throw new Error("pairing request has expired");
    }
    return request;
  }

  #present(request, includeCode) {
    return Object.freeze({
      id: request.id, initiatorDeviceId: request.initiatorDeviceId, responderDeviceId: request.responderDeviceId,
      requestedCapabilities: Object.freeze([...request.requestedCapabilities]),
      ...(includeCode ? { code: request.code } : {}),
      createdAt: request.createdAt, expiresAt: request.expiresAt, status: request.status,
      approvals: Object.freeze([...request.approvals].sort())
    });
  }
}
