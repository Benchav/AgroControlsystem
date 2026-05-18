# IA de Agro Control

## Qué hace la IA
Agro Control tiene dos funciones de inteligencia artificial:
- Un chat para responder preguntas sobre la plataforma y el trabajo agrícola.
- Un analizador de imágenes para detectar posibles enfermedades en plantas.

En palabras simples:
- El chat ayuda a entender y usar la plataforma.
- El análisis de imagen ayuda a revisar una planta y obtener una lectura rápida de su estado.

## Para qué sirve cada una
### Chat IA
Sirve para:
- responder dudas sobre la app
- explicar sensores, mapas, reportes y configuración
- dar orientación agronómica básica dentro del contexto de la plataforma

### Diagnóstico IA
Sirve para:
- subir o tomar una foto de una planta
- detectar señales de enfermedad o estrés
- recibir un informe técnico en texto
- guardar el resultado para revisarlo después

## Cómo se ve para el usuario
### Chat
El usuario escribe una pregunta y recibe una respuesta rápida en español.

### Diagnóstico
El usuario:
1. carga una imagen o toma una foto
2. presiona analizar
3. ve un informe más profesional y ordenado
4. puede descargar el resultado o ver su historial

## Qué tan inteligente es el resultado
La IA no reemplaza a un agrónomo, pero sí acelera la primera lectura.
Su valor está en:
- ahorrar tiempo
- ordenar la información
- orientar una primera decisión
- dejar evidencia del análisis

## Beneficio para negocio y marketing
Esto permite comunicar Agro Control como una plataforma que:
- no solo monitorea datos, sino que también interpreta
- combina sensores, chat y visión por IA
- ayuda a tomar decisiones más rápido
- convierte una app agrícola en una experiencia más moderna y diferenciada

## Cómo funciona técnicamente
### Chat IA
- usa Groq
- modelo principal: `Llama 3.3 70B Versatile`
- responde en español
- mantiene contexto del hilo
- toma datos del perfil y del sistema para personalizar respuestas

### Diagnóstico IA
- usa Gemini 2.5 Flash
- analiza imágenes desde archivo o cámara
- rota varias claves API para aprovechar mejor los créditos gratuitos
- guarda historial local
- muestra el informe en tarjetas visuales dentro de la pantalla

## Qué muestra el diagnóstico
El informe está organizado en partes fáciles de entender:
- resultado general
- cultivo probable
- problema probable
- causa probable
- confianza
- resumen clínico
- por qué sucede
- recomendaciones
- manejo sugerido
- cómo mejorar la salud
- seguimiento

## Historial
El sistema guarda los análisis para que el usuario pueda:
- revisar diagnósticos anteriores
- descargar un informe
- borrar uno por uno
- borrar todo el historial si lo desea

## Limitaciones
Puntos importantes:
- las claves API están en el frontend
- la calidad del diagnóstico depende mucho de la foto
- si la imagen no está clara, la respuesta puede ser más general

## Estado actual
Hoy la IA ya funciona como parte real de la plataforma:
- chat operativo
- análisis de imagen operativo
- historial operativo
- exportación de informes operativa
- animaciones y experiencia visual mejoradas

## Variables de entorno
Chat:
- `VITE_GROQ_API_KEY`
- `VITE_GROQ_MODEL`
- `VITE_GROQ_MAX_COMPLETION_TOKENS`
- `VITE_GROQ_TEMPERATURE`

Diagnóstico:
- `VITE_GEMINI_API_KEY_1`
- `VITE_GEMINI_API_KEY_2`
- `VITE_GEMINI_API_KEY_3`
- `VITE_GEMINI_API_KEY_4`
- `VITE_GEMINI_API_KEY_5`
- `VITE_GEMINI_MODEL`

## Archivos clave
- `src/services/groqChat.ts`
- `src/services/geminiDiagnosis.ts`
- `src/pages/ChatPage.tsx`
- `src/pages/AiPage.tsx`
