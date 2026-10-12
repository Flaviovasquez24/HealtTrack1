import random
from abc import ABC
from datetime import datetime

from app.models.device_stats import Device


class DeviceFactory(ABC):
    name: str
    edition: str
    firmware_version: str
    connection_type: str
    storage_total_mb: int
    serial_prefix: str

    def create(self, user_id: int) -> Device:
        return Device(
            user_id=user_id,
            name=self.name,
            edition=self.edition,
            serial_number=f"{self.serial_prefix}-{random.randint(1000, 9999)}",
            firmware_version=self.firmware_version,
            connection_type=self.connection_type,
            is_connected=True,
            battery_level=100,
            storage_used_mb=0,
            storage_total_mb=self.storage_total_mb,
            paired_at=datetime.utcnow(),
        )


class FitBandProFactory(DeviceFactory):
    name = "FitBand Pro"
    edition = "Edición Deportiva"
    firmware_version = "3.4"
    connection_type = "Bluetooth"
    storage_total_mb = 512
    serial_prefix = "FB"


class FitBandLiteFactory(DeviceFactory):
    name = "FitBand Lite"
    edition = "Edición Básica"
    firmware_version = "2.1"
    connection_type = "Bluetooth"
    storage_total_mb = 256
    serial_prefix = "FL"


_FACTORIES: dict[str, type[DeviceFactory]] = {
    "pro": FitBandProFactory,
    "lite": FitBandLiteFactory,
}


def get_device_factory(model: str = "pro") -> DeviceFactory:
    try:
        return _FACTORIES[model]()
    except KeyError:
        raise ValueError(f"Modelo de dispositivo desconocido: {model}")