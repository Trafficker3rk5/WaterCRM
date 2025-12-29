# 📸 Guía para Añadir Capturas del CRM a la Landing Page

## Capturas Necesarias

La landing page necesita 6 capturas específicas. Aquí está exactamente qué capturar y cómo:

### 1. dashboard-preview.png (Hero principal)
**Qué capturar:** Vista general del dashboard
**Cómo:**
1. Accede a `http://localhost:8000/dashboard` como Admin
2. Asegúrate de que haya datos (gráficas con información)
3. Captura toda la pantalla del dashboard
4. **Dimensiones recomendadas:** 1920x1080px
5. **Importante:** Captura con datos reales para que se vea profesional

### 2. dashboard.png (Tab: Dashboard)
**Qué capturar:** Dashboard con KPIs y estadísticas
**Ruta:** `/dashboard`
**Debe incluir:**
- Tarjetas de KPIs (leads, contratos, facturación)
- Gráficas de tendencias
- Actividad reciente
**Dimensiones:** 1920x1080px

### 3. installations.png (Tab: Instalaciones)
**Qué capturar:** Módulo de gestión de instalaciones
**Ruta:** `/installations`
**Debe incluir:**
- Lista de instalaciones
- Estados (pendiente, en proceso, completada)
- Mapa con ubicaciones (si está disponible)
**Dimensiones:** 1920x1080px

### 4. budgets.png (Tab: Presupuestos)
**Qué capturar:** Sistema de presupuestos
**Ruta:** `/budgets/{client_id}`
**Debe incluir:**
- Lista de presupuestos
- Estados (pendiente, aceptado, rechazado)
- Importes
**Dimensiones:** 1920x1080px

### 5. clients.png (Tab: Clientes)
**Qué capturar:** CRM de clientes
**Ruta:** `/clients`
**Debe incluir:**
- Tabla de clientes
- Filtros
- Datos de contacto
**Dimensiones:** 1920x1080px

### 6. reports.png (Tab: Informes)
**Qué capturar:** Dashboard de informes y análisis
**Ruta:** `/usage-stats` o `/dashboard` con gráficas
**Debe incluir:**
- Gráficas de Chart.js
- Métricas clave
- Comparativas
**Dimensiones:** 1920x1080px

---

## Cómo Hacer las Capturas

### Opción 1: Captura Manual (Recomendado)

**En Windows:**
1. Presiona `Win + Shift + S`
2. Selecciona área rectangular
3. Guarda como PNG

**En Mac:**
1. Presiona `Cmd + Shift + 4`
2. Selecciona área
3. Se guarda automáticamente

**En Linux:**
1. Usa `gnome-screenshot` o `flameshot`
2. Selecciona área
3. Guarda como PNG

### Opción 2: Extensión de Chrome (Más profesional)

1. Instala "Full Page Screen Capture"
2. Haz clic en la extensión
3. Captura página completa
4. Descarga PNG

### Opción 3: Script Automatizado con Puppeteer

He creado un script que puedes ejecutar (requiere Node.js):

```bash
# Instalar Puppeteer
npm install puppeteer

# Ejecutar script de capturas (ver abajo)
node capture-screenshots.js
```

---

## Script Automatizado de Capturas

Crea `capture-screenshots.js` en la raíz del proyecto:

```javascript
const puppeteer = require('puppeteer');
const path = require('path');

const screenshots = [
  {
    name: 'dashboard-preview',
    url: 'http://localhost:8000/dashboard',
    viewport: { width: 1920, height: 1080 }
  },
  {
    name: 'dashboard',
    url: 'http://localhost:8000/dashboard',
    viewport: { width: 1920, height: 1080 }
  },
  {
    name: 'installations',
    url: 'http://localhost:8000/installations',
    viewport: { width: 1920, height: 1080 }
  },
  {
    name: 'budgets',
    url: 'http://localhost:8000/budgets/1', // Ajusta el ID
    viewport: { width: 1920, height: 1080 }
  },
  {
    name: 'clients',
    url: 'http://localhost:8000/clients',
    viewport: { width: 1920, height: 1080 }
  },
  {
    name: 'reports',
    url: 'http://localhost:8000/usage-stats',
    viewport: { width: 1920, height: 1080 }
  }
];

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Login first
  await page.goto('http://localhost:8000/login');
  await page.type('input[name="name"]', 'Admin');
  await page.type('input[name="password"]', 'Mario.:123');
  await page.click('button[type="submit"]');
  await page.waitForNavigation();

  // Take screenshots
  for (const screenshot of screenshots) {
    console.log(`Taking screenshot: ${screenshot.name}`);

    await page.setViewport(screenshot.viewport);
    await page.goto(screenshot.url, { waitUntil: 'networkidle2' });

    // Wait for content to load
    await page.waitForTimeout(2000);

    // Take screenshot
    await page.screenshot({
      path: path.join(__dirname, 'landing-page', 'screenshots', `${screenshot.name}.png`),
      fullPage: true
    });

    console.log(`✓ Saved: ${screenshot.name}.png`);
  }

  await browser.close();
  console.log('All screenshots captured!');
})();
```

**Ejecutar:**
```bash
# Asegúrate de que el servidor esté corriendo
php artisan serve

# En otra terminal
node capture-screenshots.js
```

---

## Donde Guardar las Capturas

```
landing-page/screenshots/
├── dashboard-preview.png  (Debe existir)
├── dashboard.png          (Debe existir)
├── installations.png      (Debe existir)
├── budgets.png           (Debe existir)
├── clients.png           (Debe existir)
└── reports.png           (Debe existir)
```

---

## Optimización de Imágenes

Después de capturar, optimiza para web:

### Con TinyPNG (Online)
1. Ve a https://tinypng.com
2. Sube las 6 imágenes
3. Descarga optimizadas
4. Reemplaza en `screenshots/`

### Con CLI (Automatizado)
```bash
# Instalar ImageMagick
sudo apt-get install imagemagick  # Linux
brew install imagemagick          # macOS

# Optimizar todas
cd landing-page/screenshots
for f in *.png; do
  convert "$f" -quality 85 -resize 1920x1080 "optimized-$f"
done
```

---

## Verificar que Funciona

Después de añadir las capturas:

1. Abre `landing-page/index.html` en navegador
2. Ve a la sección "Screenshots"
3. Haz clic en cada tab (Dashboard, Instalaciones, etc.)
4. Verifica que todas las imágenes carguen correctamente

---

## Tips para Capturas Profesionales

### Antes de Capturar:
- ✅ Añade datos de prueba realistas
- ✅ Asegúrate de que las gráficas tengan datos
- ✅ Usa nombres de clientes ficticios pero profesionales
- ✅ Limpia notificaciones o alertas de desarrollo
- ✅ Zoom del navegador al 100%
- ✅ Oculta extensiones de Chrome (Cmd+Shift+B)

### Durante la Captura:
- ✅ Espera a que todo cargue (spinner/loading)
- ✅ Asegúrate de que las gráficas estén renderizadas
- ✅ Captura en un solo monitor (evita cortes)
- ✅ Usa modo light (no dark mode) para mejor visibilidad

### Después de Capturar:
- ✅ Revisa que todas sean legibles
- ✅ Verifica que no haya información sensible
- ✅ Optimiza el tamaño sin perder calidad
- ✅ Renombra exactamente como se indica arriba

---

## Troubleshooting

### "La imagen no carga en la landing"
- Verifica el nombre exacto del archivo
- Asegúrate de que esté en `landing-page/screenshots/`
- Verifica que sea PNG (no JPG)

### "La captura se ve borrosa"
- Captura a mayor resolución (2560x1440)
- Luego redimensiona a 1920x1080
- Usa PNG (no JPG)

### "El script de Puppeteer no funciona"
- Verifica que el servidor esté corriendo
- Ajusta las URLs si usas otro puerto
- Ajusta los selectores de login si han cambiado

---

## Checklist Final

- [ ] Crear datos de prueba en el CRM
- [ ] Capturar las 6 imágenes requeridas
- [ ] Guardar en `landing-page/screenshots/`
- [ ] Optimizar tamaño de archivos
- [ ] Verificar nombres exactos
- [ ] Abrir landing page y probar tabs
- [ ] Verificar que todas cargan correctamente

---

**¡Listo!** Con estas capturas, tu landing page se verá 100% profesional.
