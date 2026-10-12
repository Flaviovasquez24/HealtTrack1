from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.database import get_db
from app.models.user import User
from app.schemas.device import DeviceDetail, DeviceSyncResponse, DeviceUpdate
from app.services import device_service

router = APIRouter(prefix="/devices", tags=["devices"])


@router.get("/me", response_model=DeviceDetail)
def read_my_device(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Detalle del dispositivo vinculado (pantalla Dispositivo)."""
    return device_service.get_or_create_device(db, current_user)


@router.patch("/me", response_model=DeviceDetail)
def update_my_device(
    payload: DeviceUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Editar nombre/edición del dispositivo."""
    return device_service.update_device(db, current_user, payload)


@router.post("/me/sync", response_model=DeviceSyncResponse)
def sync_my_device(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Botón "Sincronizar ahora"."""
    return device_service.sync_device(db, current_user)


@router.post("/me/unpair", status_code=status.HTTP_204_NO_CONTENT)
def unpair_my_device(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Desvincular el dispositivo (borra también su historial de lecturas)."""
    device_service.unpair_device(db, current_user)
    return None