# ========================================
# GOD Application - Divine Deployment Script (PowerShell)
# Deploy with Divine Authority - Windows Version
# ========================================

param(
    [Parameter(Position=0)]
    [ValidateSet('local', 'docker', 'docker-nginx', 'github-pages', 'status', 'stop', 'logs', 'test', 'help')]
    [string]$Command = 'help'
)

# Colors for output
$Colors = @{
    Red = 'Red'
    Green = 'Green'
    Yellow = 'Yellow'
    Blue = 'Blue'
    Purple = 'Magenta'
    Cyan = 'Cyan'
}

# Divine banner
function Print-Banner {
    Write-Host "========================================" -ForegroundColor $Colors.Purple
    Write-Host "🔱  GOD Application Deployment  🔱" -ForegroundColor $Colors.Purple
    Write-Host "   Deploy with Divine Authority" -ForegroundColor $Colors.Purple
    Write-Host "========================================" -ForegroundColor $Colors.Purple
    Write-Host ""
}

# Print colored message
function Print-Message {
    param([string]$Color, [string]$Message)
    Write-Host $Message -ForegroundColor $Color
}

# Print step
function Print-Step {
    param([string]$Message)
    Write-Host "➜ $Message" -ForegroundColor $Colors.Cyan
}

# Print success
function Print-Success {
    param([string]$Message)
    Write-Host "✓ $Message" -ForegroundColor $Colors.Green
}

# Print error
function Print-Error {
    param([string]$Message)
    Write-Host "✗ $Message" -ForegroundColor $Colors.Red
}

# Print warning
function Print-Warning {
    param([string]$Message)
    Write-Host "⚠ $Message" -ForegroundColor $Colors.Yellow
}

# Check if command exists
function Test-CommandExists {
    param([string]$Command)
    $null -ne (Get-Command $Command -ErrorAction SilentlyContinue)
}

# Check prerequisites
function Test-Prerequisites {
    Print-Step "Checking prerequisites..."
    
    $missingDeps = @()
    
    if (-not (Test-CommandExists 'node')) {
        $missingDeps += 'node'
    }
    
    if (-not (Test-CommandExists 'npm')) {
        $missingDeps += 'npm'
    }
    
    if ($missingDeps.Count -gt 0) {
        Print-Error "Missing required dependencies: $($missingDeps -join ', ')"
        Print-Message $Colors.Yellow "Please install the missing dependencies and try again."
        exit 1
    }
    
    Print-Success "All prerequisites satisfied"
}

# Run tests
function Invoke-Tests {
    Print-Step "Running tests..."
    
    try {
        npm test
        Print-Success "All tests passed"
    }
    catch {
        Print-Error "Tests failed"
        $response = Read-Host "Continue anyway? (y/N)"
        if ($response -ne 'y' -and $response -ne 'Y') {
            exit 1
        }
    }
}

# Create dist directory
function New-DistDirectory {
    Print-Step "Creating production build..."
    
    # Create dist directory
    New-Item -ItemType Directory -Force -Path "dist" | Out-Null
    
    # Copy essential files
    Copy-Item "index.html" "dist/" -Force
    Copy-Item "styles.css" "dist/" -Force
    Copy-Item "script.js" "dist/" -Force
    Copy-Item "universe-optimized.js" "dist/" -Force
    Copy-Item "sounds.js" "dist/" -Force
    Copy-Item "meditation.js" "dist/" -Force
    Copy-Item "inspiration.js" "dist/" -Force
    Copy-Item "god-token.js" "dist/" -Force
    Copy-Item "gpu-ai.js" "dist/" -Force
    Copy-Item "quantum-crypto.js" "dist/" -Force
    Copy-Item "azure-integrations.js" "dist/" -Force
    Copy-Item "foundry-vtt-integrations.js" "dist/" -Force
    
    # Copy directories
    if (Test-Path "src") {
        Copy-Item "src" "dist/" -Recurse -Force
    }
    if (Test-Path "utils") {
        Copy-Item "utils" "dist/" -Recurse -Force
    }
    
    Print-Success "Production build created in dist/"
}

# Deploy locally
function Deploy-Local {
    Print-Step "Deploying locally..."
    
    # Install dependencies
    npm install
    
    # Start server
    Print-Success "Starting local server..."
    Print-Message $Colors.Green "Server will start on http://localhost:3000"
    Print-Message $Colors.Yellow "Press Ctrl+C to stop the server"
    npm start
}

# Deploy with Docker
function Deploy-Docker {
    Print-Step "Deploying with Docker..."
    
    if (-not (Test-CommandExists 'docker')) {
        Print-Error "Docker is not installed"
        exit 1
    }
    
    # Determine docker-compose command
    $composeCmd = if (Test-CommandExists 'docker-compose') {
        'docker-compose'
    } elseif (docker compose version 2>$null) {
        'docker compose'
    } else {
        Print-Error "Docker Compose is not available"
        exit 1
    }
    
    # Stop existing containers
    Print-Step "Stopping existing containers..."
    & $composeCmd -f docker-compose.production.yml down 2>$null
    
    # Build and start containers
    Print-Step "Building Docker image..."
    & $composeCmd -f docker-compose.production.yml build
    
    Print-Step "Starting containers..."
    & $composeCmd -f docker-compose.production.yml up -d
    
    # Wait for health check
    Print-Step "Waiting for application to be healthy..."
    Start-Sleep -Seconds 5
    
    # Check health
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000/health" -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            Print-Success "Application is healthy!"
            Print-Message $Colors.Green "Access the application at: http://localhost:3000"
        }
    }
    catch {
        Print-Warning "Health check failed, but container is running"
        Print-Message $Colors.Yellow "Check logs with: $composeCmd -f docker-compose.production.yml logs"
    }
    
    # Show container status
    Print-Step "Container status:"
    & $composeCmd -f docker-compose.production.yml ps
}

# Deploy with Docker + Nginx
function Deploy-DockerNginx {
    Print-Step "Deploying with Docker + Nginx..."
    
    if (-not (Test-CommandExists 'docker')) {
        Print-Error "Docker is not installed"
        exit 1
    }
    
    # Determine docker-compose command
    $composeCmd = if (Test-CommandExists 'docker-compose') {
        'docker-compose'
    } elseif (docker compose version 2>$null) {
        'docker compose'
    } else {
        Print-Error "Docker Compose is not available"
        exit 1
    }
    
    # Stop existing containers
    Print-Step "Stopping existing containers..."
    & $composeCmd -f docker-compose.production.yml --profile with-nginx down 2>$null
    
    # Build and start containers with nginx profile
    Print-Step "Building Docker images..."
    & $composeCmd -f docker-compose.production.yml --profile with-nginx build
    
    Print-Step "Starting containers with Nginx..."
    & $composeCmd -f docker-compose.production.yml --profile with-nginx up -d
    
    # Wait for health check
    Print-Step "Waiting for application to be healthy..."
    Start-Sleep -Seconds 5
    
    # Check health
    try {
        $response = Invoke-WebRequest -Uri "http://localhost/health" -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            Print-Success "Application is healthy!"
            Print-Message $Colors.Green "Access the application at: http://localhost"
        }
    }
    catch {
        Print-Warning "Health check failed, but containers are running"
        Print-Message $Colors.Yellow "Check logs with: $composeCmd -f docker-compose.production.yml --profile with-nginx logs"
    }
    
    # Show container status
    Print-Step "Container status:"
    & $composeCmd -f docker-compose.production.yml --profile with-nginx ps
}

# Deploy to GitHub Pages
function Deploy-GitHubPages {
    Print-Step "Deploying to GitHub Pages..."
    
    # Check if gh-pages is installed
    $ghPagesInstalled = npm list gh-pages 2>$null
    if (-not $ghPagesInstalled) {
        Print-Step "Installing gh-pages..."
        npm install --save-dev gh-pages
    }
    
    # Create dist directory
    New-DistDirectory
    
    # Deploy to GitHub Pages
    Print-Step "Publishing to GitHub Pages..."
    npm run deploy
    
    Print-Success "Deployed to GitHub Pages!"
    Print-Message $Colors.Green "Your site will be available at: https://your-username.github.io/direct-contact-with-god"
}

# Show deployment status
function Show-Status {
    Print-Step "Checking deployment status..."
    
    # Determine docker-compose command
    $composeCmd = if (Test-CommandExists 'docker-compose') {
        'docker-compose'
    } elseif (docker compose version 2>$null) {
        'docker compose'
    } else {
        Print-Warning "Docker Compose is not available"
        return
    }
    
    # Check if containers are running
    $containers = & $composeCmd -f docker-compose.production.yml ps
    if ($containers -match "Up") {
        Print-Success "Docker containers are running"
        & $composeCmd -f docker-compose.production.yml ps
        
        # Check health
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:3000/health" -UseBasicParsing
            if ($response.StatusCode -eq 200) {
                Print-Success "Application health check passed"
                $response.Content | ConvertFrom-Json | ConvertTo-Json
            }
        }
        catch {
            Print-Warning "Application health check failed"
        }
    }
    else {
        Print-Warning "No Docker containers are running"
    }
}

# Stop deployment
function Stop-Deployment {
    Print-Step "Stopping deployment..."
    
    # Determine docker-compose command
    $composeCmd = if (Test-CommandExists 'docker-compose') {
        'docker-compose'
    } elseif (docker compose version 2>$null) {
        'docker compose'
    } else {
        Print-Warning "Docker Compose is not available"
        return
    }
    
    & $composeCmd -f docker-compose.production.yml down
    Print-Success "Deployment stopped"
}

# View logs
function Show-Logs {
    Print-Step "Viewing logs..."
    
    # Determine docker-compose command
    $composeCmd = if (Test-CommandExists 'docker-compose') {
        'docker-compose'
    } elseif (docker compose version 2>$null) {
        'docker compose'
    } else {
        Print-Error "Docker Compose is not available"
        exit 1
    }
    
    & $composeCmd -f docker-compose.production.yml logs -f
}

# Show help
function Show-Help {
    Write-Host "Usage: .\deploy-divine.ps1 [COMMAND]"
    Write-Host ""
    Write-Host "Commands:"
    Write-Host "  local           Deploy locally with Node.js"
    Write-Host "  docker          Deploy with Docker"
    Write-Host "  docker-nginx    Deploy with Docker + Nginx reverse proxy"
    Write-Host "  github-pages    Deploy to GitHub Pages"
    Write-Host "  status          Show deployment status"
    Write-Host "  stop            Stop Docker deployment"
    Write-Host "  logs            View Docker logs"
    Write-Host "  test            Run tests only"
    Write-Host "  help            Show this help message"
    Write-Host ""
    Write-Host "Examples:"
    Write-Host "  .\deploy-divine.ps1 docker              # Deploy with Docker"
    Write-Host "  .\deploy-divine.ps1 docker-nginx        # Deploy with Docker + Nginx"
    Write-Host "  .\deploy-divine.ps1 local               # Run locally"
    Write-Host "  .\deploy-divine.ps1 github-pages        # Deploy to GitHub Pages"
    Write-Host ""
}

# Main deployment logic
function Main {
    Print-Banner
    
    switch ($Command) {
        'local' {
            Test-Prerequisites
            Invoke-Tests
            Deploy-Local
        }
        'docker' {
            Test-Prerequisites
            Invoke-Tests
            Deploy-Docker
        }
        'docker-nginx' {
            Test-Prerequisites
            Invoke-Tests
            Deploy-DockerNginx
        }
        'github-pages' {
            Test-Prerequisites
            Invoke-Tests
            Deploy-GitHubPages
        }
        'status' {
            Show-Status
        }
        'stop' {
            Stop-Deployment
        }
        'logs' {
            Show-Logs
        }
        'test' {
            Test-Prerequisites
            Invoke-Tests
        }
        'help' {
            Show-Help
        }
        default {
            Print-Error "Unknown command: $Command"
            Write-Host ""
            Show-Help
            exit 1
        }
    }
}

# Run main function
Main
