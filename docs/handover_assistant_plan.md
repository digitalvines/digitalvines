# Carer Handover Assistant: Research and Implementation Plan

## Research: Best Practices for Conversational Shift Handover Tools
- **Security and identity**
  - Enforce authentication before accessing any handover session; prefer SSO/OAuth2 if the org supports it, otherwise password + MFA.
  - Role-based access control so admins can manage organisations and users; carers get scoped access to their own sessions.
  - Encrypt data in transit (TLS) and at rest; store audit logs of authentication, access, and report delivery events.
  - PII handling: collect only necessary data (carer name, organisation, shift context), provide data retention policies, and allow deletion on request.
- **Conversation design**
  - Start with a clear entry point ("Ready to start?" prompt or Start button) and explain the flow and estimated time.
  - Allow rich, long-form answers; use explicit confirmations ("Got it") before proceeding.
  - Provide interruption controls: "wait", "back", "edit" to revise the last answer; keep a visible transcript so carers can verify.
  - Use gentle pacing with typing indicators and short acknowledgments; avoid auto-advance without confirmation if the response is long.
- **Question set management**
  - Store question templates per organisation; allow admins to configure mandatory vs optional questions.
  - Track completion state so the assistant can resume if interrupted or offline.
- **Reporting and delivery**
  - Generate time-stamped, immutable reports with question/answer pairs, carer identity, and shift metadata.
  - Support PDF download and email delivery; log delivery status and retries.
  - Provide a signature/attestation step before finalizing the report.
- **Accessibility and usability**
  - WCAG-compliant UI: clear contrast, keyboard navigation, screen-reader-friendly labels, and large tap targets for mobile carers.
  - Support voice input where possible; ensure text alternatives for all controls.
- **Reliability and observability**
  - Auto-save drafts after each response; recover state on reconnect.
  - Monitor latency and error rates; add health checks and structured logs.
  - Add rate limiting and abuse protection on public endpoints.

## Implementation Outline

### User Journeys
1. **Login**: Carer enters name/organisation (or SSO); authenticated session created.
2. **Start handover**: Presented with "Are you ready to start the handover?" prompt and Start button.
3. **Conversation**: Assistant asks predefined questions; carer replies with long-form text. Assistant acknowledges ("Okay", "Got it") and moves to next question after confirmation.
4. **Interruption**: Carer can say "wait" to pause, "edit" to revise the last answer, or "back" to revisit prior questions.
5. **Completion**: Assistant summarizes; carer reviews, edits if needed, and confirms.
6. **Reporting**: PDF generated and offered for download; emails sent to configured recipients; delivery logged.

### High-Level Architecture
- **Frontend**: SPA (React/Vue/Svelte) or mobile app shell for iOS/Android (React Native/Flutter). Conversational UI component, login screen, admin console. State machine to track question flow, edits, and pauses.
- **Backend API**: REST/GraphQL for authentication, session management, question sets, answer storage, report generation, and email dispatch.
- **Database**: Relational store (e.g., Postgres) for organisations, users, questions, sessions, answers, and delivery logs.
- **Identity**: JWT-based sessions backed by OAuth2/password auth; RBAC for admin vs carer roles.
- **AI/Assistant Layer**: Deterministic flow driven by question templates plus lightweight NLU to detect commands (wait/back/edit) and confirmations.
- **Reporting**: Server-side PDF rendering (e.g., Playwright/Chromium or WKHTML) to ensure consistent output; storage in object store with signed URLs for download.
- **Email Delivery**: Transactional email service (SES/SendGrid); retries and status webhooks recorded in logs.

### Mobile Delivery Options (iOS/Android)
- **Cross-platform approach**: Use React Native or Flutter to ship a single codebase with native-feeling UI, leveraging the same conversational state machine and API clients as the web SPA.
- **Native sharing and downloads**: Integrate OS-native share sheets for emailing or messaging the PDF, and use platform download managers with secure file permissions.
- **Offline resilience**: Cache question sets and in-progress answers locally (e.g., SQLite/secure storage) with background sync once connectivity resumes.
- **Push notifications**: Use APNs/FCM for reminders to complete handovers or to confirm email delivery status where appropriate.
- **Device security**: Require biometrics/passcode re-auth for app unlock, enforce TLS pinning where feasible, and use secure keystore/keychain for tokens.

### Conversation Flow Controls
- Use a finite state machine per session: `idle -> asking -> waiting_for_answer -> confirming -> paused -> review -> completed`.
- Commands:
  - **wait/pause**: Transition to `paused`; UI shows resume control.
  - **back/edit**: Surface previous answer, allow rewrite, then resume to next question.
  - **continue**: Returns to `asking` state from `paused`.
- Acknowledgment step: after each answer, send "Okay/Got it" and confirm before advancing.

### Data Model (simplified)
- `Organisation(id, name, domain, settings)`
- `User(id, name, email, role, organisation_id, auth_hash)`
- `QuestionTemplate(id, organisation_id, text, order, required)`
- `HandoverSession(id, organisation_id, user_id, started_at, completed_at, status)`
- `Answer(id, session_id, question_id, text, version, updated_at)`
- `Report(id, session_id, pdf_url, emailed_to, status, created_at)`

### Security and Compliance Checklist
- TLS everywhere; secure cookies with HttpOnly/SameSite=Lax or Strict.
- Input validation and content filtering on answers to prevent injection into PDF or emails.
- CSRF protection for session-based auth; rate limiting on auth and email endpoints.
- Audit logging for logins, question edits, report generation, and email sends.
- Data retention and deletion policies per organisation; backups with encrypted storage.

### Admin and Configuration
- Admin UI to manage organisations, users, and question templates (ordering, required flags, recipients).
- Ability to preview the conversation flow and report layout before publishing.
- Feature flags for organisation-specific behaviors (e.g., require attestation, include vitals section).

### Reporting & Email Delivery Flow
1. On completion, assemble question/answer pairs with timestamps and carer metadata.
2. Render PDF using a server-side template; store in object storage; return download link.
3. Dispatch emails to configured recipients with secure link; log success/failure and retry failures.
4. Expose delivery status in the UI.

### Testing Strategy
- Unit tests for state machine transitions (ask, pause, back, edit, resume).
- Integration tests for login, session creation, question retrieval, answer submission, and report generation endpoints.
- E2E tests covering full handover flow, pause/edit/resume interactions, and PDF download/email triggers.
- Security tests: auth bypass attempts, rate limiting, PDF injection, and email spoofing checks.

### Rollout & Operations
- Staging environment mirroring production; feature flags for conversational tweaks.
- Observability: structured logs, metrics for session completion, email success, and latency; alerting on error spikes.
- Backups and disaster recovery drills for database and object storage.

