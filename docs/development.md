# Development status and next milestones

## Completed in this baseline

- Repository workspace and CI baseline.
- Versioned protocol message envelope.
- Explicit, deny-by-default per-device capability grants with unit tests.
- Short-lived, rate-limited two-party pairing state machine with unit tests.
- Ed25519 device-identity generation and a test-only secure-store adapter.
- Architecture and security-boundary documentation.

## Not implemented

No platform secure-storage integration, persistent pairing registry, screen capture, remote input, device discovery, encryption transport, relay, file transfer, or platform client is implemented yet. The repository must not represent those features as available.

## Next task

Implement platform secure-storage adapters and a persistent paired-device registry. It must persist only mutually approved public identities and provide paired-device revocation before LAN discovery or remote-control work begins.
