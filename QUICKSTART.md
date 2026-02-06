# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies

```powershell
npm install -g wrangler
wrangler login
```

### Step 2: Create Cloudflare Resources

```powershell
# Create D1 Database
wrangler d1 create pdf-viewer-db
# Copy the database_id and update wrangler.toml

# Create KV Namespace
wrangler kv:namespace create "SESSIONS"
# Copy the id and update wrangler.toml

# Create R2 Bucket
wrangler r2 bucket create pdf-storage
```

### Step 3: Configure Google OAuth

1. Visit https://console.cloud.google.com/
2. Create/Select project → APIs & Services → Credentials
3. Create OAuth 2.0 Client ID
4. Add redirect URI: `https://your-worker.workers.dev/auth/callback`
5. Save Client ID and Secret

### Step 4: Set Environment Variables

Edit `wrangler.toml`:
```toml
[vars]
WORKER_URL = "https://your-worker.workers.dev"
APP_URL = "https://your-frontend.pages.dev"
```

Set secrets:
```powershell
wrangler secret put GOOGLE_CLIENT_ID
wrangler secret put GOOGLE_CLIENT_SECRET
```

Edit `auth.js` line 2:
```javascript
const API_BASE = 'https://your-worker.workers.dev';
```

### Step 5: Initialize Database

```powershell
wrangler d1 execute pdf-viewer-db --file=schema.sql
```

### Step 6: Deploy

```powershell
# Deploy Worker
wrangler deploy

# Deploy Frontend
wrangler pages deploy . --project-name=pdf-viewer
```

### Step 7: Upload Sample PDFs

```powershell
# Upload to R2
wrangler r2 object put pdf-storage/sample.pdf --file=sample.pdf

# Add to database
wrangler d1 execute pdf-viewer-db --command="INSERT INTO pdfs (id, title, subject, year_level, file_url) VALUES ('1', 'Sample PDF', 'Mathematics', 'Year 7', 'https://pub-YOUR_R2_ID.r2.dev/sample.pdf')"
```

## 🎉 Done!

Visit your Cloudflare Pages URL and sign in with Google!

## 📝 Next Steps

- Add more PDFs to R2 bucket
- Customize the UI in `style.css`
- Configure custom domain in Cloudflare Pages
- Set up R2 custom domain for public PDF access

## 🆘 Need Help?

Check the full [README.md](README.md) for detailed documentation and troubleshooting.
