from abc import ABC, abstractmethod


class Metric(ABC):
    field: str                 # columna de DeviceStat
    unit: str | None = None
    goal: float | None = None
    mode: str = "last"         # "avg" | "last"

    @abstractmethod
    def format(self, value: float) -> str: ...

    def raw_extremes(self, stats) -> tuple | None:
        """Hook opcional: (max, max_at, min, min_at) sobre lecturas crudas."""
        return None