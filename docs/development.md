# Development status and next milestones

## Completed in this baseline

- Repository workspace and CI baseline.
- Versioned protocol message envelope.
- Explicit, deny-by-default per-device capability grants with unit tests.
- Architecture and security-boundary documentation.

## Not implemented

No screen capture, remote input, device discovery, pairing exchange, encryption transport, relay, file transfer, or platform client is implemented yet. The repository must not represent those features as available.

## Next task

Implement device identity and a mutually approved, short-lived pairing state machine. It must persist keys through platform secure storage, rate-limit attempts, expire pairing codes, and provide revocation before LAN discovery or remote-control work begins.
