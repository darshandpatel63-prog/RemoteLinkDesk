# Architecture baseline

RemoteLinkDesk is organized as a set of platform clients around a transport-neutral shared core. This is the Phase 1 boundary; it deliberately does not claim that remote-control functionality is implemented.

## Components

| Area | Responsibility |
| --- | --- |
| `android/` | Android controller and permitted Android-host capabilities. |
| `host/windows`, `host/macos`, `host/linux` | Platform capture, input, storage and host-visible session indicators. |
| `shared/protocol/` | Versioned message envelopes and capability vocabulary. |
| `shared/networking/` | Future LAN discovery, direct transport, NAT traversal and relay selection. |
| `shared/security/` | Future device identity, key storage and pairing state. |
| `shared/session/` | Future session lifecycle and per-device authorization enforcement. |

## Security boundaries

1. Pairing creates a device identity only after approval on both devices.
2. A session is authenticated by the transport before its messages are dispatched.
3. Every requested action is checked against the paired device's independent capability grant.
4. Platform adapters enforce OS permissions in addition to RemoteLinkDesk policy.
5. A host must visibly disclose an active remote session and offer immediate disconnect.

`shared/protocol` is intentionally transport-neutral. It validates only protocol shapes and authorization vocabulary; production encryption, replay protection, and key handling belong in the security and networking implementations and must use mature libraries.

## Initial protocol contract

All messages carry protocol version, session ID, unique message ID, type, timestamp, and payload. Dispatchers must reject unsupported protocol versions, expired/replayed message IDs, unauthenticated sessions, and actions lacking a capability grant. The current package provides the first two shape-level foundations; session authentication and replay storage remain future phases.
