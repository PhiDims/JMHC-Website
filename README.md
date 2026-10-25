# Jos Mental Health Conference website

The website for josmhconference.com. It's built with Eleventy, hosted free on Cloudflare Workers, and edited at `/admin`. It uses the same setup as balmtherapeutics.com.ng and psychphidims.com.

The Central Working Committee (CWC) owns this website, the domain and this repository.

## What's in this folder

| Folder or file | What it holds |
|---|---|
| `src/_data/conference.json` | The current edition: year, theme, dates, venue, and whether registration, abstracts and the programme are open. Empty fields show as "Awaiting CWC". |
| `src/_data/site.json` | Contact details, social links, the Web3Forms key, and the vision, mission and purpose. Change these once and every page updates. |
| `src/_data/documents.json` | The downloadable documents on News and Resources. |
| `src/news/` | One file per news item. |
| `src/committee/` | One file per Central Working Committee member, shown on the About page. |
| `src/speakers/` | One file per speaker. Shown only when `approved` is ticked. |
| `src/partners/` | One file per partner or sponsor. Shown only when `approved` is ticked. |
| `src/editions/` | One file per past edition: programme, report, photos, media coverage and outcomes. Each gets its own page in the archive. |
| `src/_includes/` | Page layouts and shared parts (header, footer, status board, social links). |
| `src/assets/` | Styles, script, logo, share image, uploads and documents. |
| `src/admin/` | The `/admin` editor (Decap CMS). |
| `worker/index.js` | Serves the site and handles GitHub sign-in for the editor. |
| `wrangler.jsonc` | Cloudflare Worker settings. |

## Going live: one-time setup

**1. Code on GitHub**
Done: the code is in PhiDims/JMHC-Website, and `src/admin/config.yml` points to it.

**2. Create the Cloudflare Worker**
Cloudflare dashboard → Workers & Pages → Create → Import a repository → choose PhiDims/JMHC-Website. Then check:
- Project name: `jmhc-website`
- Build command: `npm run build`
- Deploy command: `npx wrangler deploy`

The site goes live at https://jmhc-website.phidims.workers.dev. Every change pushed to GitHub, including saves from /admin, rebuilds and publishes the site in about a minute.

**3. Connect the domain**
In the Worker → Settings → Domains & Routes, add `josmhconference.com` and `www.josmhconference.com` as custom domains. The domain is already on Cloudflare, so DNS and the security certificate are set up for you.

**4. Turn on the /admin editor**
On GitHub: Settings → Developer settings → OAuth Apps → New OAuth App.
- Application name: `JMHC website editor`
- Homepage URL: `https://josmhconference.com`
- Authorization callback URL: `https://josmhconference.com/api/callback`

Copy the Client ID and generate a Client Secret. In Cloudflare → Workers & Pages → jmhc-website → Settings → Variables and Secrets, add:
- `GITHUB_CLIENT_ID` (type Text)
- `GITHUB_CLIENT_SECRET` (type Secret)

Anyone who should edit the site needs a free GitHub account and must be added as a collaborator on this repository.

**5. Make the forms send email**
Get a free access key at web3forms.com using the secretariat's email. Put it in /admin → Site settings → Contact details, or in `src/_data/site.json` as `web3formsKey`. Until then, forms ask people to WhatsApp or email instead.

**6. Email and analytics**
- Cloudflare → josmhconference.com → Email Routing: create `info@josmhconference.com` and forward it to the secretariat's inbox.
- Worker → Metrics: turn on Web Analytics. It is free and uses no cookies.

## Everyday editing at /admin

- **Current conference:** fill in the theme, dates and venue only after CWC approval. Tick "Registration open" and paste the link when ready.
- **News:** add an item; it appears on the homepage and News page.
- **Committee, speakers, partners:** add an entry. Speakers and partners stay hidden until the approval box is ticked.
- **Site settings:** social links, contact details, the Web3Forms key, and the "Proposed" tag on the vision, mission and purpose.

## After each conference

1. In /admin → Past editions, add the edition: theme, dates, venue, report, programme, photos, media links and outcomes.
2. In /admin → Current conference, change the year to the next edition and clear the theme, dates and venue.
3. Speakers stay attached to their own year, so the archive keeps them.

## Short links

`/register`, `/donate`, `/sponsor`, `/committee` and `/whatsapp` redirect to the right place. Edit them in `src/_redirects`.
