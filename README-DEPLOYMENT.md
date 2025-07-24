# Mailbutler Clone - Deployment Guide

This guide provides comprehensive instructions for deploying the Mailbutler Clone application on EC2 Ubuntu instances.

## 🚀 Quick Start

### Method 1: Standard Deployment (Recommended)

```bash
# Make the script executable
chmod +x deploy.sh

# Basic deployment
./deploy.sh

# With custom domain
./deploy.sh --domain mailbutler.example.com

# With SSL certificate
./deploy.sh --domain mailbutler.example.com --ssl

# Custom port
./deploy.sh --port 3000
```

### Method 2: Docker Deployment

```bash
# Make the script executable
chmod +x docker-deploy.sh

# Deploy with Docker
./docker-deploy.sh
```

## 📋 Prerequisites

- Ubuntu 20.04 or 22.04 LTS
- Minimum 1GB RAM (2GB recommended)
- 10GB free disk space
- Root or sudo access
- Internet connection

## 🔧 What the Deployment Script Does

### System Setup
- ✅ Updates system packages
- ✅ Installs Node.js 18
- ✅ Installs PM2 process manager
- ✅ Installs and configures Nginx
- ✅ Sets up UFW firewall
- ✅ Installs additional dependencies

### Application Deployment
- ✅ Builds the React application
- ✅ Configures PM2 for process management
- ✅ Sets up Nginx reverse proxy
- ✅ Configures SSL (optional)
- ✅ Creates management scripts

### Security Features
- ✅ Firewall configuration
- ✅ Security headers in Nginx
- ✅ SSL/TLS encryption (optional)
- ✅ Process isolation with PM2

## 🛠️ Manual Deployment Steps

If you prefer to deploy manually, follow these steps:

### 1. System Preparation

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install nginx -y
```

### 2. Application Setup

```bash
# Clone repository
git clone <your-repo-url>
cd mailbutler-clone

# Install dependencies
npm install

# Build application
npm run build

# Start with PM2
pm2 start npm --name "mailbutler-clone" -- run preview
pm2 startup
pm2 save
```

### 3. Nginx Configuration

```bash
# Create Nginx config
sudo nano /etc/nginx/sites-available/mailbutler-clone
```

Add the configuration from the deployment script, then:

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/mailbutler-clone /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 🔒 SSL Certificate Setup

### Using Let's Encrypt (Free)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get certificate
sudo certbot --nginx -d your-domain.com
```

### Using Custom Certificate

```bash
# Copy your certificate files
sudo cp your-cert.crt /etc/ssl/certs/
sudo cp your-private.key /etc/ssl/private/

# Update Nginx configuration
sudo nano /etc/nginx/sites-available/mailbutler-clone
```

## 📊 Monitoring and Management

### Management Scripts

After deployment, you'll have these scripts available:

- `./status.sh` - Check application and system status
- `./restart-app.sh` - Restart the application
- `./update-app.sh` - Update application from git
- `./view-logs.sh` - View application logs

### Manual Commands

```bash
# PM2 commands
pm2 status                    # Check PM2 processes
pm2 logs mailbutler-clone     # View logs
pm2 restart mailbutler-clone  # Restart app
pm2 stop mailbutler-clone     # Stop app

# Nginx commands
sudo systemctl status nginx   # Check Nginx status
sudo systemctl restart nginx # Restart Nginx
sudo nginx -t                 # Test configuration

# System monitoring
htop                          # System resources
df -h                         # Disk usage
free -h                       # Memory usage
```

## 🐳 Docker Deployment

### Benefits of Docker Deployment
- Consistent environment across different systems
- Easy scaling and container management
- Isolated application environment
- Simplified updates and rollbacks

### Docker Commands

```bash
# Build and start
docker-compose up -d --build

# View logs
docker-compose logs -f

# Restart containers
docker-compose restart

# Stop containers
docker-compose down

# Update application
git pull && docker-compose up -d --build
```

## 🔧 Troubleshooting

### Common Issues

**Port already in use:**
```bash
sudo lsof -i :4173
sudo kill -9 <PID>
```

**Nginx configuration errors:**
```bash
sudo nginx -t
sudo tail -f /var/log/nginx/error.log
```

**PM2 process issues:**
```bash
pm2 delete mailbutler-clone
pm2 start npm --name "mailbutler-clone" -- run preview
```

**SSL certificate issues:**
```bash
sudo certbot renew --dry-run
sudo systemctl restart nginx
```

### Log Locations

- Application logs: `pm2 logs mailbutler-clone`
- Nginx access logs: `/var/log/nginx/access.log`
- Nginx error logs: `/var/log/nginx/error.log`
- System logs: `journalctl -u nginx`

## 🚀 Performance Optimization

### Nginx Optimizations

The deployment script includes several optimizations:
- Gzip compression
- Static file caching
- Security headers
- Proper proxy settings

### PM2 Optimizations

- Automatic restart on crashes
- Memory limit monitoring
- Log rotation
- Cluster mode (can be enabled)

### System Optimizations

```bash
# Increase file limits
echo "* soft nofile 65536" | sudo tee -a /etc/security/limits.conf
echo "* hard nofile 65536" | sudo tee -a /etc/security/limits.conf

# Optimize TCP settings
echo "net.core.somaxconn = 65536" | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

## 📈 Scaling Considerations

### Horizontal Scaling
- Use Application Load Balancer (ALB)
- Deploy multiple EC2 instances
- Configure PM2 cluster mode
- Use shared session storage (Redis)

### Vertical Scaling
- Increase EC2 instance size
- Add more CPU/RAM
- Optimize database queries
- Use CDN for static assets

## 🔐 Security Best Practices

1. **Keep system updated**: Regular security updates
2. **Use SSL/TLS**: Always encrypt traffic
3. **Configure firewall**: Limit open ports
4. **Regular backups**: Backup application and data
5. **Monitor logs**: Watch for suspicious activity
6. **Use strong passwords**: For all accounts
7. **Limit sudo access**: Only necessary users

## 📞 Support

If you encounter issues during deployment:

1. Check the logs using the provided scripts
2. Verify all prerequisites are met
3. Ensure proper file permissions
4. Check firewall and security group settings
5. Verify DNS configuration (if using custom domain)

For additional help, refer to the troubleshooting section or check the application logs.