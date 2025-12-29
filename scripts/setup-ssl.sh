#!/bin/bash

###############################################################################
# WaterCRM - Automated SSL/HTTPS Setup Script
# This script automatically configures SSL certificates using Let's Encrypt
###############################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}"
echo "=========================================="
echo "  WaterCRM SSL/HTTPS Setup Script"
echo "=========================================="
echo -e "${NC}"

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}Error: This script must be run as root${NC}"
    echo "Please run: sudo bash scripts/setup-ssl.sh"
    exit 1
fi

# Prompt for domain name
echo -e "${YELLOW}Please enter your domain name (e.g., crm.example.com):${NC}"
read -p "Domain: " DOMAIN

if [ -z "$DOMAIN" ]; then
    echo -e "${RED}Error: Domain name is required${NC}"
    exit 1
fi

# Prompt for email
echo -e "${YELLOW}Please enter your email for SSL certificate notifications:${NC}"
read -p "Email: " EMAIL

if [ -z "$EMAIL" ]; then
    echo -e "${RED}Error: Email is required${NC}"
    exit 1
fi

# Detect web server
WEBSERVER=""
if command -v nginx &> /dev/null; then
    WEBSERVER="nginx"
elif command -v apache2 &> /dev/null; then
    WEBSERVER="apache"
else
    echo -e "${RED}Error: Neither Nginx nor Apache detected${NC}"
    echo "Please install a web server first"
    exit 1
fi

echo -e "${GREEN}Detected web server: $WEBSERVER${NC}"

# Install certbot if not present
echo -e "${GREEN}Checking for certbot...${NC}"
if ! command -v certbot &> /dev/null; then
    echo -e "${YELLOW}Installing certbot...${NC}"

    if [ -f /etc/debian_version ]; then
        # Debian/Ubuntu
        apt-get update
        apt-get install -y certbot python3-certbot-$WEBSERVER
    elif [ -f /etc/redhat-release ]; then
        # RHEL/CentOS
        yum install -y certbot python3-certbot-$WEBSERVER
    else
        echo -e "${RED}Error: Unsupported OS. Please install certbot manually.${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}Certbot already installed${NC}"
fi

# Get current project directory
PROJECT_DIR=$(dirname "$(dirname "$(readlink -f "$0")")")
echo -e "${GREEN}Project directory: $PROJECT_DIR${NC}"

# Backup current web server config
echo -e "${YELLOW}Backing up current configuration...${NC}"
if [ "$WEBSERVER" = "nginx" ]; then
    if [ -f "/etc/nginx/sites-available/watercrm" ]; then
        cp /etc/nginx/sites-available/watercrm /etc/nginx/sites-available/watercrm.backup.$(date +%Y%m%d_%H%M%S)
    fi
elif [ "$WEBSERVER" = "apache" ]; then
    if [ -f "/etc/apache2/sites-available/watercrm.conf" ]; then
        cp /etc/apache2/sites-available/watercrm.conf /etc/apache2/sites-available/watercrm.conf.backup.$(date +%Y%m%d_%H%M%S)
    fi
fi

# Obtain SSL certificate
echo -e "${GREEN}Obtaining SSL certificate from Let's Encrypt...${NC}"
if [ "$WEBSERVER" = "nginx" ]; then
    certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos --email "$EMAIL" --redirect
elif [ "$WEBSERVER" = "apache" ]; then
    certbot --apache -d "$DOMAIN" --non-interactive --agree-tos --email "$EMAIL" --redirect
fi

# Update Laravel .env for HTTPS
echo -e "${YELLOW}Updating Laravel .env configuration...${NC}"
cd "$PROJECT_DIR"

if [ -f ".env" ]; then
    # Update APP_URL to use HTTPS
    if grep -q "^APP_URL=" .env; then
        sed -i "s|^APP_URL=.*|APP_URL=https://$DOMAIN|" .env
    else
        echo "APP_URL=https://$DOMAIN" >> .env
    fi

    # Set SESSION_SECURE_COOKIE to true
    if grep -q "^SESSION_SECURE_COOKIE=" .env; then
        sed -i "s|^SESSION_SECURE_COOKIE=.*|SESSION_SECURE_COOKIE=true|" .env
    else
        echo "SESSION_SECURE_COOKIE=true" >> .env
    fi

    # Set FORCE_HTTPS to true
    if grep -q "^FORCE_HTTPS=" .env; then
        sed -i "s|^FORCE_HTTPS=.*|FORCE_HTTPS=true|" .env
    else
        echo "FORCE_HTTPS=true" >> .env
    fi

    echo -e "${GREEN}Laravel .env updated for HTTPS${NC}"
else
    echo -e "${RED}Warning: .env file not found${NC}"
fi

# Clear Laravel cache
echo -e "${YELLOW}Clearing Laravel cache...${NC}"
php artisan config:clear
php artisan cache:clear
php artisan route:clear

# Setup auto-renewal cron job
echo -e "${YELLOW}Setting up automatic SSL renewal...${NC}"
CRON_CMD="0 0,12 * * * /usr/bin/certbot renew --quiet"
if ! crontab -l 2>/dev/null | grep -q "certbot renew"; then
    (crontab -l 2>/dev/null; echo "$CRON_CMD") | crontab -
    echo -e "${GREEN}Auto-renewal cron job created${NC}"
else
    echo -e "${GREEN}Auto-renewal cron job already exists${NC}"
fi

# Test configuration
echo -e "${GREEN}Testing SSL configuration...${NC}"
if [ "$WEBSERVER" = "nginx" ]; then
    nginx -t && systemctl reload nginx
elif [ "$WEBSERVER" = "apache" ]; then
    apache2ctl configtest && systemctl reload apache2
fi

echo -e "${GREEN}"
echo "=========================================="
echo "  SSL/HTTPS Setup Complete!"
echo "=========================================="
echo -e "${NC}"
echo -e "${GREEN}Your WaterCRM is now accessible at: https://$DOMAIN${NC}"
echo -e "${YELLOW}SSL certificate will auto-renew every 60 days${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Test your site: https://$DOMAIN"
echo "2. Check SSL rating: https://www.ssllabs.com/ssltest/analyze.html?d=$DOMAIN"
echo "3. Update any API endpoints or webhooks to use HTTPS"
echo ""
echo -e "${GREEN}Done!${NC}"
