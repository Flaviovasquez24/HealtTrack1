# Importar todos los modelos aquí asegura que queden registrados en
# Base.metadata antes de correr create_all() o generar migraciones de Alembic.
from app.models.user import User  # noqa: F401
from app.models.device_stats import Device, DeviceStat  # noqa: F401