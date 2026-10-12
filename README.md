# Wearable Stats App

Sistema de seguimiento de estadísticas de un dispositivo portátil.
Stack: Python (FastAPI) + React + PostgreSQL, orquestado con Docker Compose.

## Estructura

```
wearable-stats-app/
├── backend/          API en FastAPI
│   ├── app/
│   │   ├── main.py       Punto de entrada, endpoints
│   │   ├── config.py      Configuración (variables de entorno)
│   │   └── database.py    Conexión a PostgreSQL (SQLAlchemy)
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
│
├── frontend/         Dashboard en React (Vite)
│   ├── src/
│   │   ├── main.jsx
│   │   └── App.jsx
│   ├── package.json
│   ├── vite.config.js
│   ├── Dockerfile
│   └── .env.example
│
└── docker-compose.yml
```

## Requisitos previos

- Docker y Docker Compose instalados
- (Opcional para desarrollo sin Docker) Python 3.12+ y Node.js 20+

## Levantar el entorno con Docker (recomendado)

Desde la raíz del proyecto:

```bash
docker compose up --build
```

Esto levanta tres servicios:

| Servicio  | URL                          | Descripción              |
|-----------|-------------------------------|---------------------------|
| backend   | http://localhost:8000         | API FastAPI               |
| frontend  | http://localhost:5173         | Dashboard React            |
| db        | localhost:5432                 | PostgreSQL                 |

Para verificar que el backend está corriendo, entra a http://localhost:8000/health
o a http://localhost:8000/docs para ver la documentación interactiva (Swagger).

El frontend, al cargar, hace un fetch a `/health` y muestra el estado del backend en pantalla.

## Levantar el entorno sin Docker (manual)

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate      # En Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env          # Ajusta los valores si es necesario
uvicorn app.main:app --reload
```

Necesitas una instancia de PostgreSQL corriendo y accesible con los datos definidos en `.env`.

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

## Variables de entorno

**backend/.env**

```
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=wearable_db
POSTGRES_HOST=db
POSTGRES_PORT=5432
SECRET_KEY=change-this-secret-key
```

**frontend/.env**

```
VITE_API_URL=http://localhost:8000
```

## Próximos pasos sugeridos

1. Definir los modelos de la base de datos (usuarios, dispositivos, estadísticas) en `backend/app/models/`.
2. Agregar Alembic para manejar migraciones de forma versionada.
3. Crear los routers y schemas de la API (`/users`, `/devices`, `/device-stats`).
4. Implementar autenticación (JWT) en `backend/app/core/`.
5. Construir las vistas del dashboard en `frontend/src/pages/`.
