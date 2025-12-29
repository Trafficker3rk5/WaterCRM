#!/bin/bash

# Script to setup wildcard SSL certificate for *.waascrm.com
# This requires DNS validation (adding a TXT record to your DNS)

echo "=========================================="
echo "Wildcard SSL Certificate Setup"
echo "=========================================="
echo ""
echo "This script will help you get a wildcard SSL certificate for *.waascrm.com"
echo "You will need to add a DNS TXT record to your domain's DNS settings."
echo ""
echo "Press Enter to continue..."
read

# Get the certificate with DNS challenge
echo "Starting certificate request..."
echo "When prompted, you will need to add a TXT record to your DNS:"
echo "  - Record type: TXT"
echo "  - Name: _acme-challenge.waascrm.com"
echo "  - Value: (will be provided by certbot)"
echo ""
echo "Press Enter when you're ready to start..."
read

# Request certificate with manual DNS challenge
sudo certbot certonly --manual --preferred-challenges dns \
    -d "*.waascrm.com" \
    -d "waascrm.com" \
    --email admin@waascrm.com \
    --agree-tos \
    --expand

echo ""
echo "=========================================="
echo "Certificate obtained!"
echo "=========================================="
echo ""
echo "Now updating nginx configuration..."

# The certificate will be at: /etc/letsencrypt/live/waascrm.com-0001/ (or similar)
# We need to update nginx to use this certificate

echo "Please check the certificate path and update nginx configuration manually,"
echo "or run the nginx configuration update script."

