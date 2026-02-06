# PDF Upload Setup Guide

To enable PDF uploads directly from the website to GitHub, you need to set up a GitHub Personal Access Token.

## Steps:

### 1. Create a GitHub Personal Access Token

1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Give it a name like "PDF Viewer Upload"
4. Set expiration (or "No expiration" for convenience)
5. Select these scopes:
   - `repo` (Full control of private repositories)
6. Click "Generate token"
7. **Copy the token immediately** (you won't see it again!)

### 2. Add Token to Cloudflare Worker

Run this command in your terminal:

```powershell
wrangler secret put GITHUB_TOKEN
```

When prompted, paste your GitHub token.

### 3. Deploy the Updated Worker

```powershell
wrangler deploy worker.js
```

### 4. Test Upload

1. Go to your website: https://espaderarios.github.io/PDFViewer/
2. Click the "Upload PDF" tab
3. Fill in the form and select a PDF
4. Click "Upload PDF"
5. The PDF will be committed to your GitHub repo and added to the database
6. GitHub Pages will automatically rebuild and deploy the updated site (takes 1-2 minutes)
7. Refresh to see the new PDF in the Year list

## How It Works

When you upload a PDF:
1. The form data is sent to your Cloudflare Worker
2. The worker uses the GitHub API to commit the PDF file to the `pdfs/` folder
3. The worker adds the PDF metadata to the D1 database
4. GitHub Actions automatically rebuilds and deploys your site
5. The new PDF becomes available on your site

## Security Notes

- The GitHub token is stored securely as a Cloudflare secret
- Never commit the token to your repository
- The token gives write access to your repo, so keep it secure
- You can revoke the token anytime from GitHub settings
