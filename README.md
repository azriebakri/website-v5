# azriebakri.com

Personal site for Azrie Bakri, plus a private résumé editor.

- `site/` is the public website: plain HTML, CSS and a little JavaScript.
- `site/resume/` is the résumé editor at **/resume**, for the site owner only.
- `netlify/functions/` holds the small server functions behind the editor (sign-in, saving, publishing and the PDF).

## The résumé editor

Open **/resume** and sign in with Google. Only the allowed account (by default `mohamad.azriebakri@gmail.com`) can get in.

- Every section of the résumé is editable: click any text to change it. Sections and entries can be added, reordered and deleted (with undo).
- Changes save automatically to a **draft**.
- **Download PDF** downloads the draft as a PDF.
- **Publish** makes the draft the public version. The "Résumé (PDF)" link on the main page (`/resume.pdf`) always downloads the latest published version. Until you publish for the first time, that link serves the original PDF in `site/assets/resume.pdf`.

The résumé data lives in Netlify Blobs, Netlify's built-in storage, so there is no database to run.

## One-time setup: Google sign-in

The editor needs a Google OAuth client ID. It's free and takes a few minutes.

1. Go to [Google Cloud Console](https://console.cloud.google.com/) and create a project (or pick an existing one).
2. Set up the OAuth consent screen (Google Auth Platform → Branding/Audience, or APIs & Services → OAuth consent screen). Choose **External**, give it a name such as "azriebakri.com", and add your Gmail as a test user (or publish the app; only basic profile and email access is requested).
3. Create a client: Google Auth Platform → **Clients** → **Create client** (or APIs & Services → Credentials → Create credentials → OAuth client ID).
   - Application type: **Web application**
   - **Authorized JavaScript origins**: every address you open the site at, for example
     - `https://azriebakri.com`
     - `https://YOUR-SITE.netlify.app`
     - `http://localhost:8888` (only if you run it locally)
   - Redirect URIs: leave empty.
4. Copy the **Client ID** (it ends in `.apps.googleusercontent.com`).
5. In Netlify: **Site configuration → Environment variables → Add a variable**
   - Key: `GOOGLE_CLIENT_ID`
   - Value: the client ID from step 4
6. Redeploy the site (Deploys → Trigger deploy) so the functions pick up the variable.

Optional variables:

| Variable | What it does |
| --- | --- |
| `ALLOWED_EMAILS` | Comma-separated Google accounts allowed to edit. Defaults to `mohamad.azriebakri@gmail.com`. |
| `SESSION_SECRET` | Secret for signing the sign-in cookie. If unset, one is generated and kept in Netlify Blobs. |

## Deploy on Netlify

Settings are in `netlify.toml`: the site publishes from `site/` and functions build from `netlify/functions/`. Netlify installs the two dependencies in `package.json` during the build. In the Netlify UI, leave the build command and publish directory empty.

## Run locally

```sh
npm install
npx netlify dev
```

Then open http://localhost:8888. Sign-in needs `GOOGLE_CLIENT_ID` (set it in Netlify or a local `.env`) and `http://localhost:8888` listed as an authorized origin.

## Editing the public site

- Text for every section lives in `site/index.html`.
- Colours and type are the variables at the top of `site/styles.css`.
- The career timeline reads `data-from` / `data-to` (YYYY-MM or `now`) on each bar in `site/index.html`.
- Project screenshots are in `site/assets/work/` (each has a `-dark` copy for dark mode).
