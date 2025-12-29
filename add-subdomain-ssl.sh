#!/bin/bash

# Script to add SSL certificate for additional subdomains
# Usage: ./add-subdomain-ssl.sh subdomain1 subdomain2 ...

if [ $# -eq 0 ]; then
    echo "Usage: $0 <subdomain1> [subdomain2] ..."
    echo "Example: $0 newtenant.waascrm.com anotherentity.waascrm.com"
    exit 1
fi

# Get current domains from certificate
CURRENT_DOMAINS=$(sudo certbot certificates 2>&1 | grep "Domains:" | sed 's/.*Domains: //' | tr ' ' '\n' | grep -v "^$")

# Build domain list
DOMAINS="waascrm.com www.waascrm.com"
for domain in $CURRENT_DOMAINS; do
    if [[ "$domain" != "waascrm.com" && "$domain" != "www.waascrm.com" ]]; then
        DOMAINS="$DOMAINS $domain"
    fi
done

# Add new domains
for subdomain in "$@"; do
    # Remove .waascrm.com if provided, we'll add it
    subdomain=$(echo "$subdomain" | sed 's/\.waascrm\.com$//')
    if [[ "$subdomain" != "waascrm.com" && "$subdomain" != "www" ]]; then
        DOMAINS="$DOMAINS ${subdomain}.waascrm.com"
    fi
done

echo "Adding SSL certificates for the following domains:"
echo "$DOMAINS"
echo ""
echo "Press Enter to continue or Ctrl+C to cancel..."
read

# Expand certificate
sudo certbot --nginx -d $DOMAINS --expand --non-interactive --agree-tos --email admin@waascrm.com

echo ""
echo "Certificate updated! Testing SSL..."
for domain in $DOMAINS; do
    echo -n "Testing $domain: "
    if curl -I -s "https://$domain" | head -1 | grep -q "200\|302\|301"; then
        echo "✓ SSL Working"
    else
        echo "✗ SSL issue (check nginx and application)"
    fi
done

echo ""
echo "Done! Certificate now covers:"
sudo certbot certificates 2>&1 | grep "Domains:"

