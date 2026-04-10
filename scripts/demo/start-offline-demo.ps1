param(
  [int]$Port = 4173
)

$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$dist = Join-Path $here 'dist'

if (!(Test-Path $dist)) {
  Write-Host "Dossier 'dist' introuvable. Copiez le dossier frontend/dist ici."
  exit 1
}

$listener = New-Object System.Net.HttpListener
$prefix = "http://localhost:$Port/"
$listener.Prefixes.Add($prefix)
$listener.Start()

Write-Host "Serveur démo actif : $prefix"
Write-Host "Appuyez sur Ctrl+C pour arrêter."

$mime = @{
  '.html' = 'text/html'
  '.js' = 'application/javascript'
  '.css' = 'text/css'
  '.json' = 'application/json'
  '.svg' = 'image/svg+xml'
  '.png' = 'image/png'
  '.jpg' = 'image/jpeg'
  '.jpeg' = 'image/jpeg'
  '.gif' = 'image/gif'
  '.woff' = 'font/woff'
  '.woff2' = 'font/woff2'
  '.ico' = 'image/x-icon'
}

while ($listener.IsListening) {
  $ctx = $listener.GetContext()
  $path = $ctx.Request.Url.LocalPath.TrimStart('/')
  if ([string]::IsNullOrWhiteSpace($path)) { $path = 'index.html' }

  $file = Join-Path $dist $path
  if (!(Test-Path $file)) {
    $file = Join-Path $dist 'index.html'
  }

  $ext = [System.IO.Path]::GetExtension($file).ToLower()
  if ($mime.ContainsKey($ext)) {
    $ctx.Response.ContentType = $mime[$ext]
  } else {
    $ctx.Response.ContentType = 'application/octet-stream'
  }

  $bytes = [System.IO.File]::ReadAllBytes($file)
  $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
  $ctx.Response.Close()
}
