# scaname.com

The Scaname website, hosted on GitHub Pages: a landing page plus Support,
Privacy policy, Terms of service and Delete your account. Plain static files,
no build step. Every change merged to `main` is live in about a minute.

- `CNAME` sets the custom domain (scaname.com). Don't delete it.
- `.nojekyll` tells GitHub Pages to serve the files as they are.
- `/privacy`, `/terms`, `/support` and `/delete-account` work without `.html`;
  unknown addresses show `404.html`.
- `privacy.html` and `terms.html` mirror the in-app pages in the app repo
  (`src/pages/PrivacyPolicy.jsx`, `TermsOfService.jsx`). Keep them in step.
- Screenshots use fictional people and companies only. Never put a real
  person's card on the public site.
