## Deploying to GitHub Pages

### One-time setup
1. Create a new GitHub repository and push this project.
2. In repo Settings → Pages, select "Deploy from branch" = `gh-pages` (GitHub Actions may handle this automatically).

### Deploy via npm script
```bash
# IMPORTANT: set base to your repo name (including slashes)
export BASE="/<your-repo-name>/"
npm install
npm run content:build
BASE="$BASE" npm run build
npm run deploy
```
This publishes `dist/` to the `gh-pages` branch. Then enable GitHub Pages on that branch.

### Deploy via GitHub Actions
1. Commit and push to `main`.
2. The workflow `.github/workflows/deploy.yml` builds and publishes to `gh-pages`.
3. In Settings → Pages, select Source = `Deploy from a branch`, Branch = `gh-pages`.

### Custom domain (optional)
Add `CNAME` file under `public/` with your domain and re-deploy.


