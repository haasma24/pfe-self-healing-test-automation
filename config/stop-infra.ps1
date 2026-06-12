$pidFile = "$env:ProgramData\pfe-infra-pids.txt"

if (Test-Path $pidFile) {
    Get-Content $pidFile | ForEach-Object {
        $p = Get-Process -Id $_ -ErrorAction SilentlyContinue
        if ($p) {
            $p.Kill()
            Write-Host "Killed process $_"
        }
    }
    Remove-Item $pidFile -Force
} else {
    Write-Warning "No PID file found at $pidFile"
}

# Also kill any lingering ssh/python processes from this context
Get-Process -Name "ssh" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -match "localhost.run" } | ForEach-Object { $_.Kill() }
Get-Process -Name "python" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -match "http.server 8085" } | ForEach-Object { $_.Kill() }

Write-Host "Infrastructure stopped."
