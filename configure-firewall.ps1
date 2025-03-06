# Military-grade firewall configuration script
Write-Host "[INFO] Starting firewall configuration..."

try {
    # Test if port 3000 is actually being used
    $testPort = Test-NetConnection -ComputerName localhost -Port 3000
    Write-Host "[INFO] Port 3000 status: $($testPort.TcpTestSucceeded)"

    # List current firewall rules for Node.js
    Write-Host "[INFO] Checking existing firewall rules..."
    $existingRules = Get-NetFirewallRule -DisplayName "Node.js Server*" -ErrorAction SilentlyContinue
    
    if ($existingRules) {
        Write-Host "[INFO] Removing existing rules..."
        Remove-NetFirewallRule -DisplayName "Node.js Server*"
    }

    Write-Host "[INFO] Creating new firewall rules..."
    
    # Create inbound rule
    New-NetFirewallRule -DisplayName "Node.js Server (TCP-In)" `
        -Direction Inbound `
        -Action Allow `
        -Protocol TCP `
        -LocalPort 3000 `
        -Program "C:\Program Files\nodejs\node.exe" `
        -Profile Private `
        -Description "Allow incoming Node.js server connections"

    Write-Host "[SUCCESS] Firewall configuration completed"
} catch {
    Write-Host "[ERROR] Failed to configure firewall: $_"
}
