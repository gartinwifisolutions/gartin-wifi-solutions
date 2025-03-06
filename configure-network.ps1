# Network Configuration Script with Military-Grade Precision
# For Gartin WiFi Solutions Professional Website

Write-Host "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] Starting network configuration..."

function Test-AdminPrivileges {
    $identity = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($identity)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

function Test-PortAvailability {
    param($Port)
    try {
        $endpoint = New-Object System.Net.IPEndPoint([ipaddress]::Any, $Port)
        $socket = New-Object System.Net.Sockets.Socket(
            [System.Net.Sockets.AddressFamily]::InterNetwork,
            [System.Net.Sockets.SocketType]::Stream,
            [System.Net.Sockets.ProtocolType]::Tcp
        )
        $socket.Bind($endpoint)
        $socket.Close()
        return $true
    } catch {
        return $false
    }
}

# Verify admin privileges
if (-not (Test-AdminPrivileges)) {
    Write-Host "[ERROR] This script requires administrator privileges."
    Write-Host "Please run PowerShell as Administrator and try again."
    exit 1
}

# Configure firewall for Node.js
try {
    Write-Host "[INFO] Testing port 8888..."
    $portAvailable = Test-PortAvailability -Port 8888
    
    if (-not $portAvailable) {
        Write-Host "[WARN] Port 8888 is in use. Checking processes..."
        $processes = Get-NetTCPConnection -LocalPort 8888 -ErrorAction SilentlyContinue
        foreach ($process in $processes) {
            $owningProcess = Get-Process -Id $process.OwningProcess
            Write-Host "[INFO] Port is used by: $($owningProcess.ProcessName)"
        }
    }

    Write-Host "[INFO] Configuring firewall rules..."
    
    # Remove any existing rules for our port
    Remove-NetFirewallRule -DisplayName "Gartin WiFi Solutions*" -ErrorAction SilentlyContinue
    
    # Create new inbound rule
    New-NetFirewallRule -DisplayName "Gartin WiFi Solutions (TCP-In)" `
        -Direction Inbound `
        -Action Allow `
        -Protocol TCP `
        -LocalPort 8888 `
        -Program "C:\Program Files\nodejs\node.exe" `
        -Profile Private,Domain `
        -Description "Allow incoming connections for Gartin WiFi Solutions website"

    Write-Host "[SUCCESS] Firewall configured successfully"
    Write-Host "[INFO] Website should be accessible at: http://192.168.1.26:8888"
    
} catch {
    Write-Host "[ERROR] Failed to configure network: $_"
    exit 1
}
