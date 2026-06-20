# Security Policy

## Supported Versions

DorkNio is a client-side only application. We recommend always running the latest version from the `main` branch or accessing the live hosted version.

| Version | Supported          |
| ------- | ------------------ |
| Latest  | :white_check_mark: |
| Older   | :x:                |

## Reporting a Vulnerability

Security is a top priority for DorkNio. Even though the application runs entirely client-side with no backend infrastructure, we take vulnerabilities like Cross-Site Scripting (XSS), DOM-based injection, or sensitive data leakage seriously.

If you discover a security vulnerability within DorkNio, please do **NOT** open a public issue. Instead, please report it privately:

1. **Email:** Reach out to the repository owner directly.
2. **Details:** Provide a detailed description of the vulnerability, including steps to reproduce, potential impact, and your environment setup.

We will acknowledge receipt of your vulnerability report as soon as possible and strive to send you regular updates about our progress. If the vulnerability is confirmed, we will patch it immediately and issue an update.

## Scope

The following are strictly **out of scope** for security reports:
* Vulnerabilities in the external websites or domains you are targeting using DorkNio.
* Issues relying on social engineering or physical access to a user's machine.
* Denial of Service (DoS) attacks requiring massive local input (as client-side limits are already in place).

Thank you for helping keep DorkNio secure!
