// Cloudflare Workers API endpoint
// TODO: Replace with your deployed Worker URL after running 'wrangler deploy'
// Example: 'https://pdf-viewer.your-subdomain.workers.dev'
const API_BASE = 'YOUR_CLOUDFLARE_WORKER_URL'; // Replace with your Worker URL

// Store current session
let currentSession = null;

// Check for existing session on load
async function checkSession() {
  const token = localStorage.getItem('auth_token');
  if (token) {
    try {
      const response = await fetch(`${API_BASE}/auth/verify`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        currentSession = await response.json();
        return currentSession;
      }
    } catch (error) {
      console.error('Session verification failed:', error);
    }
  }
  localStorage.removeItem('auth_token');
  return null;
}

// Google Sign In
async function signInWithGoogle() {
  // Redirect to Cloudflare Worker OAuth endpoint
  window.location.href = `${API_BASE}/auth/google`;
}

// Sign Out
async function signOut() {
  const token = localStorage.getItem('auth_token');
  if (token) {
    try {
      await fetch(`${API_BASE}/auth/signout`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (error) {
      console.error('Signout error:', error);
    }
  }
  localStorage.removeItem('auth_token');
  currentSession = null;
  window.location.reload();
}

// Handle OAuth callback
async function handleOAuthCallback() {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  
  if (token) {
    localStorage.setItem('auth_token', token);
    window.history.replaceState({}, document.title, window.location.pathname);
    return await checkSession();
  }
  return null;
}

// Get current user
function getCurrentUser() {
  return currentSession?.user || null;
}

// Auth state change listeners
const authListeners = [];
function onAuthStateChange(callback) {
  authListeners.push(callback);
  // Call immediately with current state
  callback(null, currentSession);
}

function notifyAuthListeners(event, session) {
  authListeners.forEach(cb => cb(event, session));
}

// Initialize auth on load
(async () => {
  const session = await handleOAuthCallback() || await checkSession();
  if (session) {
    currentSession = session;
    notifyAuthListeners('SIGNED_IN', session);
  }
})();

export {
  signInWithGoogle,
  signOut,
  getCurrentUser,
  onAuthStateChange,
  checkSession,
  API_BASE
};
