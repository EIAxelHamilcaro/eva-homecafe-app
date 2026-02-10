# Story 9.2: Contact Page

Status: done

## Story

As a **user** (authenticated or not),
I want to access a contact page to reach support,
so that I can get help or send feedback.

## Acceptance Criteria

1. **Given** an authenticated user **When** they navigate to the contact page **Then** they see a contact form pre-filled with their name and email (connected state)
2. **Given** a non-authenticated visitor **When** they navigate to the contact page **Then** they see a contact form with empty name and email fields (non-connected state)
3. **Given** any user **When** they submit the contact form with valid data **Then** the message is sent via email and a confirmation is displayed
4. **Given** any user **When** they submit the contact form with missing required fields **Then** a validation error is displayed
5. **Given** any user on mobile or desktop **When** they view the contact page **Then** the layout is responsive per Figma designs (NFR19)

## Tasks / Subtasks

- [x] Task 1: Create contact DTO and Use Case (AC: #3, #4)
  - [x] 1.1 Create `src/application/dto/contact/send-contact-message.dto.ts` with Zod schemas
  - [x] 1.2 Create `SendContactMessageUseCase` in `src/application/use-cases/contact/`
  - [x] 1.3 Write BDD tests for the use case
- [x] Task 2: Add contact email template (AC: #3)
  - [x] 2.1 Add `contactForm` template to `src/adapters/services/email/templates.ts`
- [x] Task 3: Create controller and API route (AC: #3, #4)
  - [x] 3.1 Create `src/adapters/controllers/contact/contact.controller.ts` (POST handler)
  - [x] 3.2 Create `app/api/v1/contact/route.ts`
- [x] Task 4: Wire DI (AC: #3)
  - [x] 4.1 Create `common/di/modules/contact.module.ts`
  - [x] 4.2 Register in `container.ts` and `types.ts` (DI_SYMBOLS + DI_RETURN_TYPES)
- [x] Task 5: Create contact page UI (AC: #1, #2, #3, #4, #5)
  - [x] 5.1 Create `app/contact/page.tsx` (Server Component, public route)
  - [x] 5.2 Create `app/contact/_components/contact-form.tsx` (Client Component)
- [x] Task 6: Quality validation (AC: all)
  - [x] 6.1 `pnpm type-check` passes
  - [x] 6.2 `pnpm check` (Biome) passes
  - [x] 6.3 `pnpm test` passes (new + existing — 392 tests, 45 files)
  - [x] 6.4 Verify form pre-fill works for authenticated users
  - [x] 6.5 Verify form works for non-authenticated visitors

## Dev Notes

### Architecture Overview

Contact page is a **lightweight public page** with a simple backend for email delivery. No domain aggregate, no DB schema, no repository — just a use case that sends an email via the existing `IEmailProvider`.

**Architecture mapping confirms:** No domain, no DB, no repository. The only backend piece is a `SendContactMessageUseCase` that delegates to `IEmailProvider` (Resend service).

### Route: PUBLIC, Not Protected

The contact page is at `app/contact/page.tsx` — a **public route**, NOT inside `(protected)/`. Both authenticated users and anonymous visitors must access it.

**Session detection for pre-fill:** The page Server Component optionally fetches the session (try/catch, non-blocking). If authenticated, pass `{ name, email }` to the client form for pre-fill. If not authenticated or session fetch fails, pass nothing — form starts empty.

**Pattern for optional session:**
```typescript
// app/contact/page.tsx
import { headers } from "next/headers";
import { getInjection } from "@/common/di/container";
import { match } from "@packages/ddd-kit";
import { ContactForm } from "./_components/contact-form";

export default async function ContactPage() {
  let prefill: { name: string; email: string } | null = null;
  try {
    const headersList = await headers();
    const getSession = getInjection("GetSessionUseCase");
    const result = await getSession.execute(headersList);
    if (result.isSuccess) {
      match(result.getValue(), {
        Some: (session) => {
          prefill = { name: session.user.name, email: session.user.email };
        },
        None: () => {},
      });
    }
  } catch {
    // Not authenticated — that's fine for a public page
  }
  return <ContactForm prefill={prefill} />;
}
```

### Use Case Design

**SendContactMessageUseCase:**
- **Input:** `{ name: string, email: string, subject: string, message: string }`
- **Dependencies:** `IEmailProvider` only (no repository)
- **Flow:**
  1. Validate input (name, email, subject, message all required)
  2. Build email HTML from contact template
  3. Send email to support address via `IEmailProvider.send()`
  4. Return `Result<void>`

**Destination email:** Use env var `CONTACT_EMAIL` with fallback to `process.env.RESEND_FROM_EMAIL` or `"support@homecafe.app"`.

**Email sends TWO messages:**
1. **To support:** Full contact form data (name, email, subject, message)
2. **To sender:** Confirmation receipt ("We received your message")

### DTO Schema

```typescript
// src/application/dto/contact/send-contact-message.dto.ts
import { z } from "zod";

export const sendContactMessageInputDtoSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(1, "Subject is required").max(200),
  message: z.string().min(10, "Message must be at least 10 characters").max(5000),
});

export type ISendContactMessageInputDto = z.infer<typeof sendContactMessageInputDtoSchema>;
```

No output DTO needed — the use case returns `Result<void>`.

### Email Template

Add `contactForm` and `contactConfirmation` to `src/adapters/services/email/templates.ts`:

```typescript
contactForm: (data: { name: string; email: string; subject: string; message: string }) => ({
  subject: `[Contact] ${data.subject}`,
  html: baseLayout(`
    ${paragraph(`Nouveau message de contact de <strong>${data.name}</strong> (${data.email})`)}
    ${paragraph(`<strong>Sujet :</strong> ${data.subject}`)}
    ${paragraph(data.message.replace(/\n/g, "<br>"))}
    ${muted(`Répondre directement à : ${data.email}`)}
  `),
}),

contactConfirmation: (name: string) => ({
  subject: `${BRAND.name} — Nous avons reçu votre message`,
  html: baseLayout(`
    ${paragraph(`Bonjour ${name},`)}
    ${paragraph("Nous avons bien reçu votre message et nous vous répondrons dans les plus brefs délais.")}
    ${paragraph("Merci de nous avoir contactés !")}
    ${muted(`L'équipe ${BRAND.name}`)}
  `),
}),
```

**IMPORTANT:** Sanitize user input in email HTML to prevent XSS. Escape `<`, `>`, `&`, `"` in name, subject, and message before embedding in HTML template.

### Controller Pattern

```typescript
// src/adapters/controllers/contact/contact.controller.ts
export const sendContactMessageController = async (request: NextRequest) => {
  // NO auth check — public endpoint
  const body = await request.json();
  const parsed = sendContactMessageInputDtoSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }
  const useCase = getInjection("SendContactMessageUseCase");
  const result = await useCase.execute(parsed.data);
  if (result.isFailure) {
    return NextResponse.json({ error: result.getError() }, { status: 500 });
  }
  return NextResponse.json({ success: true }, { status: 200 });
};
```

**CRITICAL — NO auth guard on this endpoint.** This is a public contact form. Anyone can submit.

**Rate limiting consideration:** Not in scope for this story, but the dev should NOT add auth. If spam becomes an issue, rate limiting can be added later.

### API Route

```typescript
// app/api/v1/contact/route.ts
import { sendContactMessageController } from "@/adapters/controllers/contact/contact.controller";
export const POST = sendContactMessageController;
```

### DI Wiring

**contact.module.ts:**
```typescript
import { createModule } from "@evyweb/ioctopus";
import { DI_SYMBOLS } from "../types";
import { SendContactMessageUseCase } from "@/application/use-cases/contact/send-contact-message.use-case";

export const createContactModule = () => {
  const m = createModule();
  m.bind(DI_SYMBOLS.SendContactMessageUseCase).toClass(
    SendContactMessageUseCase,
    [DI_SYMBOLS.IEmailProvider],
  );
  return m;
};
```

**types.ts additions:**
```typescript
// DI_SYMBOLS
SendContactMessageUseCase: Symbol.for("SendContactMessageUseCase"),

// DI_RETURN_TYPES
SendContactMessageUseCase: SendContactMessageUseCase;
```

**container.ts:** Load `createContactModule()` alphabetically (before ChatModule).

### UI Design

**Single-page layout with centered form:**

1. **Page header:** "Contactez-nous" / "Contact Us"
2. **Brief intro text:** "Have a question, feedback, or need help? We'd love to hear from you."
3. **Form fields:**
   - Name (Input, required) — pre-filled if authenticated
   - Email (Input, required) — pre-filled if authenticated
   - Subject (Input, required)
   - Message (Textarea, required, min 10 chars)
4. **Submit button:** "Send Message" / "Envoyer"
5. **Success state:** Replace form with confirmation message + "Back to home" link
6. **Error state:** Inline validation errors under fields + toast/alert for server errors

**Client component pattern:** Follow settings-form.tsx approach:
- `"use client"` component
- `useState` for form fields, loading, success, error
- `fetch("/api/v1/contact", { method: "POST", body })` on submit
- Form validation via Zod (client-side before submit)

### shadcn/ui Components Needed

All already available in `packages/ui/src/components/ui/`:
- `Card`, `CardHeader`, `CardTitle`, `CardContent` — form container
- `Button` — submit
- `Input` — name, email, subject
- `Textarea` — message body
- `Label` — field labels
- `form.tsx` — react-hook-form integration (FormField, FormItem, FormLabel, FormControl, FormMessage)

**Choice:** Can use either plain `useState` (like settings-form) or react-hook-form (like auth forms). React-hook-form with `@hookform/resolvers/zod` is cleaner for validation.

### Project Structure Notes

**New files to create:**
```
apps/nextjs/src/application/dto/contact/send-contact-message.dto.ts
apps/nextjs/src/application/use-cases/contact/send-contact-message.use-case.ts
apps/nextjs/src/application/use-cases/contact/__tests__/send-contact-message.use-case.test.ts

apps/nextjs/src/adapters/controllers/contact/contact.controller.ts

apps/nextjs/common/di/modules/contact.module.ts

apps/nextjs/app/api/v1/contact/route.ts

apps/nextjs/app/contact/
├── page.tsx
└── _components/
    └── contact-form.tsx
```

**Files to modify:**
```
apps/nextjs/src/adapters/services/email/templates.ts     (add contactForm + contactConfirmation templates)
apps/nextjs/src/application/ports/email.provider.port.ts  (add CONTACT_FORM to EmailType if needed)
apps/nextjs/common/di/types.ts                            (add DI_SYMBOLS + DI_RETURN_TYPES)
apps/nextjs/common/di/container.ts                        (load contact module)
```

### Alignment with Existing Patterns

- **Use case pattern:** Same as `SendMessageUseCase` — takes input, delegates to provider, returns Result
- **Controller pattern:** Same as all existing controllers minus auth check (public endpoint)
- **DI pattern:** `toClass(UseCase, [DI_SYMBOLS.IEmailProvider])` — single dependency
- **Page pattern:** Server Component + _components/ Client Component (same as all pages)
- **Email template pattern:** Same structure as `passwordReset`, `welcome`, `emailVerification`
- **DTO pattern:** Zod schema with `z.infer<>` type export
- **API route pattern:** Simple re-export `export const POST = sendContactMessageController;`

### Anti-Pattern Prevention

- **DO NOT** add `requireAuth()` or `getAuthenticatedUser()` to the controller — this is a PUBLIC endpoint
- **DO NOT** create a domain aggregate — there's nothing to persist
- **DO NOT** create a repository — no database table needed
- **DO NOT** store contact submissions in DB — just send email (if persistence needed, it's a future story)
- **DO NOT** use `throw new Error()` — use `Result.fail()` in the use case
- **DO NOT** create index.ts barrel exports
- **DO NOT** add comments to the code

### Error Handling

- **Client-side:** Zod validation before submit, show inline errors per field
- **Server-side:** Zod safeParse in controller, Result pattern in use case
- **Email failure:** If IEmailProvider.send() fails, return Result.fail("Failed to send message") → controller maps to 500
- **Page-level:** Server Component wraps session fetch in try/catch (non-blocking for public page)

### Previous Story Intelligence

**From Story 9.1 (Settings & Preferences Page):**
- **Pattern confirmed:** Server Component page + Client Component form with sections
- **DI wiring confirmed:** Add to `types.ts` (both DI_SYMBOLS + DI_RETURN_TYPES), create module, load in container.ts alphabetically
- **Error handling:** Mandatory try/catch in Server Components (Epic 8 retro action item)
- **FR8 lesson:** Verify the FR is actually implemented before marking done — don't trust the epics' "Already Implemented" claims
- **DeleteAccountUseCase doesn't exist yet** — not relevant for contact page
- **No global navigation** — page accessed via direct URL `/contact`

**From Epic 8 Retrospective:**
- Error handling (try/catch + fallback) MANDATORY in async Server Components
- `Awaited<ReturnType<typeof fn>>` for typing query results
- Biome ~49 warnings were all resolved in commit b70ac87 — keep at zero

### Git Intelligence

Recent commits: `feat(nextjs): implement story X.Y — description with code review fixes`

Story 9.1 (settings) is the most recent feature commit. Story 9.2 (contact) is simpler — no domain aggregate, no DB, no repository. Expect fewer files.

### Technology Notes

No web research needed. All technologies established:
- Next.js 16 App Router (Server Components, public routes)
- Resend email service (existing `IEmailProvider`)
- shadcn/ui (Input, Textarea, Button, Card, Label)
- Zod (DTO validation)
- react-hook-form + @hookform/resolvers (optional for form handling)
- ddd-kit (Result, Option for session detection)

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Epic 9, Story 9.2]
- [Source: _bmad-output/planning-artifacts/architecture.md#Requirements to Structure Mapping — Contact row]
- [Source: _bmad-output/planning-artifacts/architecture.md#Implementation Patterns]
- [Source: apps/nextjs/src/adapters/services/email/templates.ts — Email template patterns]
- [Source: apps/nextjs/src/application/ports/email.provider.port.ts — IEmailProvider interface]
- [Source: apps/nextjs/src/adapters/actions/auth.actions.ts — Server Action pattern]
- [Source: _bmad-output/implementation-artifacts/9-1-settings-and-preferences-page.md — Previous story intelligence]

## Quality Checklist

- [x] Error handling in Server Component (try/catch for session fetch)
- [x] All new files follow naming conventions (.use-case.ts, .dto.ts, .controller.ts)
- [x] Result<T> returned from use case, never throw
- [x] DI registration complete (symbols + return types + module + container)
- [x] BDD tests cover: happy path, validation errors, email send failure
- [x] Biome passes (`pnpm check`)
- [x] TypeScript passes (`pnpm type-check`)
- [x] All existing tests still pass (`pnpm test`)
- [x] No unused imports or dead code
- [x] Form pre-fill works for authenticated users
- [x] Form works for non-authenticated visitors
- [x] Responsive layout (mobile/desktop)

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

N/A

### Completion Notes List

- All 6 tasks completed successfully
- 9 BDD tests (happy path, HTML escaping, error handling)
- 389 total tests passing across 45 test files
- Biome: 0 errors, 0 warnings
- TypeScript: clean
- Public route (no auth required), optional session pre-fill for authenticated users
- HTML escaping in use case prevents XSS in email content (incl. single quotes)
- Confirmation email failure does not fail the overall operation (try/catch)

### Code Review Fixes Applied (2026-02-10)

- **H1**: Moved `templates.ts` from `adapters/services/email/` to `application/services/email/` (Clean Architecture fix)
- **H2**: Support email now injected via DI (`toHigherOrderFunction`), no more `process.env` in use case
- **H3**: Controller returns generic error message on failure (security fix)
- **M1**: Fixed container module loading order (Chat before Contact)
- **M2**: Removed duplicate Zod validation from use case (controller-only validation)
- **M3**: Added single quote escaping to `escapeHtml` (OWASP compliance)
- **M4**: Wrapped confirmation email send in try/catch (exception safety)
- Added 2 HTML escaping tests + 1 exception handling test

### File List

**Created:**
- `apps/nextjs/src/application/dto/contact/send-contact-message.dto.ts`
- `apps/nextjs/src/application/use-cases/contact/send-contact-message.use-case.ts`
- `apps/nextjs/src/application/use-cases/contact/__tests__/send-contact-message.use-case.test.ts`
- `apps/nextjs/src/adapters/controllers/contact/contact.controller.ts`
- `apps/nextjs/app/api/v1/contact/route.ts`
- `apps/nextjs/common/di/modules/contact.module.ts`
- `apps/nextjs/app/contact/page.tsx`
- `apps/nextjs/app/contact/_components/contact-form.tsx`
- `apps/nextjs/src/application/services/email/templates.ts` (moved from adapters)

**Modified:**
- `apps/nextjs/common/auth.ts` (updated templates import path)
- `apps/nextjs/common/di/types.ts` (added DI_SYMBOLS + DI_RETURN_TYPES + import)
- `apps/nextjs/common/di/container.ts` (loaded ContactModule alphabetically, fixed order)
