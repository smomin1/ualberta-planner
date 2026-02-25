import { Course } from './prerequisiteChecker';

export type RequirementType = 
  | 'required'
  | 'pick_n'
  | 'max_level'
  | 'max_department';

export interface RequirementCategory {
  label: string;
  type: RequirementType;
  requiredCourses: string[];
  minUnits: number;
  minLevel?: number;
  pickN?: number;
  pickFromList?: string[];
  maxUnits?: number;
  maxLevel?: number;
  maxDepartment?: string;
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
  warning?: string;

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
    let missing: string[] = [];
    let warning: string | undefined;

    switch (req.type) {

      case 'required':
        // All listed courses must be completed
        completed = req.requiredCourses.filter(code =>
          completedCourseCodes.includes(code)
        );
        missing = req.requiredCourses.filter(code =>
          !completedCourseCodes.includes(code)
        );
        unitsCompleted = completed.reduce((sum, code) => {
          const course = allCourses.find(c => c.code === code);
          return sum + (course?.units || 3);
        }, 0);
        break;

      case 'pick_n':
        // Must pick N courses from a specific list
        const pickedCourses = (req.pickFromList || []).filter(code =>
          completedCourseCodes.includes(code)
        );
        completed = pickedCourses;
        unitsCompleted = pickedCourses.reduce((sum, code) => {
          const course = allCourses.find(c => c.code === code);
          return sum + (course?.units || 3);
        }, 0);
        const stillNeeded = (req.pickN || 1) - pickedCourses.length;
        if (stillNeeded > 0) {
          const remaining = (req.pickFromList || []).filter(
            code => !completedCourseCodes.includes(code)
          );
          missing = remaining.slice(0, stillNeeded);
        }
        break;

      case 'max_level':
        // Maximum units allowed at or below a certain level
        const levelCourses = completedCourses.filter(
          c => c.level <= (req.maxLevel || 199)
        );
        completed = levelCourses.map(c => c.code);
        unitsCompleted = levelCourses.reduce((sum, c) => sum + c.units, 0);
        if (req.maxUnits && unitsCompleted > req.maxUnits) {
          warning = `Exceeded maximum ${req.maxUnits} units at ${req.maxLevel}-level (have ${unitsCompleted})`;
        }
        break;

      case 'max_department':
        // Maximum units allowed from one department
        const deptCourses = completedCourses.filter(c =>
          c.code.startsWith(req.maxDepartment || '')
        );
        completed = deptCourses.map(c => c.code);
        unitsCompleted = deptCourses.reduce((sum, c) => sum + c.units, 0);
        if (req.maxUnits && unitsCompleted > req.maxUnits) {
          warning = `Exceeded maximum ${req.maxUnits} units from ${req.maxDepartment} (have ${unitsCompleted})`;
        }
        break;
    }

    const fulfilled = (() => {
      switch (req.type) {
        case 'required':
          return missing.length === 0 && unitsCompleted >= req.minUnits;
        case 'pick_n':
          return completed.length >= (req.pickN || 1);
        case 'max_level':
        case 'max_department':
          return !warning;
        default:
          return false;
      }
    })();

    return {
      label: req.label,
      completed,
      missing,
      unitsCompleted,
      unitsRequired: req.minUnits,
      fulfilled,
      warning
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