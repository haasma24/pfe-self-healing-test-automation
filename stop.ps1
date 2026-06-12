Write-Host "Stopping PFE infrastructure..."

$pidFile = "$env:ProgramData\pfe-infra-pids.txt"
if (Test-Path $pidFile) {
    Get-Content $pidFile | ForEach-Object {
        $p = Get-Process -Id $_ -ErrorAction SilentlyContinue
        if ($p) { $p.Kill(); Write-Host "Killed PID $_" }
    }
    Remove-Item $pidFile -Force
}

Get-Process -Name python -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -match "http.server 8085" } | ForEach-Object { $_.Kill(); Write-Host "Killed shop server" }
Get-Process -Name ssh -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -match "localhost.run" } | ForEach-Object { $_.Kill(); Write-Host "Killed SSH tunnel" }

Write-Host "All stopped."
