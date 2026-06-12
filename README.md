# Club de Fans de Guns n' Roses

Proyecto web con frontend estático y API Flask conectada a PostgreSQL.

## Estructura principal

```text
backend/
  app.py
  config.py
  entities/
  models/
  repositories/
  routes/
database/
  schema.sql
css/
js/
index.html
login.html
eventos.html
crear-evento.html
detalles-evento.html
marketplace.html
detalle-producto.html
subir-producto.html
mod.html
```

## Funcionalidades añadidas

- Registro de usuarios con validación de email, nombre y contraseña.
- Login con cookie HTTP Only gestionada por la API.
- Logout con borrado de sesión en base de datos y cookie del cliente.
- Página de creación de eventos con los campos de `eventos.html` y `detalles-evento.html`.
- Los eventos nuevos quedan en estado `pendiente`.
- La lista pública muestra solo eventos `aprobado`.
- La consola `mod.html` exige login con rol `moderador` o `admin`.
- El moderador puede aceptar o rechazar eventos pendientes.
- Los usuarios pueden apuntarse y desapuntarse de eventos aprobados.
- Marketplace conectado a la API con listado, detalle y subida de productos.
- Carrito básico en navegador con añadir, eliminar y botón de compra no funcional.

## Base de datos PostgreSQL

Ejemplo de creación de base de datos y usuario:

```sql
CREATE DATABASE gnr_fans_db;
CREATE USER gnr_user WITH PASSWORD 'gnr_password';
GRANT ALL PRIVILEGES ON DATABASE gnr_fans_db TO gnr_user;
```

Después de conectarte a la base de datos:

```sql
GRANT ALL ON SCHEMA public TO gnr_user;
```

También puedes revisar el esquema manual en `database/schema.sql`. La API crea las tablas automáticamente al arrancar mediante SQLAlchemy.

## Configuración del backend

Variables opcionales:

```bash
export DB_USER=gnr_user
export DB_PASSWORD=gnr_password
export DB_HOST=localhost
export DB_PORT=5432
export DB_NAME=gnr_fans_db
export FRONTEND_ORIGIN=http://localhost:3000
export DEFAULT_MOD_NAME=Moderador
export DEFAULT_MOD_EMAIL=moderador@gnr.local
export DEFAULT_MOD_PASSWORD=moderador123
```

Instalación y arranque:

```bash
cd backend
pip install -r requirements.txt
cd ..
python run_backend.py
```

La API queda disponible en `http://localhost:5000/api`.

## Arranque del frontend

En otra terminal, desde la carpeta raíz del proyecto:

```bash
python -m http.server 3000
```

Abre `http://localhost:3000`.

## Usuario moderador de prueba

Si no existe otro moderador, el backend crea uno al arrancar:

```text
Email: moderador@gnr.local
Contraseña: moderador123
```

Puedes cambiar estos valores con las variables `DEFAULT_MOD_EMAIL` y `DEFAULT_MOD_PASSWORD`.

## Endpoints principales

```text
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/users/me
GET  /api/events
GET  /api/events/<id>
POST /api/events
POST /api/events/<id>/registrations
DELETE /api/events/<id>/registrations
GET  /api/products
GET  /api/products/<id>
POST /api/products
GET  /api/mod/dashboard
GET  /api/mod/events
PATCH /api/mod/events/<id>
```
