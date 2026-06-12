$urlsFile = "$env:USERPROFILE\.pfe-urls.json"
$pidFile  = "$env:TEMP\pfe-infra-pids.txt"

# Kill previous instances
if (Test-Path $pidFile) {
    Get-Content $pidFile | ForEach-Object {
        $p = Get-Process -Id $_ -ErrorAction SilentlyContinue
        if ($p) { $p.Kill() }
    }
}

# 1. Start shop HTTP server
$shopDir = Join-Path $PSScriptRoot "..\shop"
$shopJob = Start-Process -FilePath "python" -ArgumentList "-m http.server 8085" -WorkingDirectory $shopDir -NoNewWindow -PassThru -RedirectStandardOutput "$env:TEMP\pfe-shop.log"

# 2. Start SSH tunnel and capture URL
$sshJob = Start-Process -FilePath "ssh" -ArgumentList "-o StrictHostKeyChecking=no -R 80:localhost:8085 localhost.run" -NoNewWindow -PassThru -RedirectStandardOutput "$env:TEMP\pfe-tunnel.log"

# Save PIDs
$shopJob.Id, $sshJob.Id | Out-File -FilePath $pidFile -Encoding UTF8

# 3. Wait for tunnel URL
$tunnelUrl = $null
for ($i = 0; $i -lt 60; $i++) {
    Start-Sleep -Seconds 1
    $log = Get-Content "$env:TEMP\pfe-tunnel.log" -Raw -ErrorAction SilentlyContinue
    if ($log -match 'https://([a-z0-9.-]+)\.lhr\.life') {
        $tunnelUrl = $matches[0]
        Write-Host "Tunnel URL detected: $tunnelUrl"
        break
    }
}

if (-not $tunnelUrl) {
    Write-Warning "Tunnel URL not detected after 60s. Check manually."
    $tunnelUrl = Read-Host "Enter the localhost.run URL"
}

# 4. Get ngrok/Colab URL
$apiUrl = $null
try {
    $ngrokData = Invoke-RestMethod -Uri "http://localhost:4040/api/tunnels" -ErrorAction SilentlyContinue
    $apiUrl = ($ngrokData.tunnels | Where-Object { $_.config.addr -match "localhost:5000" } | Select-Object -First 1).public_url
} catch {}

if (-not $apiUrl) {
    # Try to read existing config for API URL
    if (Test-Path $urlsFile) {
        $existing = Get-Content $urlsFile -Raw | ConvertFrom-Json
        $apiUrl = $existing.api_url
    }
    if (-not $apiUrl) {
        $apiUrl = Read-Host "Enter the Colab/ngrok API URL"
    }
}

# 5. Save URLs
$config = @{
    page_url   = $tunnelUrl
    api_url    = $apiUrl
    updated_at = (Get-Date -Format "yyyy-MM-dd HH:mm:ss")
} | ConvertTo-Json

Set-Content -Path $urlsFile -Value $config -Encoding UTF8

Write-Host "`nInfrastructure ready:"
Write-Host "  Shop  : $tunnelUrl"
Write-Host "  API   : $apiUrl"
Write-Host "  URLs  : $urlsFile"
