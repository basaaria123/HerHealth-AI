
from collections import Counter, defaultdict
from statistics import mean

from app.models import Symptom


DISCLAIMER = (
    "These observations summarize recorded data only. They are not a "
    "medical diagnosis, cannot predict disease, and do not replace "
    "professional medical advice."
)


def generate_insights(entries: list[Symptom]) -> dict:
    """
    Generate transparent, deterministic observations from symptom logs.

    The function uses only the supplied records. It does not diagnose
    conditions or infer medical causes.
    """
    if not entries:
        return {
            "total_entries": 0,
            "symptom_frequency": {},
            "average_pain_severity": None,
            "observations": [
                {
                    "type": "insufficient_data",
                    "message": (
                        "There is not enough logged data to identify "
                        "patterns yet. Continue recording symptoms over time."
                    ),
                    "evidence": "No symptom entries are currently saved.",
                }
            ],
            "disclaimer": DISCLAIMER,
        }

    # Count the frequency of each symptom category.
    counts = Counter(entry.symptom_type for entry in entries)
    symptom_frequency = dict(sorted(counts.items()))

    observations = []
    total_entries = len(entries)

    # Identify the most frequently recorded symptom.
    highest_count = max(counts.values())
    most_common = sorted(
        symptom for symptom, count in counts.items()
        if count == highest_count
    )

    if len(most_common) == 1:
        symptom = most_common[0]
        observations.append({
            "type": "frequency",
            "message": (
                f"{symptom.replace('_', ' ').capitalize()} is the most "
                "frequently recorded symptom category."
            ),
            "evidence": (
                f"{counts[symptom]} of {total_entries} entries "
                f"({counts[symptom] / total_entries * 100:.1f}%) "
                "use this category."
            ),
        })
    else:
        observations.append({
            "type": "frequency",
            "message": "Multiple symptom categories share the highest frequency.",
            "evidence": (
                f"{', '.join(most_common)} each appear "
                f"{highest_count} time(s) across {total_entries} entries."
            ),
        })

    # Calculate average pain severity when pain scores are available.
    pain_entries = [
        entry for entry in entries
        if entry.pain_severity is not None
    ]

    average_pain = None

    if pain_entries:
        average_pain = round(
            mean(entry.pain_severity for entry in pain_entries),
            2,
        )

        observations.append({
            "type": "pain_summary",
            "message": (
                f"The average recorded pain severity is "
                f"{average_pain}/10."
            ),
            "evidence": (
                f"Calculated from {len(pain_entries)} entries containing "
                "a pain severity score."
            ),
        })

    # Compare the earliest and latest dated pain scores.
    if len(pain_entries) >= 2:
        ordered_pain = sorted(
            pain_entries,
            key=lambda entry: (
                entry.date,
                entry.id if entry.id is not None else 0,
            ),
        )

        first = ordered_pain[0]
        latest = ordered_pain[-1]

        if latest.pain_severity > first.pain_severity:
            trend_message = (
                "The latest recorded pain severity is higher than "
                "the earliest recorded pain severity."
            )
        elif latest.pain_severity < first.pain_severity:
            trend_message = (
                "The latest recorded pain severity is lower than "
                "the earliest recorded pain severity."
            )
        else:
            trend_message = (
                "The earliest and latest recorded pain severity scores "
                "are equal."
            )

        observations.append({
            "type": "pain_trend",
            "message": trend_message,
            "evidence": (
                f"{first.pain_severity}/10 on {first.date} compared with "
                f"{latest.pain_severity}/10 on {latest.date}."
            ),
        })

    # Report high recorded pain scores without making a diagnosis.
    high_pain_entries = [
        entry for entry in pain_entries
        if entry.pain_severity >= 8
    ]

    if high_pain_entries:
        observations.append({
            "type": "high_pain",
            "message": (
                "Some entries record pain severity of 8/10 or higher. "
                "Consider discussing severe or persistent pain with "
                "a healthcare professional."
            ),
            "evidence": (
                f"{len(high_pain_entries)} of {len(pain_entries)} entries "
                "with pain scores record severity of 8/10 or higher."
            ),
        })

    # Summarize recorded symptoms by calendar date.
    daily_counts = defaultdict(int)

    for entry in entries:
        daily_counts[entry.date.isoformat()] += 1

    sorted_days = sorted(daily_counts.items())

    if len(sorted_days) >= 2:
        busiest_count = max(count for _, count in sorted_days)
        busiest_days = [
            day for day, count in sorted_days
            if count == busiest_count
        ]

        observations.append({
            "type": "daily_logging",
            "message": (
                "Symptom entries are not evenly distributed across "
                "recorded dates."
                if len(set(daily_counts.values())) > 1
                else "The number of symptom entries is equal across recorded dates."
            ),
            "evidence": (
                f"{len(sorted_days)} distinct dates contain entries. "
                f"The highest daily count is {busiest_count}, on "
                f"{', '.join(busiest_days)}."
            ),
        })

    return {
        "total_entries": total_entries,
        "symptom_frequency": symptom_frequency,
        "average_pain_severity": average_pain,
        "observations": observations,
        "disclaimer": DISCLAIMER,
    }
