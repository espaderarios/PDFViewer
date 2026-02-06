const API_BASE = 'https://pdf-viewer-worker.espaderarios.workers.dev';

const profileTab = document.getElementById("profileTab");
const yearTab = document.getElementById("yearTab");
const uploadTab = document.getElementById("uploadTab");
const profileSection = document.getElementById("profileSection");
const yearSection = document.getElementById("yearSection");
const uploadSection = document.getElementById("uploadSection");
const yearButtons = document.getElementById("yearButtons");
const searchContainer = document.getElementById("searchContainer");
const searchInput = document.getElementById("searchInput");
const pdfList = document.getElementById("pdfList");
const recentList = document.getElementById("recentList");
const uploadBtn = document.getElementById("uploadBtn");
const uploadStatus = document.getElementById("uploadStatus");

let allPDFs = [];
let yearLevels = [];
let recentPDFs = [];

// Helper function to make API requests
async function fetchAPI(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };
  
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }
  
  return response.json();
}

// Load years on startup
loadYears();

profileTab.addEventListener("click", () => showTab("profile"));
yearTab.addEventListener("click", () => showTab("year"));
uploadTab.addEventListener("click", () => showTab("upload"));
searchInput.addEventListener("input", handleSearch);
uploadBtn.addEventListener("click", handleUpload);

function showTab(tab) {
  profileSection.classList.toggle("hidden", tab !== "profile");
  yearSection.classList.toggle("hidden", tab !== "year");
  uploadSection.classList.toggle("hidden", tab !== "upload");
  if (tab === "profile") loadRecent();
}

async function loadYears() {
  try {
    const data = await fetchAPI('/pdfs/years');
    yearLevels = data.years || [];
    renderYearButtons();
  } catch (error) {
    console.error('Error loading years:', error);
  }
}

function renderYearButtons() {
  yearButtons.innerHTML = "";
  yearLevels.forEach((year) => {
    const btn = document.createElement("button");
    btn.textContent = year;
    btn.onclick = () => loadPDFsByYear(year);
    yearButtons.appendChild(btn);
  });
}

async function loadPDFsByYear(year) {
  try {
    const data = await fetchAPI(`/pdfs/year/${encodeURIComponent(year)}`);
    allPDFs = data.pdfs || [];
    searchContainer.classList.remove("hidden");
    renderPDFList(allPDFs);
  } catch (error) {
    console.error('Error loading PDFs:', error);
  }
}

function renderPDFList(pdfs) {
  pdfList.innerHTML = "";
  pdfs.forEach((pdf) => {
    const div = document.createElement("div");
    div.classList.add("pdf-item");
    div.textContent = `${pdf.subject} — ${pdf.title}`;
    div.onclick = () => openInMozillaViewer(pdf);
    pdfList.appendChild(div);
  });
}

function handleSearch() {
  const query = searchInput.value.toLowerCase();
  const filtered = allPDFs.filter((pdf) =>
    pdf.title.toLowerCase().includes(query)
  );
  renderPDFList(filtered);
}

async function openInMozillaViewer(pdf) {
  const mozillaViewer = "https://mozilla.github.io/pdf.js/web/viewer.html?file=";
  const pdfUrl = encodeURIComponent(pdf.file_url);
  window.open(mozillaViewer + pdfUrl, "_blank");

  // Save to recent views in localStorage
  saveToRecent(pdf);
}

function saveToRecent(pdf) {
  // Get existing recent views
  const recent = JSON.parse(localStorage.getItem('recentPDFs') || '[]');
  
  // Remove if already exists
  const filtered = recent.filter(p => p.id !== pdf.id);
  
  // Add to front
  filtered.unshift({
    id: pdf.id,
    title: pdf.title,
    subject: pdf.subject,
    year_level: pdf.year_level,
    file_url: pdf.file_url,
    viewed_at: Date.now()
  });
  
  // Keep only last 10
  const limited = filtered.slice(0, 10);
  
  // Save back
  localStorage.setItem('recentPDFs', JSON.stringify(limited));
  
  // Update display if on profile tab
  if (!profileSection.classList.contains('hidden')) {
    loadRecent();
  }
}

function loadRecent() {
  const recent = JSON.parse(localStorage.getItem('recentPDFs') || '[]');

  recentList.innerHTML = "";
  if (!recent.length) {
    recentList.textContent = "No recently viewed PDFs.";
    return;
  }

  recent.forEach((pdf) => {
    const div = document.createElement("div");
    div.classList.add("recent-item");
    div.textContent = `${pdf.year_level} | ${pdf.subject} — ${pdf.title}`;
    div.onclick = () => openInMozillaViewer(pdf);
    recentList.appendChild(div);
  });
}

async function handleUpload() {
  const title = document.getElementById('pdfTitle').value.trim();
  const subject = document.getElementById('pdfSubject').value.trim();
  const year = document.getElementById('pdfYear').value.trim();
  const fileInput = document.getElementById('pdfFile');
  const file = fileInput.files[0];

  if (!title || !subject || !year || !file) {
    uploadStatus.innerHTML = '<p class="error">❌ Please fill in all fields and select a PDF file.</p>';
    return;
  }

  if (file.type !== 'application/pdf') {
    uploadStatus.innerHTML = '<p class="error">❌ Please select a valid PDF file.</p>';
    return;
  }

  uploadStatus.innerHTML = '<p class="info">📤 Uploading PDF...</p>';
  uploadBtn.disabled = true;

  try {
    // Since we're using local storage without R2, show instructions
    const fileName = file.name.replace(/'/g, "''");
    const titleEscaped = title.replace(/'/g, "''");
    const subjectEscaped = subject.replace(/'/g, "''");
    const yearEscaped = year.replace(/'/g, "''");
    
    uploadStatus.innerHTML = `
      <div class="upload-instructions">
        <p class="success">✅ PDF ready to upload</p>
        <p><strong>To complete the upload, run this command in PowerShell:</strong></p>
        <pre>.\\add-pdf-local.ps1 -File "${file.name}" -Title "${titleEscaped}" -Subject "${subjectEscaped}" -Year "${yearEscaped}"</pre>
        <p class="info">📝 Make sure the PDF file is in your Downloads folder or update the path accordingly.</p>
        <p class="info">🚀 After running the command, deploy with: <code>wrangler pages deploy . --project-name=pdf-viewer</code></p>
      </div>
    `;
  } catch (error) {
    uploadStatus.innerHTML = `<p class="error">❌ Error: ${error.message}</p>`;
  } finally {
    uploadBtn.disabled = false;
  }
}
