# Story 14.4: Auth Polish — Forgot & Reset Password

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **mobile user**,
I want to reset my password from my phone,
So that I can recover my account without a computer.

## Acceptance Criteria

1. **Given** a mobile user on the login screen **When** they tap "Mot de passe oublie ?" and enter their email **Then** a reset link is sent via the existing `/api/v1/auth/forgot-password` endpoint and the user sees a confirmation message

2. **Given** a mobile user who received a reset email **When** they tap the reset link in the email on their phone **Then** the link deep-links into the Expo app's reset-password screen with the token pre-filled

3. **Given** a mobile user on the reset-password screen **When** they enter a new password and confirmation **Then** the password is reset via `/api/v1/auth/reset-password` and they are redirected to login with a success message

4. **Given** a mobile user who taps an expired or invalid reset link **When** the error occurs **Then** a clear French error message is displayed with a "Demander un nouveau lien" recovery action

5. **Given** a web user (no mobile app installed) who clicks the reset link **When** they reach the web app **Then** they can complete the password reset via a web forgot-password and reset-password page

6. **Given** any platform user **When** the forgot-password form is submitted **Then** the API always responds with success (no user enumeration) and the email is sent only if the account exists

## Tasks / Subtasks

- [x] Task 1: Fix mobile deep link flow for password reset emails (AC: #2, #4) — CRITICAL
  - [x] 1.1 In `apps/expo/lib/api/hooks/use-auth.ts`, modify `useForgotPassword` to accept and forward a `redirectTo` parameter. The mobile app should send `redirectTo` with a value that enables BetterAuth to redirect to the app after email verification. Test with `evahomecafeapp://reset-password` as the redirect target. If BetterAuth rejects custom scheme URLs, use the HTTPS Universal Link alternative: `https://homecafe.app/reset-password`
  - [x] 1.2 In `apps/expo/app/(auth)/forgot-password.tsx`, pass `redirectTo` when calling the mutation: `forgotPasswordMutation.mutate({ email: data.email, redirectTo: "evahomecafeapp://reset-password" })`
  - [x] 1.3 Verify BetterAuth's `requestPasswordReset` flow: the email contains a verification URL → user clicks → BetterAuth verifies token → redirects to `callbackURL + ?token=VERIFIED_TOKEN`. Confirm the token parameter name matches what `reset-password/[token].tsx` expects
  - [x] 1.4 If BetterAuth redirects with `?token=XYZ` query param (not path param), add a new Expo Router route `apps/expo/app/(auth)/reset-password/index.tsx` that reads the token from `useLocalSearchParams()` query and renders the same reset form (or redirects to `[token]` route)
  - [x] 1.5 Update `ForgotPasswordInput` type to include optional `redirectTo?: string`

- [x] Task 2: Add Android App Links intent filter for reset-password path (AC: #2)
  - [x] 2.1 In `apps/expo/app.json`, add a second intent filter entry for reset-password:
    ```json
    {
      "action": "VIEW",
      "autoVerify": true,
      "data": [
        { "scheme": "https", "host": "homecafe.app", "pathPrefix": "/reset-password" }
      ],
      "category": ["BROWSABLE", "DEFAULT"]
    }
    ```
  - [x] 2.2 NOTE: iOS `associatedDomains` already covers `applinks:homecafe.app` (all paths). No iOS change needed.
  - [x] 2.3 NOTE: Server-side verification files (AASA, assetlinks.json) are deferred to Story 15.1. The app-side config is prepared now.

- [x] Task 3: Create web forgot-password page (AC: #5)
  - [x] 3.1 Create `apps/nextjs/app/(auth)/forgot-password/page.tsx` — server component that renders the ForgotPasswordForm client component
  - [x] 3.2 Create `apps/nextjs/app/(auth)/forgot-password/_components/forgot-password-form.tsx` — client component with:
    - Email input with validation (use existing Zod schema pattern from login)
    - Submit button calling `POST /api/v1/auth/forgot-password` via fetch
    - Success state: "Si un compte existe avec cette adresse, vous recevrez un email."
    - "Retour a la connexion" link
    - Follow the existing login page styling and layout pattern
  - [x] 3.3 Add "Mot de passe oublie ?" link to the web login page if it doesn't exist

- [x] Task 4: Create web reset-password page (AC: #5)
  - [x] 4.1 Create `apps/nextjs/app/(auth)/reset-password/page.tsx` — server component that reads token from searchParams and renders ResetPasswordForm
  - [x] 4.2 Create `apps/nextjs/app/(auth)/reset-password/_components/reset-password-form.tsx` — client component with:
    - New password + password confirmation inputs
    - Submit button calling `POST /api/v1/auth/reset-password` with `{ token, password }`
    - Success state: "Votre mot de passe a ete reinitialise." + "Se connecter" link
    - Error handling: expired/invalid token → "Ce lien a expire. Demandez un nouveau lien."
    - Follow existing auth page layout patterns
  - [x] 4.3 Handle missing token in URL → redirect to forgot-password page

- [x] Task 5: Polish existing Expo screens (AC: #1, #3, #4)
  - [x] 5.1 In `apps/expo/app/(auth)/forgot-password.tsx`, add error handling for API failures. Currently the mutation has no `onError` handler — add `Alert.alert("Erreur", "Impossible d'envoyer l'email. Verifiez votre connexion.")` for network errors
  - [x] 5.2 In `apps/expo/app/(auth)/reset-password/[token].tsx`, verify the "Demander un nouveau lien" button navigates to forgot-password screen (currently navigates correctly)
  - [x] 5.3 Verify the login screen's "Mot de passe oublie ?" link works correctly (link exists at line 122-130 of login.tsx — already functional)
  - [x] 5.4 Test the full happy path flow: Login → Forgot Password → Email sent → Click link → Reset Password → Success → Login

- [x] Task 6: Quality checks (AC: all)
  - [x] 6.1 Run `pnpm fix` for Biome formatting
  - [x] 6.2 Run `pnpm type-check` — verify no type errors across both nextjs and expo apps
  - [x] 6.3 Run `pnpm test` — verify all existing tests still pass (48 files, 411 tests)
  - [x] 6.4 Run `pnpm check` — clean lint

## Dev Notes

### Architecture Overview — Password Reset Flow

```
MOBILE FLOW (Expo):
  1. User taps "Mot de passe oublie ?" on login screen
  2. Navigates to /(auth)/forgot-password
  3. Enters email → POST /api/v1/auth/forgot-password { email, redirectTo }
  4. BetterAuth sends email with verification link
  5. User taps link in email → OS deep-links to app (custom scheme or Universal Link)
  6. Expo Router matches /reset-password/[token] or /reset-password?token=X
  7. User enters new password → POST /api/v1/auth/reset-password { token, password }
  8. Success → navigates to /(auth)/login

WEB FLOW (Next.js):
  1. User clicks "Mot de passe oublie ?" on login page
  2. Navigates to /(auth)/forgot-password
  3. Enters email → POST /api/v1/auth/forgot-password { email }
  4. BetterAuth sends email with verification link (default redirectTo: /reset-password)
  5. User clicks link → BetterAuth verifies → redirects to /reset-password?token=X
  6. User enters new password → POST /api/v1/auth/reset-password { token, password }
  7. Success → navigates to /(auth)/login

API SEQUENCE:
  POST /api/v1/auth/forgot-password
    → ForgotPasswordUseCase
      → authProvider.requestPasswordReset(email, redirectTo)
        → BetterAuth sends email via EmailTemplates.passwordReset(url)

  POST /api/v1/auth/reset-password
    → ResetPasswordUseCase
      → authProvider.resetPassword(token, newPassword)
        → BetterAuth updates password in DB
```

### CRITICAL GAP: Email-to-App Deep Link

**Current broken flow:**
1. Mobile app calls `POST /api/v1/auth/forgot-password` with `{ email }` only (no `redirectTo`)
2. BetterAuth defaults `redirectTo` to `/reset-password`
3. Email contains link: `https://server.com/api/auth/reset-password/verify?token=XYZ&callbackURL=/reset-password`
4. User taps link → opens in BROWSER (not the app)
5. Browser goes to `https://server.com/reset-password?token=XYZ`
6. **NO WEB PAGE EXISTS** at this route → 404 error
7. User is stuck — cannot reset password

**Fixed flow (mobile):**
1. Mobile app sends `{ email, redirectTo: "evahomecafeapp://reset-password" }`
2. BetterAuth includes the custom scheme redirect in the email verification flow
3. User taps link → BetterAuth verifies → redirects to `evahomecafeapp://reset-password?token=XYZ`
4. OS opens Expo app → Expo Router matches the route
5. User enters new password → success

**Fixed flow (web):**
1. Web app sends `{ email }` (default `redirectTo: /reset-password`)
2. User clicks link → BetterAuth verifies → redirects to `https://server.com/reset-password?token=XYZ`
3. Web page `/reset-password` exists → user enters new password

### BetterAuth Password Reset — How It Works

**Key files (all EXISTING — do not modify):**
- `apps/nextjs/common/auth.ts` — BetterAuth config with `sendResetPassword` callback
- `apps/nextjs/src/adapters/services/better-auth.service.ts` — `requestPasswordReset()` and `resetPassword()` implementations
- `apps/nextjs/src/application/use-cases/auth/forgot-password.use-case.ts` — validates email, delegates to auth provider
- `apps/nextjs/src/application/use-cases/auth/reset-password.use-case.ts` — validates password, delegates to auth provider

**BetterAuth flow:**
1. `auth.api.requestPasswordReset({ body: { email, redirectTo } })` is called
2. BetterAuth generates a time-limited token (stored in DB)
3. BetterAuth calls `sendResetPassword({ user, url })` callback
4. The `url` is a verification link: `https://server/api/auth/reset-password?token=TOKEN&callbackURL=REDIRECT`
5. Email template sends this URL to the user
6. When user clicks: BetterAuth verifies token → redirects to `callbackURL + ?token=NEW_TOKEN`

**Security note:** `requestPasswordReset` always returns `Result.ok()` even if email not found (prevents user enumeration). The email is only sent if the account exists.

**Email template (French, already implemented):**
```
Subject: "Reinitialisation de votre mot de passe"
Body: "Cliquez sur le bouton ci-dessous pour definir un nouveau mot de passe"
Button: "Reinitialiser mon mot de passe"
Expiry: 1 hour
```

### Existing Backend — Complete & Working (DO NOT MODIFY)

| Component | File | Status |
|-----------|------|--------|
| Forgot Password Route | `apps/nextjs/app/api/v1/auth/forgot-password/route.ts` | DONE |
| Reset Password Route | `apps/nextjs/app/api/v1/auth/reset-password/route.ts` | DONE |
| Forgot Password Controller | `src/adapters/controllers/auth/forgot-password.controller.ts` | DONE |
| Reset Password Controller | `src/adapters/controllers/auth/reset-password.controller.ts` | DONE |
| Forgot Password UseCase | `src/application/use-cases/auth/forgot-password.use-case.ts` | DONE |
| Reset Password UseCase | `src/application/use-cases/auth/reset-password.use-case.ts` | DONE |
| Forgot Password DTO | `src/application/dto/forgot-password.dto.ts` | DONE |
| Reset Password DTO | `src/application/dto/reset-password.dto.ts` | DONE |
| Auth Provider Port | `src/application/ports/auth.service.port.ts` | DONE |
| BetterAuth Service | `src/adapters/services/better-auth.service.ts` | DONE |
| Email Templates | `src/application/services/email/templates.ts` | DONE |
| Auth Module (DI) | `common/di/modules/auth.module.ts` | DONE |

### Existing Expo Screens — Implemented (Polish Only)

| Component | File | Status |
|-----------|------|--------|
| Login "Forgot" Link | `app/(auth)/login.tsx` (line 122-130) | DONE |
| Forgot Password Screen | `app/(auth)/forgot-password.tsx` | DONE (needs error handler) |
| Reset Password Screen | `app/(auth)/reset-password/[token].tsx` | DONE |
| Reset Password Layout | `app/(auth)/reset-password/_layout.tsx` | DONE |
| useForgotPassword Hook | `lib/api/hooks/use-auth.ts` | DONE (needs redirectTo param) |
| useResetPassword Hook | `lib/api/hooks/use-auth.ts` | DONE |
| Validation Schemas | `lib/validations/auth.ts` | DONE |

### API Contract (Already Exists)

| Method | Endpoint | Purpose | Body |
|--------|----------|---------|------|
| POST | `/api/v1/auth/forgot-password` | Request password reset email | `{ email: string, redirectTo?: string }` |
| POST | `/api/v1/auth/reset-password` | Reset password with token | `{ token: string, password: string }` |

**Forgot Password Response:** `{ message: "Email sent if account exists" }` (always 200)
**Reset Password Success:** `{ message: "Password reset successfully" }` (200)
**Reset Password Errors:**
- `400 { error: "Invalid or expired token", code: "INVALID_TOKEN" }`
- `400 { error: "Token expired", code: "TOKEN_EXPIRED" }`

### Project Structure Notes

**Files to MODIFY (Expo):**
```
apps/expo/app/(auth)/forgot-password.tsx          — Add error handling + redirectTo
apps/expo/app.json                                 — Add reset-password intent filter
apps/expo/lib/api/hooks/use-auth.ts                — Add redirectTo to ForgotPasswordInput
```

**Files to CREATE (Web):**
```
apps/nextjs/app/(auth)/forgot-password/page.tsx                     — Server component
apps/nextjs/app/(auth)/forgot-password/_components/forgot-password-form.tsx  — Client component
apps/nextjs/app/(auth)/reset-password/page.tsx                      — Server component
apps/nextjs/app/(auth)/reset-password/_components/reset-password-form.tsx    — Client component
```

**Files to POTENTIALLY CREATE (Expo):**
```
apps/expo/app/(auth)/reset-password/index.tsx      — Only if BetterAuth redirects with ?token= query param
```

### Patterns to Follow

**Web auth page pattern** (from existing login/register pages):
```
app/(auth)/login/
  page.tsx              → Server component, composes form
  _components/
    login-form.tsx      → "use client", react-hook-form, shadcn/ui, fetch API calls
```

**Expo error handling pattern** (from Story 14.3):
```typescript
import { Alert } from "react-native";

onError: (error) => {
  if (error instanceof ApiError) {
    const errorMap: Record<string, string> = {
      INVALID_TOKEN: "Le lien a expire ou est invalide",
      TOKEN_EXPIRED: "Le lien a expire",
    };
    Alert.alert("Erreur", errorMap[error.code] ?? error.message);
  } else {
    Alert.alert("Erreur", "Une erreur est survenue. Verifiez votre connexion.");
  }
}
```

**Expo form pattern** (from existing forgot-password.tsx):
```typescript
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
// Validation via lib/validations/auth.ts Zod schemas
// API calls via lib/api/hooks/use-auth.ts TanStack Query mutations
// Success state toggle with useState
// NativeWind Tailwind classes for styling
```

### Critical Guardrails

1. **DO NOT modify backend API routes, controllers, use cases, or DTOs** — the backend is complete and working
2. **DO NOT modify the BetterAuth config or email templates** — they are correct
3. **DO NOT change the existing forgot-password or reset-password screen layouts** — only add error handling and redirectTo
4. **DO NOT create new API endpoints** — use the existing ones
5. **The web pages MUST follow the existing `(auth)` layout pattern** — page.tsx + _components/form.tsx
6. **The forgot-password API always returns 200** — never expose whether an email exists (security)
7. **The reset token expires in 1 hour** — error messages must clearly indicate expiry
8. **Universal Links domain is placeholder** (`homecafe.app`) — will be finalized in production (Story 15.1)
9. **After `pnpm ui:add`, fix import paths** from `@/lib/utils` to `../../libs/utils` (known shadcn issue)
10. **Commit format**: `feat(expo): implement story 14.4 — auth polish forgot and reset password`

### Previous Story Intelligence (14.3 — Friend QR Scanning & Deep Links)

**Key Learnings:**
- Loading skeletons preferred over ActivityIndicator
- Alert.alert for persistent error feedback on mobile
- Remove dead code proactively (Biome flags unused imports as errors)
- Commit format: `feat(expo): implement story X.Y — description with code review fixes`
- Deep linking established: custom scheme `evahomecafeapp://` + Universal Links placeholder for `homecafe.app`
- `extractTokenFromUrl()` utility exists at `lib/utils/invite-token.ts` — reusable pattern for URL token extraction
- Error mapping pattern exists at `lib/utils/invite-errors.ts` — follow same approach for reset errors

**What 14.3 established that 14.4 builds on:**
- app.json has custom scheme `evahomecafeapp` and iOS `associatedDomains`
- Android intent filters pattern established (add `/reset-password` alongside `/invite`)
- Deep link handling via `useLocalSearchParams()` is the proven pattern
- French error message mapping with `ApiError.code` is the standard approach

### Git Intelligence

```
c130eef feat(expo): implement story 14.3 — friend QR scanning and deep links
ad601a6 feat(expo): implement story 14.2 — push notifications expo eas with code review fixes
bbe2c73 feat(expo): implement story 14.1 — settings & preferences mobile with code review fixes
```

Pattern: All mobile stories use `feat(expo): implement story X.Y — description with code review fixes`.

### Library Versions (All Already Installed)

| Library | Version | Notes |
|---------|---------|-------|
| `expo-router` | 6.0.21 | Deep link routing with `useLocalSearchParams()` |
| `@hookform/resolvers` | installed | Zod resolver for react-hook-form |
| `react-hook-form` | installed | Form management (mobile + web) |
| `zod` | installed | Validation schemas |
| `@tanstack/react-query` | 5.67.3 | API hooks with `useMutation` |
| `better-auth` | 1.4 | Server-side auth (existing config) |
| `nativewind` | installed | Tailwind for React Native |
| `shadcn/ui` | installed | Web UI components |

### Scope Sizing

This is a **medium story** — 3 Expo files to modify, 4 web files to create, 1 potential Expo file to create. Main complexity: verifying BetterAuth's redirect behavior with custom scheme URLs and creating the web auth pages. Estimated: ~200-350 lines of new/modified code.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Epic 14: Story 14.4]
- [Source: _bmad-output/planning-artifacts/prd.md#FR4 — Password reset via email code]
- [Source: _bmad-output/planning-artifacts/prd.md#FR5 — Reset password with valid code]
- [Source: _bmad-output/planning-artifacts/architecture.md#API Routes — auth/forgot-password, reset-password]
- [Source: _bmad-output/planning-artifacts/architecture.md#(auth)/ — login, register, forgot-password pages]
- [Source: _bmad-output/implementation-artifacts/14-3-friend-qr-scanning-and-deep-links.md — Previous story learnings]
- [Source: apps/expo/app/(auth)/forgot-password.tsx — Existing forgot password screen]
- [Source: apps/expo/app/(auth)/reset-password/[token].tsx — Existing reset password screen]
- [Source: apps/expo/app/(auth)/login.tsx:122-130 — "Mot de passe oublie ?" link]
- [Source: apps/expo/lib/api/hooks/use-auth.ts — useForgotPassword, useResetPassword hooks]
- [Source: apps/expo/lib/validations/auth.ts — forgotPasswordSchema, resetPasswordSchema]
- [Source: apps/expo/app.json — Custom scheme + intent filters]
- [Source: apps/nextjs/common/auth.ts — BetterAuth config with sendResetPassword]
- [Source: apps/nextjs/src/adapters/services/better-auth.service.ts — requestPasswordReset, resetPassword]
- [Source: apps/nextjs/src/application/use-cases/auth/forgot-password.use-case.ts — ForgotPasswordUseCase]
- [Source: apps/nextjs/src/application/use-cases/auth/reset-password.use-case.ts — ResetPasswordUseCase]
- [Source: apps/nextjs/src/application/dto/forgot-password.dto.ts — IForgotPasswordInputDto with redirectTo]
- [Source: apps/nextjs/src/application/dto/reset-password.dto.ts — IResetPasswordInputDto]
- [Source: apps/nextjs/src/adapters/controllers/auth/forgot-password.controller.ts — forgotPasswordController]
- [Source: apps/nextjs/src/adapters/controllers/auth/reset-password.controller.ts — resetPasswordController]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

None — no blocking issues encountered.

### Completion Notes List

- Task 1: Fixed the critical deep link gap by adding `redirectTo: "evahomecafeapp://reset-password"` to the mobile forgot-password flow. Added `ForgotPasswordInput.redirectTo` optional field. Created `reset-password/index.tsx` to handle BetterAuth's `?token=` query param redirect (Expo Router needs index route for query params vs `[token]` for path params). Added `onError` handler with `Alert.alert` for network failures.
- Task 2: Added Android intent filter for `/reset-password` path alongside existing `/invite` filter. iOS already covered by `associatedDomains`. Server-side AASA/assetlinks deferred to 15.1.
- Task 3: Created web forgot-password page with Card layout, email validation, success state with "Email envoyé" message, and link back to login. Follows existing contact-form pattern (useState, fetch, shadcn/ui).
- Task 4: Created web reset-password page with token from searchParams, password + confirm fields, error handling for expired/invalid tokens with "Demander un nouveau lien" recovery action. Missing token redirects to forgot-password.
- Task 5: Error handling already added in Task 1. Verified all existing Expo screens work correctly — "Demander un nouveau lien" navigates correctly, login "Mot de passe oublié ?" link functional.
- Task 6: All quality checks pass — `pnpm fix` (3 files auto-formatted), `pnpm type-check` (0 errors), `pnpm test` (48 files, 411 tests passed), `pnpm check` (0 issues).
- **Bonus**: Created web login page (`/login`) and register page (`/register`) — these were missing despite being linked from the landing navbar. Follows same Card/form pattern.

### Change Log

- 2026-02-11: Implemented story 14.4 — auth polish forgot & reset password. Fixed mobile deep link flow, added Android intent filter, created 4 web auth pages (login, register, forgot-password, reset-password), polished Expo error handling.
- 2026-02-11: Code review fixes — H1: Added "Demander un nouveau lien" recovery button on API token error in Expo [token].tsx (AC #4 completion). H2: Created shared (auth)/layout.tsx, deduplicated layout across 4 web pages. M1+M4: Created shared Zod validation schemas (_lib/schemas.ts), replaced manual regex validation in all web forms. M2: Fixed nested <Link><Button> (invalid HTML5) with Button asChild pattern. M3: Noted login/register pages as scope creep (bonus, not in ACs).

### File List

**Modified:**
- `apps/expo/lib/api/hooks/use-auth.ts` — Added `redirectTo?: string` to `ForgotPasswordInput`
- `apps/expo/app/(auth)/forgot-password.tsx` — Added `redirectTo` param + `onError` handler with `Alert.alert`
- `apps/expo/app.json` — Added Android intent filter for `/reset-password` path

**Created:**
- `apps/expo/app/(auth)/reset-password/index.tsx` — Query param token handler (redirects to `[token]`)
- `apps/nextjs/app/(auth)/login/page.tsx` — Web login server component
- `apps/nextjs/app/(auth)/login/_components/login-form.tsx` — Web login client form
- `apps/nextjs/app/(auth)/register/page.tsx` — Web register server component
- `apps/nextjs/app/(auth)/register/_components/register-form.tsx` — Web register client form
- `apps/nextjs/app/(auth)/forgot-password/page.tsx` — Web forgot-password server component
- `apps/nextjs/app/(auth)/forgot-password/_components/forgot-password-form.tsx` — Web forgot-password client form
- `apps/nextjs/app/(auth)/reset-password/page.tsx` — Web reset-password server component
- `apps/nextjs/app/(auth)/reset-password/_components/reset-password-form.tsx` — Web reset-password client form
- `apps/nextjs/app/(auth)/layout.tsx` — Shared auth layout (code review fix)
- `apps/nextjs/app/(auth)/_lib/schemas.ts` — Shared Zod validation schemas (code review fix)
