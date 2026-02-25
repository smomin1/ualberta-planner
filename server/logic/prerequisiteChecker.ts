export interface Course {
  code: string;
  name: string;
  units: number;
  prerequisites: string[];
  corequisites: string[];
  terms: string[];
  category: string;
  level: number;
  description: string;
}

export interface EligibilityResult {
  courseCode: string;
  courseName: string;
  eligible: boolean;
  missingPrereqs: string[];
  missingCoreqs: string[];
}

export function checkEligibility(
  courseCode: string,
  completedCourses: string[],
  allCourses: Course[]
): EligibilityResult {
  const course = allCourses.find(c => c.code === courseCode);

  if (!course) {
    return {
      courseCode,
      courseName: 'Unknown Course',
      eligible: false,
      missingPrereqs: [],
      missingCoreqs: []
    };
  }

  const missingPrereqs = course.prerequisites.filter(
    prereq => !completedCourses.includes(prereq)
  );

  const missingCoreqs = course.corequisites.filter(
    coreq => !completedCourses.includes(coreq)
  );

  return {
    courseCode: course.code,
    courseName: course.name,
    eligible: missingPrereqs.length === 0,
    missingPrereqs,
    missingCoreqs
  };
}

export function checkMultipleCourses(
  courseCodes: string[],
  completedCourses: string[],
  allCourses: Course[]
): EligibilityResult[] {
  return courseCodes.map(code =>
    checkEligibility(code, completedCourses, allCourses)
  );
}