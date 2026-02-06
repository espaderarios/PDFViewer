// Cloudflare Worker for PDF Viewer Backend
// This worker handles PDF metadata queries (no authentication)

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // Route handling
      if (path === '/pdfs/years') {
        return handleGetYears(env, corsHeaders);
      } else if (path.startsWith('/pdfs/year/')) {
        const year = decodeURIComponent(path.split('/').pop());
        return handleGetPDFsByYear(env, year, corsHeaders);
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


