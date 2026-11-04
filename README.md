# Salemax public website

Next.js App Router, React, TypeScript and custom responsive CSS. Arabic RTL design with self-hosted fonts. All marketing copy, links, cards, menus, form definitions and presentation settings come from the Laravel CMS; there is no fallback marketing copy in React.

## Start

Run Laravel on port 8011, then:

```powershell
cd F:\freelance\salemax\frontend
npm.cmd install
npm.cmd run dev
```

Website: **http://127.0.0.1:3000**. The existing local `.env.local` is already configured for private draft design preview. It is ignored by version control. This mode does not publish database content.

For a new checkout, copy `.env.example` to `.env.local`, set the origins, and either publish approved CMS pages or generate a local draft preview:

```powershell
# Backend folder, local environment only. Preserves edited pages and never publishes.
php artisan db:seed --class=DesignPreviewSeeder

# Frontend folder. Writes a seven-day signature to .env.local without printing it.
npm.cmd run preview:refresh
```

Restart the Next.js dev server after changing environment variables. If the local preview expires, run `preview:refresh` again. Clear `CMS_PREVIEW_URL` to use published content in development.

## Design and content

- Warm paper background, orange accents, deep teal CTA, mint details and Arabic IBM Plex typography.
- Responsive header with editable dropdown navigation and mobile menu; editable logo/footer/social links.
- Hero with CMS-driven copy and a code-rendered illustrative product preview. Its tabs switch between a pipeline, contacts and a summary chart. It is explicitly labeled as an illustration, not a screenshot of the existing CRM.
- Bento features, team/industry solutions, process timeline, educational cards, accordion FAQ and conversion sections.
- Features default to sticky stacking cards: a section index, layered numbered cards and scroll-linked depth. The CMS `layout` field switches between `stacked` and `bento`. Content and item order stay fully editable. Native sticky positioning is enhanced with a passive, animation-frame-coalesced scroll handler; no scroll is intercepted or locked. Oversized cards, short viewports and reduced-motion preferences use readable static cards. Keyboard navigation reveals a covered card before focusing its link.
- Renderers for every existing CMS section type, including pricing, logos, testimonials, gallery/video, forms, team, offices and legal text. Empty logos/testimonials/pricing are not filled with invented claims.
- Contact/demo forms reflect CMS fields, required flags, select options and active state, with validation/success/loading states. Inactive preview forms cannot submit.
- Draft design copy stays in the local CMS database as editable drafts. Product details/prices/integrations/legal text and customer proof still need owner review before publication.
- Settings font choices (system/IBM Plex, Cairo, Tajawal, Inter) are self-hosted. No remote font request is required.

## Preview and publication

Normal production routes load published snapshots only. The development-only `CMS_PREVIEW_URL` is never used when `NODE_ENV=production` and is never sent to the browser. It cannot point outside the configured CMS origin or the expected preview endpoint.

The dashboard's **معاينة الموقع** button saves the current draft and opens an expiring signed `/preview/{slug}` URL. These links grant access to draft website content for that locale and should be treated as private. They expire in one hour, are marked `noindex,nofollow`, and do not grant CMS write access. Notification emails and other private form settings are excluded.

## Configuration

Public appearance is controlled through the admin's dedicated **Appearance &
Colors** screen. The CMS theme now accepts `mode: light | dark` along with the
existing primary, secondary, background, text colors and font. Public dark-mode
surfaces and palette-based card colors are in `src/styles/site-appearance.css`.
This shared setting is independent of an administrator's personal dashboard theme.

The published website sends minimal anonymous page-view events to Laravel for
admin-only analytics. It stores a random browser identifier in localStorage and
respects Do Not Track and Global Privacy Control. Local development and signed
draft previews do not send analytics. Blocking storage or tracking can reduce
counts; analytics failures never block the page.

### Production backend

The deployed Laravel origin is:
`https://mediumpurple-jay-763780.hostingersite.com`.
For a frontend deployment, set both `CMS_ORIGIN` and `NEXT_PUBLIC_CMS_ORIGIN`
to this URL, and set `SITE_ORIGIN` to the final frontend HTTPS origin.
Leave `CMS_PREVIEW_URL` unset in production. Use `npm ci` and `npm run build`,
then run `npm start` on a Node.js host, or connect this repository to a Next.js
hosting provider with the repository root as the project directory.

The backend's initial pages are drafts. Publish approved pages in the CMS before
expecting normal production URLs to render. Configure the backend's `FRONTEND_URL`
and `CORS_ALLOWED_ORIGINS` for the deployed frontend origin. Frontend hosting and
publishing CMS drafts are separate from uploading this repository.

| Variable | Purpose |
|---|---|
| `CMS_ORIGIN` | Laravel origin, server-side only |
| `NEXT_PUBLIC_CMS_ORIGIN` | Public Laravel origin for direct browser form submission |
| `SITE_ORIGIN` | Canonical website origin and sitemap base |
| `CMS_PREVIEW_URL` | Optional server-only local draft preview; ignored in production |

Forms post directly to Laravel to preserve the visitor's IP for its rate limiter. On deployment, set Laravel `CORS_ALLOWED_ORIGINS` to the exact HTTPS frontend origin(s), configure both public origins, then activate the form(s) in the dashboard. SMTP/queue delivery is configured separately in Laravel. Never set a production `NEXT_PUBLIC_CMS_ORIGIN` to a private/localhost address.

SSR metadata follows page SEO; sitemap includes only published, indexable pages. Unknown pages and invalid/expired preview links return not found. Content fetch failures show a retry page instead of fabricated content. Fetched content uses `no-store` so published CMS changes appear on the next request.

## Checks

```powershell
npm.cmd run lint
npm.cmd run typecheck
npm.cmd test
npm.cmd run build
```

The build, TypeScript, ESLint, link/preview security tests, Laravel integration tests and HTTP checks have been run. Visual screenshots and real browser interaction checks could not be performed because the connected browser runtime reports no available browsers. Mobile/desktop layouts are implemented but still need visual acceptance in a browser.
# Editorial visual direction

The public site now uses a dark hero/product stage, oversized Arabic headings,
expanded numbered navigation, colorful stacking cards, solution cards, a dark
story section, a lime CTA, and a large CMS-driven footer wordmark.
`src/styles/editorial.css` loads after the original styles and owns this direction.
All marketing copy, links, media and brand colors still come from Laravel.

`ExperienceEffects` progressively adds a reading progress line and one-time entry
motion. Content remains visible without JavaScript. Reduced motion disables these
animations and the existing stacking behavior. Hero product data remains explicitly
illustrative; the design adds no customer logos, testimonials or product claims.

Production build, lint, TypeScript, existing unit tests and local HTTP rendering
were checked. Visual/interaction review still requires a connected browser.

