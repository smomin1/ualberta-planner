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
  timeSlots?: TimeSlot[];
}

export interface TimeSlot {
  day: string;
  start: string;
  end: string;
}

export type RequirementType = 
  | 'required'       
  | 'pick_n'          
  | 'max_level'       
  | 'max_department'  

export interface RequirementCategory {
  label: string;
  type: RequirementType;
  requiredCourses: string[];
  minUnits: number;
  minLevel?: number;
  // pick_n specific
  pickN?: number;
  pickFromList?: string[];
  // max constraints
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

export interface EligibilityResult {
  courseCode: string;
  courseName: string;
  eligible: boolean;
  missingPrereqs: string[];
  missingCoreqs: string[];
}

export interface AnalyzeResponse {
  eligibility: EligibilityResult[];
  conflicts: Conflict[];
  degreeProgress: DegreeProgress;
}

export interface Conflict {
  course1: string;
  course2: string;
  day: string;
  time: string;
}

export type CareerTrack =
  | 'Machine Learning'
  | 'Software Engineering'
  | 'Systems & Infrastructure'
  | 'Research & Academia'
  | 'Not sure yet';