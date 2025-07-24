#!/bin/bash

# Docker Deployment Script for Mailbutler Clone
# Usage: ./docker-deploy.sh [options]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

APP_NAME="mailbutler-clone"
CONTAINER_NAME="mailbutler-app"
IMAGE_TAG="latest"
HOST_PORT=80
CONTAINER_PORT=4173

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to install Docker
install_docker() {
    print_status "Installing Docker..."
    
    if command -v docker &> /dev/null; then
        print_success "Docker is already installed"
        return
    fi
    
    # Update package index
    sudo apt-get update
    
    # Install packages to allow apt to use a repository over HTTPS
    sudo apt-get install -y \
        ca-certificates \
        curl \
        gnupg \
        lsb-release
    
    # Add Docker's official GPG key
    sudo mkdir -p /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    
    # Set up the repository
    echo \
        "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
        $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    # Install Docker Engine
    sudo apt-get update
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
    
    # Add user to docker group
    sudo usermod -aG docker $USER
    
    print_success "Docker installed successfully"
    print_status "Please log out and log back in for group changes to take effect"
}

# Function to create Dockerfile
create_dockerfile() {
    print_status "Creating Dockerfile..."
    
    cat > Dockerfile << 'EOF'
# Multi-stage build for production
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Install serve to run the built application
RUN npm install -g serve

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Change ownership of the app directory
RUN chown -R nextjs:nodejs /app
USER nextjs

# Expose port
EXPOSE 4173

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:4173/ || exit 1

# Start the application
CMD ["serve", "-s", "dist", "-l", "4173"]
EOF

    print_success "Dockerfile created successfully"
}

# Function to create docker-compose file
create_docker_compose() {
    print_status "Creating docker-compose.yml..."
    
    cat > docker-compose.yml << EOF
version: '3.8'

services:
  mailbutler-clone:
    build: .
    container_name: $CONTAINER_NAME
    ports:
      - "$HOST_PORT:$CONTAINER_PORT"
    restart: unless-stopped
    environment:
      - NODE_ENV=production
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:$CONTAINER_PORT"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    networks:
      - mailbutler-network

  nginx:
    image: nginx:alpine
    container_name: mailbutler-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - mailbutler-clone
    restart: unless-stopped
    networks:
      - mailbutler-network

networks:
  mailbutler-network:
    driver: bridge
EOF

    print_success "docker-compose.yml created successfully"
}

# Function to create Nginx configuration for Docker
create_nginx_config() {
    print_status "Creating Nginx configuration..."
    
    cat > nginx.conf << EOF
events {
    worker_connections 1024;
}

http {
    upstream mailbutler {
        server mailbutler-clone:$CONTAINER_PORT;
    }

    server {
        listen 80;
        server_name _;

        location / {
            proxy_pass http://mailbutler;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
        }
    }
}
EOF

    print_success "Nginx configuration created successfully"
}

# Function to build and deploy
deploy_with_docker() {
    print_status "Building and deploying with Docker..."
    
    # Stop and remove existing containers
    docker-compose down 2>/dev/null || true
    
    # Build and start containers
    docker-compose up -d --build
    
    print_success "Application deployed successfully with Docker"
}

# Function to create management scripts for Docker
create_docker_scripts() {
    print_status "Creating Docker management scripts..."
    
    # Docker restart script
    cat > docker-restart.sh << 'EOF'
#!/bin/bash
echo "Restarting Mailbutler Clone containers..."
docker-compose restart
echo "Containers restarted successfully!"
EOF

    # Docker update script
    cat > docker-update.sh << 'EOF'
#!/bin/bash
echo "Updating Mailbutler Clone..."
git pull
docker-compose down
docker-compose up -d --build
echo "Application updated successfully!"
EOF

    # Docker logs script
    cat > docker-logs.sh << 'EOF'
#!/bin/bash
echo "Viewing application logs (Press Ctrl+C to exit)..."
docker-compose logs -f mailbutler-clone
EOF

    # Docker status script
    cat > docker-status.sh << 'EOF'
#!/bin/bash
echo "=== Container Status ==="
docker-compose ps
echo ""
echo "=== Container Stats ==="
docker stats --no-stream
EOF

    chmod +x docker-restart.sh docker-update.sh docker-logs.sh docker-status.sh
    
    print_success "Docker management scripts created successfully"
}

# Main function
main() {
    print_status "Starting Docker deployment for Mailbutler Clone..."
    
    install_docker
    create_dockerfile
    create_docker_compose
    create_nginx_config
    deploy_with_docker
    create_docker_scripts
    
    print_success "🎉 Docker deployment completed successfully!"
    echo ""
    echo "=== Docker Management Commands ==="
    echo "View status:     ./docker-status.sh"
    echo "View logs:       ./docker-logs.sh"
    echo "Restart:         ./docker-restart.sh"
    echo "Update:          ./docker-update.sh"
    echo ""
    echo "=== Manual Docker Commands ==="
    echo "View containers: docker-compose ps"
    echo "View logs:       docker-compose logs -f"
    echo "Restart:         docker-compose restart"
    echo "Stop:            docker-compose down"
    echo "Rebuild:         docker-compose up -d --build"
}

main "$@"