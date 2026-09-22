# Security

This package now contains an in-memory, two-party pairing state machine. It
generates a short-lived eight-digit code using Node's cryptographic RNG,
requires the responder to prove the code, then requires final approval by the
initiator. Requests expire after five minutes by default and lock after five
failed code attempts.

This state machine intentionally does **not** claim persistent identity,
encrypted transport, or platform key storage. Those integrations must use OS
secure storage and mature cryptographic protocols; do not add custom
cryptography.
