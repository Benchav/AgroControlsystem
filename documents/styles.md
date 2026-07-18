# Agro Control — Manual de Identidad Visual y Diseño de Interfaz

Este manual técnico define la estructura del sistema de diseño, la paleta cromática, la tipografía y el catálogo de iconografía de la plataforma **Agro Control**.

---

##  1. Fundamentos Globales del Sistema

### 1.1 Paleta de Colores de la Marca
-   **Fondo de Aplicación (Surface/Background):** `#[000204]` — *Fondo oscuro general de la interfaz.*
-   **Fondo de Navegación (Sidebar Base):** `#[051c1a]` — *Fondo contrastado del menú lateral.*
-   **Color de Acento Primario (Smart Green):** `#[00e87e]` — *Color de estado activo e indicadores clave.*
-   **Color de Texto Primario:** `#[f9faf9]` — *Alta legibilidad para títulos y lecturas principales.*
-   **Color de Texto Secundario (Muted):** `#[949c9c]` — *Tonalidad suavizada para etiquetas y estados secundarios.*

### 1.2 Reglas de Tipografía e Iconografía General
-   **Familia Tipográfica Principal:** `[font-family: ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";]` - tipografia de tailwindcss por defecto
-   **Librería de Iconos Oficial:** `[Heroicons y lucidreact]` - iconos por default en React
---

##  Estructura de Paginas

### SECCIÓN: PRINCIPAL

#### 2.1 Dashboard
-   **Icono Identificador:** `[fa-th-large]` icono de grilla en el sidebar
-   **Color del icono:** `#[6ee7b2]`
-   **Color del texto:** `#[4c5e68]`
-   **Arquitectura de la Vista (Layout):** 
    -   *Fila Superior:* Header de contexto y estado global del sistema.
    -   *Bloque 1 (Métricas Principales):* Grid horizontal de 4 columnas con KPIs clave.
    -   *Bloque 2 (Control Operativo):* Split layout de 2 columnas principales (60% Alertas Recientes, 40% Estado de Sensores).
    -   *Bloque 3 (Widgets de Módulos):* Grid horizontal de 3 columnas para accesos rápidos (Diagnóstico, Asistente, Subastas).

    ##### ESPECIFICACIONES DE COMPONENTES (UI-UX)

    ###### A. Header de Contexto (Breadcrumbs & Status)
    -   **Elementos:** Título principal de la vista (`Dashboard`) con breadcrumb secundario (`Agro Control / Dashboard`).
    -   **Indicador de Conectividad:** Badge encapsulado a la derecha con un indicador circular parpadeante: `● 2 sensores activos` (`bg-emerald-950 text-emerald-400 border border-emerald-800`).
    -   **Notificaciones:** Icono de campana con contador flotante en rojo (`bg-red-600`) para alertas críticas pendientes.
    -   **Metadatos de Sincronización:** Subtexto informativo debajo del título indicando la API proveedora y la última hora de actualización (ej. *Sincronizado vía Open-Meteo Archive - 22:38*).

    ###### B. Tarjetas de Métricas Principales (Grid de 4 Columnas)
    *Diseño uniforme: Contenedores con bordes redondeados (`rounded-xl`), borde sutil gris-verdoso, títulos en mayúsculas pequeñas (Muted), valor principal gigante en blanco, y mini-gráficos de tendencia o estado.*

    1.  **Humedad Promedio:**
        -   *Iconografía:* Gota de agua con degradado azul.
        -   *Métrica:* Valor porcentual (ej. `89%`).
        -   *Elemento Visual:* Gráfico Sparkline de línea continua (`stroke-cyan-400`) que muestra el comportamiento de los últimos 50 días.
    2.  **Temperatura del Suelo:**
        -   *Iconografía:* Icono personalizado de sol y planta (Plant Growth).
        -   *Métrica:* Valor numérico en grados (ej. `23°C`).
        -   *Elemento Visual:* Sparkline plano de línea continua en amarillo (`stroke-amber-400`).
    3.  **Parcelas Activas:**
        -   *Iconografía:* Tractor agrícola estilizado en color verde.
        -   *Métrica:* Valor alfanumérico (ej. `5 P`).
        -   *Elemento Visual:* Línea de tendencia diagonal ascendente (`stroke-emerald-400`) que indica monitoreo satelital activo.
    4.  **Alertas Activas:**
        -   *Iconografía:* Campana de alerta con una notificación flotante interna.
        -   *Métrica:* Contador numérico entero (ej. `5`).
        -   *Elemento Visual:* Sparkline con picos críticos en color rojo/naranja (`stroke-red-500`).

    ###### C. Panel de Control Operativo (Contenedores Divididos)

    *   **Columna Izquierda: Alertas Recientes (Monitoreo 24/7)**
        -   *Contenedor Base:* Caja con scrollbar vertical personalizado y estilizado para mantener la consistencia oscura.
        -   *Tarjetas de Alerta (Alert Cards):* Bordes redondeados, botón de descarte (`X`) a la derecha, e indicador de tiempo relativo a la alerta (ej. *hace 12m*, *Ahora*).
        -   *Estados Clínicos de Alerta:*
            -   **Estado Crítico (Rojo con tonalidad Marrón):** Para anomalías graves o plagas confirmadas (ej. *Anomalía de presión*, *Plaga o Anomalía — Criadero El Progreso*). Fondo oscuro rojizo apagado con texto claro.
            -   **Estado de Advertencia (Amarillo estilo Militar):** Para actividades sospechosas de insectos o parámetros fuera de rango. Fondo marron apagado con icono de insecto/alerta.

    *   **Columna Derecha: Estado de Sensores**
        -   *Métricas de Avance:* Listado vertical de telemetría en tiempo real (Humedad, Temperatura, Parcelas, Alertas).
        -   *Componente UI Principal:* Indicador de progreso circular tipo "Semi-Dona" (Semi-circular Progress Gauge) a la izquierda, acompañado a la derecha por un gráfico de líneas extendido que muestra el histórico continuo de la métrica.
        -   *Código de Color de Gauges:* Sincronizados con la naturaleza del dato (Humedad = Cian/Verde, Temperatura = Amarillo, Alertas = Rojo).

    ###### D. Accesos Rápidos a Módulos (Fila Inferior - 3 Columnas)

    1.  **Diagnóstico IA:**
        -   *Resumen:* Muestra el conteo de plantas analizadas en el día y cuántas requieren atención urgente.
        -   *Badge de Diagnóstico:* Bloque con el resultado de la IA (ej. *Tomate Var. Cherry — Mildiu polvoroso 87% confianza*).
        -   *Call To Action (CTA):* Botón interactivo ` Analizar planta` con fondo verde oscuro opaco.
    2.  **Asistente Virtual:**
        -   *Resumen:* Indica el modelo LLM activo y el tiempo de respuesta estimado (ej. *Groq - Llama 3 — Respuesta en ~0.3s*).
        -   *Caja de Prompt:* Previsualización de la última consulta o sugerencia encerrada en un bloque de código/cita estilizado.
        -   *Call To Action (CTA):* Botón interactivo `Abrir chat`.
    3.  **Subastas:**
        -   *Resumen:* Muestra métricas de anuncios activos y subastas del día.
        -   *Grid Interno:* Dos micro-tarjetas que exponen la `Mayor oferta ($)` y las `Tierras rentadas (N°)`.
        -   *Call To Action (CTA):* Botón interactivo `Ver subastas`.
---

#### 2.2 Mapa Interactivo
-   **Icono Identificador:** `[fa-map-marked-alt]` mapa de localizacion
-   **Color del icono:** `#[6ee7b2]`
-   **Color del texto:** `#[4c5e68]`
-   **Arquitectura de la Vista (Layout):** 
    -   *Fila Superior:* Header de contexto y estado global (Sincronizado).
    -   *Bloque Principal (Split Layout 65/35):* 
        -   **Columna Izquierda (65%):** Visor del Mapa Interactivo del Terreno (Leaflet full-height).
        -   **Columna Derecha (35%):** Panel de información detallada de la parcela seleccionada y analíticas de suelo.
    -   *Bloque Inferior (Full Width):* Panel de gestión de parcelas por estado con filtrado por pestañas (*Tabs segmentados*).
##### ESPECIFICACIONES DE COMPONENTES (UI-UX)

###### A. Header de Contexto y Metadatos
-   **Elementos:** Título principal de la vista (`Mapa Interactivo`) con breadcrumb secundario (`Agro Control / Mapa Interactivo`).
-   **Subtexto Informativo:** Indicador de funcionalidades activas debajo del título principal en color azul/cian muted: `Delimitación de áreas en tiempo real · Censado de terreno`.

###### B. Contenedor de Mapa (Visor Geoespacial o satelital)
-   **Encabezado del Mapa:** Título interno (`Mapa interactivo del terreno`) con subtexto de instrucciones (`zoom, click por parcela, trazado de parcelas y lectura en vivo`).
-   **Badge de Proveedor:** Etiqueta flotante en la esquina superior derecha indicando el estado del mapa: `OSM - Live` (`bg-emerald-950 text-emerald-400 border border-emerald-800`).
-   **UI de Controles Flotantes:**
    -   *Control de Zoom:* Botonera vertical interna a la izquierda (`+` / `-`).
    -   *Capas y Herramientas:* Botonera vertical a la derecha con iconos de geolocalización, capas y edición geométrica.
-   **Capas de Polígonos (GeoJSON Styles):** Estilos de las parcelas delimitadas según su estado operativo:
    -   *Verde / Óptimo:* Polígono con relleno semi-transparente verde (`rgba(16, 185, 129, 0.2)`) y borde verde sólido. Incluye marcador flotante de texto (*Tooltip Tool*): `Cafetal Don Roberto`.
    -   *Naranja / Atención:* Polígono con relleno ocre/naranja semi-transparente para zonas con avisos (ej. *Galerías Don José*, *Campos El Mirador*).
    -   *Rojo / Crítico:* Polígono con relleno rojo/marrón semi-transparente para sectores infectados o sin lecturas (ej. *Criadero El Progreso*).

 ###### C. Panel de Detalle (Parcela Seleccionada)
*Diseño de barra lateral acoplada para inspección rápida de datos agronómicos.*

1.  **Cabecera de la Parcela:**
    -   Título principal con el nombre del lote destacado en verde grande (`Cafetal Don Roberto`).
    -   Metadatos en texto secundario indicando extensión de tierra y tiempo de refresco (`4.2 ha - Última lectura hace 2 min`).
2.  **Grid de Telemetría Rápida (2x2):**
    -   *Humedad / Fertilidad / Temperatura / Estado:* Cuatro micro-tarjetas con bordes redondeados, títulos en mayúsculas pequeñas y el valor de lectura en formato grande y contrastado en blanco.
3.  **Acción Principal:**
    -   Botón de ancho completo (`w-full`) en color verde sólido con texto centrado: `Editar Parcela` (`bg-emerald-600 hover:bg-emerald-700 text-white`).

###### D. Métricas de Fertilidad y Suelo (Widget Analítico)
-   **Título del Bloque:** `Métricas de Fertilidad y Suelo — [Nombre dinamico de la Parcela]` con menú de tres puntos (`...`) a la derecha para acciones adicionales.
-   **Gráfico de Tacómetro (Gauge Chart):** Un semicírculo central graduado con aguja que indica el porcentaje de la métrica (ej. *79% Tasa de Fertilidad*). El arco cambia de color transicionando de rojo a verde.
-   **Gráfico de Tendencia Histórica (Timeline Chart):** Gráfico de líneas multivariable (dos líneas concurrentes en color amarillo y cian) que detalla el comportamiento del suelo en las últimas horas (escala 0 a 24h).

###### E. Gestión de Parcelas por Estado (Panel Inferior)
-   **Sub-encabezado:** Título de sección (`Gestión de parcelas por estado`) con una breve descripción (`Monitoreo segmentado y acciones rápidas`).
-   **Control de Filtros (Tabs de Estado):** Grupo de botones horizontales para segmentación de datos en tiempo real:
    -   `Todas` (Estado activo/seleccionado con fondo azul/verde agua).
    -   `Óptimo`, `Atención`, `Crítico` (Estados inactivos con bordes suaves).
-   **Grid de Tarjetas de Parcelas:**
    -   *Estructura de Tarjeta:* Título del lote, tamaño en hectáreas (`ha`), un badge de estado a la derecha alineado al título (`Óptimo` en verde, `Atención` en amarillo, `Crítico` en rojo) y un botón *Ghost* en la parte inferior: `Editar / Eliminar`.
---

### SECCIÓN: MÓDULOS

#### 2.3 Sensores IoT
-   **Icono Identificador:** `[Añadir Icono / Clase]` (Ej: `cpu` o `microchip`)
-   **Color Temático / Token:** `#[Añadir Hexadecimal]`
-   **Especificaciones de Diseño:**
    -   *Estados de Conexión:* Estilo visual para los badges de sensores `En línea`, `Desconectado` o `Batería Baja`.
    -   *Paneles de Control:* Estructura de los selectores de telemetría y filtrado por tipos de datos analizados.

#### 2.4 Diagnóstico IA
-   **Icono Identificador:** `[Añadir Icono / Clase]` (Ej: `brain` o `leaf`)
-   **Color Temático / Token:** `#[Añadir Hexadecimal]`
-   **Especificaciones de Diseño:**
    -   *Carga de Archivos (Dropzone):* Estados interactivos de arrastrar/soltar imágenes médicas de cultivos.
    -   *Resultados del Modelo:* Formato visual de los reportes automatizados de patologías y porcentajes de acierto.

#### 2.5 Asistente / Expertos
-   **Icono Identificador:** `[Añadir Icono / Clase]` (Ej: `message-square`)
-   **Color Temático / Token:** `#[Añadir Hexadecimal]`
-   **Especificaciones de Diseño:**
    -   *Hilos de Conversación:* Estilo diferenciado para burbujas de texto del sistema (Bot), agronómos y usuario.
    -   *Panel de Control:* Listado lateral de chats históricos y agrónomos activos listos para consultoría.

#### 2.6 Subastas
-   **Icono Identificador:** `[Añadir Icono / Clase]` (Ej: `gavel`)
-   **Color Temático / Token:** `#[Añadir Hexadecimal]`
-   **Especificaciones de Diseño:**
    -   *Fichas de Producto:* Tarjetas con contadores de tiempo en reversa, precios base e incrementos visuales.
    -   *Historial de Pujas:* Tablas de transacciones financieras rápidas con estados de puja ganada o superada.

---

### SECCIÓN: SISTEMA

#### 2.7 Modelos 3D
-   **Icono Identificador:** `[Añadir Icono / Clase]` (Ej: `box` o `3d-cube`)
-   **Color Temático / Token:** `#[Añadir Hexadecimal]`
-   **Especificaciones de Diseño:**
    -   *Lienzo de Renderizado (Canvas):* Dimensionamiento, bordes y masks sobre los visores 3D de maquinaria.
    -   *Herramientas Flotantes:* Botones transparentes (Glassmorphism) para la manipulación de cámaras y vistas.

#### 2.8 Reportes
-   **Icono Identificador:** `[Añadir Icono / Clase]` (Ej: `file-text` o `bar-chart`)
-   **Color Temático / Token:** `#[Añadir Hexadecimal]`
-   **Especificaciones de Diseño:**
    -   *Filtros y Rangos:* Formularios limpios para selección temporal (Date Pickers) y tipos de exportación.
    -   *Tablas de Reporte:* Cabeceras estáticas, filas alternadas (Zebra striping) y pie de página de paginación.

#### 2.9 Configuración
-   **Icono Identificador:** `[Añadir Icono / Clase]` (Ej: `settings`)
-   **Color Temático / Token:** `#[Añadir Hexadecimal]`
-   **Especificaciones de Diseño:**
    -   *Formularios Técnicos:* Diseño de componentes inputs, toggles de activación, selectores de idioma y temas.

---

## 👤 3. Footer / Perfil de Usuario
-   **Identificación del Perfil:** `oscar demo (Administrador)`
-   **Acciones Directas:** Icono de Ajustes Rápidos (`⚙️`) e Icono de Salida Segura (`🚪`).
-   **Especificaciones de Diseño:** Tipografía compacta, estilos de la imagen del avatar o iniciales corporativas y alineación en la parte inferior de la barra lateral.