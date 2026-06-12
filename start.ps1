param(
    [string]$ApiUrl
)

Write-Host "========================"
Write-Host "PFE - START INFRASTRUCTURE"
Write-Host "========================"
Write-Host ""

# 1. Verify Python
$python = "C:\Users\binitns\AppData\Local\Programs\Python\Python313\python.exe"
if (-not (Test-Path $python)) {
    Write-Error "Python not found at $python"
    exit 1
}
Write-Host "[1/4] Python OK"

# 2. Start shop server
$shopDir = Join-Path $PSScriptRoot "shop"
$shopLog = "$env:TEMP\pfe-shop.log"
$shopJob = Get-Process -Name python -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -match "8085" }
if (-not $shopJob) {
    $shopJob = Start-Process -FilePath $python -ArgumentList "-m http.server 8085" -WorkingDirectory $shopDir -WindowStyle Hidden -PassThru -RedirectStandardOutput $shopLog
    Start-Sleep -Seconds 2
    Write-Host "[2/4] Shop server started on port 8085 (PID: $($shopJob.Id))"
} else {
    Write-Host "[2/4] Shop server already running (PID: $($shopJob.Id))"
}

# 3. Start SSH tunnel
$sshLog = "$env:TEMP\pfe-tunnel.log"
$sshJob = Get-Process -Name ssh -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -match "localhost.run" }
if (-not $sshJob) {
    $sshJob = Start-Process -FilePath "C:\WINDOWS\System32\OpenSSH\ssh.exe" -ArgumentList "-o StrictHostKeyChecking=no -R 80:localhost:8085 localhost.run" -WindowStyle Hidden -PassThru -RedirectStandardOutput $sshLog
    Write-Host "[3/4] SSH tunnel starting... waiting for URL"
    $tunnelUrl = $null
    for ($i = 0; $i -lt 60; $i++) {
        Start-Sleep -Seconds 1
        $log = Get-Content $sshLog -Raw -ErrorAction SilentlyContinue
        if ($log -match 'https://([a-z0-9.-]+)\.lhr\.life') {
            $tunnelUrl = $matches[0]
            break
        }
        Write-Host "  waiting... $($i+1)s"
    }
    if (-not $tunnelUrl) {
        Write-Warning "Could not auto-detect tunnel URL. Check $sshLog manually."
        $tunnelUrl = Read-Host "Enter the localhost.run URL"
    }
    Write-Host "  Tunnel URL: $tunnelUrl"
} else {
    Write-Host "[3/4] SSH tunnel already running (PID: $($sshJob.Id))"
    # Try to get URL from log
    $log = Get-Content $sshLog -Raw -ErrorAction SilentlyContinue
    if ($log -match 'https://([a-z0-9.-]+)\.lhr\.life') {
        $tunnelUrl = $matches[0]
        Write-Host "  Tunnel URL: $tunnelUrl"
    }
}

# 4. Detect or ask for API URL
if (-not $ApiUrl) {
    try {
        $ngrokData = Invoke-RestMethod -Uri "http://localhost:4040/api/tunnels" -ErrorAction SilentlyContinue
        $ApiUrl = ($ngrokData.tunnels | Where-Object { $_.config.addr -match "localhost:5000" } | Select-Object -First 1).public_url
    } catch {}
    if (-not $ApiUrl) {
        $ApiUrl = Read-Host "Enter the Colab/ngrok API URL"
    }
}
Write-Host "[4/4] API URL: $ApiUrl"

# 5. Save URLs for Jenkins
$urlsFile = "$env:ProgramData\.pfe-urls.json"
$config = @{
    page_url   = $tunnelUrl
    api_url    = $ApiUrl
    updated_at = (Get-Date -Format "yyyy-MM-dd HH:mm:ss")
} | ConvertTo-Json
$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText($urlsFile, $config, $utf8NoBom)

Write-Host ""
Write-Host "========================"
Write-Host "INFRASTRUCTURE READY"
Write-Host "========================"
Write-Host "Shop  : $tunnelUrl"
Write-Host "API   : $ApiUrl"
Write-Host ""
Write-Host "URLs saved to: $urlsFile"
Write-Host "Now run Jenkins build!"
Write-Host "========================"

# Save PIDs for cleanup
$shopJob.Id, $sshJob.Id | Out-File "$env:ProgramData\pfe-infra-pids.txt" -Encoding UTF8
