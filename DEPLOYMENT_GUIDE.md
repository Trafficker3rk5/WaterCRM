# WaterCRM Deployment Guide

Complete guide for deploying WaterCRM to production.

## Table of Contents

1. [Server Requirements](#server-requirements)
2. [Pre-Deployment Checklist](#pre-deployment-checklist)
3. [Server Setup](#server-setup)
4. [Database Configuration](#database-configuration)
5. [Application Deployment](#application-deployment)
6. [Web Server Configuration](#web-server-configuration)
7. [SSL/HTTPS Setup](#ssl-https-setup)
8. [Multi-Tenancy Configuration](#multi-tenancy-configuration)
9. [Performance Optimization](#performance-optimization)
10. [Monitoring & Maintenance](#monitoring--maintenance)
11. [Backup Strategy](#backup-strategy)
12. [Troubleshooting](#troubleshooting)

---

## Server Requirements

### Minimum Requirements

- **OS**: Ubuntu 22.04 LTS (recommended) or similar Linux distribution
- **CPU**: 4 cores
- **RAM**: 8 GB minimum, 16 GB recommended
- **Storage**: 100 GB SSD
- **PHP**: 8.1, 8.2, 8.3, or 8.4
- **PostgreSQL**: 14.x or higher
- **Node.js**: 18.x or higher
- **Nginx/Apache**: Latest stable version

### Recommended Production Setup

- **CPU**: 8 cores or more
- **RAM**: 32 GB or more
- **Storage**: 500 GB SSD with regular snapshots
- **PHP**: 8.2 or 8.3 (latest stable)
- **PostgreSQL**: 15.x
- **Redis**: For caching and sessions

---

## Pre-Deployment Checklist

- [ ] Domain name registered and DNS configured
- [ ] SSL certificate obtained (Let's Encrypt recommended)
- [ ] Server provisioned with SSH access
- [ ] Backup server/solution configured
- [ ] SMTP credentials for email (if not using sendmail)
- [ ] Google Maps API key
- [ ] PostgreSQL database server ready
- [ ] Git repository access configured
- [ ] Environment variables documented

---

## Server Setup

### 1. Update System

```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Install Required Packages

```bash
# Add PHP repository
sudo add-apt-repository ppa:ondrej/php -y
sudo apt update

# Install PHP and extensions
sudo apt install -y php8.2 php8.2-fpm php8.2-cli php8.2-pgsql php8.2-mbstring \
    php8.2-xml php8.2-curl php8.2-zip php8.2-gd php8.2-intl php8.2-bcmath \
    php8.2-redis php8.2-imagick

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install Redis
sudo apt install -y redis-server

# Install Nginx
sudo apt install -y nginx

# Install Composer
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer

# Install Node.js and npm
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 for Node process management (for Inertia SSR)
sudo npm install -g pm2
```

### 3. Configure PHP

Edit `/etc/php/8.2/fpm/php.ini`:

```ini
memory_limit = 512M
upload_max_filesize = 50M
post_max_size = 50M
max_execution_time = 300
max_input_time = 300
date.timezone = UTC

; OpCache settings
opcache.enable=1
opcache.memory_consumption=256
opcache.interned_strings_buffer=16
opcache.max_accelerated_files=10000
opcache.revalidate_freq=60
opcache.fast_shutdown=1
```

Restart PHP-FPM:

```bash
sudo systemctl restart php8.2-fpm
```

### 4. Configure Redis

Edit `/etc/redis/redis.conf`:

```conf
maxmemory 256mb
maxmemory-policy allkeys-lru
```

Restart Redis:

```bash
sudo systemctl restart redis-server
```

---

## Database Configuration

### 1. Configure PostgreSQL

Edit `/etc/postgresql/14/main/postgresql.conf`:

```conf
max_connections = 200
shared_buffers = 4GB
effective_cache_size = 12GB
maintenance_work_mem = 1GB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
work_mem = 10MB
min_wal_size = 1GB
max_wal_size = 4GB
```

### 2. Create Database and User

```bash
sudo -u postgres psql

CREATE DATABASE watercrm;
CREATE USER watercrm_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE watercrm TO watercrm_user;
ALTER DATABASE watercrm OWNER TO watercrm_user;
\q
```

### 3. Configure Remote Access (if needed)

Edit `/etc/postgresql/14/main/pg_hba.conf`:

```conf
# Allow connections from application server
host    watercrm    watercrm_user    10.0.0.0/24    md5
```

Restart PostgreSQL:

```bash
sudo systemctl restart postgresql
```

---

## Application Deployment

### 1. Create Application Directory

```bash
sudo mkdir -p /var/www/watercrm
sudo chown -R $USER:www-data /var/www/watercrm
cd /var/www/watercrm
```

### 2. Clone Repository

```bash
git clone https://github.com/Mario1988123/WaterCRM.git .
git checkout main  # or your production branch
```

### 3. Install Dependencies

```bash
# Install PHP dependencies
composer install --optimize-autoloader --no-dev

# Install Node dependencies
npm ci --production
```

### 4. Configure Environment

```bash
cp .env.example .env
nano .env
```

Configure `.env` file:

```env
APP_NAME=WaterCRM
APP_ENV=production
APP_KEY=  # Will generate below
APP_DEBUG=false
APP_URL=https://your-domain.com
APP_DOMAIN=your-domain.com

LOG_CHANNEL=stack
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=error

DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=watercrm
DB_USERNAME=watercrm_user
DB_PASSWORD=your_secure_password

BROADCAST_DRIVER=log
CACHE_DRIVER=redis
FILESYSTEM_DISK=local
QUEUE_CONNECTION=redis
SESSION_DRIVER=redis
SESSION_LIFETIME=120

REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

MAIL_MAILER=smtp
MAIL_HOST=smtp.your-provider.com
MAIL_PORT=587
MAIL_USERNAME=your_email@domain.com
MAIL_PASSWORD=your_mail_password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@your-domain.com
MAIL_FROM_NAME="${APP_NAME}"

GOOGLE_MAPS_API_KEY=your_google_maps_api_key
INSTALLATION_RADIUS=100

MAX_IMAGE_SIZE=2048
MAX_LOGO_SIZE=512
ALLOWED_IMAGE_TYPES=jpg,jpeg,png,webp

# Tenancy settings
TENANCY_DATABASE_BASED_ON=database
CENTRAL_DOMAINS=your-domain.com,www.your-domain.com
```

### 5. Generate Application Key

```bash
php artisan key:generate
```

### 6. Run Migrations

```bash
# Run central database migrations
php artisan migrate --force

# Migrate all tenant databases (if tenants exist)
php artisan tenants:migrate --force
```

### 7. Create Storage Links

```bash
php artisan storage:link
```

### 8. Set Permissions

```bash
sudo chown -R www-data:www-data /var/www/watercrm/storage
sudo chown -R www-data:www-data /var/www/watercrm/bootstrap/cache
sudo chmod -R 775 /var/www/watercrm/storage
sudo chmod -R 775 /var/www/watercrm/bootstrap/cache
```

### 9. Build Frontend Assets

```bash
npm run build
```

### 10. Optimize Laravel

```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
composer dump-autoload --optimize
```

---

## Web Server Configuration

### Nginx Configuration

Create `/etc/nginx/sites-available/watercrm`:

```nginx
# Redirect www to non-www
server {
    listen 80;
    listen 443 ssl http2;
    server_name www.your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    return 301 https://your-domain.com$request_uri;
}

# Main server block
server {
    listen 80;
    server_name your-domain.com *.your-domain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com *.your-domain.com;
    root /var/www/watercrm/public;

    index index.php index.html;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Logging
    access_log /var/log/nginx/watercrm-access.log;
    error_log /var/log/nginx/watercrm-error.log;

    # Increase upload size
    client_max_body_size 50M;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_split_path_info ^(.+\.php)(/.+)$;
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_index index.php;
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        fastcgi_param PATH_INFO $fastcgi_path_info;
        fastcgi_buffering off;
        fastcgi_read_timeout 300;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }

    # Cache static assets
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

Enable site and restart Nginx:

```bash
sudo ln -s /etc/nginx/sites-available/watercrm /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## SSL/HTTPS Setup

### Using Let's Encrypt (Recommended)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com -d *.your-domain.com

# Test auto-renewal
sudo certbot renew --dry-run

# Set up auto-renewal cron job (usually installed automatically)
sudo crontab -e
# Add if not present:
# 0 12 * * * /usr/bin/certbot renew --quiet
```

---

## Multi-Tenancy Configuration

### Wildcard DNS Setup

Configure your DNS provider:

```
Type: A
Name: @
Value: your_server_ip

Type: A
Name: *
Value: your_server_ip
```

### Create First Tenant

```bash
php artisan tinker

$tenant = \App\Models\Main\Tenant::create([
    'name' => 'Company Name',
    'domain' => 'company.your-domain.com'
]);

$tenant->domains()->create([
    'domain' => 'company.your-domain.com'
]);
```

---

## Performance Optimization

### 1. Enable OPcache

Already configured in PHP setup above.

### 2. Set Up Queue Workers

Create supervisor configuration `/etc/supervisor/conf.d/watercrm-worker.conf`:

```ini
[program:watercrm-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/watercrm/artisan queue:work redis --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=4
redirect_stderr=true
stdout_logfile=/var/www/watercrm/storage/logs/worker.log
stopwaitsecs=3600
```

Start workers:

```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start watercrm-worker:*
```

### 3. Set Up Task Scheduler

Add to crontab:

```bash
sudo crontab -e

* * * * * cd /var/www/watercrm && php artisan schedule:run >> /dev/null 2>&1
```

### 4. Configure Database Connection Pooling

Install PgBouncer:

```bash
sudo apt install -y pgbouncer
```

Configure `/etc/pgbouncer/pgbouncer.ini`:

```ini
[databases]
watercrm = host=127.0.0.1 port=5432 dbname=watercrm

[pgbouncer]
listen_addr = 127.0.0.1
listen_port = 6432
auth_type = md5
auth_file = /etc/pgbouncer/userlist.txt
pool_mode = transaction
max_client_conn = 200
default_pool_size = 20
```

Update `.env`:

```env
DB_PORT=6432
```

---

## Monitoring & Maintenance

### Set Up Laravel Horizon (for queue monitoring)

```bash
composer require laravel/horizon
php artisan horizon:install
php artisan migrate
```

Update supervisor config to use Horizon instead of queue:work.

### Application Monitoring

Consider installing:

- **Laravel Telescope** (development/staging only)
- **Sentry** for error tracking
- **New Relic** or **DataDog** for APM

### Server Monitoring

```bash
# Install monitoring tools
sudo apt install -y htop iotop nethogs

# Set up log rotation for Laravel logs
sudo nano /etc/logrotate.d/watercrm
```

Content:

```
/var/www/watercrm/storage/logs/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
    sharedscripts
}
```

---

## Backup Strategy

### Database Backups

Create backup script `/usr/local/bin/backup-watercrm-db.sh`:

```bash
#!/bin/bash

BACKUP_DIR="/var/backups/watercrm"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="watercrm"

mkdir -p $BACKUP_DIR

# Backup central database
sudo -u postgres pg_dump $DB_NAME | gzip > $BACKUP_DIR/watercrm_central_$DATE.sql.gz

# Backup tenant databases
TENANT_DBS=$(sudo -u postgres psql -t -c "SELECT datname FROM pg_database WHERE datname LIKE 'tenant%';")

for db in $TENANT_DBS; do
    sudo -u postgres pg_dump $db | gzip > $BACKUP_DIR/${db}_$DATE.sql.gz
done

# Remove backups older than 30 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete

# Upload to S3 (optional)
# aws s3 sync $BACKUP_DIR s3://your-bucket/watercrm-backups/
```

Make executable and schedule:

```bash
sudo chmod +x /usr/local/bin/backup-watercrm-db.sh
sudo crontab -e
# Add:
# 0 2 * * * /usr/local/bin/backup-watercrm-db.sh
```

### Application Files Backup

```bash
# Backup storage and uploads
tar -czf /var/backups/watercrm/storage_$(date +%Y%m%d).tar.gz /var/www/watercrm/storage/app

# Upload to remote storage
# rsync -avz /var/www/watercrm/storage/ user@backup-server:/backups/watercrm/
```

---

## Troubleshooting

### Common Issues

**1. Permission Errors**

```bash
sudo chown -R www-data:www-data /var/www/watercrm/storage
sudo chmod -R 775 /var/www/watercrm/storage
```

**2. 500 Internal Server Error**

```bash
# Check Laravel logs
tail -f /var/www/watercrm/storage/logs/laravel.log

# Check Nginx logs
tail -f /var/log/nginx/watercrm-error.log

# Check PHP-FPM logs
tail -f /var/log/php8.2-fpm.log
```

**3. Database Connection Issues**

```bash
# Test PostgreSQL connection
psql -h 127.0.0.1 -U watercrm_user -d watercrm

# Check PostgreSQL status
sudo systemctl status postgresql
```

**4. Queue Not Processing**

```bash
# Check supervisor status
sudo supervisorctl status

# Restart workers
sudo supervisorctl restart watercrm-worker:*

# Check worker logs
tail -f /var/www/watercrm/storage/logs/worker.log
```

**5. Clear All Caches**

```bash
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear
redis-cli FLUSHALL
```

---

## Security Checklist

- [ ] SSL/HTTPS enabled and enforced
- [ ] Firewall configured (UFW or similar)
- [ ] SSH key-based authentication only
- [ ] Fail2ban installed and configured
- [ ] Database not exposed to public internet
- [ ] `.env` file permissions set to 600
- [ ] APP_DEBUG=false in production
- [ ] Regular security updates scheduled
- [ ] File upload validation working
- [ ] CSRF protection enabled
- [ ] SQL injection protection (using Eloquent ORM)
- [ ] XSS protection headers configured

---

## Post-Deployment

1. **Test all major functionalities**
2. **Set up monitoring alerts**
3. **Document admin credentials securely**
4. **Train team on system usage**
5. **Schedule regular maintenance windows**

---

## Support

For deployment assistance, contact: support@watercrm.com
