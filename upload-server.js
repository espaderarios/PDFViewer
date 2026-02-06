// Simple Node.js server to handle PDF uploads locally
// Run with: node upload-server.js

const http = require('http');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const crypto = require('crypto');

const PORT = 3001;
const PDFS_DIR = path.join(__dirname, 'pdfs');
const DATABASE_NAME = 'pdf-viewer-db';

// Ensure pdfs directory exists
if (!fs.existsSync(PDFS_DIR)) {
  fs.mkdirSync(PDFS_DIR, { recursive: true });
}

const server = http.createServer(async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.method === 'POST' && req.url === '/upload') {
    try {
      const contentType = req.headers['content-type'];
      const boundary = contentType.split('boundary=')[1];
      
      let body = [];
      req.on('data', chunk => body.push(chunk));
      req.on('end', () => {
        body = Buffer.concat(body);
        
        // Parse multipart form data
        const parts = parseMultipart(body, boundary);
        
        const title = parts.title;
        const subject = parts.subject;
        const year = parts.year;
        const fileData = parts.file;
        const fileName = parts.fileName;

        if (!title || !subject || !year || !fileData || !fileName) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Missing required fields' }));
          return;
        }

        // Save file
        const filePath = path.join(PDFS_DIR, fileName);
        fs.writeFileSync(filePath, fileData);
        console.log(`✅ Saved file: ${fileName}`);

        // Add to database
        const id = crypto.randomUUID();
        const fileUrl = `/pdfs/${fileName}`;
        
        const titleEscaped = title.replace(/'/g, "''");
        const subjectEscaped = subject.replace(/'/g, "''");
        const yearEscaped = year.replace(/'/g, "''");
        
        const sqlCommand = `INSERT INTO pdfs (id, title, subject, year_level, file_url) VALUES ('${id}', '${titleEscaped}', '${subjectEscaped}', '${yearEscaped}', '${fileUrl}')`;
        
        try {
          execSync(`wrangler d1 execute ${DATABASE_NAME} --command="${sqlCommand}"`, { 
            stdio: 'pipe',
            encoding: 'utf-8'
          });
          console.log('✅ Added to database');
          
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ 
            success: true, 
            message: 'PDF uploaded successfully',
            id,
            title,
            subject,
            year,
            fileUrl
          }));
        } catch (dbError) {
          console.error('Database error:', dbError.message);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Database error: ' + dbError.message }));
        }
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: error.message }));
    }
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

function parseMultipart(buffer, boundary) {
  const parts = {};
  const boundaryBuffer = Buffer.from('--' + boundary);
  
  let start = 0;
  while (start < buffer.length) {
    // Find next boundary
    const boundaryIndex = buffer.indexOf(boundaryBuffer, start);
    if (boundaryIndex === -1) break;
    
    // Find end of headers (double CRLF)
    const headersEnd = buffer.indexOf('\r\n\r\n', boundaryIndex);
    if (headersEnd === -1) break;
    
    const headers = buffer.slice(boundaryIndex, headersEnd).toString();
    const nameMatch = headers.match(/name="([^"]+)"/);
    
    if (nameMatch) {
      const name = nameMatch[1];
      const contentStart = headersEnd + 4;
      
      // Find next boundary
      const nextBoundary = buffer.indexOf(boundaryBuffer, contentStart);
      const contentEnd = nextBoundary === -1 ? buffer.length : nextBoundary - 2; // -2 for \r\n before boundary
      
      if (name === 'file') {
        const fileNameMatch = headers.match(/filename="([^"]+)"/);
        if (fileNameMatch) {
          parts.fileName = fileNameMatch[1];
          parts.file = buffer.slice(contentStart, contentEnd);
        }
      } else {
        parts[name] = buffer.slice(contentStart, contentEnd).toString('utf-8');
      }
    }
    
    start = headersEnd + 4;
  }
  
  return parts;
}

server.listen(PORT, () => {
  console.log(`📤 Upload server running on http://localhost:${PORT}`);
  console.log(`   Ready to receive PDF uploads`);
});
