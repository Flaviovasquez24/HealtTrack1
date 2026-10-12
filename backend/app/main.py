from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.routes import auth, device_stats, devices, users

# Crea las tablas si no existen. Para producción, reemplazar por
# migraciones versionadas con Alembic (ver README > Próximos pasos).
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Wearable Stats API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://3.15.214.222:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(devices.router)
app.include_router(device_stats.router)


@app.get("/health")
def health_check():
    return {"status": "ok"}