import { Course } from './prerequisiteChecker';

export interface RequirementCategory {
  label: string;
  requiredCourses: string[];
  minUnits: number;
  minLevel?: number;
}

export interface DegreeRequirements {
  programName: string;
  totalUnitsRequired: number;
  categories: RequirementCategory[];
}

export interface CategoryProgress {
  label: string;
  completed: string[];
  missing: string[];
  unitsCompleted: number;
  unitsRequired: number;
  fulfilled: boolean;
}

export interface DegreeProgress {
  programName: string;
  categories: CategoryProgress[];
  totalUnitsCompleted: number;
  totalUnitsRequired: number;
  overallPercent: number;
  missingRequiredCourses: string[];
}

export function getDegreeProgress(
  completedCourseCodes: string[],
  allCourses: Course[],
  requirements: DegreeRequirements
): DegreeProgress {
  const completedCourses = allCourses.filter(c =>
    completedCourseCodes.includes(c.code)
  );

  const totalUnitsCompleted = completedCourses.reduce(
    (sum, c) => sum + c.units, 0
  );

  const categories: CategoryProgress[] = requirements.categories.map(req => {
    let completed: string[] = [];
    let unitsCompleted = 0;

    if (req.requiredCourses.length > 0) {
      completed = req.requiredCourses.filter(code =>
        completedCourseCodes.includes(code)
      );
      unitsCompleted = completed.reduce((sum, code) => {
        const course = allCourses.find(c => c.code === code);
        return sum + (course?.units || 3);
      }, 0);
    } else if (req.minLevel) {
      const seniorCompleted = completedCourses.filter(
        c => c.level >= req.minLevel!
      );
      completed = seniorCompleted.map(c => c.code);
      unitsCompleted = seniorCompleted.reduce((sum, c) => sum + c.units, 0);
    } else {
      const electivesCompleted = completedCourses.filter(
        c => req.requiredCourses.length === 0 && !c.code.startsWith('CMPUT')
      );
      completed = electivesCompleted.map(c => c.code);
      unitsCompleted = electivesCompleted.reduce((sum, c) => sum + c.units, 0);
    }

    const missing = req.requiredCourses.filter(
      code => !completedCourseCodes.includes(code)
    );

    return {
      label: req.label,
      completed,
      missing,
      unitsCompleted,
      unitsRequired: req.minUnits,
      fulfilled: unitsCompleted >= req.minUnits && missing.length === 0
    };
  });

  const missingRequiredCourses = categories.flatMap(c => c.missing);
  const overallPercent = Math.min(
    Math.round((totalUnitsCompleted / requirements.totalUnitsRequired) * 100),
    100
  );

  return {
    programName: requirements.programName,
    categories,
    totalUnitsCompleted,
    totalUnitsRequired: requirements.totalUnitsRequired,
    overallPercent,
    missingRequiredCourses
  };
}