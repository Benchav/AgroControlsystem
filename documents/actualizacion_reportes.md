# Actualización del Módulo de Reportes e IoT - Agro Control System

Mejoras y nuevas funciones implementadas en los módulos de IoT y Reportes para llevar el sistema a un nivel profesional (Senior/Alta Gama).

## 1. Módulo IoT (`IotPage.tsx`)

El panel de IoT se transformó en un centro de control y administración de hardware con las siguientes características:

*   **Integración Multimedia:**
    *   **Video de YouTube Embebido:** Se integró un video específico que se reproduce automáticamente, sin audio y con los controles e información de YouTube ocultos para una apariencia más limpia.
    *   **Modelo 3D (Sketchfab):** Se agregó un visor interactivo de un modelo 3D de un entorno Arduino/Planta para ofrecer una experiencia visual inmersiva.
*   **Gestión de Dispositivos (CRUD):** Implementación completa para crear, leer, actualizar y eliminar (simuladamente) placas Arduino.
*   **Simulación de Sensores:** Sistema dinámico para generar lecturas de sensores que simulan datos en tiempo real.
*   **Correlación de Datos:** Todos los datos generados y gestionados en este módulo se sincronizan y guardan en el `localStorage` (`ac_arduinos`, `ac_sensors`, `ac_alerts`), actuando como la única fuente de verdad para el resto de la aplicación.

## 2. Módulo de Reportes (`ReportsPage.tsx`)

La pantalla de reportes fue reescrita por completo (pasando de un boceto a un sistema de ~800 líneas) para ofrecer una experiencia analítica de primer nivel.

### Estructura de Pestañas
El panel se divide en 4 secciones principales:
1.  **Resumen Ejecutivo:** Vista general con gráficos de telemetría histórica combinada (Multi-sensor), tendencias individuales de temperatura y humedad, distribución de alertas y un inventario de tipos de sensores.
2.  **Análisis de Sensores:** Gráfico de evolución de CO2 y una tabla exhaustiva de todo el inventario de sensores con barras de salud visuales y coloreadas según el estado (OK, Atención, Crítico).
3.  **Reporte por Parcela:** Tarjetas individuales para cada zona o parcela, mostrando su índice de salud. Incluye un gráfico de Radar (`RadarChart`) para comparar múltiples dimensiones (Salud, Humedad, Temperatura) entre diferentes parcelas, y una tabla resumen.
4.  **Historial de Alertas:** Timeline cronológico ("Registro de Eventos") con diseño visual de estados y un gráfico de barras de frecuencia diaria.

### Funciones Analíticas y Gráficos
*   **KPIs Dinámicos:** Los indicadores de la parte superior (Salud del Sistema, Humedad Promedio, Arduinos Activos, Alertas) se calculan en tiempo real consumiendo los datos sincronizados del `localStorage`.
*   **Librería `recharts`:** Uso intensivo de gráficos modernos (`AreaChart`, `LineChart`, `BarChart`, `RadarChart`) con gradientes personalizados, tooltips detallados y líneas de referencia (umbrales críticos).
*   **Generación Sintética de Datos:** Funciones `generateDailyHistory` y `generateMultiSensorHistory` que generan curvas de datos realistas (con varianza calculada) adaptadas al período seleccionado (7, 14 o 30 días).

### Sistema Profesional de Exportación de Datos
Se integraron librerías de nivel empresarial para la generación de reportes descargables:

*   **Exportación CSV Rápida:** Función nativa para exportar tablas específicas con un solo clic. Genera el archivo con codificación UTF-8 BOM (`\uFEFF`) para compatibilidad perfecta con acentos en Excel, y sanitización de comas.
*   **Exportación Excel Multi-hoja (`xlsx` / SheetJS):**
    *   La función `exportExcel` genera un único archivo `.xlsx` estructurado en 6 hojas de cálculo separadas: *Resumen KPIs, Sensores, Arduinos, Parcelas, Alertas y Telemetria*.
    *   Ajuste automático de ancho de columnas para mejor legibilidad.
*   **Exportación PDF Profesional (`jspdf` + `jspdf-autotable`):**
    *   La función `exportPDF` construye un documento de múltiples páginas con orientación vertical (A4).
    *   **Diseño:** Tema oscuro (`#0a101b`), con recuadros redondeados, colores de branding (esmeralda, rojo, ámbar), encabezados formales y pie de página con paginación automática y fecha de generación.
    *   **Tablas Inteligentes:** Las celdas cambian de color automáticamente dependiendo de su valor (ej. verde para "OK" / "Activo", rojo para "Crítico" / "Inactivo") utilizando los hooks de `autotable`.

### Calidad de Código
*   Se corrigieron warnings de React (`useEffect` sin uso).
*   Se optimizaron las funciones de generación de datos usando `useMemo` para evitar re-renderizados innecesarios y caídas de rendimiento.
*   Se resolvieron conflictos de inferencia de tipos de TypeScript (Error `TS2345` en las claves dinámicas del historial) asegurando un build 100% libre de errores.
