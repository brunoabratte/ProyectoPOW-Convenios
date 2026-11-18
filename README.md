# 📑 Sistema de Gestión de Convenios — UNLPam

Trabajo Práctico Integrador de **Programación Orientada a la Web**
Facultad de Ingeniería · Universidad Nacional de La Pampa · Analista Programador / Ingeniería en Sistemas

> ⚠️ Proyecto académico. Trabaja **exclusivamente con datos ficticios**. No incluye firma digital, validación jurídica, OCR, envío de correos ni conexión con sistemas reales de la Universidad.

---

## 📌 Descripción

Plataforma web de uso interno para administrar los convenios de la UNLPam: convenios **marco** y **específicos** de colaboración y de pasantía, **adendas**, **renovaciones** y **sustituciones**, junto con sus partes, representantes, personas vinculadas, documentación, revisión, firma registrada, plazos y estadísticas.

La web consume una **API REST** propia, desarrollada en este mismo proyecto.

Principios de modelado:

- Adendas, renovaciones y sustituciones son **instrumentos nuevos**, con código y ficha propios, vinculados a sus antecedentes. La relación **no modifica** automáticamente el registro anterior.
- La aprobación es **administrativa**: no equivale a firma digital ni a certificación de legalidad.
- Acceso **privado**: no existe portal público; todo requiere autenticación.

## ✨ Funcionalidades principales

| Módulo | Descripción |
|---|---|
| **Convenios** | Alta, edición y ficha de detalle (código único, tipo, unidad responsable, objeto, alcance, obligaciones, fechas de firma/inicio/vencimiento/preaviso, etc.) |
| **Relaciones** | Específico ↔ marco(s), adenda ↔ instrumento modificado, renovaciones y sustituciones ↔ antecedentes |
| **Partes y representantes** | Instituciones firmantes y sus representantes (mínimo dos partes para aprobar) |
| **Personas y pasantías** | Personas vinculadas, rol y período; datos complementarios de pasantías |
| **Documentos** | PDF de hasta 20 MB (principal, anexo, dictamen, resolución, otro), versionado, hash SHA-256 y descarga protegida |
| **Circuito de estados** | Borrador → Revisión → Aprobado → Firmado → Rescindido → Archivado, con registro de cada transición y su fundamento |
| **Revisión** | Observaciones con responsable, fecha, contenido, resolución y respuesta del equipo gestor |
| **Plazos y alertas** | Cálculo de vencimiento y preaviso; instrumentos próximos a vencer y vencidos |
| **Panel de estadísticas** | Cantidades por estado, tipo, unidad y año de firma; personas únicas dentro del alcance autorizado |
| **Búsqueda y exportación** | Búsqueda por texto, filtros, paginación y exportación CSV con neutralización de fórmulas |
| **Auditoría y concurrencia** | Registro de acciones, cambios de estado y descargas; control de versión para evitar sobrescrituras silenciosas |
| **Trabajo sin conexión** | Persistencia local con IndexedDB y sincronización de pendientes con resolución controlada de conflictos |

## 👥 Roles y alcance

Cuatro perfiles: **Administración**, **Gestión**, **Revisión** y **Consulta**. Cada usuario tiene alcance **global** o limitado a una **unidad** asignada, y las consultas, estadísticas y descargas se validan en el servidor según ese alcance.

## 🧱 Arquitectura y tecnologías

```
┌──────────────┐
│  Web         │
│  Next.js     │
└──────┬───────┘
       │  JSON / HTTPS
┌──────▼───────┐
│  API REST    │
│  PHP/Laravel │
└──────┬───────┘
       │
┌──────▼───────┐
│    MySQL     │
└──────────────┘
```

- **Frontend web:** React / Next.js (responsive: escritorio, tablet y móvil)
- **Backend:** PHP / Laravel (API REST, autenticación, autorización, validación, manejo de archivos)
- **Base de datos:** MySQL
- **Offline web:** IndexedDB
- **Formatos de interoperabilidad:** JSON (API) y CSV (exportaciones)

## 🔌 API REST

Recursos principales:

```
/auth
/users
/units
/agreements
/agreements/{id}/links
/parties
/people
/documents
/dashboard
/alerts
```

Todos los endpoints requieren autenticación, validan autorización en el servidor y están protegidos con control de sesión y CSRF (o mecanismo equivalente).

> 📄 La documentación detallada de métodos, validaciones, respuestas y errores está en `docs/` *(completar)*.

## 🗂️ Estructura del repositorio

> Ajustá los nombres a las carpetas reales del repo.

```
.
├── backend/      # API REST (Laravel)
├── web/          # Cliente web (Next.js)
├── database/     # Scripts, migraciones y datos de prueba
├── docs/         # Informe técnico, DER, matriz de permisos, API
└── README.md
```

## 🚀 Instalación y ejecución

### Requisitos

- PHP 8.2+ y Composer
- Node.js 18+ y npm
- MySQL 8+
- Git

### 1. Clonar el repositorio

```bash
git clone https://github.com/brunoabratte/ProyectoPOW-Convenios.git
cd ProyectoPOW-Convenios
```

### 2. Base de datos

Crear una base vacía en MySQL:

```sql
CREATE DATABASE convenios_unlpam CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. Backend (Laravel)

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
```

Configurar en `.env` los datos de conexión (`DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`) y luego:

```bash
php artisan migrate --seed
php artisan storage:link
php artisan serve
```

La API queda disponible en `http://localhost:8000`.

### 4. Frontend web (Next.js)

```bash
cd web
npm install
cp .env.example .env.local
npm run dev
```

Configurar en `.env.local` la URL de la API (por ejemplo `NEXT_PUBLIC_API_URL=http://localhost:8000/api`). La web queda en `http://localhost:3000`.

### Usuarios de prueba

Los seeders crean cuentas **ficticias** para cada rol *(completar con las credenciales de demostración)*:

| Rol | Usuario | Contraseña |
|---|---|---|
| Administración | `admin@convenios.test` | `Admin123!` |
| Gestión | `gestion@convenios.test ` | `Gestion123!` |
| Revisión | `gestion.facultad@convenios.test` | `GestionFacultad123!` |
| Consulta | `consulta@convenios.test` | `Consulta123!` |

## 🔐 Seguridad y privacidad

- Autenticación obligatoria en todas las funciones.
- Autorización por rol y unidad validada siempre en el servidor.
- Documentos almacenados fuera del acceso público y descargados solo mediante endpoint autorizado.
- Verificación de tipo (PDF) y tamaño (≤ 20 MB) y registro de integridad con SHA-256.
- Exportación CSV con neutralización de fórmulas.
- Sin secretos en el repositorio: solo `.env.example`.
- Datos de prueba mínimos y ficticios.

## ♿ Usabilidad y accesibilidad

Diseño centrado en el usuario (DCU, ISO 9241-210) y criterios de **WCAG 2.1**: etiquetas asociadas a controles, foco visible, contraste, navegación por teclado y mensajes comprensibles.

## 🧪 Pruebas

```bash
# Backend
cd backend && php artisan test

# Web
cd web && npm test
```

## ⚠️ Limitaciones conocidas

*(Completar antes de la entrega: funcionalidades parciales, decisiones pendientes, etc.)*

## 👨‍💻 Equipo

| Integrante | Rol / Responsabilidad |
|---|---|
| Bruno Abratte | Desarrollo web *(completar)* |
| *(completar)* | *(completar)* |

## 📚 Documentación del proyecto

- Informe técnico y modelo de datos (DER)
- Matriz de permisos
- Documentación de la API REST
- Prototipos y archivos de diseño
- Manual breve de uso

## 📅 Entrega

Presentación grupal: **18 y 19 de noviembre de 2026**.

---

*Facultad de Ingeniería · UNLPam — Proyecto académico sin fines comerciales.*
