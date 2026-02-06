# PowerShell script to add PDF locally (without R2)
# Usage: .\add-pdf-local.ps1 -File "myfile.pdf" -Title "My PDF" -Subject "Math" -Year "Year 7"

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
$DatabaseName = "pdf-viewer-db"

# Check if file exists
if (-not (Test-Path $File)) {
    Write-Host "❌ File not found: $File" -ForegroundColor Red
    exit 1
}

# Generate unique ID
$Id = [guid]::NewGuid().ToString()

# Get filename
$FileName = Split-Path $File -Leaf

# Copy PDF to local pdfs folder
Write-Host "📁 Copying PDF to local storage..." -ForegroundColor Cyan
$DestPath = "pdfs\$FileName"
Copy-Item -Path $File -Destination $DestPath -Force

Write-Host "✅ PDF copied successfully" -ForegroundColor Green

# Construct relative URL
$FileUrl = "/pdfs/$FileName"

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
Write-Host ""
Write-Host "⚠️  Remember to redeploy to Cloudflare Pages after adding PDFs:" -ForegroundColor Yellow
Write-Host "  wrangler pages deploy . --project-name=pdf-viewer"
