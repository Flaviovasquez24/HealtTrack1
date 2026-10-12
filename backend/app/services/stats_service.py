from datetime import datetime, timedelta

from sqlalchemy.orm import Session

from app.models.device_stats import DeviceStat
from app.models.user import User
from app.schemas.device_stats import (
    ActivityPoint,
    DailyPoint,
    DashboardResponse,
    DeviceRead,
    DeviceStatCreate,
    MetricStatsSummary,
    MetricSummary,
    StatsResponse,
)
from app.metrics.definitions import CALORIES_GOAL, SLEEP_GOAL_MINUTES, STEPS_GOAL
from app.metrics.factory import MetricFactory
from app.services.device_service import get_or_create_device

_WEEKDAY_LETTERS = ["L", "M", "X", "J", "V", "S", "D"]  # lunes..domingo
_MONTH_ABBR_ES = {
    1: "Ene", 2: "Feb", 3: "Mar", 4: "Abr", 5: "May", 6: "Jun",
    7: "Jul", 8: "Ago", 9: "Sep", 10: "Oct", 11: "Nov", 12: "Dic",
}

_PERIOD_DAYS = {"today": 1, "7d": 7, "30d": 30}


def _pct_change(today: float, yesterday: float) -> float | None:
    if not yesterday:
        return None
    return round(((today - yesterday) / yesterday) * 100, 1)


def _last_value(stats: list[DeviceStat], field: str):
    """Último valor no nulo de `field` en una lista de lecturas ordenadas por fecha."""
    for stat in reversed(stats):
        value = getattr(stat, field)
        if value is not None:
            return value
    return None


def get_dashboard_data(db: Session, user: User) -> DashboardResponse:
    device = get_or_create_device(db, user)

    now = datetime.utcnow()
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    yesterday_start = today_start - timedelta(days=1)

    today_stats = (
        db.query(DeviceStat)
        .filter(DeviceStat.device_id == device.id, DeviceStat.recorded_at >= today_start)
        .order_by(DeviceStat.recorded_at.asc())
        .all()
    )

    yesterday_stats = (
        db.query(DeviceStat)
        .filter(
            DeviceStat.device_id == device.id,
            DeviceStat.recorded_at >= yesterday_start,
            DeviceStat.recorded_at < today_start,
        )
        .order_by(DeviceStat.recorded_at.asc())
        .all()
    )

    heart_rates = [s.heart_rate for s in today_stats if s.heart_rate is not None]
    avg_heart_rate = round(sum(heart_rates) / len(heart_rates)) if heart_rates else 0

    latest_steps = _last_value(today_stats, "steps") or 0
    latest_calories = _last_value(today_stats, "calories") or 0
    latest_sleep = _last_value(today_stats, "sleep_minutes") or 0

    yesterday_heart_rates = [s.heart_rate for s in yesterday_stats if s.heart_rate is not None]
    yesterday_avg_hr = (
        round(sum(yesterday_heart_rates) / len(yesterday_heart_rates)) if yesterday_heart_rates else 0
    )
    yesterday_steps = _last_value(yesterday_stats, "steps") or 0
    yesterday_calories = _last_value(yesterday_stats, "calories") or 0
    yesterday_sleep = _last_value(yesterday_stats, "sleep_minutes") or 0

    activity_chart = [
        ActivityPoint(time=s.recorded_at.strftime("%H:%M"), steps=s.steps)
        for s in today_stats
        if s.steps is not None
    ]

    sleep_hours, sleep_minutes_rem = divmod(int(latest_sleep), 60)

    return DashboardResponse(
        greeting_name=user.full_name.split(" ")[0],
        date=now.strftime("%Y-%m-%d"),
        heart_rate=MetricSummary(
            value=avg_heart_rate,
            value_display=str(avg_heart_rate),
            unit="ppm",
            change_pct=_pct_change(avg_heart_rate, yesterday_avg_hr),
            sparkline=heart_rates[-12:],
        ),
        steps=MetricSummary(
            value=latest_steps,
            value_display=f"{latest_steps:,.0f}",
            unit=f"/ {STEPS_GOAL:,}",
            goal=STEPS_GOAL,
            change_pct=_pct_change(latest_steps, yesterday_steps),
            sparkline=[s.steps for s in today_stats[-12:] if s.steps is not None],
        ),
        calories=MetricSummary(
            value=latest_calories,
            value_display=f"{latest_calories:,.0f}",
            unit=f"/ {CALORIES_GOAL} kcal",
            goal=CALORIES_GOAL,
            change_pct=_pct_change(latest_calories, yesterday_calories),
            sparkline=[s.calories for s in today_stats[-12:] if s.calories is not None],
        ),
        sleep=MetricSummary(
            value=latest_sleep,
            value_display=f"{sleep_hours}h {sleep_minutes_rem}m",
            meta=f"Meta: {SLEEP_GOAL_MINUTES // 60}h",
            goal=SLEEP_GOAL_MINUTES,
            change_pct=_pct_change(latest_sleep, yesterday_sleep),
            sparkline=[],
        ),
        activity_chart=activity_chart,
        device=DeviceRead.model_validate(device),
    )


def list_stats(db: Session, user: User, skip: int = 0, limit: int = 100) -> list[DeviceStat]:
    device = get_or_create_device(db, user)
    return (
        db.query(DeviceStat)
        .filter(DeviceStat.device_id == device.id)
        .order_by(DeviceStat.recorded_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


def create_stat(db: Session, user: User, payload: DeviceStatCreate) -> DeviceStat:
    device = get_or_create_device(db, user)

    stat = DeviceStat(
        device_id=device.id,
        recorded_at=payload.recorded_at or datetime.utcnow(),
        heart_rate=payload.heart_rate,
        steps=payload.steps,
        calories=payload.calories,
        sleep_minutes=payload.sleep_minutes,
    )
    db.add(stat)

    device.last_sync_at = stat.recorded_at
    device.is_connected = True

    db.commit()
    db.refresh(stat)
    return stat


# ---------------------------------------------------------------------------
# Vista "Estadísticas" (/device-stats/summary)
# ---------------------------------------------------------------------------


def _format_range_label(start: datetime, end: datetime) -> str:
    if start.year == end.year:
        return (
            f"{start.day} {_MONTH_ABBR_ES[start.month]} – "
            f"{end.day} {_MONTH_ABBR_ES[end.month]} {end.year}"
        )
    return (
        f"{start.day} {_MONTH_ABBR_ES[start.month]} {start.year} – "
        f"{end.day} {_MONTH_ABBR_ES[end.month]} {end.year}"
    )


def _group_by_day(stats: list[DeviceStat]) -> dict:
    groups: dict = {}
    for stat in stats:
        day = stat.recorded_at.date()
        groups.setdefault(day, []).append(stat)
    return groups


def _last_in_day(day_stats: list[DeviceStat], field: str):
    """Último valor no nulo de `field` en las lecturas de un día (ya vienen ordenadas)."""
    for stat in reversed(day_stats):
        value = getattr(stat, field)
        if value is not None:
            return value
    return None


def _avg_in_day(day_stats: list[DeviceStat], field: str):
    values = [getattr(s, field) for s in day_stats if getattr(s, field) is not None]
    return round(sum(values) / len(values), 1) if values else None


def _daily_series(
    day_list: list, groups: dict, field: str, mode: str, label_mode: str
) -> list[DailyPoint]:
    points: list[DailyPoint] = []
    for day in day_list:
        day_stats = groups.get(day, [])
        value = _last_in_day(day_stats, field) if mode == "last" else _avg_in_day(day_stats, field)

        if label_mode == "weekday":
            label = _WEEKDAY_LETTERS[day.weekday()]
        else:  # "day_number"
            label = str(day.day)

        points.append(DailyPoint(date=day.isoformat(), label=label, value=value))
    return points


def _hourly_series(stats: list[DeviceStat], field: str) -> list[DailyPoint]:
    """Serie por lectura individual (usada solo para el período 'today')."""
    points = []
    for stat in stats:
        value = getattr(stat, field)
        if value is None:
            continue
        time_label = stat.recorded_at.strftime("%H:%M")
        points.append(DailyPoint(date=time_label, label=time_label, value=value))
    return points


def _build_metric_summary(
    daily_points: list[DailyPoint],
    previous_avg: float | None,
    unit: str | None,
    goal: float | None,
    value_fmt,
    raw_extremes: tuple | None = None,
    use_last: bool = False,
) -> MetricStatsSummary:
    """
    use_last=True se usa en el período 'today' para métricas acumuladas (pasos, calorías,
    sueño): el último valor del día ya es el total, promediar las lecturas no tiene sentido.
    """
    values = [p.value for p in daily_points if p.value is not None]
    if not values:
        avg = 0.0
    elif use_last:
        avg = float(values[-1])
    else:
        avg = round(sum(values) / len(values), 1)

    if raw_extremes is not None:
        max_value, max_at, min_value, min_at = raw_extremes
    else:
        max_value = max(values) if values else None
        min_value = min(values) if values else None
        max_at = None
        min_at = None

    return MetricStatsSummary(
        avg=avg,
        avg_display=value_fmt(avg),
        unit=unit,
        max=max_value,
        max_at=max_at,
        min=min_value,
        min_at=min_at,
        goal=goal,
        change_pct=_pct_change(avg, previous_avg) if previous_avg is not None else None,
        daily=daily_points,
    )


def get_stats_summary(db: Session, user: User, period: str = "7d") -> StatsResponse:
    if period not in _PERIOD_DAYS:
        period = "7d"
    days = _PERIOD_DAYS[period]

    device = get_or_create_device(db, user)

    now = datetime.utcnow()
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    period_start = today_start - timedelta(days=days - 1)
    previous_start = period_start - timedelta(days=days)

    all_stats = (
        db.query(DeviceStat)
        .filter(DeviceStat.device_id == device.id, DeviceStat.recorded_at >= previous_start)
        .order_by(DeviceStat.recorded_at.asc())
        .all()
    )

    current_stats = [s for s in all_stats if s.recorded_at >= period_start]
    previous_stats = [s for s in all_stats if s.recorded_at < period_start]

    if period == "today":
        label_mode = None
        day_list = []
        groups = {}
    else:
        label_mode = "weekday" if period == "7d" else "day_number"
        day_list = [(period_start + timedelta(days=i)).date() for i in range(days)]
        groups = _group_by_day(current_stats)

    # Promedios del período anterior equivalente (para el % de variación).
    prev_groups = _group_by_day(previous_stats)
    prev_day_list = [(previous_start + timedelta(days=i)).date() for i in range(days)]

    def _prev_avg(field: str, mode: str) -> float | None:
        vals = [
            _last_in_day(prev_groups.get(d, []), field) if mode == "last"
            else _avg_in_day(prev_groups.get(d, []), field)
            for d in prev_day_list
        ]
        vals = [v for v in vals if v is not None]
        return round(sum(vals) / len(vals), 1) if vals else None

    # Una métrica por entrada de la fábrica: heart_rate, steps, calories, sleep.
    summaries = {}
    for name, metric in MetricFactory.create_all().items():
        if period == "today":
            daily = _hourly_series(current_stats, metric.field)
        else:
            daily = _daily_series(day_list, groups, metric.field, metric.mode, label_mode)

        summaries[name] = _build_metric_summary(
            daily,
            _prev_avg(metric.field, metric.mode),
            unit=metric.unit,
            goal=metric.goal,
            value_fmt=metric.format,
            raw_extremes=metric.raw_extremes(current_stats),
            use_last=(period == "today" and metric.mode == "last"),
        )

    range_label = _format_range_label(period_start, now)

    return StatsResponse(period=period, range_label=range_label, **summaries)