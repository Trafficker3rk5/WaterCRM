# WaterCRM SSL/HTTPS Setup Guide

This guide explains how to configure SSL/HTTPS encryption for your WaterCRM installation using Let's Encrypt certificates.

## Table of Contents

1. [Automated Setup](#automated-setup)
2. [Manual Setup](#manual-setup)
3. [Verification](#verification)
4. [Troubleshooting](#troubleshooting)
5. [Security Best Practices](#security-best-practices)

---

## Automated Setup

The easiest way to enable SSL is using our automated setup script.

### Prerequisites

- Root or sudo access to your server
- A domain name pointing to your server's IP address
- Port 80 and 443 open in your firewall
- Nginx or Apache web server installed

### Quick Start

1. **Make the script executable:**
   ```bash
   chmod +x scripts/setup-ssl.sh
   ```

2. **Run the setup script:**
   ```bash
   sudo bash scripts/setup-ssl.sh
   ```

3. **Follow the prompts:**
   - Enter your domain name (e.g., `crm.example.com`)
   - Enter your email address (for SSL expiration notifications)

4. **Done!** The script will:
   - Install certbot if not present
   - Obtain SSL certificate from Let's Encrypt
   - Configure your web server for HTTPS
   - Update Laravel .env for secure cookies
   - Setup automatic certificate renewal
   - Redirect all HTTP traffic to HTTPS

### What the Script Does

The automated script performs the following actions:

1. **Installs Certbot**: Downloads and installs Let's Encrypt certbot tool
2. **Obtains Certificate**: Requests and validates SSL certificate for your domain
3. **Configures Web Server**: Automatically updates Nginx/Apache configuration
4. **Updates Laravel**: Modifies `.env` file to use HTTPS
5. **Enables Auto-Renewal**: Creates cron job to renew certificates every 60 days
6. **Forces HTTPS**: Redirects all HTTP traffic to HTTPS

---

## Manual Setup

If you prefer to set up SSL manually, follow these steps:

### Step 1: Install Certbot

**For Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx
```

**For CentOS/RHEL:**
```bash
sudo yum install certbot python3-certbot-nginx
```

### Step 2: Obtain SSL Certificate

**For Nginx:**
```bash
sudo certbot --nginx -d your-domain.com
```

**For Apache:**
```bash
sudo certbot --apache -d your-domain.com
```

### Step 3: Update Laravel Configuration

Edit your `.env` file:

```env
APP_URL=https://your-domain.com
SESSION_SECURE_COOKIE=true
FORCE_HTTPS=true
```

Clear Laravel cache:
```bash
php artisan config:clear
php artisan cache:clear
php artisan route:clear
```

### Step 4: Configure Nginx (if not using certbot --nginx)

Use the template in `config/nginx-ssl-template.conf`:

1. Copy the template:
   ```bash
   sudo cp config/nginx-ssl-template.conf /etc/nginx/sites-available/watercrm
   ```

2. Replace placeholders:
   ```bash
   sudo sed -i 's/DOMAIN_NAME/your-domain.com/g' /etc/nginx/sites-available/watercrm
   sudo sed -i "s|PROJECT_PATH|$(pwd)|g" /etc/nginx/sites-available/watercrm
   ```

3. Enable the site:
   ```bash
   sudo ln -s /etc/nginx/sites-available/watercrm /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

### Step 5: Setup Auto-Renewal

Add to crontab:
```bash
sudo crontab -e
```

Add this line:
```
0 0,12 * * * /usr/bin/certbot renew --quiet
```

---

## Verification

### 1. Test Your SSL Configuration

Visit your site:
```
https://your-domain.com
```

### 2. Check SSL Grade

Test your SSL configuration at:
- [SSL Labs](https://www.ssllabs.com/ssltest/)
- [Security Headers](https://securityheaders.com/)

You should aim for an **A+ rating**.

### 3. Verify HTTPS Redirect

Test that HTTP redirects to HTTPS:
```bash
curl -I http://your-domain.com
```

Should return:
```
HTTP/1.1 301 Moved Permanently
Location: https://your-domain.com/
```

### 4. Check Certificate Expiry

```bash
sudo certbot certificates
```

Certificates are valid for 90 days and auto-renew at 60 days.

---

## Troubleshooting

### Certificate Renewal Fails

**Check certbot logs:**
```bash
sudo tail -f /var/log/letsencrypt/letsencrypt.log
```

**Test renewal manually:**
```bash
sudo certbot renew --dry-run
```

### Port 80/443 Not Accessible

**Check firewall (UFW):**
```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw reload
```

**Check firewall (iptables):**
```bash
sudo iptables -I INPUT -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT -p tcp --dport 443 -j ACCEPT
```

### Mixed Content Warnings

If you see mixed content warnings in browser console:

1. Check that all assets use HTTPS or protocol-relative URLs
2. Update `.env`:
   ```env
   ASSET_URL=https://your-domain.com
   ```
3. Clear cache:
   ```bash
   php artisan config:clear
   php artisan view:clear
   ```

### Session/Cookie Issues

If users are being logged out:

1. Ensure `.env` has:
   ```env
   SESSION_SECURE_COOKIE=true
   SESSION_DOMAIN=.your-domain.com
   ```

2. Clear browser cookies and try again

---

## Security Best Practices

### 1. Security Headers

Our Nginx template includes these security headers:

- **HSTS**: Forces HTTPS for 2 years
- **X-Frame-Options**: Prevents clickjacking
- **X-Content-Type-Options**: Prevents MIME-type sniffing
- **X-XSS-Protection**: Enables XSS filter
- **Referrer-Policy**: Controls referrer information

### 2. TLS Configuration

We use:
- **TLS 1.2 and 1.3** only (no SSL/TLS 1.0/1.1)
- **Strong cipher suites** (ECDHE, GCM, CHACHA20)
- **OCSP stapling** for faster validation

### 3. Database Encryption

For encrypted database connections, add to `.env`:

```env
DB_SSLMODE=require
DB_SSLCERT=/path/to/client-cert.pem
DB_SSLKEY=/path/to/client-key.pem
DB_SSLROOTCERT=/path/to/ca-cert.pem
```

### 4. Email Encryption

For secure email (SMTP over TLS), ensure `.env` has:

```env
MAIL_ENCRYPTION=tls
MAIL_PORT=587
```

### 5. Regular Updates

Keep your SSL configuration up to date:

```bash
# Update certbot
sudo apt-get update
sudo apt-get upgrade certbot

# Regenerate DH parameters (every 6 months)
sudo openssl dhparam -out /etc/nginx/dhparam.pem 4096
```

---

## Additional Configuration

### Force HTTPS in Laravel

Add to `app/Providers/AppServiceProvider.php`:

```php
public function boot()
{
    if (config('app.env') === 'production') {
        \URL::forceScheme('https');
    }
}
```

### Content Security Policy (CSP)

Add to Nginx config inside `server` block:

```nginx
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';" always;
```

Adjust based on your needs.

---

## Support

For issues or questions:

1. Check the [troubleshooting section](#troubleshooting)
2. Review certbot logs: `/var/log/letsencrypt/`
3. Check web server logs: `/var/log/nginx/` or `/var/log/apache2/`

---

## Certificate Renewal Schedule

Let's Encrypt certificates:
- **Validity**: 90 days
- **Auto-renewal**: Every 60 days
- **Renewal time**: 12:00 AM and 12:00 PM daily (cron checks)
- **Grace period**: 30 days before expiry

You should receive email notifications 20 days before expiry if renewal fails.

---

## Performance Optimization

### Enable HTTP/2

Already enabled in our Nginx template:
```nginx
listen 443 ssl http2;
```

### Enable Brotli Compression (Optional)

For better compression than gzip:

1. Install Nginx brotli module
2. Add to Nginx config:
   ```nginx
   brotli on;
   brotli_comp_level 6;
   brotli_types text/plain text/css application/json application/javascript text/xml application/xml;
   ```

### CDN Integration

For better performance, consider using a CDN like Cloudflare:

1. Point your domain to Cloudflare
2. Enable "Full (strict)" SSL mode
3. Enable HTTP/2, Brotli, and caching

---

## Compliance

This SSL configuration helps meet compliance requirements:

- **PCI DSS**: TLS 1.2+ required
- **GDPR**: Encryption of personal data in transit
- **HIPAA**: Secure transmission of health information
- **SOC 2**: Data encryption requirements

---

## Checklist

After SSL setup, verify:

- [ ] HTTPS works (https://your-domain.com)
- [ ] HTTP redirects to HTTPS
- [ ] SSL grade is A or A+ (SSL Labs test)
- [ ] No mixed content warnings
- [ ] Sessions/cookies work correctly
- [ ] Auto-renewal cron job is active
- [ ] Email notifications are configured
- [ ] Security headers are present
- [ ] All API endpoints use HTTPS
- [ ] Database connections are encrypted (if applicable)

---

**Last Updated**: 2025-12-29
**WaterCRM Version**: 1.0
**Tested On**: Ubuntu 20.04, Ubuntu 22.04, Debian 11
