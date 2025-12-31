#!/bin/bash
################################################################################
# Script de diagnóstico completo
################################################################################

echo "=========================================="
echo "  DIAGNÓSTICO COMPLETO"
echo "=========================================="
echo ""

cd /var/www/vhosts/crm-prueba.test/public

echo "[1/5] Verificando servicios..."
echo "----------------------------------------------------------------------"
echo "Apache:"
systemctl status apache2 | head -3

echo ""
echo "nginx:"
systemctl status nginx | head -3

echo ""
echo "[2/5] Verificando puertos..."
echo "----------------------------------------------------------------------"
ss -tln | grep -E ":(80|443|7080|7443)" || netstat -tln | grep -E ":(80|443|7080|7443)"

echo ""
echo "[3/5] Probando accesos HTTP..."
echo "----------------------------------------------------------------------"
echo "127.0.0.1:7080:"
curl -I http://127.0.0.1:7080 2>&1 | head -5

echo ""
echo "217.154.186.92:80:"
curl -I http://217.154.186.92 2>&1 | head -5

echo ""
echo "[4/5] Verificando errores recientes..."
echo "----------------------------------------------------------------------"
echo "Laravel logs (últimas 10 líneas):"
tail -10 storage/logs/laravel.log 2>/dev/null || echo "No hay logs de Laravel"

echo ""
echo "Apache error log (últimas 10 líneas):"
tail -10 /var/www/vhosts/system/crm-prueba.test/logs/error_log 2>/dev/null || echo "No hay logs de Apache"

echo ""
echo "[5/5] Verificando configuración..."
echo "----------------------------------------------------------------------"
echo "FORCE_HTTPS en .env:"
grep FORCE_HTTPS .env || echo "FORCE_HTTPS no está configurado"

echo ""
echo "APP_DEBUG en .env:"
grep APP_DEBUG .env || echo "APP_DEBUG no está configurado"

echo ""
echo "=========================================="
echo "  INSTRUCCIONES"
echo "=========================================="
echo ""
echo "Si ves ERR_CONNECTION_REFUSED en navegador:"
echo "  1. Asegúrate de usar HTTP (no HTTPS):"
echo "     ✓ http://217.154.186.92"
echo "     ✗ https://217.154.186.92"
echo ""
echo "  2. Verifica que nginx esté corriendo:"
echo "     systemctl status nginx"
echo ""
echo "  3. Si nginx está caído, reinícialo:"
echo "     systemctl restart nginx"
echo ""
