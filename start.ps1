param(
    [string]$ApiUrl
)

$urlsFile = "$env:ProgramData\.pfe-urls.json"

Write-Host "========================"
Write-Host "PFE - START INFRASTRUCTURE"
Write-Host "========================"
Write-Host ""

# 0. Load previous URLs to keep stable ones (API)
$previousUrls = @{}
if (Test-Path $urlsFile) {
    try {
        $previousUrls = Get-Content $urlsFile -Raw | ConvertFrom-Json
        Write-Host "[0/4] Previous config loaded"
    } catch {}
}

# 1. Verify Python
$python = "C:\Users\binitns\AppData\Local\Programs\Python\Python313\python.exe"
if (-not (Test-Path $python)) {
    Write-Error "Python not found at $python"
    exit 1
}
Write-Host "[1/4] Python OK"

# 2. Start shop server (if shop directory exists)
$shopDir = Join-Path $PSScriptRoot "shop"
$shopLog = "$env:ProgramData\pfe-shop.log"
$shopJob = $null
if (Test-Path $shopDir) {
    $shopJob = Get-Process -Name python -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -match "8085" }
    if (-not $shopJob) {
        $shopJob = Start-Process -FilePath $python -ArgumentList "-m http.server 8085" -WorkingDirectory $shopDir -WindowStyle Hidden -PassThru -RedirectStandardOutput $shopLog
        Start-Sleep -Seconds 2
        Write-Host "[2/4] Shop server started on port 8085 (PID: $($shopJob.Id))"
    } else {
        Write-Host "[2/4] Shop server already running (PID: $($shopJob.Id))"
    }
} else {
    Write-Host "[2/4] Shop directory not found at $shopDir - skipping shop server"
}

# 3. Start SSH tunnel and auto-detect URL
$tunnelUrl = $null
$sshProcess = Get-Process -Name ssh -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -match "localhost.run" }
if (-not $sshProcess) {
    Write-Host "[3/4] SSH tunnel starting..."
    $sshLog = "$env:ProgramData\pfe-tunnel.log"
    $sshExe = "C:\WINDOWS\System32\OpenSSH\ssh.exe"
    $sshArgs = "-o StrictHostKeyChecking=no -o ServerAliveInterval=30 -o ServerAliveCountMax=3 -R 80:localhost:8085 localhost.run"
    Start-Process -FilePath "cmd.exe" -ArgumentList "/c `"$sshExe $sshArgs > $sshLog 2>&1`"" -WindowStyle Hidden -PassThru -OutVariable sshProcess
    Write-Host "  waiting for URL (PID: $($sshProcess.Id))..."
    $timeout = 60
    for ($i = 1; $i -le $timeout; $i++) {
        Start-Sleep -Seconds 1
        $content = Get-Content $sshLog -Raw -ErrorAction SilentlyContinue
        if ($content -match 'https://([a-z0-9.-]+)\.lhr\.life') {
            $tunnelUrl = $matches[0]
            break
        }
        Write-Host "  waiting... ${i}s"
    }
    if (-not $tunnelUrl) {
        Write-Warning "Could not auto-detect tunnel URL after ${timeout}s."
        $tunnelUrl = Read-Host "Enter the localhost.run URL"
    }
    Write-Host "  Tunnel URL: $tunnelUrl"
} else {
    Write-Host "[3/4] SSH tunnel already running (PID: $($sshProcess.Id))"
    $sshLog = "$env:ProgramData\pfe-tunnel.log"
    $content = Get-Content $sshLog -Raw -ErrorAction SilentlyContinue
    if ($content -match '(?s).*?(https://([a-z0-9.-]+)\.lhr\.life)') {
        $tunnelUrl = $matches[1]
    }
    if (-not $tunnelUrl) {
        Write-Warning "Could not extract tunnel URL from log."
    } else {
        Write-Host "  Tunnel URL: $tunnelUrl"
    }
}

# 4. API URL : garder la precedente si stable, sinon detecter/demander
if (-not $ApiUrl) {
    $ApiUrl = $previousUrls.api_url
}
if (-not $ApiUrl) {
    try {
        $ngrokData = Invoke-RestMethod -Uri "http://localhost:4040/api/tunnels" -ErrorAction SilentlyContinue
        $ApiUrl = ($ngrokData.tunnels | Where-Object { $_.config.addr -match "localhost:5000" } | Select-Object -First 1).public_url
    } catch {}
}
if (-not $ApiUrl) {
    $ApiUrl = Read-Host "Enter the Colab/ngrok API URL"
}
Write-Host "[4/4] API URL: $ApiUrl"

# 5. Save URLs for Jenkins
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

# Save PIDs for cleanup (only if jobs were started)
$pids = @()
if ($shopJob) { $pids += $shopJob.Id }
if ($sshJob)  { $pids += $sshJob.Id }
if ($pids.Count -gt 0) {
    $pids | Out-File "$env:ProgramData\pfe-infra-pids.txt" -Encoding UTF8
}