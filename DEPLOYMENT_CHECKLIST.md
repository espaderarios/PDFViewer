# 📋 Deployment Checklist

Use this checklist to ensure you've completed all setup steps.

## Prerequisites
- [ ] Cloudflare account created
- [ ] Node.js installed (for npm/wrangler)
- [ ] Google Cloud account (for OAuth)

## Installation
- [ ] Installed Wrangler CLI: `npm install -g wrangler`
- [ ] Logged into Cloudflare: `wrangler login`

## Cloudflare Resources
- [ ] Created D1 database: `wrangler d1 create pdf-viewer-db`
- [ ] Created KV namespace: `wrangler kv:namespace create "SESSIONS"`
- [ ] Created R2 bucket: `wrangler r2 bucket create pdf-storage`
- [ ] Initialized database schema: `wrangler d1 execute pdf-viewer-db --file=schema.sql`

## Configuration Files
- [ ] Updated `wrangler.toml` with KV namespace ID
- [ ] Updated `wrangler.toml` with D1 database ID
- [ ] Updated `wrangler.toml` with WORKER_URL (after first deploy)
- [ ] Updated `wrangler.toml` with APP_URL

## Google OAuth
- [ ] Created Google Cloud project
- [ ] Enabled Google+ API
- [ ] Created OAuth 2.0 credentials
- [ ] Added redirect URI: `https://your-worker.workers.dev/auth/callback`
- [ ] Set secret: `wrangler secret put GOOGLE_CLIENT_ID`
- [ ] Set secret: `wrangler secret put GOOGLE_CLIENT_SECRET`

## Frontend Configuration
- [ ] Updated `auth.js` with your WORKER_URL (line 3)

## Deployment
- [ ] Deployed Worker: `wrangler deploy`
- [ ] Deployed Frontend: `wrangler pages deploy . --project-name=pdf-viewer`
- [ ] Updated Google OAuth redirect URI with actual Worker URL
- [ ] Updated `wrangler.toml` WORKER_URL with actual URL
- [ ] Updated `wrangler.toml` APP_URL with actual Pages URL
- [ ] Updated `auth.js` API_BASE with actual Worker URL
- [ ] Redeployed after URL updates

## Content
- [ ] Uploaded at least one PDF to R2
- [ ] Added PDF metadata to database
- [ ] Verified PDF URL is accessible

## Testing
- [ ] Visited frontend URL
- [ ] Clicked "Sign in with Google"
- [ ] Successfully authenticated
- [ ] Can see year levels
- [ ] Can browse PDFs
- [ ] Can open PDFs in viewer
- [ ] Recent views are tracked

## Optional
- [ ] Configured custom domain for Pages
- [ ] Configured custom domain for R2
- [ ] Added more PDFs
- [ ] Customized styling

## 🎉 Launch!
- [ ] Shared app URL with users
- [ ] Documented any custom configuration

---

## Quick Commands Reference

```powershell
# Deploy Worker
wrangler deploy

# Deploy Pages
wrangler pages deploy . --project-name=pdf-viewer

# Execute SQL
wrangler d1 execute pdf-viewer-db --command="YOUR SQL HERE"

# Upload to R2
wrangler r2 object put pdf-storage/filename.pdf --file=local-file.pdf

# View logs
wrangler tail

# Test locally
wrangler dev
```

## URLs to Save
- Worker URL: `https://__________.workers.dev`
- Pages URL: `https://__________.pages.dev`
- Google Cloud Console: `https://console.cloud.google.com/`
- Cloudflare Dashboard: `https://dash.cloudflare.com/`
