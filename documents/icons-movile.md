# Iconos y Menú Móvil

## Objetivo
Esta guía explica cómo se ve y cómo funciona la navegación móvil de Agro Control, para que cualquier persona del equipo la entienda sin entrar al código.

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
