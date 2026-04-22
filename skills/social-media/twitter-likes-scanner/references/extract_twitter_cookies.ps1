# Extract Twitter/X Cookies from Windows Browser
# Run this in PowerShell while logged into your Twitter account
# Must be run as the same Windows user (DPAPI decryption requires your user context)
# Requires: PowerShell 5.1+ with SQLite support

Add-Type -AssemblyName System.Security

# Try Chrome first, then Edge
$paths = @(
    "$env:LOCALAPPDATA\Google\Chrome\User Data\Default\Network\Cookies",
    "$env:LOCALAPPDATA\Microsoft\Edge\User Data\Default\Network\Cookies"
)

$found = $false
foreach ($db in $paths) {
    if (-not (Test-Path $db)) { continue }
    
    Write-Host "Checking: $db" -ForegroundColor Green
    
    try {
        $conn = New-Object System.Data.SQLite.SQLiteConnection
        $conn.ConnectionString = "Data Source=$db"
        $conn.Open()
        
        $cmd = $conn.CreateCommand()
        $cmd.CommandText = "SELECT name, encrypted_value FROM cookies WHERE host_key LIKE '%.x.com%' AND name IN ('auth_token','ct0','twid','att')"
        
        $reader = $cmd.ExecuteReader()
        while ($reader.Read()) {
            try {
                $enc = $reader.GetValue(1)
                $dec = [System.Security.Cryptography.ProtectedData]::Unprotect(
                    $enc, $null, 
                    [System.Security.Cryptography.DataProtectionScope]::CurrentUser
                )
                $val = [System.Text.Encoding]::UTF8.GetString($dec)
                $name = $reader.GetString(0)
                Write-Output "$name=$val"
                $found = $true
            } catch {
                Write-Host "  Failed to decrypt: $($reader.GetString(0))" -ForegroundColor Yellow
            }
        }
        $conn.Close()
    } catch {
        Write-Host "  Error reading $db : $_" -ForegroundColor Red
    }
}

if (-not $found) {
    Write-Host ""
    Write-Host "No Twitter cookies found. Make sure:" -ForegroundColor Yellow
    Write-Host "  1. You are logged into Twitter in this browser" -ForegroundColor Yellow
    Write-Host "  2. Install SQLite if needed: Install-Module PowerShellSQLite -Scope CurrentUser" -ForegroundColor Yellow
}
