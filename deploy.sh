#!/bin/bash

# Mailbutler Clone Deployment Script
# Usage: ./deploy.sh [options]
# Options:
#   --domain DOMAIN     Set custom domain
#   --ssl              Enable SSL certificate
#   --port PORT        Set custom port (default: 4173)
#   --help             Show help

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default configuration
APP_NAME="mailbutler-clone"
APP_PORT=4173
DOMAIN=""
ENABLE_SSL=false
NODE_VERSION="18"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to show help
show_help() {
    cat << EOF
Mailbutler Clone Deployment Script

Usage: ./deploy.sh [options]

Options:
    --domain DOMAIN     Set custom domain (e.g., mailbutler.example.com)
    --ssl              Enable SSL certificate with Let's Encrypt
    --port PORT        Set custom port (default: 4173)
    --help             Show this help message

Examples:
    ./deploy.sh                                    # Basic deployment
    ./deploy.sh --domain mailbutler.example.com   # With custom domain
    ./deploy.sh --domain example.com --ssl        # With SSL
    ./deploy.sh --port 3000                       # Custom port

EOF
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --domain)
            DOMAIN="$2"
            shift 2
            ;;
        --ssl)
            ENABLE_SSL=true
            shift
            ;;
        --port)
            APP_PORT="$2"
            shift 2
            ;;
        --help)
            show_help
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Function to check if running as root
check_root() {
    if [[ $EUID -eq 0 ]]; then
        print_error "This script should not be run as root"
        exit 1
    fi
}

# Function to check if we're on Ubuntu
check_ubuntu() {
    if ! grep -q "Ubuntu" /etc/os-release; then
        print_error "This script is designed for Ubuntu systems"
        exit 1
    fi
}

# Function to update system
update_system() {
    print_status "Updating system packages..."
    sudo apt update && sudo apt upgrade -y
    print_success "System updated successfully"
}

# Function to install Node.js
install_nodejs() {
    print_status "Installing Node.js ${NODE_VERSION}..."
    
    # Check if Node.js is already installed
    if command -v node &> /dev/null; then
        NODE_CURRENT=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
        if [[ "$NODE_CURRENT" == "$NODE_VERSION" ]]; then
            print_success "Node.js ${NODE_VERSION} is already installed"
            return
        fi
    fi
    
    # Install Node.js
    curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | sudo -E bash -
    sudo apt-get install -y nodejs
    
    print_success "Node.js $(node --version) installed successfully"
}

# Function to install PM2
install_pm2() {
    print_status "Installing PM2..."
    
    if command -v pm2 &> /dev/null; then
        print_success "PM2 is already installed"
        return
    fi
    
    sudo npm install -g pm2
    print_success "PM2 installed successfully"
}

# Function to install Nginx
install_nginx() {
    print_status "Installing Nginx..."
    
    if systemctl is-active --quiet nginx; then
        print_success "Nginx is already installed and running"
        return
    fi
    
    sudo apt install nginx -y
    sudo systemctl start nginx
    sudo systemctl enable nginx
    
    print_success "Nginx installed and started successfully"
}

# Function to install dependencies
install_dependencies() {
    print_status "Installing additional dependencies..."
    sudo apt install -y git curl wget unzip htop ufw
    print_success "Dependencies installed successfully"
}

# Function to setup firewall
setup_firewall() {
    print_status "Configuring firewall..."
    
    # Enable UFW if not already enabled
    if ! sudo ufw status | grep -q "Status: active"; then
        sudo ufw --force enable
    fi
    
    # Allow necessary ports
    sudo ufw allow ssh
    sudo ufw allow 'Nginx Full'
    sudo ufw allow $APP_PORT
    
    print_success "Firewall configured successfully"
}

# Function to build application
build_application() {
    print_status "Building application..."
    
    if [[ ! -f "package.json" ]]; then
        print_error "package.json not found. Make sure you're in the project directory."
        exit 1
    fi
    
    # Install dependencies
    print_status "Installing npm dependencies..."
    npm install
    
    # Build the application
    print_status "Building production bundle..."
    npm run build
    
    print_success "Application built successfully"
}

# Function to setup PM2
setup_pm2() {
    print_status "Setting up PM2 process..."
    
    # Stop existing process if running
    pm2 delete $APP_NAME 2>/dev/null || true
    
    # Start the application
    pm2 start npm --name "$APP_NAME" -- run preview
    
    # Setup PM2 startup
    pm2 startup | grep -E '^sudo' | bash || true
    pm2 save
    
    print_success "PM2 configured successfully"
}

# Function to configure Nginx
configure_nginx() {
    print_status "Configuring Nginx..."
    
    # Get server IP if no domain provided
    if [[ -z "$DOMAIN" ]]; then
        SERVER_IP=$(curl -s http://checkip.amazonaws.com/ || curl -s http://ipinfo.io/ip)
        SERVER_NAME="$SERVER_IP"
    else
        SERVER_NAME="$DOMAIN"
    fi
    
    # Create Nginx configuration
    sudo tee /etc/nginx/sites-available/$APP_NAME > /dev/null << EOF
server {
    listen 80;
    server_name $SERVER_NAME;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss;

    location / {
        proxy_pass http://localhost:$APP_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # Timeout settings
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Static files caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        proxy_pass http://localhost:$APP_PORT;
        proxy_set_header Host \$host;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

    # Enable the site
    sudo ln -sf /etc/nginx/sites-available/$APP_NAME /etc/nginx/sites-enabled/
    
    # Remove default site if it exists
    sudo rm -f /etc/nginx/sites-enabled/default
    
    # Test Nginx configuration
    if sudo nginx -t; then
        sudo systemctl reload nginx
        print_success "Nginx configured successfully"
    else
        print_error "Nginx configuration test failed"
        exit 1
    fi
}

# Function to setup SSL
setup_ssl() {
    if [[ "$ENABLE_SSL" == "true" && -n "$DOMAIN" ]]; then
        print_status "Setting up SSL certificate..."
        
        # Install Certbot
        sudo apt install -y certbot python3-certbot-nginx
        
        # Get SSL certificate
        if sudo certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos --email admin@"$DOMAIN"; then
            print_success "SSL certificate installed successfully"
        else
            print_warning "SSL certificate installation failed, continuing without SSL"
        fi
    fi
}

# Function to create management scripts
create_management_scripts() {
    print_status "Creating management scripts..."
    
    # Create restart script
    cat > restart-app.sh << 'EOF'
#!/bin/bash
echo "Restarting Mailbutler Clone..."
pm2 restart mailbutler-clone
echo "Application restarted successfully!"
EOF

    # Create update script
    cat > update-app.sh << 'EOF'
#!/bin/bash
echo "Updating Mailbutler Clone..."
git pull
npm install
npm run build
pm2 restart mailbutler-clone
echo "Application updated successfully!"
EOF

    # Create logs script
    cat > view-logs.sh << 'EOF'
#!/bin/bash
echo "Viewing application logs (Press Ctrl+C to exit)..."
pm2 logs mailbutler-clone
EOF

    # Create status script
    cat > status.sh << 'EOF'
#!/bin/bash
echo "=== Application Status ==="
pm2 status
echo ""
echo "=== Nginx Status ==="
sudo systemctl status nginx --no-pager
echo ""
echo "=== System Resources ==="
free -h
df -h
EOF

    # Make scripts executable
    chmod +x restart-app.sh update-app.sh view-logs.sh status.sh
    
    print_success "Management scripts created successfully"
}

# Function to display deployment info
show_deployment_info() {
    print_success "🎉 Deployment completed successfully!"
    echo ""
    echo "=== Deployment Information ==="
    echo "Application Name: $APP_NAME"
    echo "Port: $APP_PORT"
    
    if [[ -n "$DOMAIN" ]]; then
        if [[ "$ENABLE_SSL" == "true" ]]; then
            echo "URL: https://$DOMAIN"
        else
            echo "URL: http://$DOMAIN"
        fi
    else
        SERVER_IP=$(curl -s http://checkip.amazonaws.com/ || curl -s http://ipinfo.io/ip)
        echo "URL: http://$SERVER_IP"
    fi
    
    echo ""
    echo "=== Management Commands ==="
    echo "View status:     ./status.sh"
    echo "View logs:       ./view-logs.sh"
    echo "Restart app:     ./restart-app.sh"
    echo "Update app:      ./update-app.sh"
    echo ""
    echo "=== Manual Commands ==="
    echo "PM2 status:      pm2 status"
    echo "PM2 logs:        pm2 logs $APP_NAME"
    echo "Nginx status:    sudo systemctl status nginx"
    echo "Restart Nginx:   sudo systemctl restart nginx"
    echo ""
    print_success "Your Mailbutler Clone is now live! 🚀"
}

# Main deployment function
main() {
    print_status "Starting Mailbutler Clone deployment..."
    
    # Pre-flight checks
    check_root
    check_ubuntu
    
    # System setup
    update_system
    install_dependencies
    install_nodejs
    install_pm2
    install_nginx
    setup_firewall
    
    # Application deployment
    build_application
    setup_pm2
    configure_nginx
    setup_ssl
    
    # Post-deployment
    create_management_scripts
    show_deployment_info
}

# Run main function
main "$@"