# Documentacion de Autenticacion de Dos Factores (2FA)

Este documento detalla la arquitectura, el flujo y las implementaciones realizadas para el sistema de autenticacion de dos factores (2FA) en la plataforma Agro Control, incluyendo tanto el frontend (React) como el backend de soporte.

## 1. Arquitectura General

El sistema de autenticacion esta diseñado bajo un enfoque hibrido que combina una base de datos simulada en el lado del cliente (Local Storage) para la validacion estricta de credenciales, y un servicio backend sin estado (Stateless) encargado exclusivamente del envio seguro de codigos de verificacion por correo electronico mediante la plataforma Resend.

### 1.1. Backend (twofactor-api)
Se construyo una API RESTful utilizando Node.js y Express.
- **Rutas de Autenticacion:**
  - `POST /api/auth/login`: Recibe credenciales. Valida y dispara la creacion del codigo 2FA enviado al correo.
  - `POST /api/auth/register`: Recibe los datos del nuevo usuario, simulando el guardado y emitiendo el codigo 2FA al correo.
  - `POST /api/auth/verify-2fa`: Recibe el correo y el codigo (PIN) ingresado por el usuario. Si coincide con el codigo generado temporalmente, autoriza la sesion.
- **Seguridad:**
  - **Validacion de Esquemas:** Implementacion de middlewares personalizados para validar que los formatos de correo, contraseñas y pines sean correctos antes de procesarlos.
  - **Rate Limiting:** Se establecio un limite de 5 peticiones por minuto por direccion IP para las rutas de autenticacion, previniendo ataques de fuerza bruta.

### 1.2. Frontend (Agro Control - React)
La integracion en el frontend se desarrollo enfocada en la experiencia de usuario (UX) y en mantener la consistencia de los datos.
- **Servicio de Autenticacion (`auth.ts`):** 
  - Centraliza las llamadas a la API de produccion (Vercel).
  - Implementa un "Mock Database" local que almacena a los usuarios registrados en el `localStorage`.
- **Mock Database y Validacion:**
  - Al intentar registrarse, el frontend verifica si el correo ya existe en el almacenamiento local. De ser asi, rechaza la peticion previniendo duplicados.
  - Al intentar iniciar sesion, el frontend busca la cuenta y verifica que la contraseña ingresada coincida de forma exacta con la almacenada. Si las credenciales son incorrectas, no se realiza la peticion al backend, ahorrando recursos y reforzando la seguridad de la capa cliente.
  - Tras la confirmacion exitosa del PIN 2FA, el frontend inyecta los datos persistidos (Nombre, Organizacion) al contexto global de la aplicacion para reflejarlos en la interfaz.

## 2. Experiencia de Usuario (UI/UX)

La interfaz de usuario fue rediseñada para reflejar un estandar senior y alinearse con la linea grafica de "Smart Agriculture" de la plataforma.

- **Diseño de Pantalla Dividida (Split-Screen):** La pantalla de acceso fue reestructurada. La mitad presenta un fondo inmersivo (con gradientes animados y transparencias) que comunica el proposito de la plataforma, y la otra mitad contiene los formularios estilizados con efectos tipo Glassmorphism.
- **Flujo Unificado (Single Page):** Los estados de *Login*, *Registro* y *Verificacion de PIN* ocurren dentro de un mismo componente funcional, permitiendo transiciones suaves (fade y slide) sin necesidad de recargar la pagina o cambiar de ruta.
- **Microinteracciones:** Se incluyeron animaciones de carga en los botones, etiquetas flotantes que reaccionan al foco del teclado (focus rings) y manejo estandarizado de mensajes de error.
- **Prevencion de Accesos Innecesarios:** Se agrego logica de enrutamiento para detectar si un usuario ya cuenta con una sesion activa. Si intenta acceder a la pagina de login, es redirigido inmediatamente al panel principal, mejorando el flujo.

## 3. Gestion de Sesiones (AppShell)

La navegacion y el panel de control de la aplicacion se actualizaron para soportar un ciclo de vida completo de la sesion del usuario.
- **Boton de Cierre de Sesion:** Se añadio un control tactico en la barra lateral del Dashboard, junto a las opciones de configuracion de perfil.
- Al accionar el cierre de sesion, el sistema elimina las credenciales en memoria, purga las variables del entorno de sesion (`localStorage`) referentes al estado actual y devuelve al usuario de forma segura a la pantalla de inicio de sesion.
