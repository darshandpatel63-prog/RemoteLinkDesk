# Development status and next milestones

## Completed in this baseline

- Repository workspace and CI baseline.
- Versioned protocol message envelope.
- Explicit, deny-by-default per-device capability grants with unit tests.
- Short-lived, rate-limited two-party pairing state machine with unit tests.
- Architecture and security-boundary documentation.

## Not implemented

No persistent device identity, platform secure storage integration, screen capture, remote input, device discovery, encryption transport, relay, file transfer, or platform client is implemented yet. The repository must not represent those features as available.

## Next task

Implement device identity and a platform secure-storage adapter, then persist only mutually approved pairings. This must provide paired-device revocation before LAN discovery or remote-control work begins.
