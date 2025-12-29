# Wildcard SSL Certificate Setup for *.waascrm.com

## Current Status
- ✅ Main domain SSL: waascrm.com, www.waascrm.com (working)
- ❌ Wildcard SSL: *.waascrm.com (needs setup)

## Option 1: Wildcard Certificate (Recommended for multiple subdomains)

### Step 1: Add DNS TXT Record
You need to add a DNS TXT record to verify domain ownership:

1. Go to your DNS provider (where waascrm.com DNS is managed)
2. Add a new TXT record:
   - **Record Type**: TXT
   - **Name**: `_acme-challenge.waascrm.com`
   - **Value**: (Will be provided by certbot - see below)
   - **TTL**: 300 (or default)

### Step 2: Get the Certificate
Run this command and follow the prompts:

```bash
sudo certbot certonly --manual --preferred-challenges dns \
    -d "*.waascrm.com" \
    -d "waascrm.com" \
    --email admin@waascrm.com \
    --agree-tos \
    --expand
```

When prompted:
1. Copy the TXT record value shown
2. Add it to your DNS as described in Step 1
3. Wait for DNS propagation (check with: `dig TXT _acme-challenge.waascrm.com`)
4. Press Enter to continue

### Step 3: Update Nginx Configuration
After obtaining the certificate, update nginx to use it.

## Option 2: Individual Certificates (Easier for few subdomains)

If you only have a few subdomains, you can get certificates for each:

```bash
# For aquaam.waascrm.com
sudo certbot --nginx -d aquaam.waascrm.com --expand

# For tgl.waascrm.com
sudo certbot --nginx -d tgl.waascrm.com --expand
```

This is easier but requires running certbot for each new subdomain.

## Option 3: Update Existing Certificate (If DNS is accessible)

If your subdomains are already accessible via HTTP, you can expand the existing certificate:

```bash
sudo certbot --nginx -d waascrm.com -d www.waascrm.com -d aquaam.waascrm.com -d tgl.waascrm.com --expand
```

This adds the subdomains to your existing certificate.

## Verify Certificate

After setup, verify with:
```bash
openssl s_client -connect aquaam.waascrm.com:443 -servername aquaam.waascrm.com < /dev/null 2>/dev/null | openssl x509 -noout -text | grep -A 2 "Subject Alternative Name"
```

## Automatic Renewal

Certbot automatically renews certificates. For wildcard certificates using DNS challenge, you may need to set up automatic DNS validation using a DNS plugin or manual renewal script.

## Troubleshooting

- **DNS not propagating**: Wait 5-15 minutes after adding TXT record
- **Certificate not working**: Check nginx configuration uses the correct certificate path
- **Renewal issues**: Wildcard certificates with DNS challenge may need manual renewal or DNS plugin setup

