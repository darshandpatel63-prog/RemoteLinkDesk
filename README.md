# RemoteLinkDesk

Privacy-first device-to-device remote access, control, and fast wireless file transfer.

## Official Repository

https://github.com/darshandpatel63-prog/RemoteLinkDesk

## Project Blueprint

The complete product requirements and development roadmap are maintained in:

**[BLUEPRINT.md](BLUEPRINT.md)**

## Core Vision

RemoteLinkDesk is intended to connect a user's own phones, laptops, desktops, tablets, and other supported devices.

It is designed to support:

- Remote computer access from Android
- Bidirectional device control where the operating system permits it
- Same-LAN operation without internet
- Secure connections across different networks
- QR-code or one-time-code pairing
- Per-device permissions
- Fast wireless file transfer
- Clipboard synchronization
- Terminal access
- Multi-device connections
- Multitasking across simultaneous sessions
- Privacy-first architecture
- Secure device revocation

## Important

RemoteLinkDesk does not bypass operating-system security or provide hidden access.

Capabilities depend on the permissions and security model of each operating system.

## License

This repository currently uses an All Rights Reserved license. See [LICENSE](LICENSE).

## Status

Phase 1 architecture is underway. The initial shared protocol foundation defines
versioned message envelopes and independently granted, deny-by-default device
capabilities. Platform clients and remote-access features are not implemented
yet; see [the development status](docs/development.md).

## Development

Requires Node.js 20 or newer.

```sh
npm test
```

Architecture decisions and platform boundaries are documented in
[docs/architecture.md](docs/architecture.md).
