from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.database import get_db
from app.models.user import User
from app.schemas.device_stats import (
    DashboardResponse,
    DeviceStatCreate,
    DeviceStatRead,
    StatsResponse,
)
from app.services import stats_service

router = APIRouter(prefix="/device-stats", tags=["device-stats"])


@router.get("/dashboard", response_model=DashboardResponse)
def read_dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Payload agregado que consume la vista Dashboard del frontend."""
    return stats_service.get_dashboard_data(db, current_user)


@router.get("/summary", response_model=StatsResponse)
def read_stats_summary(
    period: str = Query("7d", pattern="^(today|7d|30d)$"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Payload agregado que consume la vista Estadísticas del frontend."""
    return stats_service.get_stats_summary(db, current_user, period=period)


@router.get("/", response_model=list[DeviceStatRead])
def list_stats(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Lecturas crudas del dispositivo del usuario (útil para Historial/Estadísticas)."""
    return stats_service.list_stats(db, current_user, skip=skip, limit=limit)


@router.post("/", response_model=DeviceStatRead, status_code=status.HTTP_201_CREATED)
def create_stat(
    payload: DeviceStatCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Ingesta de una nueva lectura enviada por el dispositivo."""
    return stats_service.create_stat(db, current_user, payload)