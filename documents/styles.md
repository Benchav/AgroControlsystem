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

#### 2.3 Sensores IoT
-   **Icono Identificador:** `[fa-microchip]` icono de GPU
-   **Color del icono:** `#[6ee7b2]`
-   **Color del texto:** `#[4c5e68]`
-   **Arquitectura General de la Vista:**
    -   *Fila Superior Global:* Header con breadcrumbs (`Agro Control / Sensores IoT`) y badge de simulación activa: `● Simulación en Vivo Activa` (`bg-emerald-950 text-emerald-400`).
    -   *Fila de KPIs Fijos:* Grid horizontal de 4 columnas (Placas Arduino, Humedad Promedio, Sensores en Línea, Alertas Activas).
    -   *Navegación Interna (Tabs):* Sistema de segmentación mediante tres botones con bordes redondeados tipo píldora (`Monitoreo en Vivo`, `Administración Arduino`, `Guías y Tutoriales`).

##### ESPECIFICACIONES DE COMPONENTES POR TAB (UI-UX)

### TAB 1: Monitoreo en Vivo

#### A. Gráfico de Telemetría General (Time-Series Chart)
-   **Título del Bloque:** `Telemetría de Humedad en Tiempo Real` con bajada explicativa (`Fluctuación del promedio de humedad del suelo en parcelas monitoreadas`).
-   **Estilo del Gráfico:** Gráfico de línea cronológico extendido con un stroke verde agua (`stroke-emerald-400`). El eje X muestra marcas de tiempo precisas en formato `HH:MM:SS` (ej. `14:23:13`) actualizándose de forma continua.

#### B. Grid de Módulos de Telemetría en Tiempo Real (Métricas de Campo)
*Matriz de tarjetas que renderizan las lecturas directas del hardware. Cada una incluye un tag en la esquina superior derecha con el identificador de la placa (ej. `ARD-MEGA-01`, `ARD-UNO-02`) y un badge de estado en el footer (`✓ OK` en verde, `✓ Crítico` o `Placa Desconectada` en rojo).*

-   **Humedad del Suelo:** Muestra el porcentaje actual (ej. `14%`) mapeado a su parcela física y sensor (ej. `Parcela Norte - S01`).
-   **Temperatura Suelo:** Muestra la temperatura en grados centígrados (ej. `23°C`) asignada a su sector (ej. `Sector 2A - S05`).
-   **Humedad Zona Crítica:** Estado alternativo de pérdida de señal. Muestra líneas continuas (`---`), badge rojo de error y subtexto descriptivo.
-   **Parámetros Químicos y Ambientales:** Bloques adicionales dedicados a la lectura de acidez (`9.2 pH`), nutrientes (`118 mg/kg` de Nitrógeno) y acumulación de gases (`707 ppm` de $CO_2$).

#### C. Historial Operativo e Inventario Completo
-   **Detección de Anomalías y Plagas:** Contenedor con scroll vertical que aloja las alertas activas del sistema. Incluye la marca de tiempo relativa (`hace 12m`, `Ayer`), el grado de severidad (`CRÍTICO` / `ADVERTENCIA`) y un botón de acción interactivo en verde oliva texturizado: `Marcar como atendido / corregido`.
-   **Tabla de Inventario de Hardware (Todos los sensores):**
    -   *Estilo:* Cabecera sólida azul/slate (`bg-slate-800`), líneas divisorias horizontales muy finas y tipografía monoespaciada para códigos identificadores de sensores (`S01`, `S05`). Muestra de forma tabular: Sensor, Tipo, Ubicación, Placa Arduino, Lectura y Estado.

### TAB 2: Administración Arduino

#### A. Renderizado del Prototipo Físico (Visualizador de Hardware)
-   **Título del Bloque:** `Prototipo Físico IoT: Aula 19 — Plantas Felices II` con subtítulo (`Modelo interactivo 3D del microcontrolador conectado al cultivo`).
-   **Viewport de Renderizado (Canvas 3D):** Ventana con esquinas redondeadas que carga la maqueta virtual interactiva del conexionado de hardware (Placas Arduino Uno R3, protoboards, cableado Dupont y sensores resistivos). Incluye un botón flotante de maximizado e icono de volumen/rotación.
-   **Subtexto de Instrucción:** Caja de texto informativa destacada con un icono de bombilla (`Inspección Virtual 3D`) para guiar al usuario en la manipulación espacial del modelo.

#### B. Listado de Placas de Desarrollo Conectadas
-   **Botón de Acción:** Control superior alineado a la derecha en color turquesa brillante para dar de alta nuevo hardware: `+ Crear Nuevo`.
-   **Fichas de Dispositivos (Device Cards):** Contenedores individuales oscuros con un indicador de estado a la izquierda (`● ARD-MEGA-01 ACTIVO` en verde, `● ARD-NANO-03 INACTIVO` en rojo).
-   **Ficha Técnica de la Placa:** Detalla las variables del firmware configuradas: Ubicación física, tasa de baudios (ej. `115200 baudios`, `9600 baudios`) y la frecuencia de muestreo establecida (ej. `2s de lectura`).
-   **Acciones de Control:** Botonera lateral derecha por dispositivo con acciones críticas: `Desactivar` / `Activar` (estilo Ghost/Bordered) y `Eliminar` (fondo rojo vino opaco `bg-red-950`).

### TAB 3: Guías y Tutoriales

#### A. Reproductor Técnico Integrado (Layout Split 60/40)
-   **Columna Izquierda (60%): Contenedor de Video**
    -   *Elemento:* Reproductor de video incrustado (Iframe/YouTube Video) que carga el video-tutorial en formato vertical/adaptativo (`Configuración e Instalación del Sensor`).
    -   *Pie de Contenedor:* Badge de recomendación de ingeniería con fondo verde oscuro que detalla consejos contra la corrosión de electrodos por electrólisis mediante el uso de sensores capacitivos v1.2.

-   **Columna Derecha (40%): Documentación Adjunta**
    -   *Esquema de Conexión:* Lista ordenada y limpia del hardware requerido con el desglose exacto de unidades necesarias (ej. *Arduino Board, Sensor FC-28, Cables Dupont, Resistencia 10k Ohm*).
    -   *Código Arduino Básico (Code Block):* Bloque de código integrado con resaltado de sintaxis (*Syntax Highlighting*) para temas oscuros que expone el sketch base de inicialización (`void setup()`, `void loop()`) y funciones de mapeo analógico para el sensor de humedad.
---
#### 2.4 Diagnóstico IA
-   **Icono Identificador:** `[fa-brain]` icono de cerebro
-   **Color del icono:** `#[6ee7b2]`
-   **Color del texto:** `#[4c5e68]`
-   **Arquitectura de la Vista (Layout):** 
    -   *Fila Superior:* Header principal con breadcrumbs (`Agro Control / Diagnóstico IA`) y barra de estado global del sistema.
    -   *Bloque Central (Split Layout 55/45):* 
        -   **Columna Izquierda (55%):** Panel operativo de carga de medios y disparadores de ejecución del modelo LLM.
        -   **Columna Derecha (45%):** Visor de reportes técnicos generados por la Inteligencia Artificial.
    -   *Bloque Inferior (Full Width):* Historial cronológico de análisis guardados con sistema de búsqueda y previsualización en grid.

##### ESPECIFICACIONES DE COMPONENTES (UI-UX)

###### A. Panel Operativo de Diagnóstico (Carga y Control)
-   **Encabezado Técnico:** Título interno (`Diagnóstico visual Gemini 2.5 Flash`) con subtexto indicativo de flujo de trabajo (`Sube una imagen o toma una foto y obtén el informe en texto`).
-   **Zona de Carga (Dropzone Interactiva):**
    -   Contenedor con borde discontinuo / punteado verde (`border-dashed border-emerald-700`).
    -   Instrucciones de acción rápida en texto grande y blanco: `Carga una foto o toma una imagen desde tu dispositivo`.
    -   Botonera doble interna: Botón primario sólido `Subir imagen` (`bg-emerald-600`) y botón secundario Ghost `Tomar foto`.
-   **Contenedor de Previsualización (Image Preview Window):**
    -   Caja con esquinas redondeadas (`rounded-xl`) de fondo claro mate que sirve como lienzo de validación de la imagen cargada. Muestra un estado vacío por defecto (`NO IMAGE AVAILABLE`) con un placeholder vectorial de fotografía.
-   **Barra de Acciones Críticas:**
    -   `Analizar enfermedad`: Botón de disparo principal en verde brillante.
    -   `Limpiar`: Botón neutral Ghost para resetear los campos.
    -   `Descargar Informe`: Botón en estado deshabilitado (`disabled:opacity-50`) que se activa únicamente tras recibir la respuesta del modelo.

###### B. Visor de Reportes (Resultado del Análisis)
-   **Cabecera del Widget:** Título del módulo (`Resultado del análisis con Gemini`) acompañado de la etiqueta de tipología de documento (`Reporte profesional estructurado`).
-   **Área de Contenido Dinámico:** Contenedor vertical dedicado a renderizar el markdown textual del diagnóstico agronómico. Presenta un estado inicial ilustrativo (Lupa con indicador de búsqueda / error) antes de procesar los datos de los cultivos.

###### C. Historial de Análisis Guardados (Módulo de Persistencia)
-   **Filtros de Búsqueda:** Input de búsqueda de ancho completo con icono de lupa interna (`SearchIcon`) y placeholder descriptivo (`Buscar por nombre de archivo...`).
-   **Acción Global:** Botón de vaciado de registros alineado a la derecha en color rojo vino/marrón opaco: `Borrar historial` (`bg-red-800 text-white`).
-   **Grid de Tarjetas de Historial (4 Columnas):**
    *Diseño compacto para auditoría histórica de patologías.*
    -   *Encabezado de Tarjeta:* Imagen en miniatura recortada en cuadrado (`aspect-square object-cover`) de la hoja analizada.
    -   *Metadatos:* Nombre del archivo de origen (ej. `leaveSick.jpg`, `leaveYellow.webp`) alineado a la izquierda, y marca de fecha/hora a la derecha (ej. `22/5/26, 19:30`).
    -   *Cuerpo (Snippet de Diagnóstico):* Texto truncado de los primeros caracteres del reporte médico (ej. *Resultado: Clorosis interveinal severa en hojas...*).
    -   *Botonera de Control:* Fila inferior con dos acciones por registro: `Descargar informe` (Link interactivo en verde) y `Borrar` (Botón de eliminación en rojo sólido).
 ---

#### 2.5 Asistente / Expertos
-   **Icono Identificador:** `[fa-comments]` icono de chats o comentarios
-   **Color del icono:** `#[6ee7b2]`
-   **Color del texto:** `#[4c5e68]`
-   **Arquitectura de la Vista (Layout - Split Layout 25/75):**
    -   **Columna Izquierda (25%):** Barra lateral interna (*Sidebar secundario*) para el canal de comunicación y lista de contactos.
    -   **Columna Derecha (75%):** Interfaz principal de la sala de chat activa con área de scroll de mensajes, sugerencias rápidas y barra de entrada de texto.

##### ESPECIFICACIONES DE COMPONENTES (UI-UX)

###### A. Canal de Comunicación (Lista de Contactos)
-   **Encabezado del Módulo:** Título interno (`Canal de comunicación`) acompañado de la etiqueta de estado (`Contactos disponibles`).
-   **Fichas de Contacto (Contact Cards):** Contenedores individuales con bordes redondeados y micro-layouts internos de dos columnas:
    -   *Columna Foto:* Avatar circular (`rounded-full`) con reborde estilizado.
    -   *Columna Información:* Nombre del contacto en texto principal y su rol o especialidad en texto secundario (*Muted*).
-   **Tipos de Contacto y Estados Visuales:**
    -   **Asistente Automatizado (IA):** Destacado en estado activo con un borde verde sólido (`border-emerald-600`) y fondo contrastado. Identificador: `Asistente IA - Llama 3 - Groq API`.
    -   **Especialistas Humanos:** Tarjetas con bordes sutiles en gris-oscuro para ingenieros agrónomos de soporte (ej. *María Campos — Especialista - Cultivos*, *Jorge Méndez — Suelos - Fertilización*, *Ana López — Plagas - Entomología*).

###### B. Sala de Chat Activa (Chat Interface)
-   **Encabezado del Chat:** Muestra el nombre del canal actual (`Asistente AgroControl`) y una etiqueta de estado de latencia de red (`Respuesta instantánea`).
-   **Ventana de Conversación (Chat Feed):**
    -   Contenedor con scroll vertical e hilos de mensajes estructurados de forma asíncrona.
    -   *Burbuja de Mensaje de la IA/Sistema:* Alineada a la izquierda, caja grisácea con esquinas suavizadas, texto blanco legible y marca de tiempo en formato de 24 horas (`15:01`) alineada a la esquina inferior derecha interna de la burbuja.

###### C. Controles de Entrada y Sugerencias (Chat Input Deck)
-   **Botones de Sugerencia Rápida (Quick Action Chips):**
    -   Fila horizontal de etiquetas redondeadas tipo píldora con bordes delgados (*Ghost style*) que actúan como disparadores automáticos de preguntas frecuentes (ej. *¿Qué hace el dashboard?*, *Explícame el flujo de sensores*, *¿Cómo veo reportes?*, *¿Dónde cambio la configuración?*).
-   **Barra de Entrada de Texto (Input Field):**
    -   Input alargado con bordes muy redondeados de fondo oscuro mate (`bg-slate-900/80`) y placeholder descriptivo: `Escribe tu consulta agronómica...`.
-   **Acción de Envío (Send Button):**
    -   Botón circular independiente a la derecha en color verde sólido (`bg-emerald-500 hover:bg-emerald-600`) que aloja el icono de envío de papel o flecha de acción (`paper-plane`).
---

#### 2.6 Subastas
-   **Icono Identificador:** `[fa-store]` icono de tienda
-   **Color del icono:** `#[6ee7b2]`
-   **Color del texto:** `#[4c5e68]`
-   **Arquitectura de la Vista (Layout):**
    -   *Fila Superior:* Header de navegación (`Agro Control / Subastas`) junto con el panel superior de controles comerciales (Buscador, Filtros por categorías y botón de creación).
    -   *Bloque Principal (Main Grid):* Grid de tarjetas adaptativo en malla multi-columna (5 columnas en pantallas amplias) para la exposición masiva del catálogo de lotes disponibles.

##### ESPECIFICACIONES DE COMPONENTES (UI-UX)

###### A. Barra de Control Comercial y Filtrado
-   **Encabezado del Módulo:** Título principal (`Mercado de Subastas`) acompañado de un subtexto con los tipos de transacciones soportadas (`Tierras en alquiler · Cultivos en venta · Subastas activas`).
-   **Botón de Creación:** Control superior destacado a la derecha en color verde turquesa sólido para dar de alta ofertas: `+ Nueva Subasta` (`bg-emerald-500 text-white`).
-   **Buscador Integrado:** Input horizontal a la izquierda con un icono de lupa y placeholder predictivo (`Buscar por nombre, categoría o estado...`).
-   **Segmentación por Categorías (Filter Tabs):** Fila de botones con esquinas redondeadas tipo píldora, acompañados de iconos temáticos específicos para clasificar el catálogo:
    -   `Todos` (Fila seleccionada por default / Fondo slate contrastado).
    -   `Alimentos`
    -   `Animales`
    -   `Parcelas`

###### B. Tarjetas del Catálogo de Subastas (Product Cards)
*Estructura modular repetible y limpia para cada lote en venta o alquiler. Cuenta con un layout vertical dividido en medios, textos informativos y acciones secundarias.*

1.  **Bloque Multimedia Superior:**
    -   Fotografía del producto o terreno recortada en relación de aspecto fija (`aspect-video object-cover`).
    -   **Capa de Gestión Flotante (Hover Actions):** Dos iconos pequeños redondeados en la esquina superior derecha para control administrativo del catálogo: Editar (Icono de lápiz amarillo ) y Borrar (Icono de papelera roja ).
2.  **Cuerpo Informativo (Text & Metadata):**
    -   **Título del Lote:** Tipografía en negrita y blanca (ej. *Tomates Orgánicos*, *Parcela en Jinotepe*, *Vaca Lechera*).
    -   **Descripción Corta:** Snippet textual descriptivo en tipografía secundaria grisácea (*Muted*) detallando el estado de la oferta.
3.  **Fila de Estados y Precios (Badges & Pricing):**
    -   *Columna Izquierda (Badge de Estado):* Etiquetas redondeadas con opacidad de fondo para indicar la fase comercial del lote:
        -   `disponible`  (Fondo verde tenue con texto verde claro).
        -   `pendiente`  (Fondo ocre/amarillo con texto amarillo).
        -   `no disponible`  (Fondo rojizo con texto rosa/rojo).
    -   *Columna Derecha (Valor Comercial):* Tipografía grande en verde brillante (`text-emerald-400 font-semibold`) que expone el valor monetario o la puja más alta del lote (ej. `$5.70`, `$25000.00`, `$1800.00`).
4.  **Acción de Inspección (CTA):**
    -   Botón de ancho completo en la base de la tarjeta con estilo Ghost/Bordeado delgado: `Ver detalles` el cual abre un modal con mas detalles de acciones que realizar.
---

#### 2.7 Modelos 3D
-   **Icono Identificador:** `[fa-cube]` icono de cubo 3D
-   **Color del icono:** `#[6ee7b2]`
-   **Color del texto:** `#[4c5e68]`
-   **Arquitectura de la Vista (Layout):**
    -   *Fila Superior:* Header de navegación global (`Agro Control / Modelos 3D`) y panel superior con título de módulo y botón de carga de assets.
    -   *Bloque Principal (Asset Grid):* Grid adaptativo en malla de 3 columnas para la administración y visualización del catálogo de gemelos digitales y modelos tridimensionales del entorno agrícola.

##### ESPECIFICACIONES DE COMPONENTES (UI-UX)

###### A. Panel Superior de Gestión de Assets
-   **Encabezado del Módulo:** Título principal de la sección (`Modelos 3D Disponibles`) acompañado de un subtexto técnico indicando la finalidad del panel (`Administración de assets y métricas agrícolas`).
-   **Acción de Carga Principal:** Botón superior alineado a la derecha en color verde turquesa sólido para la inyección de nuevos archivos tridimensionales: `+ Añadir Objeto 3D` (`bg-emerald-500 text-white`).

###### B. Tarjetas del Catálogo de Modelos (Asset Cards)
*Estructura de tarjeta limpia y modular diseñada para aislar visualmente el render del modelo e identificar rápidamente al diseñador o responsable del asset.*

1.  **Lienzo de Previsualización Superior (Viewport Container):**
    -   Caja negra mate con esquinas fuertemente redondeadas (`rounded-xl`) que sirve como contenedor base.
    -   **Render de Asset:** Espacio centralizado para el renderizado estático o interactivo (vía canvas de Three.js / React Three Fiber) del objeto 3D con fondo oscuro absoluto para resaltar las texturas y geometrías del asset (ej. *Porcino, Heno, Maíz, Girasol, Macetera, Maqueta Arduino, Yuca, Ayote, Cebolla, Chiltoma, Tomate, Zanahoria*).
2.  **Fila de Metadatos y Acción (Footer Deck):**
    -   *Columna Izquierda (Identificación Técnica):* 
        -   **Nombre del Asset:** Título en negrita y tipografía blanca clara con el prefijo estandarizado (ej. `Diseño de Porcino`, `Diseño de Arduino`).
        -   **Autor / Responsable:** Subtexto en tipografía secundaria grisácea (*Muted*) que detalla el usuario que dio de alta o modeló el asset (ej. `Oscar`, `Joshua`).
    -   *Columna Derecha (CTA de Inspección):*
        -   Botón compacto interactivo en color verde sólido brillante con texto centrado: `Ver modelo` (`bg-emerald-500 text-slate-900 font-medium px-4 py-1 rounded-lg`). Actúa como disparador para abrir el viewport interactivo 3D a pantalla completa o modal de edición de mallas.

---

#### 2.8 Reportes
-   **Icono Identificador:** `[fa-chart-line]` icono de grafico de linea
-   **Color del icono:** `#[6ee7b2]`
-   **Color del texto:** `#[4c5e68]`
-   **Arquitectura General del Bloque Superior (Común en la Vista):**
    -   *Fila de Control:* Header dinámico (`Agro Control / Reportes`) con un panel derecho que aloja selectores de rango temporal de píldora interactiva (`Última semana`, `Últimas 2 semanas`, `Último mes`) y un botón dropdown primario: `Exportar` este exporta en csv , pdf o excel.
    -   *Fila de KPIs Analíticos Fijos:* Grid horizontal de 4 columnas que muestra la salud del ecosistema:
        -   **Salud del Sistema:** Porcentaje global (ej. `67%`) con barra de progreso y tag de estado (`ATENCIÓN`).
        -   **Humedad Promedio:** Porcentaje crítico del suelo (ej. `9%`) con tag de estado (`CRÍTICO`).
        -   **Arduinos Activos:** Relación de hardware online (ej. `2/3`) con el conteo fuera de línea.
        -   **Alertas Activas:** Cuantificador de incidencias (ej. `5`) con desglose de severidad.
    -   *Navegación Interna por Sub-pestañas:* Sistema de pestañas con bordes limpios y badges descriptivos (`Resumen Ejecutivo`, `Análisis de Sensores`, `Reporte por Parcela`, `Historial de Alertas`).

#####  ESPECIFICACIONES DE COMPONENTES POR TAB (UI-UX)

### TAB 1: Resumen Ejecutivo

#### A. Gráfico de Telemetría Histórica (Multi-Axis Line Chart)
-   **Título del Bloque:** `Telemetría Histórica — Última semana` con subtítulo explicativo (`Correlación de sensores activos en el período seleccionado`).
-   **Leyendas Activas:** Micro-badges de color circular para `Humedad` (Azul claro), `Temperatura` (Naranja/Amarillo) y `pH` (Morado).
-   **Estilo del Gráfico:** Gráfico multilínea cronológico continuo que cruza las tres variables en el eje Y contra los días de la semana en el eje X (ej. `12 Jul` a `18 Jul`).
-   **Acción de Cierre:** Enlace interactivo inferior derecho para descarga rápida: ` Exportar telemetría como CSV`.

#### B. Grid de Tendencias Específicas
-   **Tendencia de Humedad:** Gráfico de área suavizada (`AreaChart`) en azul turquesa mapeando el promedio del suelo a 7 días, delimitado por una línea base discontinua de umbral mínimo.
-   **Tendencia de Temperatura:** Gráfico de área suavizada con degradado en tonos cálidos (naranja a amarillo) que mapea el comportamiento térmico del suelo agrícola a 7 días.

#### C. Distribución Operativa e Inventarios
-   **Distribución de Alertas:** Widget analítico que muestra barras horizontales de progreso porcentual segmentadas por colores según criticidad (`Críticas` en rojo, `Advertencias` en amarillo, `Resueltas` en verde), complementado con tarjetas numéricas independientes en la base para auditoría directa.
-   **Inventario de Sensores:** Gráfico de barras horizontales sólidas en color verde esmeralda para cuantificar la densidad de hardware según el tipo de métrica registrada (`Humedad`, `Temperatura`, `pH`, `Nutrientes`, `Gas`).


### TAB 2: Análisis de Sensores

#### A. Evolorado Analítico de Gases ($CO_2$ en Suelo)
-   **Título del Bloque:** `Evolución de CO₂ en Suelo` con descripción técnica (`Concentración de dióxido de carbono - 7 días`).
-   **Estilo de Visualización:** Gráfico de área con gradiente lineal morado profundo (`stroke-purple-400`) que mapea densidades de partículas desde $0$ hasta $1000\text{ ppm}$ en el eje vertical, reflejando el comportamiento respiratorio bacteriano del suelo a lo largo de la semana.

#### B. Inventario Completo de Sensores (Data Table Avanzada)
-   **Tabla de Datos Estructurada:** Muestra la totalidad de los nodos de hardware mediante un diseño tabular optimizado (`w-full text-left`).
    -   *Columnas:* ID (Monoespaciado y subrayado en verde), Nombre, Tipo de Sensor, Ubicación física (Badge gris encapsulado), Placa Arduino vinculada, Lectura Actual (En negrita), Estado (Badge de color reactivo) y Barra de Salud.
    -   *Estados Soportados en la Fila:*
        -   `CRÍTICO` / Barra de salud mínima roja (ej. `S01 - Humedad del Suelo`).
        -   `OK` / Barra de salud completa verde (ej. `S02 - Temperatura Suelo`).
        -   `OFFLINE` / Texto atenuado `— Sin señal —` y barra vacía (ej. `S09 - Humedad Zona Crítica`).

### TAB 3: Reporte por Parcela

#### A. Grid de Monitoreo Topográfico (Micro-Dashboard Cards)
*Matriz de tarjetas que agrupan los indicadores de salud agregados por subdivisiones físicas de la finca o cultivo.*
-   **Encabezado de Tarjeta:** Nombre de la parcela en negrita (ej. *Cafetal Don Roberto*, *Matadero La Esperanza*, *Galeras Don Jose*) acompañado de un badge de salud porcentual en verde brillante (ej. `100%`, `93%`).
-   **Métricas Internas:** Malla interna de 4 celdas que resume los valores clave del terreno: `Humedad %`, `Temperatura °C`, `Fertilidad %` y el `Área` total expresada en hectáreas (`ha`).

#### B. Gráfico Multidimensional (Radar Chart)
-   **Componente:** Gráfico de araña/radar centrado (`RadarChart`) que sobrepone polígonos radiales para comparar la salud y humedad de todas las parcelas registradas simultáneamente, permitiendo identificar asimetrías de riego de un vistazo.

#### C. Tabla Comparativa de Parcelas
-   **Estructura:** Lista indexada de terrenos que expone de forma tabular el nombre, barra de rendimiento visual para salud, y los valores crudos de sus variables. Finaliza con un badge de estado de productividad del suelo: `ÓPTIMO` (`bg-emerald-950 text-emerald-400`).

### TAB 4: Historial de Alertas

#### A. Fichas de Control Cuantitativo
-   **Bloques Estadísticos:** Tres grandes contenedores horizontales en la parte superior que aíslan el volumen actual de incidencias: `ALERTAS CRÍTICAS` (Rojo), `ADVERTENCIAS` (Amarillo) y `RESUELTAS` (Verde).

#### B. Registro Cronológico de Eventos (Timeline Log)
*Lista lineal que archiva la actividad anómala detectada por la IA y los sensores IoT, ordenada de forma descendente.*
-   **Estructura de Fila de Incidencia:**
    -   *Indicador de Eje:* Punto de anclaje lateral de color reactivo que conecta con la línea temporal del historial.
    -   *Iconografía:* Icono según tipo de problema (ej. `snowflake` para plagas, `alert-triangle` para nutrientes).
    -   *Cuerpo del Log:* Glosa del problema en texto blanco destacado (`Anomalía de presión — Posible plaga subterránea`, `Nutrientes Bajos`), badge de criticidad y párrafo con la causa raíz identificada por el sistema.
    -   *Lateral Derecho:* Marca temporal relativa (`hace 12m`, `Ahora`, `Ayer`) e identificador del sensor emisor en tipografía atenuada.

#### C. Frecuencia Diaria de Eventos (Bar Chart)
-   **Componente:** Gráfico de barras verticales sólidas en color rojo arcilla (`bg-red-700`) que muestra el volumen bruto de alertas disparadas por día durante la semana elegida, facilitando la detección de picos de estrés en el cultivo.
---

#### 2.9 Configuración
-   **Icono Identificador:** `[fa-sliders-h]` icono de sliders arrastrables
-   **Color del icono:** `#[6ee7b2]`
-   **Color del texto:** `#[4c5e68]`
-   **Arquitectura General de la Vista:**
    -   *Fila Superior Global:* Header con breadcrumbs (`Agro Control / Configuración`) y barra de estado secundaria que incluye el tag `Estación Central Sincronizada` (`bg-slate-900 text-slate-400`).
    -   *Diseño en dos columnas (Split Layout 25/75):*
        -   **Columna Izquierda (25% - Sidebar de Control):** Aloja la tarjeta resumida del operador en la parte superior, el menú de navegación interna (`Perfil y Finca`, `Umbrales IoT`, `Integraciones API`) y el widget inferior de *Estado Operativo* (Muestra `EXCELENTE` con subtexto `Salud General: Sin sensores reportando fallas críticas`).
        -   **Columna Derecha (75% - Workspace Dinámico):** Contenedor principal que renderiza el formulario o panel correspondiente a la opción seleccionada en el menú izquierdo.

##### ESPECIFICACIONES DE COMPONENTES POR SECCIÓN (UI-UX)

### OPCIÓN 1: Perfil y Finca

#### A. Cabecera del Panel de Control
-   **Título del Bloque:** `Configuración de Cuenta y Finca` con descripción técnica (`Gestione la información del operador general y los parámetros geográficos del predio`).
-   **Badge de Rol:** Etiqueta flotante a la derecha en color verde aguamarina: `ESTACIÓN CENTRAL`.

#### B. Ficha de Identidad del Operador
-   **Componente:** Contenedor estilizado oscuro con la fotografía de perfil del usuario enmarcada en un avatar circular (`rounded-full`) que superpone un micro-icono de cámara verde en la esquina inferior.
-   **Detalles de Cuenta:** Despliega el nombre completo (`Juan Rodríguez`), el rol (`Administrador de Estación - Registrado el 15 Mar 2026`) y un micro-badge gris que expone las coordenadas geográficas de telemetría por GPS: `Lat: -12.1345 / Long: -86.1234`.

#### C. Formulario de Datos Geográficos y Operacionales
-   **Campos de Entrada (Input Grid):** Estructura en dos columnas con inputs oscuros de bordes redondeados y etiquetas en mayúsculas (`text-slate-400 font-semibold`):
    -   *Nombre del Operador:* Input de texto pre-cargado (`Juan Rodríguez`).
    -   *Correo de Enlace:* Input de tipo email (`juan@agrocontrol.io`).
    -   *Finca / Organización:* Nombre de la propiedad agrícola (`Finca La Esperanza`).
    -   *Cultivo Principal:* Selector desplegable (`select`) configurado con la opción activa `Aguacate Hass`.
    -   *Superficie (Hectáreas):* Input numérico de ancho completo en fila inferior (`45,2`).
-   **Botón de Guardado:** Acción principal alineada a la derecha en color verde turquesa sólido con icono de disco magnético: `Guardar Perfil y Finca` (`bg-emerald-500 text-slate-950 font-semibold`).


### OPCIÓN 2: Umbrales IoT

#### A. Panel de Reglas Dinámicas
-   **Título del Bloque:** `Parámetros de Alerta Crítica (IoT)` con descripción funcional (`Configure los valores límites del suelo. Las alertas se generarán dinámicamente en base a estas reglas.`).
-   **Badge de Estado:** Etiqueta de aviso en color ocre en la esquina superior derecha: `REACTIVO IOT`.

#### B. Deslizadores de Calibración Analógica (Range Sliders)
*Tarjetas independientes de fondo oscuro que aíslan cada variable crítica mediante un icono identificador a la izquierda, título, badge numérico a la derecha y un control deslizante horizontal.*
-   **Humedad Mínima Crítica:** 
    -   *Icono e Indicador:* Gota en verde esmeralda, valor establecido en `21%`.
    -   *Slider:* Línea horizontal gris con nodo de arrastre turquesa. Límites en subtítulo: `10% (Muy Seco)` a la izquierda y `80% (Saturado)` a la derecha.
-   **Temperatura Suelo Crítica:** 
    -   *Icono e Indicador:* Termómetro en amarillo/naranja, valor establecido en `37°C`.
    -   *Slider:* Nodo de arrastre naranja. Límites en subtítulo: `15°C (Frío)` a `50°C (Caliente)`.
-   **Acidez Crítica de Suelo (pH):** 
    -   *Icono e Indicador:* Tubo de ensayo en morado, valor establecido en `5.4 pH`.
    -   *Slider:* Nodo de arrastre morado. Límites en subtítulo: `4.0 (Ácido)` a `10.0 (Alcalino)`.


### OPCIÓN 3: Integraciones API

#### A. Concentrador de Servicios (API Connectors Hub)
-   **Título del Bloque:** `Servicios Conectados e Integraciones API` con bajada descriptiva (`Habilite o deshabilite los módulos lógicos vinculados a APIs de terceros`).
-   **Badge de Red:** Etiqueta azul a la derecha: `API CONNECTORS`.

#### B. Matriz de Conectores Lógicos (2x2 Grid)
*Malla de cuatro tarjetas oscuras cuadradas destinadas a la administración de webhooks y servicios en la nube de IA y Hardware.*
1.  **Google Gemini 2.5 Flash (Visión Computacional):** Icono de lápiz/varita verde. Texto descriptivo de diagnóstico automatizado de plagas. Footer con badge `● ACTIVO EN CONSOLA` (Verde) y enlace a `Documentación ↗`.
2.  **Groq - Llama 3 (Motor de Inferencia Conversacional):** Icono de cerebro verde. Texto enfocado en soporte conversacional en campo. Footer con badge `● ACTIVO EN CONSOLA` (Verde) y enlace a `Documentación ↗`.
3.  **Arduino IoT Cloud (Sincronización de Hardware):** Icono de microchip verde. Texto dedicado a telemetría bidireccional en vivo. Footer con badge `● ACTIVO EN CONSOLA` (Verde) y enlace a `Documentación ↗`.
4.  **Sketchfab API (Renderizado 3D):** Icono de cubo amarillo. Texto enfocado en el visor interactivo de gemelos digitales de las parcelas. Footer con estado alternativo `● EN ESPERA` (Amarillo) y enlace a `Documentación ↗`.
---

## 3. Footer / Perfil de Usuario en Sidebar
-   **Identificación del Perfil:** `oscar demo (Administrador)`
-   **Acciones Directas:** Icono de Ajustes Rápidos (`settings`) e Icono de Salida Segura (`logout`).
-   **Especificaciones de Diseño:** Tipografía compacta, estilos de la imagen del avatar o iniciales corporativas y alineación en la parte inferior de la barra lateral.