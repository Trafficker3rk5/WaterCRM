# SSL Certificate Setup - COMPLETE ✅

## Current Status

### ✅ SSL Certificates Installed and Working

The following domains now have valid SSL certificates:
- ✅ `waascrm.com` (Central domain)
- ✅ `www.waascrm.com` (Central domain)
- ✅ `aquaam.waascrm.com` (Tenant subdomain)
- ✅ `tgs.waascrm.com` (Tenant subdomain)

### Certificate Details
- **Certificate Path**: `/etc/letsencrypt/live/waascrm.com-0001/`
- **Expiry Date**: February 9, 2026 (89 days)
- **Auto-renewal**: Configured and enabled
- **Certificate Type**: Multi-domain certificate (SAN - Subject Alternative Names)

## Verification

Test SSL certificates:
```bash
# Test aquaam.waascrm.com
curl -I https://aquaam.waascrm.com

# Test tgs.waascrm.com
curl -I https://tgs.waascrm.com

# Check certificate details
openssl s_client -connect aquaam.waascrm.com:443 -servername aquaam.waascrm.com < /dev/null 2>/dev/null | openssl x509 -noout -text | grep "Subject Alternative Name"
```

## Adding More Subdomains

### Easy Method (Recommended)
Use the provided script to add new subdomains:

```bash
cd /mnt/var/www/waascrm.com
./add-subdomain-ssl.sh newtenant.waascrm.com anotherentity.waascrm.com
```

### Manual Method
```bash
sudo certbot --nginx -d waascrm.com -d www.waascrm.com -d aquaam.waascrm.com -d tgs.waascrm.com -d newtenant.waascrm.com --expand --non-interactive --agree-tos --email admin@waascrm.com
```

## Important Notes

### Current Approach: Specific Subdomains
- ✅ **Pros**: Easy to set up, no DNS configuration needed, works immediately
- ⚠️ **Cons**: Need to run certbot for each new subdomain

### Alternative: Wildcard Certificate
For automatic SSL for ALL subdomains, you would need:
- DNS-01 validation (requires adding DNS TXT records)
- More complex setup
- See `WILDCARD-SSL-SETUP.md` for instructions

## Certificate Renewal

Certificates auto-renew via Certbot's timer. Check renewal status:
```bash
sudo systemctl status certbot.timer
sudo certbot renew --dry-run
```

## Troubleshooting

### SSL Not Working for New Subdomain
1. Add the subdomain to the certificate using the script above
2. Verify nginx configuration is updated
3. Test with: `curl -I https://newsubdomain.waascrm.com`

### Certificate Expiry
- Certificates auto-renew 30 days before expiry
- Check expiry: `sudo certbot certificates`
- Manual renewal: `sudo certbot renew`

### Nginx Configuration
- Configuration is managed by Certbot
- Located at: `/etc/nginx/sites-enabled/waascrm.com`
- Test config: `sudo nginx -t`
- Reload: `sudo systemctl reload nginx`

## Next Steps

1. ✅ SSL is working for all configured domains
2. To add more tenant subdomains, use the `add-subdomain-ssl.sh` script
3. Monitor certificate expiry with: `sudo certbot certificates`
4. For wildcard certificate (covers all subdomains automatically), see `WILDCARD-SSL-SETUP.md`

