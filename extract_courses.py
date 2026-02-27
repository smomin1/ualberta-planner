"""
UAlberta Course Catalogue Extractor
Extracts course data from the UAlberta course listings PDF and converts it to JSON.

Usage:
    python extract_courses.py

Requirements:
    pip install pdfplumber

Output:
    extracted_courses.json — ready to replace your server/data/courses.json
"""

import pdfplumber
import json
import re
import os

# ── CONFIG ────────────────────────────────────────────────────────────────────
PDF_PATH = "course-listings.pdf"   
OUTPUT_PATH = "courses.json"

# Set to None to extract ALL departments
TARGET_DEPARTMENTS = None  # e.g. ['CMPUT', 'MATH', 'STAT', 'PHYS', 'CHEM', 'BIOL', 'EAS']
# ─────────────────────────────────────────────────────────────────────────────


def parse_terms(text):
    t = text.lower()
    if "either term" in t:
        return ["Fall", "Winter"]
    elif "first term" in t:
        return ["Fall"]
    elif "second term" in t:
        return ["Winter"]
    elif "two-term" in t or "two term" in t:
        return ["Fall", "Winter"]
    elif "spring" in t or "summer" in t:
        return ["Spring", "Summer"]
    return ["Fall", "Winter"]


def parse_prerequisites(text):
    match = re.search(r'[Pp]rerequisites?:\s*([^.]+)', text)
    if match:
        raw = match.group(1)
        codes = re.findall(r'[A-Z]{2,6}\s+\d{3}', raw)
        return [c.strip() for c in codes]
    return []


def parse_corequisites(text):
    match = re.search(r'[Cc]orequisites?:\s*([^.]+)', text)
    if match:
        raw = match.group(1)
        codes = re.findall(r'[A-Z]{2,6}\s+\d{3}', raw)
        return [c.strip() for c in codes]
    return []


def parse_units(text):
    match = re.search(r'★\s*(\d+)', text)
    if match:
        return int(match.group(1))
    return 3


def get_level(course_code):
    match = re.search(r'\d{3}', course_code)
    if match:
        return (int(match.group()) // 100) * 100
    return 100


def get_category(course_code, level):
    dept = re.match(r'[A-Z]+', course_code)
    dept = dept.group() if dept else ''

    if dept == 'CMPUT':
        return 'Computing Science'
    elif dept in ['MATH', 'STAT']:
        return 'Mathematics'
    elif dept in ['PHYS', 'CHEM', 'BIOL', 'EAS']:
        return 'Natural Science'
    elif level >= 500:
        return 'Graduate'
    elif level >= 300:
        return 'Senior Elective'
    else:
        return 'General'


def extract_courses(pdf_path):
    courses = []
    full_text = ""

    print(f"Opening PDF: {pdf_path}")
    with pdfplumber.open(pdf_path) as pdf:
        total = len(pdf.pages)
        print(f"Total pages: {total}")

        for i, page in enumerate(pdf.pages):
            if i % 100 == 0:
                print(f"  Reading page {i}/{total}...")
            text = page.extract_text()
            if text:
                full_text += text + "\n"

    print("Parsing courses...")
    lines = full_text.split('\n')
    seen_codes = set()

    i = 0
    while i < len(lines):
        line = lines[i].strip()

        header_match = re.match(r'^([A-Z]{2,6}\s+\d{3}[A-Z]?)\s+-\s+(.+)$', line)

        if header_match:
            code = header_match.group(1).strip()
            name = header_match.group(2).strip()

            # Filter by department if TARGET_DEPARTMENTS is set
            dept = code.split()[0]
            if TARGET_DEPARTMENTS and dept not in TARGET_DEPARTMENTS:
                i += 1
                continue

            # Skip duplicates
            if code in seen_codes:
                i += 1
                continue

            # Collect course body
            body_lines = []
            j = i + 1
            while j < len(lines) and j < i + 10:
                next_line = lines[j].strip()
                if re.match(r'^[A-Z]{2,6}\s+\d{3}[A-Z]?\s+-\s+', next_line):
                    break
                if next_line:
                    body_lines.append(next_line)
                j += 1

            body = ' '.join(body_lines)

            # Only process real courses (has ★ or term info)
            if '★' in body or re.search(r'\((?:either|first|second|two)[\s-]term', body):
                units = parse_units(body)
                terms = parse_terms(body)
                prerequisites = parse_prerequisites(body)
                corequisites = parse_corequisites(body)
                level = get_level(code)
                category = get_category(code, level)

                # Clean up description
                desc = re.sub(r'★\s*\d+\s*\(fi\s*[\d.]+\)\s*\([^)]+\)', '', body).strip()
                desc = re.sub(r'Prerequisites?:[^.]+\.?', '', desc).strip()
                desc = re.sub(r'Corequisites?:[^.]+\.?', '', desc).strip()
                desc = desc[:300] if len(desc) > 300 else desc

                courses.append({
                    "code": code,
                    "name": name,
                    "units": units,
                    "prerequisites": prerequisites,
                    "corequisites": corequisites,
                    "terms": terms,
                    "category": category,
                    "level": level,
                    "description": desc
                })
                seen_codes.add(code)

        i += 1

    return courses


def main():
    if not os.path.exists(PDF_PATH):
        print(f"ERROR: Could not find '{PDF_PATH}'")
        print(f"Please put your PDF in the same folder as this script and rename it to: {PDF_PATH}")
        return

    courses = extract_courses(PDF_PATH)

    print(f"\nExtracted {len(courses)} courses")

    # Print department breakdown
    from collections import Counter
    depts = Counter(c['code'].split()[0] for c in courses)
    print("\nDepartment breakdown:")
    for dept, count in sorted(depts.items()):
        print(f"  {dept}: {count} courses")

    # Save
    with open(OUTPUT_PATH, 'w') as f:
        json.dump(courses, f, indent=2)

    print(f"\nSaved to {OUTPUT_PATH}")
    print(f"\nNext step: copy {OUTPUT_PATH} to your server/data/courses.json")


if __name__ == "__main__":
    main()