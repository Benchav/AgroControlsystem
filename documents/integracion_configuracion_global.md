# Integración de Configuración Global y Persistencia

## Visión General
Esta actualización introduce un sistema de configuración global con persistencia de datos reales para la plataforma **Agro Control System**. Anteriormente, la pantalla de ajustes (`SettingsPage.tsx`) contenía valores estáticos (mock) que no afectaban el funcionamiento del resto de la aplicación. Con esta nueva integración, los ajustes definidos por el usuario se guardan localmente y se reflejan dinámicamente en todos los módulos (IoT, Chat, Reportes, etc.).

## Cambios Realizados

### 1. Persistencia Local (`localStorage`)
Se implementó un sistema de persistencia basado en `localStorage` para garantizar que la configuración del usuario y los umbrales del sistema se mantengan entre sesiones del navegador.
- Los datos del **Perfil de Usuario** (Nombre, Email, Organización) se guardan de forma persistente.
- Los **Umbrales del Sistema** (Humedad, Temperatura, pH) ahora son valores reales y configurables.

### 2. Gestión de Estado Global (Hooks / Storage)
Para correlacionar la configuración con el resto del sistema, se actualizaron las utilidades de almacenamiento y gestión de estado.
- Esto permite acceder de forma reactiva y estandarizada a los umbrales configurados.
- Si un usuario modifica la alerta de temperatura máxima a 35°C, los módulos correspondientes como **IoTPage** o los análisis del sistema basarán sus cálculos y alertas visuales en este nuevo valor guardado.

### 3. Rediseño Profesional de `SettingsPage`
Se actualizó la interfaz de la página de ajustes para que actúe como un panel de control profesional y funcional:
- **Mejoras Visuales:** Se integraron controles deslizantes (sliders) personalizados con estilos alineados a la estética general de la aplicación (UI oscura, esmeralda y glassmorphism).
- **Iconografía Completa:** Integración total de iconos representativos (vía `lucide-react`) para cada sección de los ajustes, facilitando la navegación.
- **Feedback Interactivo:** Se implementó retroalimentación visual al guardar (alertas tipo toast y cambios de estado), lo que mejora significativamente la experiencia del usuario (UX) confirmando que sus acciones tuvieron efecto.

## Beneficios
- **Experiencia de Usuario Mejorada:** La aplicación ahora se siente como un producto terminado y personalizable.
- **Escalabilidad:** Al centralizar la lectura de estas configuraciones, futuras integraciones (como lógicas de notificaciones push o reportes automatizados) podrán leer directamente los umbrales establecidos en el panel.
- **Cohesión de Diseño:** La interfaz del panel de ajustes mantiene y eleva el estándar de diseño *premium* que caracteriza al dashboard.
