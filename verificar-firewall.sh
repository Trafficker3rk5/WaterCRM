#!/bin/bash
################################################################################
# Verificar y corregir firewall
################################################################################

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m'

show_message() {
    echo -e "${GREEN}✓${NC} $1"
}

show_error() {
    echo -e "${RED}✗${NC} $1"
}

show_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

show_header() {
    echo ""
    echo "=========================================================================="
    echo -e "  ${BOLD}$1${NC}"
    echo "=========================================================================="
    echo ""
}

show_header "Verificación de Firewall"

echo "[1/4] Verificando iptables..."
echo "----------------------------------------------------------------------"

if command -v iptables &> /dev/null; then
    echo "Reglas de iptables para puerto 80:"
    iptables -L INPUT -n -v 2>/dev/null | grep "80" || show_info "No hay reglas específicas para puerto 80"

    # Verificar si hay DROP o REJECT
    if iptables -L INPUT -n 2>/dev/null | grep -E "DROP|REJECT" | grep -q "dpt:80"; then
        show_error "iptables está BLOQUEANDO el puerto 80"
        echo ""
        echo "Para permitir el puerto 80:"
        echo "  iptables -I INPUT -p tcp --dport 80 -j ACCEPT"
        echo "  iptables-save > /etc/iptables/rules.v4"
    else
        show_message "iptables NO bloquea el puerto 80"
    fi
else
    show_info "iptables no está instalado"
fi

echo ""
echo "[2/4] Verificando ufw..."
echo "----------------------------------------------------------------------"

if command -v ufw &> /dev/null; then
    UFW_STATUS=$(ufw status 2>/dev/null || echo "inactive")

    if echo "$UFW_STATUS" | grep -q "Status: active"; then
        echo "ufw está ACTIVO:"
        ufw status | grep -E "80|ALLOW|DENY"

        if ! echo "$UFW_STATUS" | grep -q "80.*ALLOW"; then
            show_error "Puerto 80 NO está permitido en ufw"
            echo ""
            echo "Para permitir el puerto 80:"
            echo "  ufw allow 80/tcp"
            echo "  ufw reload"
        else
            show_message "Puerto 80 está permitido en ufw"
        fi
    else
        show_info "ufw está inactivo"
    fi
else
    show_info "ufw no está instalado"
fi

echo ""
echo "[3/4] Verificando firewalld..."
echo "----------------------------------------------------------------------"

if command -v firewall-cmd &> /dev/null; then
    if systemctl is-active --quiet firewalld 2>/dev/null; then
        echo "firewalld está ACTIVO:"
        firewall-cmd --list-ports 2>/dev/null || show_info "No hay puertos abiertos"

        if ! firewall-cmd --list-ports 2>/dev/null | grep -q "80/tcp"; then
            show_error "Puerto 80 NO está permitido en firewalld"
            echo ""
            echo "Para permitir el puerto 80:"
            echo "  firewall-cmd --permanent --add-port=80/tcp"
            echo "  firewall-cmd --reload"
        else
            show_message "Puerto 80 está permitido en firewalld"
        fi
    else
        show_info "firewalld está inactivo"
    fi
else
    show_info "firewalld no está instalado"
fi

echo ""
echo "[4/4] Verificando conectividad externa..."
echo "----------------------------------------------------------------------"

echo "Probando desde el servidor a IP pública:"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://217.154.186.92 2>/dev/null)
echo "  → HTTP $HTTP_CODE"

if [ "$HTTP_CODE" = "000" ]; then
    show_error "No hay respuesta - posible problema de firewall o red"
elif [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "302" ] || [ "$HTTP_CODE" = "500" ]; then
    show_message "El servidor responde correctamente"
fi

echo ""
show_header "PRUEBA DESDE TU COMPUTADORA"

echo "Desde tu computadora local (NO desde el servidor), ejecuta:"
echo ""
echo "  curl -I http://217.154.186.92"
echo ""
echo "Debe devolver:"
echo "  HTTP/1.1 200 OK"
echo "  o HTTP/1.1 302 Found"
echo ""
echo "Si devuelve 'Connection refused', el problema es:"
echo "  → Firewall del servidor IONOS bloqueando puerto 80"
echo "  → Firewall de red bloqueando"
echo "  → ISP bloqueando puerto 80"
echo ""
echo "Contacta a IONOS para verificar que el puerto 80 esté abierto."
echo ""
