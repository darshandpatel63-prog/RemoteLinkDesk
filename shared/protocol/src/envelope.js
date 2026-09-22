export const PROTOCOL_VERSION = 1;

/**
 * Validates the minimum authenticated-message envelope before a dispatcher acts.
 * Payload encryption/authentication is provided by the selected transport, not this shape.
 */
export function createEnvelope({ sessionId, messageId, type, sentAt, payload }) {
  for (const [name, value] of Object.entries({ sessionId, messageId, type })) {
    if (typeof value !== "string" || value.trim().length === 0) {
      throw new TypeError(`${name} must be a non-empty string`);
    }
  }
  if (Number.isNaN(Date.parse(sentAt))) {
    throw new TypeError("sentAt must be an ISO-compatible timestamp");
  }
  if (payload === undefined) throw new TypeError("payload is required");

  return Object.freeze({
    version: PROTOCOL_VERSION,
    sessionId: sessionId.trim(),
    messageId: messageId.trim(),
    type: type.trim(),
    sentAt: new Date(sentAt).toISOString(),
    payload
  });
}
