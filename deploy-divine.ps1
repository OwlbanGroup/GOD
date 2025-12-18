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
function Write-Banner {
    Write-Host "========================================" -ForegroundColor $Colors.Purple
    Write-Host "🔱  GOD Application Deployment  🔱" -ForegroundColor $Colors.Purple
    Write-Host "   Deploy with Divine Authority" -ForegroundColor $Colors.Purple
    Write-Host "========================================" -ForegroundColor $Colors.Purple
    Write-Host ""
}

# Write colored message
function Write-ColoredMessage {
    param([string]$Color, [string]$Message)
    Write-Host $Message -ForegroundColor $Color
}

# Write step
function Write-Step {
    param([string]$Message)
    Write-Host "➜ $Message" -ForegroundColor $Colors.Cyan
}

# Write success
function Write-SuccessMessage {
    param([string]$Message)
    Write-Host "[OK] $Message" -ForegroundColor $Colors.Green
}

# Write error
function Write-ErrorMessage {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor $Colors.Red
}

# Write warning
function Write-WarningMessage {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor $Colors.Yellow
}

# Check if command exists
function Test-CommandExists {
    param([string]$Command)
    $null -ne (Get-Command $Command -ErrorAction SilentlyContinue)
}

# Check prerequisites
function Test-Prerequisites {
    Write-Step "Checking prerequisites..."
    
    $missingDeps = @()
    
    if (-not (Test-CommandExists 'node')) {
        $missingDeps += 'node'
    }
    
    if (-not (Test-CommandExists 'npm')) {
        $missingDeps += 'npm'
    }
    
    if ($missingDeps.Count -gt 0) {
        Write-ErrorMessage "Missing required dependencies: $($missingDeps -join ', ')"
        Write-ColoredMessage $Colors.Yellow "Please install the missing dependencies and try again."
        exit 1
    }
    
    Write-SuccessMessage "All prerequisites satisfied"
}

# Run tests
function Invoke-Tests {
    Write-Step "Running tests..."
    
    try {
        npm test
        Write-SuccessMessage "All tests passed"
    }
    catch {
        Write-ErrorMessage "Tests failed"
        $response = Read-Host "Continue anyway? (y/N)"
        if ($response -ne 'y' -and $response -ne 'Y') {
            exit 1
        }
    }
}

# Create dist directory
function New-DistDirectory {
    Write-Step "Creating production build..."
    
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
    
    Write-SuccessMessage "Production build created in dist/"
}

# Deploy locally
function Invoke-LocalDeployment {
    Write-Step "Deploying locally..."
    
    # Install dependencies
    npm install
    
    # Start server
    Write-SuccessMessage "Starting local server..."
    Write-ColoredMessage $Colors.Green "Server will start on http://localhost:3000"
    Write-ColoredMessage $Colors.Yellow "Press Ctrl+C to stop the server"
    npm start
}

# Deploy with Docker
function Invoke-DockerDeployment {
    Write-Step "Deploying with Docker..."
    
    if (-not (Test-CommandExists 'docker')) {
        Write-ErrorMessage "Docker is not installed"
        exit 1
    }
    
    # Determine docker-compose command
    $composeCmd = if (Test-CommandExists 'docker-compose') {
        'docker-compose'
    } else {
        # Check if docker compose plugin is available
        try {
            $null = docker compose version 2>&1
            'docker compose'
        }
        catch {
            Write-ErrorMessage "Docker Compose is not available"
            exit 1
        }
    }
    
    # Stop existing containers
    Write-Step "Stopping existing containers..."
    & $composeCmd -f docker-compose.production.yml down 2>&1 | Out-Null
    
    # Build and start containers
    Write-Step "Building Docker image..."
    & $composeCmd -f docker-compose.production.yml build
    
    Write-Step "Starting containers..."
    & $composeCmd -f docker-compose.production.yml up -d
    
    # Wait for health check
    Write-Step "Waiting for application to be healthy..."
    Start-Sleep -Seconds 5
    
    # Check health
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000/health" -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            Write-SuccessMessage "Application is healthy!"
            Write-ColoredMessage $Colors.Green "Access the application at: http://localhost:3000"
        }
    }
    catch {
        Write-WarningMessage "Health check failed, but container is running"
        Write-ColoredMessage $Colors.Yellow "Check logs with: $composeCmd -f docker-compose.production.yml logs"
    }
    
    # Show container status
    Write-Step "Container status:"
    & $composeCmd -f docker-compose.production.yml ps
}

# Deploy with Docker + Nginx
function Invoke-DockerNginxDeployment {
    Write-Step "Deploying with Docker + Nginx..."
    
    if (-not (Test-CommandExists 'docker')) {
        Write-ErrorMessage "Docker is not installed"
        exit 1
    }
    
    # Determine docker-compose command
    $composeCmd = if (Test-CommandExists 'docker-compose') {
        'docker-compose'
    } else {
        # Check if docker compose plugin is available
        try {
            $null = docker compose version 2>&1
            'docker compose'
        }
        catch {
            Write-ErrorMessage "Docker Compose is not available"
            exit 1
        }
    }
    
    # Stop existing containers
    Write-Step "Stopping existing containers..."
    & $composeCmd -f docker-compose.production.yml --profile with-nginx down 2>&1 | Out-Null
    
    # Build and start containers with nginx profile
    Write-Step "Building Docker images..."
    & $composeCmd -f docker-compose.production.yml --profile with-nginx build
    
    Write-Step "Starting containers with Nginx..."
    & $composeCmd -f docker-compose.production.yml --profile with-nginx up -d
    
    # Wait for health check
    Write-Step "Waiting for application to be healthy..."
    Start-Sleep -Seconds 5
    
    # Check health
    try {
        $response = Invoke-WebRequest -Uri "http://localhost/health" -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            Write-SuccessMessage "Application is healthy!"
            Write-ColoredMessage $Colors.Green "Access the application at: http://localhost"
        }
    }
    catch {
        Write-WarningMessage "Health check failed, but containers are running"
        Write-ColoredMessage $Colors.Yellow "Check logs with: $composeCmd -f docker-compose.production.yml --profile with-nginx logs"
    }
    
    # Show container status
    Write-Step "Container status:"
    & $composeCmd -f docker-compose.production.yml --profile with-nginx ps
}

# Deploy to GitHub Pages
function Publish-ToGitHubPages {
    Write-Step "Deploying to GitHub Pages..."
    
    # Check if gh-pages is installed
    try {
        $null = npm list gh-pages 2>&1
        $ghPagesInstalled = $true
    }
    catch {
        $ghPagesInstalled = $false
    }
    
    if (-not $ghPagesInstalled) {
        Write-Step "Installing gh-pages..."
        npm install --save-dev gh-pages
    }
    
    # Create dist directory
    New-DistDirectory
    
    # Deploy to GitHub Pages
    Write-Step "Publishing to GitHub Pages..."
    npm run deploy
    
    Write-SuccessMessage "Deployed to GitHub Pages!"
    Write-ColoredMessage $Colors.Green "Your site will be available at: https://your-username.github.io/direct-contact-with-god"
}

# Show deployment status
function Show-Status {
    Write-Step "Checking deployment status..."
    
    # Determine docker-compose command
    $composeCmd = if (Test-CommandExists 'docker-compose') {
        'docker-compose'
    } else {
        # Check if docker compose plugin is available
        try {
            $null = docker compose version 2>&1
            'docker compose'
        }
        catch {
            Write-WarningMessage "Docker Compose is not available"
            return
        }
    }
    
    # Check if containers are running
    $containers = & $composeCmd -f docker-compose.production.yml ps
    if ($containers -match "Up") {
        Write-SuccessMessage "Docker containers are running"
        & $composeCmd -f docker-compose.production.yml ps
        
        # Check health
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:3000/health" -UseBasicParsing
            if ($response.StatusCode -eq 200) {
                Write-SuccessMessage "Application health check passed"
                $response.Content | ConvertFrom-Json | ConvertTo-Json
            }
        }
        catch {
            Write-WarningMessage "Application health check failed"
        }
    }
    else {
        Write-WarningMessage "No Docker containers are running"
    }
}

# Stop deployment
function Stop-Deployment {
    Write-Step "Stopping deployment..."
    
    # Determine docker-compose command
    $composeCmd = if (Test-CommandExists 'docker-compose') {
        'docker-compose'
    } else {
        # Check if docker compose plugin is available
        try {
            $null = docker compose version 2>&1
            'docker compose'
        }
        catch {
            Write-WarningMessage "Docker Compose is not available"
            return
        }
    }
    
    & $composeCmd -f docker-compose.production.yml down
    Write-SuccessMessage "Deployment stopped"
}

# View logs
function Show-Logs {
    Write-Step "Viewing logs..."
    
    # Determine docker-compose command
    $composeCmd = if (Test-CommandExists 'docker-compose') {
        'docker-compose'
    } else {
        # Check if docker compose plugin is available
        try {
            $null = docker compose version 2>&1
            'docker compose'
        }
        catch {
            Write-ErrorMessage "Docker Compose is not available"
            exit 1
        }
    }
    
    & $composeCmd -f docker-compose.production.yml logs -f
}

# Show help
function Show-HelpMessage {
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
    Write-Banner
    
    switch ($Command) {
        'local' {
            Test-Prerequisites
            Invoke-Tests
            Invoke-LocalDeployment
        }
        'docker' {
            Test-Prerequisites
            Invoke-Tests
            Invoke-DockerDeployment
        }
        'docker-nginx' {
            Test-Prerequisites
            Invoke-Tests
            Invoke-DockerNginxDeployment
        }
        'github-pages' {
            Test-Prerequisites
            Invoke-Tests
            Publish-ToGitHubPages
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
            Show-HelpMessage
        }
        default {
            Write-ErrorMessage "Unknown command: $Command"
            Write-Host ""
            Show-HelpMessage
            exit 1
        }
    }
}

# Run main function
Main
