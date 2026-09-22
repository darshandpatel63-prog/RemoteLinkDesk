/** Capabilities are deliberately independent: granting one never implies another. */
export const CAPABILITIES = Object.freeze([
  "screen.view",
  "input.control",
  "files.transfer",
  "clipboard.read",
  "clipboard.write",
  "terminal.access",
  "audio.stream",
  "device.info"
]);

const capabilitySet = new Set(CAPABILITIES);

export function isCapability(value) {
  return typeof value === "string" && capabilitySet.has(value);
}

/**
 * Creates a normalized, deny-by-default permission grant for one paired device.
 * Invalid or duplicate capability names are rejected instead of silently widened.
 */
export function createPermissionGrant({ deviceId, capabilities = [], updatedAt = new Date().toISOString() }) {
  if (typeof deviceId !== "string" || deviceId.trim().length === 0) {
    throw new TypeError("deviceId must be a non-empty string");
  }
  if (!Array.isArray(capabilities) || !capabilities.every(isCapability)) {
    throw new TypeError("capabilities must contain only supported capabilities");
  }
  if (new Set(capabilities).size !== capabilities.length) {
    throw new TypeError("capabilities must not contain duplicates");
  }
  if (Number.isNaN(Date.parse(updatedAt))) {
    throw new TypeError("updatedAt must be an ISO-compatible timestamp");
  }

  return Object.freeze({
    deviceId: deviceId.trim(),
    capabilities: Object.freeze([...capabilities].sort()),
    updatedAt: new Date(updatedAt).toISOString()
  });
}

export function isAuthorized(grant, capability) {
  return Boolean(grant && isCapability(capability) && grant.capabilities.includes(capability));
}
