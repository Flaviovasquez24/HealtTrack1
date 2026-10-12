from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class DeviceDetail(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    edition: str | None = None
    serial_number: str | None = None
    firmware_version: str | None = None
    connection_type: str

    is_connected: bool
    battery_level: int

    storage_used_mb: int | None = None
    storage_total_mb: int | None = None

    paired_at: datetime | None = None
    last_sync_at: datetime | None = None


class DeviceRead(BaseModel):
    """Versión resumida del dispositivo, usada dentro de DashboardResponse."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    edition: str | None = None
    is_connected: bool
    battery_level: int
    last_sync_at: datetime | None = None


class DeviceUpdate(BaseModel):
    """Campos editables desde la pantalla de Dispositivo (ej. renombrarlo)."""

    name: str | None = Field(default=None, min_length=1, max_length=120)
    edition: str | None = Field(default=None, max_length=120)


class DeviceSyncResponse(BaseModel):
    synced_at: datetime
    battery_level: int
    is_connected: bool