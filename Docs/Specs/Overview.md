Security Audit — Spec Issues & Fixes

C-01 — Container Runs as Root

Problem: Docker container runs as root until Sprint 7, increasing impact of any code execution vulnerability.

Solution: Create and run the application as a non-root user in S0-02. Add acceptance criteria verifying the container user is mnemo.

⸻

C-02 — Unscoped Data Volume Permissions

Problem: /data volume permissions are unrestricted, allowing full database and media modification if the container is compromised.

Solution: Assign /data ownership to the application user and verify ownership in acceptance criteria.

⸻

H-01 — No Request Size Limits

Problem: API requests have no documented payload limits, allowing oversized requests to consume memory and destabilize the application.

Solution: Configure explicit request size limits (e.g., 50 KB) and return HTTP 413 for oversized payloads.

⸻

H-02 — No Markdown Sanitization Policy

Problem: Note content is validated but no rendering security policy exists, creating future XSS risk if HTML rendering is introduced.

Solution: Store raw Markdown and require sanitization during rendering. Prohibit rendering unsanitized HTML.

⸻

H-03 — DB_PATH Not Validated

Problem: Database path values can point outside the intended data directory through malformed or traversal-based paths.

Solution: Validate DB_PATH at startup and reject paths outside /data.

⸻

H-04 — Vite Dev Server Exposed

Problem: Development server binds to all interfaces and may become externally accessible if ports are mapped incorrectly.

Solution: Prevent host exposure of port 5173 in the base configuration and restrict HMR access to development-only overrides.

⸻

M-01 — Foreign Keys Enabled Too Late

Problem: SQLite foreign key enforcement is disabled during early development, allowing silent integrity violations.

Solution: Enable PRAGMA foreign_keys = ON alongside initial database configuration in Sprint 0.

⸻

M-02 — Error Detail Leakage

Problem: Error responses are not constrained and may expose stack traces or internal implementation details.

Solution: Add a global error handler that returns generic error messages while logging details server-side.

⸻

M-03 — No Write Endpoint Rate Limiting

Problem: Write operations can be spammed, potentially exhausting storage or application resources.

Solution: Apply rate limiting to write endpoints and return HTTP 429 when limits are exceeded.

⸻

M-04 — No .env Management Policy

Problem: Environment files are not addressed, increasing the risk of accidentally committing sensitive configuration.

Solution: Add .env.example and ignore local environment files in version control.

⸻

L-01 — Missing Security Headers

Problem: Express responses lack standard security headers.

Solution: Apply middleware such as Helmet to establish secure default headers.

⸻

L-02 — No Dependency Vulnerability Scanning

Problem: CI validates code quality but does not detect known vulnerable dependencies.

Solution: Add dependency auditing to CI and fail builds on high or critical vulnerabilities.

⸻

L-03 — Unvalidated Tag Colors

Problem: Tag colors accept arbitrary strings, allowing malformed values to enter the system.

Solution: Restrict colors to valid hexadecimal color values.

⸻

L-04 — Unbounded Link Labels

Problem: Link labels have no maximum length and can negatively impact UI rendering.

Solution: Enforce a reasonable length limit (e.g., 100 characters).
