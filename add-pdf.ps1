# PowerShell script to upload PDF and add to database
# Usage: .\add-pdf.ps1 -File "myfile.pdf" -Title "My PDF" -Subject "Math" -Year "Year 7"

param(
    [Parameter(Mandatory=$true)]
    [string]$File,
    
    [Parameter(Mandatory=$true)]
    [string]$Title,
    
    [Parameter(Mandatory=$true)]
    [string]$Subject,
    
    [Parameter(Mandatory=$true)]
    [string]$Year
)

# Configuration
$BucketName = "pdf-storage"
$DatabaseName = "pdf-viewer-db"
$R2Domain = "YOUR_R2_PUBLIC_DOMAIN"  # Update this with your R2 public domain

# Generate unique ID
$Id = [guid]::NewGuid().ToString()

# Get filename
$FileName = Split-Path $File -Leaf

Write-Host "📤 Uploading PDF to R2..." -ForegroundColor Cyan
$uploadResult = wrangler r2 object put "$BucketName/$FileName" --file="$File"

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to upload PDF" -ForegroundColor Red
    exit 1
}

Write-Host "✅ PDF uploaded successfully" -ForegroundColor Green

# Construct URL
$FileUrl = "https://$R2Domain/$FileName"

Write-Host "💾 Adding metadata to database..." -ForegroundColor Cyan

# Escape single quotes in SQL values
$TitleEscaped = $Title -replace "'", "''"
$SubjectEscaped = $Subject -replace "'", "''"
$YearEscaped = $Year -replace "'", "''"

$SqlCommand = "INSERT INTO pdfs (id, title, subject, year_level, file_url) VALUES ('$Id', '$TitleEscaped', '$SubjectEscaped', '$YearEscaped', '$FileUrl')"

$dbResult = wrangler d1 execute $DatabaseName --command="$SqlCommand"

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to add to database" -ForegroundColor Red
    exit 1
}

Write-Host "✅ PDF added to database successfully" -ForegroundColor Green
Write-Host ""
Write-Host "📋 PDF Details:" -ForegroundColor Yellow
Write-Host "  ID: $Id"
Write-Host "  Title: $Title"
Write-Host "  Subject: $Subject"
Write-Host "  Year: $Year"
Write-Host "  URL: $FileUrl"
