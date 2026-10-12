# azriebakri.com

Personal site for Azrie Bakri. Plain HTML, CSS and a little JavaScript, so there's no build step.

## Run locally

Open `index.html` in a browser, or serve the folder:

```sh
npx serve .
```

## Deploy on Netlify

1. Push this repo to GitHub.
2. In Netlify, choose **Add new site → Import an existing project** and pick the repo.
3. Leave the build command empty. The publish directory is `.` (already set in `netlify.toml`).
4. Deploy, then add `azriebakri.com` under **Domain management** if you want the custom domain.

## Editing

- Text for every section lives in `index.html`.
- Colours and type are the variables at the top of `styles.css`.
- The career timeline reads `data-from` / `data-to` (YYYY-MM or `now`) on each bar in `index.html`.
- Project screenshots are in `assets/work/`, and the résumé is `assets/resume.pdf`.
