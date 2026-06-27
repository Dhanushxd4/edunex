# GitHub CI/CD — One-Time Setup

After Git installs (approve the UAC prompt), do these steps **once**.
After that, every `git push` auto-deploys backend + frontend.

---

## Step 1 — Approve the Git UAC prompt
A Windows admin prompt appeared. Click **Yes** to install Git.
Then close and reopen PowerShell.

---

## Step 2 — Create GitHub Repo
1. Go to https://github.com/new
2. Name: `edunex`
3. Private repo ✓
4. Don't add README or .gitignore (we have them)
5. Click **Create repository**
6. Copy the repo URL shown (e.g. `https://github.com/YourName/edunex.git`)

---

## Step 3 — Push code (run in PowerShell)

```powershell
cd C:\Users\admin\Downloads\edunex

git init
git add .
git commit -m "Initial commit — Edunex LMS"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/edunex.git
git push -u origin main
```

---

## Step 4 — Add GitHub Secrets

Go to your GitHub repo → **Settings** → **Secrets and variables** → **Actions**
Add these secrets:

| Secret Name | Where to get it |
|---|---|
| `RAILWAY_TOKEN` | railway.com → Account Settings → Tokens → Create token |
| `VERCEL_TOKEN` | vercel.com → Settings → Tokens → Create |
| `VERCEL_ORG_ID` | Run: `vercel whoami --json` in PowerShell → copy `orgId` |
| `VERCEL_PROJECT_ID` | Run: `cat C:\Users\admin\Downloads\edunex\frontend\.vercel\project.json` → copy `projectId` |

---

## That's it!

From now on:
- Edit code in `C:\Users\admin\Downloads\edunex`
- Run: `git add . && git commit -m "your change" && git push`
- GitHub Actions auto-builds and deploys to Railway + Vercel in ~2 minutes

No more manual `railway up` or `vercel deploy` needed.
