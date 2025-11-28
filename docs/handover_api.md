# Handover Assistant API Skeleton

This API skeleton backs the carer handover assistant for iOS/Android or web clients. It includes authentication, question retrieval, session management with pause/back/resume controls, and stubbed report/email delivery.

## Running locally
1. Install dependencies: `npm install`
2. Start the dev server: `npm run dev`
3. Health check: `GET http://localhost:3000/health`

## Authentication
- **POST `/auth/register`** — register a carer or admin (requires `name`, `email`, `organisationId`, `password`, optional `role`). Returns JWT + user.
- **POST `/auth/login`** — login with `email`, `password`. Returns JWT + user.

## Questions
- **GET `/questions/:organisationId`** — fetch ordered question templates for the organisation.

## Sessions
- **POST `/sessions`** — create a new session (`organisationId`, `userId`). Starts in `idle` state.
- **POST `/sessions/:sessionId/start`** — moves session to `asking` state (first question).
- **POST `/sessions/:sessionId/answer`** — store answer for current question, acknowledge, advance question index.
- **POST `/sessions/:sessionId/pause`** — move to `paused` state; resume later.
- **POST `/sessions/:sessionId/resume`** — move back to `asking`.
- **POST `/sessions/:sessionId/back`** — go to prior question and keep editing flow.
- **POST `/sessions/:sessionId/complete`** — mark session complete (used before report generation).

### Session state machine
- `idle -> asking -> waiting_for_answer -> confirming -> review -> completed`
- Supports interruptions: `pause`, `resume`, `back`

## Reports
- **POST `/reports/:sessionId`** — generate a placeholder PDF URL and (optionally) send emails to `recipients` array.
- **GET `/reports/:sessionId`** — list generated reports for a session.

## Next steps for production
- Replace JWT secret management with environment variables/secret manager.
- Replace password storage with hashed credentials and SSO support.
- Swap in persistent database (Postgres) and real PDF/email providers.
- Enforce RBAC + org scoping on every endpoint.
- Add request validation, telemetry, and error handling middleware.
