# Sutar Tech — multi-user member pages

Static site on GitHub Pages + Google Sheet + one Apps Script web app.
No build step, no server, no dependencies.

Your values are already filled in:

- Sheet: `1gBjxFXd3Z404obQ-5z5QezDjw3-3DTR0yybH9iDe87M`
- Web app: `https://script.google.com/macros/s/AKfycbyKSBKoFabAXXxmt8RV-P0nE-gsYfuqKa1A6ZLi9EWidqbQ1XTUyijJOrDzxcI3An9n/exec`
- Site: `https://sutartech.github.io/`

---

## Step 1 — Apps Script

1. Open your script project and **replace everything** with `Code.gs` from this folder.
2. *Project settings → Script properties* → add two:

   | Property    | Value                                |
   |-------------|--------------------------------------|
   | `PEPPER`    | any long random string, 40+ chars    |
   | `TOKEN_KEY` | another long random string           |

   (Optional third: `SHEET_ID` — only if you ever change spreadsheets.)
3. Run `setupSheet()` once. Approve the permission prompt. It creates the six
   tabs with their header rows.
4. Run `seedOwner()` once. Open *Executions* or the log — it prints:

   ```
   user id: admin
   password: Sutar@xxxxxx
   ```

   Write that down. Change it from the dashboard afterwards.
5. Optional: run `seedDemoMember()` to get a `sarada / demo123` account with
   sample content, so the dashboard isn't empty.
6. **Deploy → New deployment → Web app**, *Execute as:* **Me**,
   *Who has access:* **Anyone**. 

   ⚠ Every time you edit `Code.gs` you must go
   *Deploy → Manage deployments → ✏️ → Version: New version → Deploy*,
   or the live site keeps running the old code.
7. Sanity check — open this in a browser tab:
   `…/exec?ping=1` → should print `{"ok":true,"pong":true}`

## Step 2 — GitHub

Copy everything inside `site/` to the root of your `sutartech.github.io` repo:

```
/index.html              landing page listing members
/admin/index.html        the dashboard
/assets/api.js           talks to the web app
/assets/common.js        themes + the page renderer
/404.html                catch-all: renders ANY member, no folder needed
/sarada/index.html       optional real folder (indexable by Google)
```

Commit and push. In *Settings → Pages*, source = `main` branch, `/root`.

## Step 3 — Add a member

**That's it:** sign in at `https://sutartech.github.io/admin/` as `admin`,
open the Owner console, click **Invite a member**, give them the temporary
password it shows.

No folder. No commit. No file.

`404.html` is a catch-all: GitHub Pages serves it for any path that has no
real file, so `/meera` and `/meera/prices` render straight from the sheet the
moment the account exists. Sub-pages the member creates in the dashboard work
the same way — nothing to add on your side, ever.

**The one trade-off:** those URLs return HTTP 404, so Google won't index them.
Visitors see a perfectly normal page; search engines skip it. If a particular
member needs to rank on Google, give that one a real folder — copy
`sarada/index.html` to `meera/index.html` and change one line:

```js
var SLUG = 'meera';
```

A real folder always wins over the catch-all, so you can do this for two
members and leave the other twenty on the fallback.

Member photos: commit a square image as `/<slug>/avatar.jpg`.

---

## What each file does

| File | Role |
|---|---|
| `Code.gs` | Everything server-side: login, hashing, tokens, reads, writes, invites, analytics. The only place secrets live. |
| `assets/api.js` | Thin `fetch` wrapper. Posts as `text/plain` so Apps Script needs no CORS preflight. Holds the session token in `sessionStorage`. |
| `assets/common.js` | The four themes, six channel types, and `renderPage()` — used by both the dashboard preview and the real member pages, so they can never drift apart. |
| `admin/index.html` | The dashboard: profile, pages, links, channels, theme, live phone preview, publish, owner console, ⌘K palette. |
| `404.html` | Catch-all member page. Reads the slug from the URL, so every member works with zero files. Also renders sub-pages from the `body` column. |
| `<slug>/index.html` | Optional real folder for a member who needs Google indexing. Identical, but the slug is hardcoded. |

## Security, honestly

A static site cannot keep a secret — anyone can read the JavaScript. So:

- every password check and every write happens **inside Apps Script**;
- the sheet stores salted SHA-256 hashes plus a pepper held in script
  properties, never passwords;
- session tokens are HMAC-signed and expire in 12 hours;
- members can only ever read or write their own slug; only `role: owner`
  can list members or edit someone else's page.

That is enough to stop members editing each other's pages. It is not
bank-grade. Keep nothing confidential in the sheet.

## Known limits

- Free Apps Script quota is roughly 20,000 calls and 90 minutes of runtime a
  day — fine for dozens of members.
- Follower counts are typed in by hand. Live Facebook/Instagram numbers need
  an API token, which a static site can't hold; a nightly Apps Script trigger
  could fetch and cache them if you register an app.
- No password-reset email. The owner runs `resetPassword('userId', 'newPw')`
  in the script editor.
- Public reads are cached for 5 minutes, so a published change can take that
  long to appear for visitors. Publishing clears the cache for that slug, so
  usually it's instant.
