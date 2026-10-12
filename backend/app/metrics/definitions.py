from app.metrics.base import Metric

STEPS_GOAL = 10_000
CALORIES_GOAL = 500
SLEEP_GOAL_MINUTES = 8 * 60


class HeartRateMetric(Metric):
    field, unit, mode = "heart_rate", "ppm", "avg"

    def format(self, v: float) -> str:
        return str(round(v))

    def raw_extremes(self, stats):
        readings = [(s.heart_rate, s.recorded_at) for s in stats if s.heart_rate is not None]
        if not readings:
            return (None, None, None, None)
        mx = max(readings, key=lambda t: t[0])
        mn = min(readings, key=lambda t: t[0])
        return (float(mx[0]), mx[1], float(mn[0]), mn[1])


class StepsMetric(Metric):
    field, unit, goal, mode = "steps", "pasos/día", STEPS_GOAL, "last"

    def format(self, v: float) -> str:
        return f"{v:,.0f}"


class CaloriesMetric(Metric):
    field, unit, goal, mode = "calories", "kcal act.", CALORIES_GOAL, "last"

    def format(self, v: float) -> str:
        return f"{v:,.0f}"


class SleepMetric(Metric):
    field, goal, mode = "sleep_minutes", SLEEP_GOAL_MINUTES, "last"

    def format(self, v: float) -> str:
        return f"{int(v) // 60}h {int(v) % 60}m"