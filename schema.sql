-- D1 Database Schema for PDF Viewer

-- PDFs table
CREATE TABLE IF NOT EXISTS pdfs (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  year_level TEXT NOT NULL,
  file_url TEXT NOT NULL,
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch())
);

CREATE INDEX idx_pdfs_year ON pdfs(year_level);
CREATE INDEX idx_pdfs_subject ON pdfs(subject);

-- Sample data
INSERT INTO pdfs (id, title, subject, year_level, file_url) VALUES
  ('1', 'Introduction to Mathematics', 'Mathematics', 'Year 7', 'https://your-r2-bucket.r2.cloudflarestorage.com/math-intro.pdf'),
  ('2', 'Basic Science Concepts', 'Science', 'Year 7', 'https://your-r2-bucket.r2.cloudflarestorage.com/science-basic.pdf'),
  ('3', 'Advanced Mathematics', 'Mathematics', 'Year 8', 'https://your-r2-bucket.r2.cloudflarestorage.com/math-advanced.pdf'),
  ('4', 'English Literature', 'English', 'Year 8', 'https://your-r2-bucket.r2.cloudflarestorage.com/english-lit.pdf');
