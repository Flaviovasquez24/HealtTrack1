from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.database import Base


class Device(Base):
    __tablename__ = "devices"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )

    name = Column(String(120), nullable=False, default="FitBand Pro")
    edition = Column(String(120), nullable=True, default="Edición Deportiva")
    serial_number = Column(String(50), nullable=True)
    firmware_version = Column(String(20), nullable=True)
    connection_type = Column(String(30), nullable=False, default="Bluetooth")

    is_connected = Column(Boolean, nullable=False, default=True)
    battery_level = Column(Integer, nullable=False, default=100)

    storage_used_mb = Column(Integer, nullable=True, default=0)
    storage_total_mb = Column(Integer, nullable=True, default=512)

    paired_at = Column(DateTime, nullable=True, default=datetime.utcnow)
    last_sync_at = Column(DateTime, nullable=True)

    owner = relationship("User", back_populates="devices")
    stats = relationship(
        "DeviceStat", back_populates="device", cascade="all, delete-orphan"
    )


class DeviceStat(Base):
    """
    Lectura puntual enviada por el dispositivo (una "muestra" en el tiempo).
    El dashboard agrega estas muestras para calcular los totales del día
    y la curva de actividad horaria.
    """

    __tablename__ = "device_stats"

    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(
        Integer, ForeignKey("devices.id", ondelete="CASCADE"), nullable=False, index=True
    )

    recorded_at = Column(DateTime, nullable=False, index=True, default=datetime.utcnow)

    heart_rate = Column(Integer, nullable=True)     # ppm en el momento de la lectura
    steps = Column(Integer, nullable=True)           # pasos acumulados del día hasta este punto
    calories = Column(Float, nullable=True)          # kcal acumuladas del día hasta este punto
    sleep_minutes = Column(Integer, nullable=True)   # minutos dormidos (lectura nocturna)

    device = relationship("Device", back_populates="stats")