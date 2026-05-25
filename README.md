# proyecto-certificados-tec

# AIR-TEC — Sistema de Gestión de la Asamblea Institucional Representativa

Sistema de información para la gestión de la Asamblea Institucional Representativa (AIR) del Instituto Tecnológico de Costa Rica.

## Descripción

El sistema permite gestionar asambleístas, nombramientos, sesiones, normativa institucional y la emisión de certificaciones oficiales con formato normativo.

## Stack Tecnológico

- **Backend:** Node.js + Express
- **Base de datos:** Oracle Cloud Autonomous Database
- **Autenticación:** Firebase Authentication
- **Frontend:** React + Material UI
- **Vistas HTML:** Módulos funcionales en /src/views

## Estructura del Proyecto

- **backend/** — API REST (Node.js + Express)
  - src/config/ — Conexión Oracle y Firebase
  - src/controllers/ — Lógica de negocio
  - src/middlewares/ — Auth, errores, validación
  - src/models/ — Acceso a datos Oracle
  - src/routes/ — Definición de endpoints
- **database/** — Scripts SQL Oracle
- **docs/** — Documentación técnica
- **src/views/** — Vistas HTML por módulo
  - normativa/
  - asambleistas/
  - sesiones/
  - certificaciones/

## Instalación

1. Clonar el repositorio
2. Instalar dependencias: cd backend && npm install
3. Crear backend/.env con las variables de entorno
4. Colocar wallet en backend/src/config/wallet/
5. Colocar firebase-credentials.json en backend/src/config/
6. Iniciar servidor: node server.js

## Variables de entorno requeridas

- PORT=3000
- DB_USER=AIR_DEV
- DB_PASSWORD=tu_password
- DB_CONNECTION_STRING=airtec_high
- DB_WALLET_PASSWORD=tu_wallet_password
- FIREBASE_PROJECT_ID=air-tec

## Roles del Sistema

- **ADMINISTRADOR** — Acceso total
- **SECRETARIA** — Gestión de asambleístas, sesiones y certificaciones
- **ASAMBLEISTA** — Solo lectura

## Equipo

- Juan Diego — Backend y Base de datos
- Sebastián — Frontend
- Alejandro — Frontend

## Institución

Instituto Tecnológico de Costa Rica
Asamblea Institucional Representativa
2025-2026


## Video Explicativo

[![Video AIR-TEC Sprint 2](https://img.youtube.com/vi/mzFtPMAsJJQ/0.jpg)](https://youtu.be/mzFtPMAsJJQ)

[Ver video en YouTube](https://youtu.be/mzFtPMAsJJQ)