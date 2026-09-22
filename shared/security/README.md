# Security

This package contains an in-memory, two-party pairing state machine. It
generates a short-lived eight-digit code using Node's cryptographic RNG,
requires the responder to prove the code, then requires final approval by the
initiator. Requests expire after five minutes by default and lock after five
failed code attempts.

It also creates an Ed25519 identity and exposes a `DeviceIdentityService` with
an injected key-store contract. `MemoryKeyStore` exists exclusively for tests;
platform applications must implement the contract using their OS secure
storage. The code intentionally does **not** claim encrypted transport or
platform key-store integration. Do not add custom cryptography.
