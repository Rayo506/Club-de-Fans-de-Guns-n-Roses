CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'fan',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sessions (
    session_id VARCHAR(128) PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NULL
);

CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(160) NOT NULL,
    creador_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    localizacion VARCHAR(160) NOT NULL,
    precio NUMERIC(10, 2) NULL,
    plazas_totales INTEGER NOT NULL CHECK (plazas_totales > 0),
    plazas_ocupadas INTEGER NOT NULL DEFAULT 0 CHECK (plazas_ocupadas >= 0),
    imagen_url VARCHAR(500) NULL,
    descripcion TEXT NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'aprobado', 'rechazado')),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS event_registrations (
    id SERIAL PRIMARY KEY,
    event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_event_user_registration UNIQUE (event_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_events_estado ON events(estado);
CREATE INDEX IF NOT EXISTS idx_events_fecha ON events(fecha);
CREATE INDEX IF NOT EXISTS idx_events_creador_id ON events(creador_id);

CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(160) NOT NULL,
    vendedor_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    precio NUMERIC(10, 2) NOT NULL DEFAULT 0,
    categoria VARCHAR(50) NOT NULL,
    estado VARCHAR(80) NOT NULL,
    imagen_url VARCHAR(500) NULL,
    descripcion TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_products_vendedor_id ON products(vendedor_id);
CREATE INDEX IF NOT EXISTS idx_products_categoria ON products(categoria);
