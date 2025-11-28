# Implementation steps for the carer handover assistant API

This guide explains how to turn the current Express skeleton into a production-ready service. Follow the sections in order; each one maps to specific source files so you can verify progress quickly.

## 1) Environment setup
1. Install Node.js 18+ and npm.
2. Run `npm install` in the repo root to pull dependencies declared in `package.json`.
3. Copy environment variables into a `.env` file (not committed):
   - `PORT` (optional; defaults to 3000)
   - `JWT_SECRET` (required for authentication)
   - Mail service credentials for `emailService.ts` if you integrate a real provider.
4. Start the API locally with `npm run dev` and validate `GET /health` returns `{ "status": "ok" }`.

## 2) Wire the server entrypoint (`src/index.ts`)
1. Ensure `cors` and `body-parser` middlewares stay registered before routes so JSON bodies are parsed and CORS preflight succeeds.
2. Keep the `/health` route lightweight—no DB calls—to act as a liveness probe.
3. Confirm routers are mounted at `/auth`, `/questions`, `/sessions`, and `/reports`; any new routers should be imported and added here.
4. In production, add centralized error handling middleware after routers and configure structured logging.

## 3) Define shared types (`src/models/types.ts`)
1. Replace in-memory ID strings with UUIDs (e.g., `crypto.randomUUID()` or `uuid` package) and add validation helpers.
2. Expand the `Question`, `Session`, and `Response` interfaces with audit fields (`createdAt`, `updatedAt`, `createdBy`, `organizationId`).
3. Add a finite set of `SessionStatus` values (e.g., `"not_started"`, `"in_progress"`, `"paused"`, `"completed"`, `"cancelled"`) to keep state transitions explicit.
4. Export Zod (or similar) schemas to validate incoming payloads for responses and user registration.

## 4) Replace in-memory storage (`src/storage/memory.ts`)
1. Swap the in-memory maps with a real data store (PostgreSQL via Prisma/TypeORM recommended).
2. Mirror the existing helper methods (e.g., `createSession`, `appendResponse`, `getSession`) in a repository layer so route handlers stay unchanged.
3. Add optimistic concurrency or row-level locks when updating sessions so question order is preserved.
4. Enforce organization scoping in all queries to prevent cross-tenant data leakage.

## 5) Harden authentication routes (`src/routes/auth.ts`)
1. Connect registration and login to persistent storage; hash passwords with `bcrypt` before saving.
2. On login, verify password, issue a signed JWT using `JWT_SECRET`, and include organization context in the token claims.
3. Add middleware to verify JWTs and attach the authenticated user to `req` for downstream handlers.
4. Return only non-sensitive fields in responses (e.g., `id`, `name`, `organizationId`), never password hashes.

## 6) Question catalog endpoint (`src/routes/questions.ts`)
1. Load questions from the database keyed by `organizationId`; cache the catalog in memory with an expiry for speed.
2. Support pagination or versioning if organizations maintain multiple checklists.
3. Validate that the requesting user belongs to the organization before returning the question set.

## 7) Session lifecycle (`src/routes/sessions.ts` + `src/services/stateMachine.ts`)
1. Keep `stateMachine.ts` as the single source of truth for allowed transitions (e.g., `start`, `pause`, `resume`, `answer`, `complete`). Update it when adding statuses.
2. In `sessions.ts`, call the state machine before mutating session records to reject illegal transitions with `400` errors.
3. When creating a session, stamp the current question index and preload the question list for consistent ordering.
4. Add endpoints to:
   - Pause/resume when the carer says "wait".
   - Amend the last response (replace the stored answer while keeping an audit trail).
   - Jump back one question if the assistant advanced too quickly.
5. Stream acknowledgements (`"okay"`, `"got it"`) in responses, and return the next question payload to the client so the UI can render immediately.

## 8) Reporting pipeline (`src/services/reportService.ts` + `src/routes/reports.ts`)
1. Implement `reportService` to transform a session into a markdown/HTML report (include carer details, timestamps, and Q&A pairs).
2. Use a PDF generator (e.g., `puppeteer` or `pdfkit`) to render the report; return a download URL or binary from `POST /reports/:sessionId/pdf`.
3. Support multi-recipient email delivery in `emailService.ts` by integrating with a provider (SES, SendGrid); send the PDF as an attachment.
4. Mark sessions as reported and store metadata (recipients, timestamp, delivery status) for auditing.

## 9) Validation and error handling
1. Add request validation middleware (Zod/Joi) to every endpoint to guard against malformed payloads.
2. Normalize error responses (e.g., `{ error: { code, message, details } }`) and log full stack traces server-side.
3. Return `404` when sessions or questions are missing, and `403` when cross-organization access is attempted.

## 10) Mobile client integration notes
1. Expose CORS for your mobile app origins and require JWTs on all stateful endpoints.
2. For Android/iOS shells, ensure the client can handle pause/resume/amend flows by listening for the `nextQuestion` payload from session endpoints.
3. Add rate limiting and HTTPS termination in front of the API when deployed.

## 11) Testing checklist
1. Unit test the state machine transitions and repository methods.
2. Integration test session flows: start → answer → pause → resume → amend → complete → report.
3. Security tests: JWT rejection, organization isolation, password hashing verification.
4. Contract tests for the question and report endpoints that the mobile client relies on.
