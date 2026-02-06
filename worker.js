// Cloudflare Worker for PDF Viewer Backend
// This worker handles PDF metadata queries and uploads

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': '*',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { 
        status: 204,
        headers: corsHeaders 
      });
    }

    try {
      // Route handling
      if (path === '/pdfs/years') {
        return handleGetYears(env, corsHeaders);
      } else if (path.startsWith('/pdfs/year/')) {
        const year = decodeURIComponent(path.split('/').pop());
        return handleGetPDFsByYear(env, year, corsHeaders);
      } else if (path === '/upload' && request.method === 'POST') {
        return handleUpload(request, env, corsHeaders);
      }

      return new Response('Not Found', { status: 404, headers: corsHeaders });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }
};

// PDF Management
async function handleGetYears(env, corsHeaders) {

  // Query D1 database for distinct years
  const result = await env.DB.prepare(
    'SELECT DISTINCT year_level FROM pdfs ORDER BY year_level'
  ).all();

  return new Response(JSON.stringify({ years: result.results.map(r => r.year_level) }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handleGetPDFsByYear(env, year, corsHeaders) {

  const result = await env.DB.prepare(
    'SELECT * FROM pdfs WHERE year_level = ? ORDER BY subject, title'
  ).bind(year).all();

  return new Response(JSON.stringify({ pdfs: result.results }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handleUpload(request, env, corsHeaders) {
  try {
    const formData = await request.formData();
    const title = formData.get('title');
    const subject = formData.get('subject');
    const year = formData.get('year');
    const file = formData.get('file');

    if (!title || !subject || !year || !file) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const fileName = file.name;
    const fileBuffer = await file.arrayBuffer();
    const fileBase64 = arrayBufferToBase64(fileBuffer);

    // Commit to GitHub using GitHub API
    const githubToken = env.GITHUB_TOKEN; // You'll need to set this as a secret
    const repo = 'espaderarios/PDFViewer'; // Your repo
    const filePath = `pdfs/${fileName}`;

    const githubResponse = await fetch(`https://api.github.com/repos/${repo}/contents/${filePath}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${githubToken}`,
        'Content-Type': 'application/json',
        'User-Agent': 'PDF-Viewer-Worker'
      },
      body: JSON.stringify({
        message: `Add PDF: ${title}`,
        content: fileBase64,
        branch: 'main' // or 'master', check your default branch
      })
    });

    if (!githubResponse.ok) {
      const errorData = await githubResponse.text();
      throw new Error(`GitHub API error: ${githubResponse.status} - ${errorData}`);
    }

    // Add to D1 database
    const id = crypto.randomUUID();
    const fileUrl = `/pdfs/${fileName}`;

    await env.DB.prepare(
      'INSERT INTO pdfs (id, title, subject, year_level, file_url) VALUES (?, ?, ?, ?, ?)'
    ).bind(id, title, subject, year, fileUrl).run();

    return new Response(JSON.stringify({
      success: true,
      message: 'PDF uploaded successfully',
      id,
      title,
      subject,
      year,
      fileUrl
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
