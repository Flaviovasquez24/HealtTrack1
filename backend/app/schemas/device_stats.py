from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.schemas.device import DeviceRead


class DeviceStatBase(BaseModel):
    heart_rate: int | None = None
    steps: int | None = None
    calories: float | None = None
    sleep_minutes: int | None = None


class DeviceStatCreate(DeviceStatBase):
    """Payload enviado por el dispositivo al crear una nueva lectura."""

    recorded_at: datetime | None = None


class DeviceStatRead(DeviceStatBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    device_id: int
    recorded_at: datetime


class ActivityPoint(BaseModel):
    """Un punto de la curva de actividad horaria del Dashboard."""

    time: str
    steps: int | None = None


class MetricSummary(BaseModel):
    """Resumen de una métrica (heart rate, steps, calories, sleep) para el Dashboard."""

    value: float
    value_display: str
    unit: str | None = None
    meta: str | None = None
    goal: float | None = None
    change_pct: float | None = None
    sparkline: list[float] = []


class DashboardResponse(BaseModel):
    """Payload agregado que consume la vista Dashboard del frontend."""

    greeting_name: str
    date: str
    heart_rate: MetricSummary
    steps: MetricSummary
    calories: MetricSummary
    sleep: MetricSummary
    activity_chart: list[ActivityPoint]
    device: DeviceRead


class DailyPoint(BaseModel):
    """Un punto de una serie temporal (por día u hora) para la vista Estadísticas."""

    date: str          # ISO date (YYYY-MM-DD) u hora (HH:MM) según el período
    label: str         # Etiqueta corta para el eje (ej. "L", "14", "08:00")
    value: float | None = None


class MetricStatsSummary(BaseModel):
    """
    Resumen estadístico de una métrica para un período (hoy / 7 días / 30 días),
    usado por la vista Estadísticas.
    """

    avg: float
    avg_display: str
    unit: str | None = None

    max: float | None = None
    max_at: datetime | None = None
    min: float | None = None
    min_at: datetime | None = None

    goal: float | None = None
    change_pct: float | None = None  # vs. el período anterior equivalente

    daily: list[DailyPoint] = []


class StatsResponse(BaseModel):
    """Payload agregado que consume la vista Estadísticas del frontend."""

    period: str          # "today" | "7d" | "30d"
    range_label: str     # ej. "10 Sep – 16 Sep 2025"
    heart_rate: MetricStatsSummary
    steps: MetricStatsSummary
    calories: MetricStatsSummary
    sleep: MetricStatsSummary