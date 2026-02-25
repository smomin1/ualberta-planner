export interface TimeSlot {
  day: string;
  start: string;
  end: string;
}

export interface CourseWithTime {
  code: string;
  name: string;
  timeSlots: TimeSlot[];
}

export interface Conflict {
  course1: string;
  course2: string;
  day: string;
  time: string;
}

function timesOverlap(a: TimeSlot, b: TimeSlot): boolean {
  return a.start < b.end && b.start < a.end;
}

export function detectConflicts(selectedCourses: CourseWithTime[]): Conflict[] {
  const conflicts: Conflict[] = [];

  for (let i = 0; i < selectedCourses.length; i++) {
    for (let j = i + 1; j < selectedCourses.length; j++) {
      const c1 = selectedCourses[i];
      const c2 = selectedCourses[j];

      for (const slot1 of c1.timeSlots || []) {
        for (const slot2 of c2.timeSlots || []) {
          if (slot1.day === slot2.day && timesOverlap(slot1, slot2)) {
            conflicts.push({
              course1: c1.code,
              course2: c2.code,
              day: slot1.day,
              time: `${slot1.start} - ${slot1.end}`
            });
          }
        }
      }
    }
  }

  return conflicts;
}