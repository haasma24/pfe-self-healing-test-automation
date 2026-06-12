param(
    [string]$PageUrl,
    [string]$ApiUrl
)

$outputPath = "$env:ProgramData\.pfe-urls.json"

# Auto-detect ngrok URL
if (-not $ApiUrl) {
    try {
        $ngrokData = Invoke-RestMethod -Uri "http://localhost:4040/api/tunnels" -ErrorAction SilentlyContinue
        $ngrokUrl = ($ngrokData.tunnels | Where-Object { $_.config.addr -match "localhost:5000" } | Select-Object -First 1).public_url
        if ($ngrokUrl) { $ApiUrl = $ngrokUrl }
    } catch {}
}

if (-not $ApiUrl) {
    $ApiUrl = Read-Host "URL du backend Colab/ngrok (ex: https://xxxx.ngrok-free.app)"
}
if (-not $PageUrl) {
    $PageUrl = Read-Host "URL de la page shop (ex: https://xxxx.lhr.life)"
}

$config = @{
    page_url   = $PageUrl
    api_url    = $ApiUrl
    updated_at = (Get-Date -Format "yyyy-MM-dd HH:mm:ss")
} | ConvertTo-Json

$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText($outputPath, $config, $utf8NoBom)
Write-Host "URLs sauvegardees dans $outputPath"
Write-Host "  Page shop : $PageUrl"
Write-Host "  API Colab  : $ApiUrl"
