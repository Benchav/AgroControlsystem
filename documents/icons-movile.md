# Iconos y Menú Móvil

## Objetivo
Esta guía explica cómo se ve y cómo funciona la navegación móvil de Agro Control, para que cualquier persona del equipo la entienda sin entrar al código.

## Vista de iconos
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="720" viewBox="0 0 1200 720" fill="none">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1200" y2="720" gradientUnits="userSpaceOnUse">
      <stop stop-color="#081114"/>
      <stop offset="1" stop-color="#0c0c49"/>
    </linearGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="1">
      <stop stop-color="#34d399"/>
      <stop offset="1" stop-color="#22c55e"/>
    </linearGradient>
    <linearGradient id="accent2" x1="0" y1="0" x2="1" y2="1">
      <stop stop-color="#60a5fa"/>
      <stop offset="1" stop-color="#a78bfa"/>
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="8" result="blur"/>
      <feColorMatrix in="blur" type="matrix" values="0 0 0 0 0.13  0 0 0 0 0.77  0 0 0 0 0.42  0 0 0 0.65 0" result="greenGlow"/>
      <feMerge>
        <feMergeNode in="greenGlow"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    <style>
      .title { font: 700 28px Inter, Arial, sans-serif; fill: #f8fafc; }
      .sub { font: 400 15px Inter, Arial, sans-serif; fill: #94a3b8; }
      .cardTitle { font: 600 16px Inter, Arial, sans-serif; fill: #e2e8f0; }
      .label { font: 400 12px Inter, Arial, sans-serif; fill: #94a3b8; }
      .code { font: 500 12px Consolas, Monaco, monospace; fill: #cbd5e1; }
    </style>
  </defs>

  <rect width="1200" height="720" rx="32" fill="url(#bg)"/>
  <text x="40" y="54" class="title">Iconos usados en la navegación móvil</text>
  <text x="40" y="82" class="sub">Vista rápida de los iconos principales y su significado dentro de Agro Control</text>

  <!-- Grid positions -->
  <!-- Card template: 260 x 160 -->

  <g transform="translate(40 120)">
    <rect width="260" height="160" rx="22" fill="#0f172a" stroke="rgba(255,255,255,0.08)"/>
    <circle cx="52" cy="56" r="28" fill="rgba(52,211,153,0.12)" stroke="rgba(52,211,153,0.3)"/>
    <rect x="40" y="44" width="9" height="9" rx="2" fill="#34d399"/>
    <rect x="51" y="44" width="9" height="9" rx="2" fill="#34d399"/>
    <rect x="40" y="55" width="9" height="9" rx="2" fill="#34d399"/>
    <rect x="51" y="55" width="9" height="9" rx="2" fill="#34d399"/>
    <text x="92" y="50" class="cardTitle">Dashboard</text>
    <text x="92" y="74" class="code">fa-th-large</text>
    <text x="24" y="126" class="sub">Inicio rápido de la plataforma</text>
  </g>

  <g transform="translate(300 120)">
    <rect width="260" height="160" rx="22" fill="#0f172a" stroke="rgba(255,255,255,0.08)"/>
    <circle cx="52" cy="56" r="28" fill="rgba(96,165,250,0.12)" stroke="rgba(96,165,250,0.3)"/>
    <path d="M52 36c-8.8 0-16 7.2-16 16 0 11 16 30 16 30s16-19 16-30c0-8.8-7.2-16-16-16zm0 22a6 6 0 1 1 0-12 6 6 0 0 1 0 12z" fill="#60a5fa"/>
    <text x="92" y="50" class="cardTitle">Mapa</text>
    <text x="92" y="74" class="code">fa-map-marked-alt</text>
    <text x="24" y="126" class="sub">Ubicación y parcelas</text>
  </g>

  <g transform="translate(560 120)">
    <rect width="260" height="160" rx="22" fill="#0f172a" stroke="rgba(255,255,255,0.08)"/>
    <circle cx="52" cy="56" r="28" fill="rgba(167,139,250,0.12)" stroke="rgba(167,139,250,0.3)"/>
    <circle cx="44" cy="52" r="6" fill="#a78bfa"/>
    <circle cx="60" cy="50" r="8" fill="#a78bfa"/>
    <circle cx="52" cy="64" r="9" fill="#a78bfa"/>
    <path d="M42 52c3-7 12-10 19-6M45 60c7 2 12 1 17-4" stroke="#a78bfa" stroke-width="2" stroke-linecap="round"/>
    <text x="92" y="50" class="cardTitle">IA</text>
    <text x="92" y="74" class="code">fa-brain</text>
    <text x="24" y="126" class="sub">Diagnóstico e interpretación</text>
  </g>

  <g transform="translate(820 120)">
    <rect width="260" height="160" rx="22" fill="#0f172a" stroke="rgba(255,255,255,0.08)"/>
    <circle cx="52" cy="56" r="28" fill="rgba(34,197,94,0.12)" stroke="rgba(34,197,94,0.3)"/>
    <path d="M34 42h22l8 8v18a4 4 0 0 1-4 4H34a4 4 0 0 1-4-4V46a4 4 0 0 1 4-4z" fill="none" stroke="#34d399" stroke-width="3" stroke-linejoin="round"/>
    <path d="M56 42v8h8" stroke="#34d399" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M41 66c0-6 4-10 11-10s11 4 11 10" stroke="#34d399" stroke-width="2.5" stroke-linecap="round"/>
    <text x="92" y="50" class="cardTitle">Chat</text>
    <text x="92" y="74" class="code">fa-comments</text>
    <text x="24" y="126" class="sub">Asistente y expertos</text>
  </g>

  <g transform="translate(40 300)">
    <rect width="260" height="160" rx="22" fill="#0f172a" stroke="rgba(255,255,255,0.08)"/>
    <circle cx="52" cy="56" r="28" fill="rgba(251,191,36,0.12)" stroke="rgba(251,191,36,0.3)"/>
    <circle cx="42" cy="52" r="2.8" fill="#fbbf24"/>
    <circle cx="52" cy="52" r="2.8" fill="#fbbf24"/>
    <circle cx="62" cy="52" r="2.8" fill="#fbbf24"/>
    <text x="92" y="50" class="cardTitle">Más</text>
    <text x="92" y="74" class="code">fa-ellipsis-h</text>
    <text x="24" y="126" class="sub">Acceso al menú completo</text>
  </g>

  <g transform="translate(300 300)">
    <rect width="260" height="160" rx="22" fill="#0f172a" stroke="rgba(255,255,255,0.08)"/>
    <circle cx="52" cy="56" r="28" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.16)"/>
    <rect x="38" y="43" width="28" height="3.5" rx="1.75" fill="#e2e8f0"/>
    <rect x="38" y="52" width="28" height="3.5" rx="1.75" fill="#e2e8f0"/>
    <rect x="38" y="61" width="28" height="3.5" rx="1.75" fill="#e2e8f0"/>
    <text x="92" y="50" class="cardTitle">Menú</text>
    <text x="92" y="74" class="code">fa-bars</text>
    <text x="24" y="126" class="sub">Abre el panel lateral</text>
  </g>

  <g transform="translate(560 300)">
    <rect width="260" height="160" rx="22" fill="#0f172a" stroke="rgba(255,255,255,0.08)"/>
    <circle cx="52" cy="56" r="28" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.16)"/>
    <path d="M43 47l18 18M61 47L43 65" stroke="#f8fafc" stroke-width="3" stroke-linecap="round"/>
    <text x="92" y="50" class="cardTitle">Cerrar</text>
    <text x="92" y="74" class="code">fa-times</text>
    <text x="24" y="126" class="sub">Cierra el panel lateral</text>
  </g>

  <g transform="translate(820 300)">
    <rect width="260" height="160" rx="22" fill="#0f172a" stroke="rgba(255,255,255,0.08)"/>
    <circle cx="52" cy="56" r="28" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.16)"/>
    <path d="M46 68c7 0 12-4.5 12-10v-7c0-4-3-7-7-7s-7 3-7 7v7c0 5.5 5 10 12 10z" fill="none" stroke="#e2e8f0" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M40 53h24" stroke="#e2e8f0" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M47 35c0-2 1-3 5-3s5 1 5 3" stroke="#e2e8f0" stroke-width="2.5" stroke-linecap="round"/>
    <text x="92" y="50" class="cardTitle">Notificaciones</text>
    <text x="92" y="74" class="code">fa-bell</text>
    <text x="24" y="126" class="sub">Alertas y avisos</text>
  </g>

  <g transform="translate(40 480)">
    <rect width="260" height="160" rx="22" fill="#0f172a" stroke="rgba(255,255,255,0.08)"/>
    <circle cx="52" cy="56" r="28" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.16)"/>
    <circle cx="50" cy="55" r="9" stroke="#e2e8f0" stroke-width="3"/>
    <path d="M57 62l8 8" stroke="#e2e8f0" stroke-width="3" stroke-linecap="round"/>
    <text x="92" y="50" class="cardTitle">Buscar</text>
    <text x="92" y="74" class="code">fa-search</text>
    <text x="24" y="126" class="sub">Búsqueda interna</text>
  </g>

  <g transform="translate(300 480)">
    <rect width="260" height="160" rx="22" fill="#0f172a" stroke="rgba(255,255,255,0.08)"/>
    <circle cx="52" cy="56" r="28" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.16)"/>
    <path d="M38 58l14-12 14 12v12H38V58z" fill="none" stroke="#e2e8f0" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M44 70v-8h16v8" stroke="#e2e8f0" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    <text x="92" y="50" class="cardTitle">Inicio</text>
    <text x="92" y="74" class="code">fa-home</text>
    <text x="24" y="126" class="sub">Regresa al home</text>
  </g>

  <g transform="translate(560 480)">
    <rect width="260" height="160" rx="22" fill="#0f172a" stroke="rgba(255,255,255,0.08)"/>
    <circle cx="52" cy="56" r="28" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.16)"/>
    <rect x="39" y="45" width="26" height="18" rx="4" fill="none" stroke="#e2e8f0" stroke-width="2.5"/>
    <circle cx="52" cy="54" r="5.5" fill="none" stroke="#e2e8f0" stroke-width="2.5"/>
    <path d="M44 42l3-5h10l3 5" stroke="#e2e8f0" stroke-width="2.5" stroke-linejoin="round"/>
    <text x="92" y="50" class="cardTitle">Cámara</text>
    <text x="92" y="74" class="code">fa-camera</text>
    <text x="24" y="126" class="sub">Captura imágenes</text>
  </g>

  <g transform="translate(820 480)">
    <rect width="260" height="160" rx="22" fill="#0f172a" stroke="rgba(255,255,255,0.08)"/>
    <circle cx="52" cy="56" r="28" fill="rgba(34,197,94,0.12)" stroke="rgba(34,197,94,0.3)"/>
    <rect x="37" y="48" width="30" height="16" rx="2" fill="none" stroke="#34d399" stroke-width="2.5"/>
    <path d="M39 48l6-7h16l6 7" stroke="#34d399" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M44 64h16" stroke="#34d399" stroke-width="2.5" stroke-linecap="round"/>
    <text x="92" y="50" class="cardTitle">Marketplace</text>
    <text x="92" y="74" class="code">fa-store</text>
    <text x="24" y="126" class="sub">Ventas y anuncios</text>
  </g>
</svg>

## Qué aparece en móvil
En pantallas pequeñas se usa una barra inferior fija, tipo aplicación móvil.

Accesos visibles:
- Inicio
- Mapa
- IA
- Chat
- Más

Además:
- aparece un menú lateral completo cuando se toca `Más`
- el menú lateral también se puede cerrar con una `X` arriba
- al tocar fuera del menú, este también se cierra

## Iconos usados
La app usa `Font Awesome`.

Iconos principales:
- `fa-th-large` para Inicio / Dashboard
- `fa-map-marked-alt` para Mapa
- `fa-brain` para IA
- `fa-comments` para Chat
- `fa-ellipsis-h` para Más
- `fa-bars` para abrir menú
- `fa-times` para cerrar menú
- `fa-bell` para notificaciones
- `fa-search` para búsqueda
- `fa-home` para volver al inicio

Iconos visibles en otras zonas:
- `fa-camera` en acciones de IA
- `fa-comment-dots` en accesos al chat
- `fa-store` en marketplace
- `fa-cog` en configuración

## Colores
La interfaz usa una paleta oscura con acentos verdes.

Colores principales:
- fondo general: azul muy oscuro / negro azulado
- acento principal: verde esmeralda
- texto principal: blanco
- texto secundario: gris claro

Significado visual:
- verde: acción, activo, saludable, conectado
- ámbar: advertencia o atención
- rojo: crítico o urgente
- azul/cian: información o estado técnico

## Comportamiento del menú
### Desktop
- se muestra el sidebar lateral completo
- la navegación principal vive a la izquierda

### Móvil
- el sidebar se oculta por defecto
- se abre con el botón de menú
- se puede cerrar de 3 formas:
  - tocando la `X`
  - tocando fuera del panel
  - presionando `Escape` en navegador/teclado

## Responsive
El diseño cambia según el tamaño de pantalla:
- en escritorio se prioriza el menú lateral
- en móvil se prioriza la barra inferior
- el contenido principal mantiene scroll independiente
- se deja espacio inferior para que la barra móvil no tape contenido

## Barra inferior móvil
La barra inferior está pensada para parecer una app nativa.

Ventajas:
- navegación rápida con el pulgar
- acceso inmediato a las secciones más usadas
- el usuario no necesita abrir el menú para todo

## Experiencia visual
Para que se sienta más moderno:
- el menú tiene fondo oscuro con imagen y degradado
- el botón activo resalta en verde
- los cambios tienen transición suave
- el contenido no aparece de golpe

## Qué debe saber marketing
Lo más importante para comunicar es esto:
- Agro Control funciona como una app móvil real
- la navegación está optimizada para uso rápido en campo
- la IA y el chat están al alcance de un toque
- la interfaz prioriza claridad, velocidad y uso práctico

## Archivos relacionados
- `src/components/layout/AppShell.tsx`
- `src/config/navigation.ts`
- `index.html`

## Resumen
La navegación móvil ya tiene:
- barra inferior tipo app
- iconografía clara
- menú lateral completo
- cierre intuitivo
- diseño responsive pensado para uso agrícola en campo
