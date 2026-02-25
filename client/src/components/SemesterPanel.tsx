import { useState } from 'react';
import type { Course, EligibilityResult, Conflict } from '../types';

interface SemesterPanelProps {
  allCourses: Course[];
  selectedCourses: Course[];
  eligibility: EligibilityResult[];
  conflicts: Conflict[];
  onAddCourse: (course: Course) => void;
  onRemoveCourse: (code: string) => void;
}

export default function SemesterPanel({
  allCourses,
  selectedCourses,
  eligibility,
  conflicts,
  onAddCourse,
  onRemoveCourse
}: SemesterPanelProps) {
  const [search, setSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const filtered = allCourses.filter(c =>
    (c.code.toLowerCase().includes(search.toLowerCase()) ||
    c.name.toLowerCase().includes(search.toLowerCase())) &&
    !selectedCourses.find(s => s.code === c.code)
  ).slice(0, 6);

  const getEligibility = (code: string) =>
    eligibility.find(e => e.courseCode === code);

  const getCourseConflicts = (code: string) =>
    conflicts.filter(c => c.course1 === code || c.course2 === code);

  return (
    <div className="bg-white rounded-2xl shadow p-6 flex flex-col gap-4">
      <h2 className="text-lg font-bold text-gray-800">📅 Next Semester</h2>

      {/* Search */}
      <div className="relative">
        <input
          className="w-full border rounded-lg p-3 text-sm"
          placeholder="Search courses to add..."
          value={search}
          onChange={e => {
            setSearch(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
        />

        {/* Dropdown */}
        {showDropdown && search && filtered.length > 0 && (
          <div className="absolute z-10 w-full bg-white border rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto">
            {filtered.map(course => (
              <button
                key={course.code}
                onClick={() => {
                  onAddCourse(course);
                  setSearch('');
                  setShowDropdown(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 border-b last:border-0"
              >
                <span className="font-medium text-sm text-gray-800">{course.code}</span>
                <span className="text-xs text-gray-400 ml-2">{course.name}</span>
                <span className="text-xs text-gray-300 ml-2">· {course.units} units</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Selected courses */}
      <div className="space-y-3">
        {selectedCourses.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <div className="text-3xl mb-2">📋</div>
            <p className="text-sm">Search for courses to add to your semester plan</p>
          </div>
        ) : (
          selectedCourses.map(course => {
            const elig = getEligibility(course.code);
            const courseConflicts = getCourseConflicts(course.code);
            const hasIssues = (elig && !elig.eligible) || courseConflicts.length > 0;

            return (
              <div
                key={course.code}
                className={`p-3 rounded-xl border-2 ${
                  hasIssues ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-semibold text-sm text-gray-800">
                      {course.code}
                    </span>
                    <span className="text-xs text-gray-500 ml-2">{course.name}</span>
                    <span className="text-xs text-gray-400 ml-2">· {course.units} units</span>
                  </div>
                  <button
                    onClick={() => onRemoveCourse(course.code)}
                    className="text-gray-400 hover:text-red-500 text-lg leading-none"
                  >×</button>
                </div>

                {/* Prerequisite warning */}
                {elig && !elig.eligible && (
                  <div className="mt-2 text-xs text-red-600 bg-red-100 rounded-lg p-2">
                    ⚠️ Missing prerequisites: {elig.missingPrereqs.join(', ')}
                  </div>
                )}

                {/* Conflict warning */}
                {courseConflicts.map((conflict, i) => (
                  <div key={i} className="mt-2 text-xs text-orange-600 bg-orange-100 rounded-lg p-2">
                    ❌ Conflicts with {conflict.course1 === course.code ? conflict.course2 : conflict.course1} on {conflict.day}
                  </div>
                ))}

                {/* All good */}
                {!hasIssues && elig && (
                  <div className="mt-2 text-xs text-green-600">
                    ✅ Eligible — no conflicts
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Units summary */}
      {selectedCourses.length > 0 && (
        <div className="text-sm text-gray-500 pt-2 border-t">
          Total: <span className="font-semibold text-gray-700">
            {selectedCourses.reduce((sum, c) => sum + c.units, 0)} units
          </span> planned for next semester
        </div>
      )}
    </div>
  );
}