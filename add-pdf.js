#!/usr/bin/env node

// Node.js script to upload PDF and add to database
// Usage: node add-pdf.js <file> <title> <subject> <year>

const { execSync } = require('child_process');
const crypto = require('crypto');
const path = require('path');

// Configuration
const BUCKET_NAME = 'pdf-storage';
const DATABASE_NAME = 'pdf-viewer-db';
const R2_DOMAIN = 'YOUR_R2_PUBLIC_DOMAIN'; // Update this with your R2 public domain

// Get command line arguments
const [,, file, title, subject, year] = process.argv;

if (!file || !title || !subject || !year) {
  console.error('❌ Usage: node add-pdf.js <file> <title> <subject> <year>');
  console.error('   Example: node add-pdf.js myfile.pdf "My PDF Title" "Mathematics" "Year 7"');
  process.exit(1);
}

// Generate unique ID
const id = crypto.randomUUID();

// Get filename
const fileName = path.basename(file);

try {
  // Upload to R2
  console.log('📤 Uploading PDF to R2...');
  execSync(`wrangler r2 object put ${BUCKET_NAME}/${fileName} --file="${file}"`, { stdio: 'inherit' });
  console.log('✅ PDF uploaded successfully');

  // Construct URL
  const fileUrl = `https://${R2_DOMAIN}/${fileName}`;

  // Add to database
  console.log('💾 Adding metadata to database...');
  
  // Escape single quotes for SQL
  const titleEscaped = title.replace(/'/g, "''");
  const subjectEscaped = subject.replace(/'/g, "''");
  const yearEscaped = year.replace(/'/g, "''");
  
  const sqlCommand = `INSERT INTO pdfs (id, title, subject, year_level, file_url) VALUES ('${id}', '${titleEscaped}', '${subjectEscaped}', '${yearEscaped}', '${fileUrl}')`;
  
  execSync(`wrangler d1 execute ${DATABASE_NAME} --command="${sqlCommand}"`, { stdio: 'inherit' });
  console.log('✅ PDF added to database successfully');

  console.log('\n📋 PDF Details:');
  console.log(`  ID: ${id}`);
  console.log(`  Title: ${title}`);
  console.log(`  Subject: ${subject}`);
  console.log(`  Year: ${year}`);
  console.log(`  URL: ${fileUrl}`);

} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
