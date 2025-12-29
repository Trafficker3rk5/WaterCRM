# WaterCRM Landing Page

Landing page moderna y profesional para WaterCRM, inspirada en diseños modernos tipo seelight.site.

## Características

- **Diseño Moderno**: Interfaz limpia y profesional con efectos visuales sutiles
- **Totalmente Responsive**: Optimizada para desktop, tablet y móvil
- **Animaciones Fluidas**: Transiciones suaves y efectos parallax
- **Secciones Completas**:
  - Hero con estadísticas animadas
  - Características del producto con tarjetas interactivas
  - Galería de screenshots con tabs
  - Módulos del sistema
  - Integraciones
  - Precios
  - Call-to-Action
  - Footer completo

## Estructura de Archivos

```
landing-page/
├── index.html          # Página principal
├── css/
│   └── style.css      # Estilos completos
├── js/
│   └── script.js      # Funcionalidad JavaScript
├── images/            # Carpeta para imágenes (ver abajo)
└── README.md          # Este archivo
```

## Cómo Añadir Capturas de Pantalla

Para completar la landing page, necesitas añadir capturas de pantalla del CRM en la carpeta `images/`.

### Imágenes Requeridas

Coloca las siguientes imágenes en `landing-page/images/`:

1. **dashboard-preview.png** (1400x900px recomendado)
   - Captura del dashboard principal
   - Debe mostrar: KPIs, gráficas, resumen general
   - Usada en la sección Hero

2. **screenshot-dashboard.png** (1920x1080px recomendado)
   - Vista completa del dashboard
   - Incluye: navegación, sidebar, widgets principales

3. **screenshot-installations.png** (1920x1080px)
   - Vista de gestión de instalaciones
   - Debe mostrar: lista de instalaciones, mapa, detalles

4. **screenshot-budgets.png** (1920x1080px)
   - Vista de presupuestos
   - Debe mostrar: listado, formulario, PDF preview

5. **screenshot-clients.png** (1920x1080px)
   - Vista de gestión de clientes
   - Debe mostrar: listado, ficha de cliente, historial

6. **screenshot-reports.png** (1920x1080px)
   - Vista de informes y analytics
   - Debe mostrar: gráficas, tablas, exportación

### Cómo Tomar las Capturas

#### Opción 1: Capturas Reales del CRM

1. Accede a tu instalación de WaterCRM
2. Usa datos de demostración (crea clientes, presupuestos, etc. de ejemplo)
3. Toma capturas de pantalla de cada sección
4. Recomendado: Usa navegador en modo incógnito con zoom 100%
5. Herramientas:
   - macOS: `Cmd + Shift + 4`
   - Windows: `Win + Shift + S`
   - Linux: `gnome-screenshot` o similar

#### Opción 2: Capturas con DevTools

Para capturas de mejor calidad:

1. Abre Chrome DevTools (F12)
2. Activa el Device Toolbar (Ctrl+Shift+M)
3. Configura dimensiones personalizadas (1920x1080)
4. Toma la captura con DevTools:
   - Cmd/Ctrl + Shift + P
   - Escribe "screenshot"
   - Selecciona "Capture screenshot"

#### Opción 3: Placeholders Temporales

Mientras generas las capturas reales, puedes usar placeholders:

```bash
cd landing-page/images

# Crea placeholders con ImageMagick (si lo tienes instalado)
convert -size 1400x900 xc:lightblue -pointsize 72 -fill white -gravity center \
    -annotate +0+0 "Dashboard Preview" dashboard-preview.png

convert -size 1920x1080 xc:lightgray -pointsize 72 -fill darkgray -gravity center \
    -annotate +0+0 "Dashboard" screenshot-dashboard.png

convert -size 1920x1080 xc:lightgreen -pointsize 72 -fill darkgreen -gravity center \
    -annotate +0+0 "Instalaciones" screenshot-installations.png

convert -size 1920x1080 xc:lightcoral -pointsize 72 -fill darkred -gravity center \
    -annotate +0+0 "Presupuestos" screenshot-budgets.png

convert -size 1920x1080 xc:lightyellow -pointsize 72 -fill darkgoldenrod -gravity center \
    -annotate +0+0 "Clientes" screenshot-clients.png

convert -size 1920x1080 xc:lightcyan -pointsize 72 -fill darkcyan -gravity center \
    -annotate +0+0 "Informes" screenshot-reports.png
```

O usa servicios online como:
- https://placeholder.com/
- https://via.placeholder.com/1920x1080/EFEFEF/666666?text=Dashboard

### Optimización de Imágenes

Antes de subir las imágenes, optimízalas:

```bash
# Con ImageMagick
mogrify -strip -interlace Plane -quality 85% images/*.png

# Con OptiPNG
optipng -o7 images/*.png

# Con TinyPNG (online)
# Visita https://tinypng.com y arrastra las imágenes
```

## Personalización

### Cambiar Colores

Edita las variables CSS en `css/style.css`:

```css
:root {
    --primary: #3B82F6;      /* Color principal (azul) */
    --primary-dark: #1D4ED8;  /* Azul oscuro */
    --secondary: #10B981;     /* Verde (acciones positivas) */
    --accent: #8B5CF6;        /* Púrpura (acentos) */
    /* ... más colores */
}
```

### Cambiar Textos

1. Abre `index.html`
2. Busca las secciones que quieras modificar
3. Edita el contenido HTML directamente

### Añadir Más Características

Para añadir una nueva tarjeta de característica:

```html
<div class="feature-card">
    <div class="feature-icon">
        <svg><!-- Tu icono SVG aquí --></svg>
    </div>
    <h3 class="feature-title">Título de la Característica</h3>
    <p class="feature-description">
        Descripción de lo que hace esta característica.
    </p>
    <a href="#" class="feature-link">
        Más información
        <svg><!-- Icono de flecha --></svg>
    </a>
</div>
```

## Despliegue

### Opción 1: Servicio Estático (Netlify, Vercel)

1. Crea una cuenta en Netlify o Vercel
2. Arrastra la carpeta `landing-page` a su interfaz
3. ¡Listo! Tu sitio estará disponible en minutos

### Opción 2: Integrar con Laravel

1. Copia el contenido de `landing-page` a `public/landing` en tu proyecto Laravel
2. Accede vía `https://tu-dominio.com/landing`

O sirve como página principal:

1. Copia `index.html` a `resources/views/landing.blade.php`
2. Mueve CSS y JS a `public/assets/`
3. Actualiza las rutas en Blade
4. Crea ruta en `routes/web.php`:

```php
Route::get('/', function () {
    return view('landing');
});
```

### Opción 3: Servidor Web Tradicional

1. Sube la carpeta `landing-page` a tu servidor
2. Configura el dominio para apuntar a esta carpeta
3. Asegúrate de que el servidor sirve `index.html` por defecto

## Mejoras Futuras

Ideas para expandir la landing page:

- [ ] Formulario de contacto funcional (integrado con backend)
- [ ] Chat en vivo (Intercom, Crisp, etc.)
- [ ] Blog/Noticias integrado
- [ ] Testimonios de clientes
- [ ] Video demo embebido
- [ ] Calculadora interactiva de precios
- [ ] Comparación con competidores
- [ ] FAQ expandible
- [ ] Mapa de funcionalidades interactivo
- [ ] Demo en vivo (iframe o enlace)

## Tecnologías Utilizadas

- **HTML5**: Estructura semántica
- **CSS3**: Flexbox, Grid, Variables CSS, Animaciones
- **JavaScript (Vanilla)**: Sin dependencias, código limpio
- **Google Fonts**: Inter (fuente principal)
- **SVG**: Iconos y gráficos vectoriales

## Soporte de Navegadores

- Chrome/Edge (últimas 2 versiones)
- Firefox (últimas 2 versiones)
- Safari (últimas 2 versiones)
- iOS Safari (iOS 12+)
- Chrome Android (últimas 2 versiones)

## Licencia

Este diseño es parte del proyecto WaterCRM.

## Contacto

Para soporte o preguntas:
- Email: soporte@watercrm.com
- Web: https://watercrm.com
