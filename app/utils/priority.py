# ============================================
# MediScan AI — Priority Classification & Text Parsing
# ============================================

import re
from typing import List, Dict


# ── Priority Keywords ───────────────────────
CRITICAL_KEYWORDS = [
    "sos", "emergency", "life saving", "life-saving", "lifesaving",
    "stat", "immediately", "cardiac arrest", "anaphylaxis",
    "insulin", "epinephrine", "adrenaline", "nitroglycerin",
    "morphine", "naloxone", "atropine",
]

HIGH_KEYWORDS = [
    "urgent", "asap", "high priority", "acute",
    "pain", "severe", "infection", "antibiotic",
    "amoxicillin", "azithromycin", "ciprofloxacin",
    "metformin", "atorvastatin", "amlodipine",
    "blood pressure", "diabetes", "hypertension",
]

URGENT_KEYWORDS = [
    "important", "follow up", "follow-up", "monitor",
    "prescription refill", "chronic", "ongoing",
    "omeprazole", "pantoprazole", "ranitidine",
    "ibuprofen", "diclofenac", "paracetamol",
]


def classify_priority(text: str) -> str:
    """Classify prescription priority based on keywords in the text.

    Returns one of: critical, high, urgent, regular
    """
    if not text:
        return "regular"

    lower_text = text.lower()

    # Check Critical
    for keyword in CRITICAL_KEYWORDS:
        if keyword in lower_text:
            return "critical"

    # Check High Priority
    for keyword in HIGH_KEYWORDS:
        if keyword in lower_text:
            return "high"

    # Check Urgent
    for keyword in URGENT_KEYWORDS:
        if keyword in lower_text:
            return "urgent"

    return "regular"


def parse_medicines_from_text(raw_text: str) -> List[Dict[str, str]]:
    """Parse medicine names, dosages, frequency, and duration from OCR text.

    This is a rule-based parser that handles common prescription patterns:
      - Medicine Name 500mg — 3 times daily — 7 days
      - Tab. Amoxicillin 500mg 1-0-1 x 7 days
      - Paracetamol 650mg SOS

    Returns a list of dicts with keys: medicine_name, dosage, frequency, duration
    """
    if not raw_text:
        return []

    medicines = []
    lines = raw_text.strip().split("\n")

    # Common medicine patterns
    # Pattern: Medicine Dosage Frequency Duration
    medicine_pattern = re.compile(
        r"(?:tab\.?|cap\.?|syp\.?|inj\.?|oint\.?|drops?\.?)?\s*"  # prefix
        r"([A-Z][a-zA-Z\-]+(?:\s+[A-Z][a-zA-Z\-]+)*)"            # medicine name
        r"[\s,\-]*"
        r"(\d+\s*(?:mg|mcg|ml|g|iu|units?|%)?)"                    # dosage
        r"[\s,\-]*"
        r"([\w\s\-/]*?(?:daily|twice|thrice|times|sos|bd|tds|od|qid|bid|tid|prn|stat|1-0-1|1-1-1|0-0-1|1-0-0|0-1-0))?"  # frequency
        r"[\s,\-]*"
        r"(?:(?:for|x|×)\s*)?(\d+\s*(?:days?|weeks?|months?))?"    # duration
        ,
        re.IGNORECASE,
    )

    for line in lines:
        line = line.strip()
        if not line or len(line) < 3:
            continue

        match = medicine_pattern.search(line)
        if match:
            name = match.group(1).strip() if match.group(1) else ""
            dosage = match.group(2).strip() if match.group(2) else ""
            frequency = match.group(3).strip() if match.group(3) else ""
            duration = match.group(4).strip() if match.group(4) else ""

            if name and len(name) > 2:
                medicines.append({
                    "medicine_name": name,
                    "dosage": dosage or "As prescribed",
                    "frequency": frequency or "As directed",
                    "duration": duration or "As needed",
                })
        else:
            # Fallback: treat each non-empty line as a medicine name
            # Only if it looks like it could be a medicine (starts with letter, > 3 chars)
            clean_line = re.sub(r"^\d+[\.\)\s]+", "", line).strip()
            if clean_line and len(clean_line) > 3 and clean_line[0].isalpha():
                medicines.append({
                    "medicine_name": clean_line,
                    "dosage": "As prescribed",
                    "frequency": "As directed",
                    "duration": "As needed",
                })

    return medicines
