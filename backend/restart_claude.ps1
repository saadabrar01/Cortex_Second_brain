# restart_claude.ps1
# Kills all Claude Desktop processes and relaunches cleanly
# Run from PowerShell as normal user (no admin needed)

Write-Host "`n[1/3] Killing all Claude processes..." -ForegroundColor Cyan
$killed = Get-Process -Name "claude" -ErrorAction SilentlyContinue
if ($killed) {
    $killed | Stop-Process -Force
    Write-Host "  Killed $($killed.Count) Claude process(es)" -ForegroundColor Green
} else {
    Write-Host "  No Claude processes running" -ForegroundColor Yellow
}

# Wait for processes to fully exit
Start-Sleep -Seconds 2

$remaining = Get-Process -Name "claude" -ErrorAction SilentlyContinue
if ($remaining) {
    Write-Host "  WARNING: $($remaining.Count) process(es) still alive, waiting..." -ForegroundColor Yellow
    Start-Sleep -Seconds 3
}

Write-Host "`n[2/3] Verifying config files..." -ForegroundColor Cyan

# Check standard AppData config
$stdPath = "$env:APPDATA\Claude\claude_desktop_config.json"
if (Test-Path $stdPath) {
    $bytes = [System.IO.File]::ReadAllBytes($stdPath)
    $hasBOM = ($bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF)
    Write-Host "  Standard AppData config: EXISTS $(if($hasBOM){'[BOM WARNING]'}else{'[no BOM, OK]'})" -ForegroundColor $(if($hasBOM){'Yellow'}else{'Green'})
} else {
    Write-Host "  Standard AppData config: NOT FOUND" -ForegroundColor Red
}

# Check VFS config (Microsoft Store version path)
$vfsPath = "$env:LOCALAPPDATA\Packages\Claude_pzs8sxrjxfjjc\LocalCache\Roaming\Claude\claude_desktop_config.json"
if (Test-Path $vfsPath) {
    $vfsBytes = [System.IO.File]::ReadAllBytes($vfsPath)
    $vfsBOM = ($vfsBytes[0] -eq 0xEF -and $vfsBytes[1] -eq 0xBB -and $vfsBytes[2] -eq 0xBF)
    $parsed = (Get-Content $vfsPath -Raw | ConvertFrom-Json)
    $hasMCP = $parsed.PSObject.Properties['mcpServers'] -ne $null
    Write-Host "  VFS (Store) config:       EXISTS $(if($vfsBOM){'[BOM WARNING]'}else{'[no BOM, OK]'}) | mcpServers: $(if($hasMCP){'PRESENT'}else{'MISSING'})" -ForegroundColor $(if($vfsBOM -or -not $hasMCP){'Yellow'}else{'Green'})
} else {
    Write-Host "  VFS (Store) config:       NOT FOUND" -ForegroundColor Red
}

Write-Host "`n[3/3] Launching Claude Desktop..." -ForegroundColor Cyan

# Try MS Store launch first
$storeExe = (Get-ChildItem "C:\Program Files\WindowsApps" -Filter "Claude.exe" -Recurse -ErrorAction SilentlyContinue | 
    Where-Object { $_.FullName -like "*Claude_*" } | Select-Object -First 1)?.FullName

if ($storeExe) {
    Start-Process $storeExe
    Write-Host "  Launched Store version: $storeExe" -ForegroundColor Green
} else {
    # Fallback: use shell start
    Start-Process "shell:AppsFolder\Claude_pzs8sxrjxfjjc!Claude" -ErrorAction SilentlyContinue
    if (-not $?) {
        # Last resort: search PATH
        $claudePath = (Get-Command claude -ErrorAction SilentlyContinue)?.Source
        if ($claudePath) { Start-Process $claudePath }
        else { Write-Host "  Could not find Claude executable. Please launch manually." -ForegroundColor Red }
    } else {
        Write-Host "  Launched via shell apps folder" -ForegroundColor Green
    }
}

Write-Host "`nDone. Wait ~5 seconds for Claude to load, then check:" -ForegroundColor White
Write-Host "  Settings -> Developer -> MCP Servers" -ForegroundColor White
Write-Host "  Or look for the hammer icon in a new chat" -ForegroundColor White
Write-Host "`nLog files to check if still broken:" -ForegroundColor White
Write-Host "  $env:LOCALAPPDATA\Claude\logs\mcp.log" -ForegroundColor Gray
Write-Host "  $env:LOCALAPPDATA\Claude\logs\main.log" -ForegroundColor Gray
