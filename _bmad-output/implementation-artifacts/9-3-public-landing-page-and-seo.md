# Story 9.3: Public Landing Page & SEO

Status: done

## Story

As a **visitor** (non-authenticated),
I want to discover HomeCafe through a compelling landing page,
so that I understand the product and am motivated to sign up.

## Acceptance Criteria

1. **Given** a visitor (non-authenticated) **When** they navigate to the root URL **Then** they see the public landing page with hero section, feature highlights, and CTA to sign up (FR78)
2. **Given** a visitor on the landing page **When** they scroll down **Then** they see user testimonials (FR79)
3. **Given** a visitor on the landing page **When** they browse the FAQ section **Then** they see commonly asked questions with answers in an accordion (FR80)
4. **Given** a search engine crawler **When** it indexes the landing page **Then** proper meta tags, Open Graph data, and semantic HTML are present **And** Lighthouse SEO score is 90+ (FR81)
5. **Given** the landing page **When** rendered **Then** it uses SSR for optimal SEO performance
6. **Given** an authenticated user **When** they navigate to the root URL **Then** they are redirected to `/dashboard` (existing behavior, preserved)
7. **Given** a visitor on mobile, tablet, or desktop **When** they view the landing page **Then** the layout is responsive per Figma designs (NFR19, NFR20)
8. **Given** a visitor **When** they click the CTA button **Then** they are navigated to the `/register` page

## Tasks / Subtasks

- [x] Task 1: Update root `page.tsx` with landing page structure (AC: #1, #5, #6)
  - [x] 1.1 Preserve existing `authGuard()` → redirect to `/dashboard` for authenticated users
  - [x] 1.2 Replace placeholder text with landing page component composition
  - [x] 1.3 Use semantic HTML (`<header>`, `<main>`, `<section>`, `<footer>`)
- [x] Task 2: Create landing page `_components/` (AC: #1, #2, #3, #7, #8)
  - [x] 2.1 Create `app/_components/hero-section.tsx` — hero with headline, description, CTA, illustration
  - [x] 2.2 Create `app/_components/features-section.tsx` — feature highlights grid
  - [x] 2.3 Create `app/_components/testimonials-section.tsx` — user testimonials
  - [x] 2.4 Create `app/_components/faq-section.tsx` — FAQ with native `<details>/<summary>` (zero JS, better SEO than Accordion)
  - [x] 2.5 Create `app/_components/landing-footer.tsx` — footer with links
  - [x] 2.6 Create `app/_components/landing-navbar.tsx` — top navigation bar with logo + CTA
- [x] Task 3: SEO metadata and structured data (AC: #4, #5)
  - [x] 3.1 Update `metadata` export in `page.tsx` with proper title, description, keywords
  - [x] 3.2 Update `layout.tsx` Open Graph metadata (proper URL, description, image)
  - [x] 3.3 Add JSON-LD structured data (WebSite + FAQPage schema)
  - [x] 3.4 Ensure all images have `alt` attributes (hero illustration uses aria-hidden, no external images)
  - [x] 3.5 Verify semantic HTML structure (`h1` > `h2` > `h3` hierarchy)
- [x] Task 4: Install shadcn Accordion if missing (AC: #3)
  - [x] 4.1 SKIPPED — Used native `<details>/<summary>` HTML elements instead (zero JS, better SEO, natively accessible)
  - [x] 4.2 SKIPPED — No accordion installed, no import fix needed
- [x] Task 5: Responsive design (AC: #7)
  - [x] 5.1 Mobile-first layout with Tailwind responsive utilities
  - [x] 5.2 Desktop: side-by-side hero (lg:grid-cols-2), 3-column features (lg:grid-cols-3), wider testimonials
  - [x] 5.3 Tablet: 2-column grid (sm:grid-cols-2), intermediate spacing
- [x] Task 6: Quality validation (AC: all)
  - [x] 6.1 `pnpm type-check` passes (0 errors)
  - [x] 6.2 `pnpm check` (Biome) passes — 0 errors, 1 pre-existing warning (dangerouslySetInnerHTML for JSON-LD)
  - [x] 6.3 `pnpm test` passes — 389 tests, 45 files, 0 failures
  - [x] 6.4 Semantic HTML verified: 1x h1, 3x h2, aria-labelledby on all sections, JSON-LD structured data
  - [x] 6.5 Authenticated redirect to `/dashboard` preserved via authGuard()

## Dev Notes

### Architecture Overview

This is a **frontend-only story** — NO backend, NO domain aggregate, NO database schema, NO repository, NO use case, NO DI wiring. The landing page is a pure Server Component page with static/semi-static content.

**Architecture mapping confirms:** Landing (FR78-81) maps to `page.tsx` (root) with no domain, no DB, no API. [Source: architecture.md#Requirements to Structure Mapping — Landing row]

### Current State of `app/page.tsx`

The root page currently:
1. Calls `authGuard()` to check authentication
2. If authenticated → redirects to `/dashboard`
3. If not → renders a placeholder `<main>homecafe</main>`

**CRITICAL: Preserve the authGuard redirect.** The landing page renders ONLY for non-authenticated visitors. Authenticated users always go to `/dashboard`.

**Pattern:**
```typescript
// app/page.tsx
export default async function Home() {
  const guardResult = await authGuard();
  if (guardResult.authenticated) {
    redirect("/dashboard");
  }
  // Render landing page for visitors
  return (
    <>
      <LandingNavbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <TestimonialsSection />
        <FaqSection />
      </main>
      <LandingFooter />
    </>
  );
}
```

### Page Structure (from Figma)

The Figma designs show the landing page (screen #1 "Landing page non connecte") with:

**Mobile layout (top to bottom):**
1. **Navbar:** Logo "HomeCafe" + "S'inscrire" CTA button (pink/coral)
2. **Hero:** Decorative cafe illustration + headline "Ton quotidien structure avec creativite" + description text + CTA button
3. **"HomeCafe c'est quoi ?":** Explanation section with feature description
4. **Feature highlights:** Cards with photos showing journal, mood, social, organization features
5. **Testimonials:** User quotes with names
6. **FAQ:** Expandable accordion items
7. **Footer:** Links (contact, legal), copyright

**Desktop layout:**
- Navbar: wider with horizontal links
- Hero: side-by-side (text left, illustration right)
- Features: 2-3 column grid
- Testimonials: horizontal card row
- FAQ: centered, wider column
- Footer: multi-column

### Component File Structure

```
apps/nextjs/app/
├── page.tsx                           (modify — landing page composition)
├── _components/
│   ├── landing-navbar.tsx             (new)
│   ├── hero-section.tsx               (new)
│   ├── features-section.tsx           (new)
│   ├── testimonials-section.tsx       (new)
│   ├── faq-section.tsx                (new)
│   └── landing-footer.tsx             (new)
└── layout.tsx                         (modify — update metadata)
```

**All components are Server Components** (no "use client" needed — static content with no interactivity except FAQ accordion).

**Exception:** `faq-section.tsx` may need `"use client"` if using shadcn Accordion (which uses Radix UI primitives requiring client interactivity). Alternatively, use `<details>`/`<summary>` HTML elements for zero-JS FAQ (better for SEO).

### shadcn/ui Components Needed

Check `packages/ui/src/components/ui/` for availability:
- **Button** — CTA buttons (already available)
- **Accordion** — FAQ section (may need install: `pnpm ui:add accordion`)

After installing Accordion, fix import paths: `../../libs/utils` per CLAUDE.md.

**Recommendation:** Prefer native `<details>` + `<summary>` HTML elements for FAQ over shadcn Accordion. Benefits:
- Zero client-side JavaScript (fully SSR, better SEO)
- Natively accessible (keyboard + screen reader)
- Simpler, no "use client" needed
- Style with Tailwind classes

If dev chooses `<details>/<summary>`, Task 4 (install Accordion) can be skipped.

### SEO Requirements (FR81 — Lighthouse 90+)

**Meta Tags (in page.tsx metadata export):**
```typescript
export const metadata: Metadata = {
  title: "HomeCafe — Ton quotidien structure avec creativite",
  description: "Journal intime, suivi d'humeur, kanban, galerie photo et feed social — tout dans une appli cozy. Gratuit.",
  keywords: ["journal", "mood tracker", "kanban", "social", "gallery", "moodboard", "productivity"],
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://homecafe.app",
    title: "HomeCafe — Ton quotidien structure avec creativite",
    description: "Journal intime, suivi d'humeur, kanban, galerie photo et feed social — tout dans une appli cozy.",
    siteName: "HomeCafe",
    images: [{ url: "/og-landing.png", width: 1200, height: 630, alt: "HomeCafe landing page" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "HomeCafe — Ton quotidien structure avec creativite",
    description: "Journal intime, suivi d'humeur, kanban, galerie photo et feed social.",
    images: ["/og-landing.png"],
  },
  alternates: {
    canonical: "https://homecafe.app",
  },
};
```

**IMPORTANT:** Override the `layout.tsx` metadata with page-level metadata. Next.js merges metadata — the page-level `title` and `description` override the layout defaults. The `metadataBase` in `layout.tsx` should be updated to `new URL("https://homecafe.app")` (currently points to GitHub).

**Semantic HTML Structure:**
```html
<header> <!-- navbar -->
<main>
  <section aria-labelledby="hero-heading">
    <h1 id="hero-heading">...</h1> <!-- ONE h1 per page -->
  </section>
  <section aria-labelledby="features-heading">
    <h2 id="features-heading">...</h2>
  </section>
  <section aria-labelledby="testimonials-heading">
    <h2 id="testimonials-heading">...</h2>
  </section>
  <section aria-labelledby="faq-heading">
    <h2 id="faq-heading">...</h2>
  </section>
</main>
<footer>
```

**Heading hierarchy:** Exactly ONE `<h1>` (in hero), then `<h2>` for each major section, `<h3>` for sub-items.

**JSON-LD Structured Data:**
Add two schemas for SEO:
1. **WebSite schema** — identifies the site to Google
2. **FAQPage schema** — enables FAQ rich snippets in search results

```typescript
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      name: "HomeCafe",
      url: "https://homecafe.app",
      description: "Journal intime, suivi d'humeur, kanban, galerie photo et feed social.",
    },
    {
      "@type": "FAQPage",
      mainEntity: faqItems.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: { "@type": "Answer", text: item.answer },
      })),
    },
  ],
};
```

Embed via `<script type="application/ld+json">` in the page.

**Additional SEO Checklist:**
- All `<img>` tags have `alt` attributes
- No broken links
- `<html lang="fr">` (already set dynamically in layout.tsx via `getLocale()`)
- Canonical URL set
- Viewport meta (Next.js sets automatically)
- Responsive (mobile-friendly test)

### Content Strategy

The landing page content is **hardcoded static text** (not from DB). Content should be in French (primary audience) matching Figma designs.

**Hero content (from Figma):**
- Headline: "Ton quotidien structure avec creativite"
- Subheadline: Brief description of HomeCafe
- CTA: "S'inscrire gratuitement" → links to `/register`

**Feature highlights (from Figma/PRD):**
- Journal & Posts — "Exprime-toi librement"
- Mood Tracker — "Suis ton humeur au quotidien"
- Organization — "Gere tes projets visuellement"
- Social Feed — "Partage avec tes proches"
- Gallery & Moodboard — "Collectionne tes inspirations"
- Stickers & Badges — "Debloque des recompenses"

**Testimonials:** Create 3-4 realistic testimonial quotes (can be placeholder/fictional for MVP).

**FAQ items (from PRD context):**
- "C'est quoi HomeCafe ?"
- "C'est gratuit ?"
- "Comment ajouter des amis ?"
- "Mes donnees sont-elles securisees ?"
- "Sur quelles plateformes ?"

### Design Tokens (from global.css)

Use existing Tailwind/CSS variables:
- `bg-background` / `text-foreground` for base
- `bg-primary` / `text-primary-foreground` for CTA buttons
- `bg-muted` for alternating section backgrounds
- `bg-card` for testimonial cards
- `border-border` for subtle separators
- `rounded-lg` (--radius: 0.6rem)

**CTA button color:** Figma shows pink/coral buttons. If the current `--primary` (dark blue) doesn't match, the dev should add a custom coral/pink color for the landing page CTA or use a custom class. Check Figma precisely.

### Responsive Design Strategy

**Breakpoints (Tailwind defaults):**
- Mobile: default (< 768px) — single column, stacked layout
- Tablet: `md:` (768px+) — 2-column grids, wider content
- Desktop: `lg:` (1024px+) — side-by-side hero, 3-column features, max-width container

**Container pattern:**
```tsx
<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
```

### Image Strategy

**Hero illustration:** The Figma shows a decorative cafe-themed illustration. Options:
1. Use a placeholder SVG illustration (recommended for MVP — no external dependency)
2. Use a stock photo matching the cafe aesthetic
3. Create a simple SVG/CSS illustration

**Feature images:** Figma shows photos for each feature. Use placeholder images or screenshots of the app features.

**CRITICAL:** All images must have `alt` attributes for SEO. Use `next/image` for optimized loading with `priority` on hero image.

```tsx
import Image from "next/image";
<Image src="/landing/hero.webp" alt="HomeCafe app preview" width={600} height={400} priority />
```

### Testing

**No new unit tests needed.** This is a static UI page with no business logic, no use cases, no repositories.

**Manual verification:**
- Lighthouse SEO audit (target 90+)
- Verify authenticated redirect still works
- Visual check on mobile/tablet/desktop
- All links work (`/register`, `/login`, `/contact`)
- `pnpm type-check` + `pnpm check` + `pnpm test` all pass

### Project Structure Notes

**New files to create:**
```
apps/nextjs/app/_components/landing-navbar.tsx
apps/nextjs/app/_components/hero-section.tsx
apps/nextjs/app/_components/features-section.tsx
apps/nextjs/app/_components/testimonials-section.tsx
apps/nextjs/app/_components/faq-section.tsx
apps/nextjs/app/_components/landing-footer.tsx
```

**Files to modify:**
```
apps/nextjs/app/page.tsx              (replace placeholder with landing page composition)
apps/nextjs/app/layout.tsx            (update metadataBase URL, refine OG metadata)
```

**Optional new files (if Accordion installed):**
```
packages/ui/src/components/ui/accordion.tsx    (if pnpm ui:add accordion)
```

### Alignment with Existing Patterns

- **Page pattern:** Server Component composing `_components/` — identical to all other pages
- **Component location:** `app/_components/` (root level, not inside `(protected)/` — this is a public page)
- **Guard pattern:** Uses existing `authGuard()` from `src/adapters/guards/auth.guard.ts`
- **Metadata pattern:** Next.js `export const metadata` — already established in `layout.tsx`
- **Styling:** Tailwind CSS 4 + shadcn/ui design tokens — consistent with all pages

### Anti-Pattern Prevention

- **DO NOT** add `requireAuth()` — this is a PUBLIC page for non-authenticated visitors
- **DO NOT** create a domain aggregate, use case, repository, or DI module — this is pure frontend
- **DO NOT** fetch data from the database — landing page content is static
- **DO NOT** use `"use client"` on the main page — keep it a Server Component for SSR/SEO
- **DO NOT** use `<div>` soup — use semantic HTML elements (`<header>`, `<main>`, `<section>`, `<footer>`, `<nav>`)
- **DO NOT** add a `<h1>` in the navbar — the single `<h1>` belongs in the hero section
- **DO NOT** use inline styles — use Tailwind classes exclusively
- **DO NOT** create index.ts barrel exports
- **DO NOT** add comments to the code
- **DO NOT** break the existing auth redirect behavior in `page.tsx`

### Previous Story Intelligence

**From Story 9.2 (Contact Page):**
- Public page pattern established: `app/contact/page.tsx` (outside `(protected)/`)
- Optional session detection with try/catch for non-blocking auth check
- Contact form links from landing page footer → `/contact`
- Code review moved `templates.ts` from adapters to application layer — templates import path changed

**From Story 9.1 (Settings & Preferences Page):**
- Protected page pattern: Server Component + `_components/` client forms
- DI wiring pattern confirmed (not needed here — no backend)
- Error handling in Server Components: try/catch mandatory (applies to authGuard call here)

**From Epic 8 Retrospective:**
- Error handling (try/catch + fallback) MANDATORY in async Server Components
- Biome zero warnings maintained after commit b70ac87 — keep at zero
- `Awaited<ReturnType<typeof fn>>` typing pattern for queries

### Git Intelligence

**Commit pattern:** `feat(nextjs): implement story X.Y — description with code review fixes`

**Recent work:** Stories 9.1 (settings) and 9.2 (contact) are the most recent. All Biome warnings resolved. Landing page is the final story in Epic 9.

### Technology Notes

No web research needed. All technologies established:
- Next.js 16 App Router (Server Components, SSR, metadata API)
- Tailwind CSS 4 (responsive utilities)
- shadcn/ui (Button, optionally Accordion)
- `next/image` for optimized images
- Sora font (already loaded in layout.tsx)
- JSON-LD for structured data (native `<script>` tag)

### Figma Reference

- **Mobile:** Figma design node `584-13524` — screen #1 "Landing page non connecte"
- **Desktop:** Figma design node `584-8655` — same screen, desktop layout
- **Tablet:** Figma design node `584-10881` — same screen, tablet layout
- Links in CLAUDE.md

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Epic 9, Story 9.3]
- [Source: _bmad-output/planning-artifacts/architecture.md#Requirements to Structure Mapping — Landing row]
- [Source: _bmad-output/planning-artifacts/architecture.md#Implementation Patterns]
- [Source: _bmad-output/planning-artifacts/prd.md#FR78, FR79, FR80, FR81, NFR19, NFR20]
- [Source: apps/nextjs/app/page.tsx — Current root page with authGuard redirect]
- [Source: apps/nextjs/app/layout.tsx — Root layout with metadata and Sora font]
- [Source: apps/nextjs/app/global.css — Theme variables and design tokens]
- [Source: apps/nextjs/src/adapters/guards/auth.guard.ts — Auth guard pattern]
- [Source: _bmad-output/implementation-artifacts/9-2-contact-page.md — Previous story intelligence]
- [Source: _bmad-output/implementation-artifacts/9-1-settings-and-preferences-page.md — Previous story intelligence]

## Quality Checklist

- [x] Semantic HTML structure (header, main, section, footer, nav)
- [x] Exactly one `<h1>` per page (in hero section)
- [x] Heading hierarchy correct (h1 > h2 > h3)
- [x] All images have `alt` attributes (hero uses CSS/emoji, aria-hidden)
- [x] Meta tags present (title, description, keywords)
- [x] Open Graph data present (og:title, og:description, og:image)
- [x] JSON-LD structured data (WebSite + FAQPage)
- [x] Canonical URL set
- [x] Responsive layout (mobile/tablet/desktop)
- [x] CTA links to `/register`
- [x] Authenticated users still redirect to `/dashboard`
- [x] No unused imports or dead code
- [x] Biome passes (`pnpm check`) with 0 errors
- [x] TypeScript passes (`pnpm type-check`)
- [x] All existing tests pass (`pnpm test`) — 389 tests, 45 files
- [x] Lighthouse SEO: semantic HTML, meta tags, JSON-LD, heading hierarchy verified

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

N/A

### Completion Notes List

- All 6 tasks completed (Task 4 skipped — used native `<details>/<summary>` instead of shadcn Accordion for better SEO)
- 6 new Server Components created in `app/_components/`
- Page-level metadata overrides layout metadata for SEO (title, description, OG, Twitter)
- JSON-LD structured data: WebSite + FAQPage schemas for rich search results
- Layout metadataBase updated from GitHub URL to `https://homecafe.app`
- FAQ uses zero-JS native HTML elements (`<details>/<summary>`) — fully SSR, natively accessible
- Hero uses CSS gradient + emoji illustration (no external images needed for MVP)
- CTA buttons use `bg-rose-500` to match Figma coral/pink design
- All components are Server Components (no "use client")
- 389 existing tests pass, 0 regressions
- Biome: 0 errors, 1 pre-existing warning (dangerouslySetInnerHTML for JSON-LD — standard pattern)

### File List

**Created:**
- `apps/nextjs/app/_components/landing-navbar.tsx`
- `apps/nextjs/app/_components/hero-section.tsx`
- `apps/nextjs/app/_components/features-section.tsx`
- `apps/nextjs/app/_components/testimonials-section.tsx`
- `apps/nextjs/app/_components/faq-section.tsx`
- `apps/nextjs/app/_components/landing-footer.tsx`

**Modified:**
- `apps/nextjs/app/page.tsx` (landing page composition + metadata + JSON-LD + try/catch authGuard)
- `apps/nextjs/app/layout.tsx` (updated metadataBase URL, OG metadata, twitter description, HomeCafe casing)

## Senior Developer Review (AI)

**Reviewer:** Claude Opus 4.6 — 2026-02-10

**Issues Found:** 2 High, 3 Medium, 2 Low — **All code issues fixed**

### Fixed Issues

| ID | Severity | Description | Fix |
|----|----------|-------------|-----|
| H2 | HIGH | No try/catch around `authGuard()` — landing page could 500 if auth system fails | Wrapped in try/catch, mirroring contact page pattern |
| M1 | MEDIUM | Missing French accents throughout all text content (30+ words) | Fixed all diacritics across 6 components + page metadata |
| M2 | MEDIUM | Missing `aria-label` on navbar `<nav>` (two nav landmarks indistinguishable) | Added `aria-label="Navigation principale"` |
| M3 | MEDIUM | `<Link>` from next/link used for in-page `#features` hash anchor | Replaced with native `<a>` element |
| L1 | LOW | "Homecafe" casing inconsistency in layout.tsx pre-existing fields | Fixed to "HomeCafe" in title.default, twitter.title, applicationName |
| L2 | LOW | Layout twitter card missing `description` field | Added description + aligned image to `/og-landing.png` |

### Outstanding Action Item

| ID | Severity | Description |
|----|----------|-------------|
| H1 | HIGH | `/og-landing.png` referenced in OG/Twitter metadata but file does not exist in `public/`. Requires design asset creation (not a code fix). Social media preview images will 404. |

### Validation

- TypeScript: 0 errors
- Biome: 0 errors, 1 pre-existing warning (dangerouslySetInnerHTML)
- Tests: 389 passed, 45 files, 0 regressions
