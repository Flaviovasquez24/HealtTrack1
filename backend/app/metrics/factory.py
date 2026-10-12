from app.metrics.base import Metric
from app.metrics.definitions import (
    CaloriesMetric, HeartRateMetric, SleepMetric, StepsMetric,
)


class MetricFactory:
    _registry: dict[str, type[Metric]] = {
        "heart_rate": HeartRateMetric,
        "steps": StepsMetric,
        "calories": CaloriesMetric,
        "sleep": SleepMetric,
    }

    @classmethod
    def create(cls, name: str) -> Metric:
        try:
            return cls._registry[name]()
        except KeyError:
            raise ValueError(f"Métrica desconocida: {name}")

    @classmethod
    def create_all(cls) -> dict[str, Metric]:
        return {name: klass() for name, klass in cls._registry.items()}