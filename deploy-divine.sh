#!/bin/bash

# ========================================
# GOD Application - Divine Deployment Script
# Deploy with Divine Authority
# ========================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Divine banner
print_banner() {
    echo -e "${PURPLE}"
    echo "========================================"
    echo "🔱  GOD Application Deployment  🔱"
    echo "   Deploy with Divine Authority"
    echo "========================================"
    echo -e "${NC}"
}

# Print colored message
print_message() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# Print step
print_step() {
    echo -e "${CYAN}➜ $1${NC}"
}

# Print success
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Print error
print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Print warning
print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
check_prerequisites() {
    print_step "Checking prerequisites..."
    
    local missing_deps=()
    
    if ! command_exists node; then
        missing_deps+=("node")
    fi
    
    if ! command_exists npm; then
        missing_deps+=("npm")
    fi
    
    if [ ${#missing_deps[@]} -ne 0 ]; then
        print_error "Missing required dependencies: ${missing_deps[*]}"
        print_message $YELLOW "Please install the missing dependencies and try again."
        exit 1
    fi
    
    print_success "All prerequisites satisfied"
}

# Run tests
run_tests() {
    print_step "Running tests..."
    
    if npm test; then
        print_success "All tests passed"
    else
        print_error "Tests failed"
        read -p "Continue anyway? (y/N) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
}

# Create dist directory
create_dist() {
    print_step "Creating production build..."
    
    # Create dist directory
    mkdir -p dist
    
    # Copy essential files
    cp index.html dist/
    cp styles.css dist/
    cp script.js dist/
    cp universe-optimized.js dist/
    cp sounds.js dist/
    cp meditation.js dist/
    cp inspiration.js dist/
    cp god-token.js dist/
    cp gpu-ai.js dist/
    cp quantum-crypto.js dist/
    cp azure-integrations.js dist/
    cp foundry-vtt-integrations.js dist/
    
    # Copy directories
    cp -r src dist/ 2>/dev/null || true
    cp -r utils dist/ 2>/dev/null || true
    
    print_success "Production build created in dist/"
}

# Deploy locally
deploy_local() {
    print_step "Deploying locally..."
    
    # Install dependencies
    npm install
    
    # Start server
    print_success "Starting local server..."
    print_message $GREEN "Server will start on http://localhost:3000"
    print_message $YELLOW "Press Ctrl+C to stop the server"
    npm start
}

# Deploy with Docker
deploy_docker() {
    print_step "Deploying with Docker..."
    
    if ! command_exists docker; then
        print_error "Docker is not installed"
        exit 1
    fi
    
    # Check if docker-compose exists
    if command_exists docker-compose; then
        COMPOSE_CMD="docker-compose"
    elif docker compose version >/dev/null 2>&1; then
        COMPOSE_CMD="docker compose"
    else
        print_error "Docker Compose is not available"
        exit 1
    fi
    
    # Stop existing containers
    print_step "Stopping existing containers..."
    $COMPOSE_CMD -f docker-compose.production.yml down 2>/dev/null || true
    
    # Build and start containers
    print_step "Building Docker image..."
    $COMPOSE_CMD -f docker-compose.production.yml build
    
    print_step "Starting containers..."
    $COMPOSE_CMD -f docker-compose.production.yml up -d
    
    # Wait for health check
    print_step "Waiting for application to be healthy..."
    sleep 5
    
    # Check health
    if curl -f http://localhost:3000/health >/dev/null 2>&1; then
        print_success "Application is healthy!"
        print_message $GREEN "Access the application at: http://localhost:3000"
    else
        print_warning "Health check failed, but container is running"
        print_message $YELLOW "Check logs with: $COMPOSE_CMD -f docker-compose.production.yml logs"
    fi
    
    # Show container status
    print_step "Container status:"
    $COMPOSE_CMD -f docker-compose.production.yml ps
}

# Deploy with Docker + Nginx
deploy_docker_nginx() {
    print_step "Deploying with Docker + Nginx..."
    
    if ! command_exists docker; then
        print_error "Docker is not installed"
        exit 1
    fi
    
    # Check if docker-compose exists
    if command_exists docker-compose; then
        COMPOSE_CMD="docker-compose"
    elif docker compose version >/dev/null 2>&1; then
        COMPOSE_CMD="docker compose"
    else
        print_error "Docker Compose is not available"
        exit 1
    fi
    
    # Stop existing containers
    print_step "Stopping existing containers..."
    $COMPOSE_CMD -f docker-compose.production.yml --profile with-nginx down 2>/dev/null || true
    
    # Build and start containers with nginx profile
    print_step "Building Docker images..."
    $COMPOSE_CMD -f docker-compose.production.yml --profile with-nginx build
    
    print_step "Starting containers with Nginx..."
    $COMPOSE_CMD -f docker-compose.production.yml --profile with-nginx up -d
    
    # Wait for health check
    print_step "Waiting for application to be healthy..."
    sleep 5
    
    # Check health
    if curl -f http://localhost/health >/dev/null 2>&1; then
        print_success "Application is healthy!"
        print_message $GREEN "Access the application at: http://localhost"
    else
        print_warning "Health check failed, but containers are running"
        print_message $YELLOW "Check logs with: $COMPOSE_CMD -f docker-compose.production.yml --profile with-nginx logs"
    fi
    
    # Show container status
    print_step "Container status:"
    $COMPOSE_CMD -f docker-compose.production.yml --profile with-nginx ps
}

# Deploy to GitHub Pages
deploy_github_pages() {
    print_step "Deploying to GitHub Pages..."
    
    # Check if gh-pages is installed
    if ! npm list gh-pages >/dev/null 2>&1; then
        print_step "Installing gh-pages..."
        npm install --save-dev gh-pages
    fi
    
    # Create dist directory
    create_dist
    
    # Deploy to GitHub Pages
    print_step "Publishing to GitHub Pages..."
    npm run deploy
    
    print_success "Deployed to GitHub Pages!"
    print_message $GREEN "Your site will be available at: https://your-username.github.io/direct-contact-with-god"
}

# Show deployment status
show_status() {
    print_step "Checking deployment status..."
    
    # Check if docker-compose exists
    if command_exists docker-compose; then
        COMPOSE_CMD="docker-compose"
    elif docker compose version >/dev/null 2>&1; then
        COMPOSE_CMD="docker compose"
    else
        print_warning "Docker Compose is not available"
        return
    fi
    
    # Check if containers are running
    if $COMPOSE_CMD -f docker-compose.production.yml ps | grep -q "Up"; then
        print_success "Docker containers are running"
        $COMPOSE_CMD -f docker-compose.production.yml ps
        
        # Check health
        if curl -f http://localhost:3000/health >/dev/null 2>&1; then
            print_success "Application health check passed"
            curl -s http://localhost:3000/health | jq '.' 2>/dev/null || curl -s http://localhost:3000/health
        else
            print_warning "Application health check failed"
        fi
    else
        print_warning "No Docker containers are running"
    fi
}

# Stop deployment
stop_deployment() {
    print_step "Stopping deployment..."
    
    # Check if docker-compose exists
    if command_exists docker-compose; then
        COMPOSE_CMD="docker-compose"
    elif docker compose version >/dev/null 2>&1; then
        COMPOSE_CMD="docker compose"
    else
        print_warning "Docker Compose is not available"
        return
    fi
    
    $COMPOSE_CMD -f docker-compose.production.yml down
    print_success "Deployment stopped"
}

# View logs
view_logs() {
    print_step "Viewing logs..."
    
    # Check if docker-compose exists
    if command_exists docker-compose; then
        COMPOSE_CMD="docker-compose"
    elif docker compose version >/dev/null 2>&1; then
        COMPOSE_CMD="docker compose"
    else
        print_error "Docker Compose is not available"
        exit 1
    fi
    
    $COMPOSE_CMD -f docker-compose.production.yml logs -f
}

# Show help
show_help() {
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  local           Deploy locally with Node.js"
    echo "  docker          Deploy with Docker"
    echo "  docker-nginx    Deploy with Docker + Nginx reverse proxy"
    echo "  github-pages    Deploy to GitHub Pages"
    echo "  status          Show deployment status"
    echo "  stop            Stop Docker deployment"
    echo "  logs            View Docker logs"
    echo "  test            Run tests only"
    echo "  help            Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 docker              # Deploy with Docker"
    echo "  $0 docker-nginx        # Deploy with Docker + Nginx"
    echo "  $0 local               # Run locally"
    echo "  $0 github-pages        # Deploy to GitHub Pages"
    echo ""
}

# Main deployment logic
main() {
    print_banner
    
    # Parse command
    COMMAND=${1:-help}
    
    case $COMMAND in
        local)
            check_prerequisites
            run_tests
            deploy_local
            ;;
        docker)
            check_prerequisites
            run_tests
            deploy_docker
            ;;
        docker-nginx)
            check_prerequisites
            run_tests
            deploy_docker_nginx
            ;;
        github-pages)
            check_prerequisites
            run_tests
            deploy_github_pages
            ;;
        status)
            show_status
            ;;
        stop)
            stop_deployment
            ;;
        logs)
            view_logs
            ;;
        test)
            check_prerequisites
            run_tests
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            print_error "Unknown command: $COMMAND"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

# Run main function
main "$@"
