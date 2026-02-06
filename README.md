# PDF Viewer with Cloudflare

A modern PDF viewer web application using Cloudflare infrastructure instead of Supabase.

## Architecture

- **Frontend**: Static HTML/CSS/JS hosted on Cloudflare Pages
- **Backend**: Cloudflare Workers (serverless API)
- **Database**: Cloudflare D1 (SQLite)
- **Session Storage**: Cloudflare KV
- **File Storage**: Cloudflare R2 (for PDFs)
- **Authentication**: Google OAuth via Cloudflare Workers

## Setup Instructions

### 1. Install Wrangler CLI

```powershell
npm install -g wrangler
```

### 2. Login to Cloudflare

```powershell
wrangler login
```

### 3. Create D1 Database

```powershell
wrangler d1 create pdf-viewer-db
```

Copy the database ID from the output and update `wrangler.toml`.

### 4. Initialize Database Schema

```powershell
wrangler d1 execute pdf-viewer-db --file=schema.sql
```

### 5. Create KV Namespace

```powershell
wrangler kv:namespace create "SESSIONS"
```

Copy the namespace ID and update `wrangler.toml`.

### 6. Create R2 Bucket (for PDF storage)

```powershell
wrangler r2 bucket create pdf-storage
```

### 7. Set up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `https://your-worker.workers.dev/auth/callback`
6. Copy Client ID and Client Secret

### 8. Set Secrets

```powershell
wrangler secret put GOOGLE_CLIENT_ID
# Enter your Google Client ID

wrangler secret put GOOGLE_CLIENT_SECRET
# Enter your Google Client Secret
```

### 9. Update Configuration

Edit `wrangler.toml`:
- Update `WORKER_URL` to your Worker URL
- Update `APP_URL` to your frontend URL

Edit `auth.js`:
- Update `API_BASE` with your Worker URL

### 10. Deploy Worker

```powershell
wrangler deploy
```

### 11. Deploy Frontend to Cloudflare Pages

```powershell
# Option 1: Use Wrangler
wrangler pages deploy . --project-name=pdf-viewer

# Option 2: Connect GitHub repo to Cloudflare Pages dashboard
```

## Adding PDFs to R2

### Upload PDFs to R2

```powershell
wrangler r2 object put pdf-storage/your-file.pdf --file=path/to/your-file.pdf
```

### Make PDFs Public (Optional)

Configure R2 bucket with public access or use presigned URLs in your Worker.

### Add PDF Metadata to Database

```powershell
wrangler d1 execute pdf-viewer-db --command="INSERT INTO pdfs (id, title, subject, year_level, file_url) VALUES ('unique-id', 'PDF Title', 'Subject', 'Year Level', 'https://your-bucket.r2.cloudflarestorage.com/your-file.pdf')"
```

## Local Development

### Test Worker Locally

```powershell
wrangler dev
```

### Test Frontend Locally

Use any local server:

```powershell
# Python
python -m http.server 8000

# Node.js
npx serve .
```

Update `API_BASE` in `auth.js` to `http://localhost:8787` for local testing.

## Environment Variables

Set in `wrangler.toml`:
- `WORKER_URL`: Your Cloudflare Worker URL
- `APP_URL`: Your frontend application URL

Set as secrets:
- `GOOGLE_CLIENT_ID`: Google OAuth Client ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth Client Secret

## Database Schema

### pdfs table
- `id`: Unique identifier
- `title`: PDF title
- `subject`: Subject/category
- `year_level`: Grade/year level
- `file_url`: R2 storage URL
- `created_at`: Creation timestamp
- `updated_at`: Update timestamp

### recent_views table
- `id`: Auto-increment ID
- `user_id`: Google user ID
- `pdf_id`: Reference to pdfs.id
- `viewed_at`: Timestamp of view

## Features

✅ Google OAuth authentication
✅ Browse PDFs by year level
✅ Search PDFs by title
✅ Track recently viewed PDFs
✅ Open PDFs in Mozilla PDF.js viewer
✅ Progressive Web App (PWA) support
✅ Offline caching with Service Worker

## Cost Estimation

Cloudflare offers generous free tiers:
- Workers: 100,000 requests/day
- D1: 5GB storage, 5M rows read/day
- KV: 100,000 reads/day, 1,000 writes/day
- R2: 10GB storage, Class A operations free
- Pages: Unlimited static requests

Most small to medium applications will run entirely on the free tier!

## Troubleshotting

### CORS Errors
Ensure Worker returns proper CORS headers for all endpoints.

### Authentication Not Working
- Verify Google OAuth credentials
- Check redirect URI matches exactly
- Ensure secrets are set correctly

### Database Empty
Run `schema.sql` to initialize and populate sample data.

### PDFs Not Loading
- Verify R2 bucket URLs are publicly accessible
- Check file_url in database matches R2 object path

## License

MIT
