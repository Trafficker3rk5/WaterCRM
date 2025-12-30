#!/bin/bash
################################################################################
# Script para corregir VirtualHost 7080 en Plesk
# Agrega DocumentRoot y elimina redirección HTTPS forzada
################################################################################

set -e

CONFIG="/etc/apache2/plesk.conf.d/vhosts/crm-prueba.test.conf"

echo "=========================================="
echo "Corrigiendo VirtualHost 7080"
echo "=========================================="
echo ""

# Backup
echo "[1/5] Creando backup..."
cp "$CONFIG" "$CONFIG.backup-$(date +%Y%m%d-%H%M%S)"
echo "✓ Backup creado"

# Crear archivo temporal con el contenido correcto
echo "[2/5] Generando nueva configuración..."

cat > /tmp/vhost-7080-new.conf << 'VHOSTEOF'
<VirtualHost 217.154.186.92:7080 >
        ServerName "crm-prueba.test"
        ServerAlias "www.crm-prueba.test"
        ServerAlias "ipv4.crm-prueba.test"
        UseCanonicalName Off

        CustomLog /var/www/vhosts/system/crm-prueba.test/logs/access_log plesklog
        ErrorLog "/var/www/vhosts/system/crm-prueba.test/logs/error_log"

        # mailconfig
        <IfModule mod_proxy_http.c>
                <IfModule mod_rewrite.c>
                        RewriteEngine On
                        RewriteCond %{REQUEST_URI} ^/autodiscover/autodiscover\.xml$ [NC,OR]
                        RewriteCond %{REQUEST_URI} ^(/\.well-known/autoconfig)?/mail/config\-v1\.1\.xml$ [NC,OR]
                        RewriteCond %{REQUEST_URI} ^/email\.mobileconfig$ [NC]
                        RewriteRule ^(.*)$ http://127.0.0.1:8880/mailconfig/ [P,QSA,L,E=REQUEST_URI:%{REQUEST_URI},E=HOST:%{HTTP_HOST}]
                </IfModule>
                <Proxy "http://127.0.0.1:8880/mailconfig/">
                        RequestHeader set X-Host "%{HOST}e"
                        RequestHeader set X-Request-URI "%{REQUEST_URI}e"
                </Proxy>
        </IfModule>
        # mailconfig

        DocumentRoot "/var/www/vhosts/crm-prueba.test/public/public"

        <IfModule mod_suexec.c>
                SuexecUserGroup "crm-prueba.test_kovfbpusm6d" "psacln"
        </IfModule>

        <Directory /var/www/vhosts/crm-prueba.test/public/public>
                Options -Indexes +FollowSymLinks
                AllowOverride All
                Require all granted

                <IfModule mod_proxy_fcgi.c>
                        <Files ~ (\.php$)>
                                SetHandler proxy:unix:/var/www/vhosts/system/crm-prueba.test/php-fpm.sock|fcgi://127.0.0.1:9000
                        </Files>
                </IfModule>
        </Directory>

        Alias /error_docs /var/www/vhosts/crm-prueba.test/error_docs
        ErrorDocument 400 /error_docs/bad_request.html
        ErrorDocument 401 /error_docs/unauthorized.html
        ErrorDocument 403 /error_docs/forbidden.html
        ErrorDocument 404 /error_docs/not_found.html
        ErrorDocument 500 /error_docs/internal_server_error.html
        ErrorDocument 405 /error_docs/method_not_allowed.html
        ErrorDocument 406 /error_docs/not_acceptable.html
        ErrorDocument 407 /error_docs/proxy_authentication_required.html
        ErrorDocument 412 /error_docs/precondition_failed.html
        ErrorDocument 414 /error_docs/request_uri_too_long.html
        ErrorDocument 415 /error_docs/unsupported_media_type.html
        ErrorDocument 501 /error_docs/not_implemented.html
        ErrorDocument 502 /error_docs/bad_gateway.html
        ErrorDocument 503 /error_docs/maintenance.html

        DirectoryIndex "index.html" "index.cgi" "index.pl" "index.php" "index.xhtml" "index.htm" "index.shtml"

        Include "/var/www/vhosts/system/crm-prueba.test/conf/vhost.conf"

        <IfModule mod_rewrite.c>
                RewriteEngine On
                RewriteCond %{HTTP_HOST} ^www\.crm-prueba\.test$ [NC]
                RewriteRule ^(.*)$ http://crm-prueba.test$1 [L,R=301]
        </IfModule>

        <Directory /var/www/vhosts/crm-prueba.test>
                Options -FollowSymLinks
                AllowOverride AuthConfig FileInfo Indexes Limit Options=Indexes,SymLinksIfOwnerMatch,MultiViews,ExecCGI,Includes,IncludesNOEXEC
        </Directory>

</VirtualHost>
VHOSTEOF

echo "✓ Configuración VirtualHost 7080 generada"

# Extraer solo el VirtualHost SSL (7443) del archivo original
echo "[3/5] Extrayendo VirtualHost SSL (7443)..."
sed -n '1,/<VirtualHost 217.154.186.92:7080/p' "$CONFIG" | head -n -1 > /tmp/vhost-ssl.conf
echo "✓ VirtualHost SSL extraído"

# Combinar: SSL + nuevo HTTP
echo "[4/5] Combinando configuraciones..."
cat /tmp/vhost-ssl.conf > "$CONFIG.new"
echo "" >> "$CONFIG.new"
cat /tmp/vhost-7080-new.conf >> "$CONFIG.new"

# Reemplazar
mv "$CONFIG.new" "$CONFIG"
echo "✓ Archivo reemplazado"

# Verificar sintaxis
echo "[5/5] Verificando sintaxis de Apache..."
if apachectl configtest 2>&1 | grep -q "Syntax OK"; then
    echo "✓ Sintaxis correcta"
else
    echo "✗ Error de sintaxis:"
    apachectl configtest
    exit 1
fi

# Limpiar archivos temporales
rm -f /tmp/vhost-7080-new.conf /tmp/vhost-ssl.conf

echo ""
echo "=========================================="
echo "✓ Configuración corregida exitosamente"
echo "=========================================="
echo ""
echo "Cambios realizados:"
echo "  • Agregado DocumentRoot en VirtualHost 7080"
echo "  • Agregado bloque <Directory> con permisos para Laravel"
echo "  • Configurado handler PHP-FPM"
echo "  • Eliminada redirección forzada HTTP→HTTPS"
echo "  • Mantenida redirección www→no-www en HTTP"
echo ""
echo "Próximos pasos:"
echo "  1. systemctl restart apache2"
echo "  2. curl http://127.0.0.1:7080"
echo "  3. curl http://217.154.186.92"
echo ""
