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
-   **Icono Identificador:** `[Añadir Icono / Clase]` (Ej: `map`)
-   **Color Temático / Token:** `#[Añadir Hexadecimal]`
-   **Especificaciones de Diseño:**
    -   *Capas y Polígonos:* Estilos de renderizado sobre mapas (Bordes, opacidades de zonas geográficas).
    -   *Tooltips & Modales:* Diseño de ventanas flotantes e interfaces de información rápida al hacer clic.

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