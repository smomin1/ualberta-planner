import type { DegreeProgress } from '../types';

interface CompletedPanelProps {
  completedCourses: string[];
  degreeProgress: DegreeProgress | null;
}

export default function CompletedPanel({
  completedCourses,
  degreeProgress
}: CompletedPanelProps) {
  return (
    <div className="bg-white rounded-2xl shadow p-6 flex flex-col gap-4">
      <h2 className="text-lg font-bold text-gray-800">📚 Completed Courses</h2>

      {/* Course list */}
      <div className="flex flex-wrap gap-2">
        {completedCourses.length === 0 ? (
          <p className="text-gray-400 text-sm">No courses added yet</p>
        ) : (
          completedCourses.map(code => (
            <span
              key={code}
              className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium"
            >
              ✓ {code}
            </span>
          ))
        )}
      </div>

      {/* Degree progress */}
      {degreeProgress && (
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-gray-700">Degree Progress</h3>
            <span className="text-sm font-bold text-green-600">
              {degreeProgress.overallPercent}%
            </span>
          </div>

          {/* Overall progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div
              className="bg-green-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${degreeProgress.overallPercent}%` }}
            />
          </div>

          <p className="text-xs text-gray-400 mb-4">
            {degreeProgress.totalUnitsCompleted} / {degreeProgress.totalUnitsRequired} units completed
          </p>

          {/* Category breakdown */}
          <div className="space-y-3">
            {degreeProgress.categories.map(cat => {
              const percent = Math.min(
                Math.round((cat.unitsCompleted / cat.unitsRequired) * 100),
                100
              );
              return (
                <div key={cat.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className={`font-medium ${cat.fulfilled ? 'text-green-600' : 'text-gray-600'}`}>
                      {cat.fulfilled ? '✅' : '⏳'} {cat.label}
                    </span>
                    <span className="text-gray-400">
                        {cat.warning 
                            ? `${cat.unitsCompleted} units (max exceeded)`
                            : cat.unitsRequired === cat.unitsCompleted && cat.fulfilled
                            ? `${cat.unitsCompleted} units ✓`
                            : `${cat.unitsCompleted}/${cat.unitsRequired} units`
                        }
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        cat.fulfilled ? 'bg-green-500' :
                        percent > 50 ? 'bg-yellow-400' : 'bg-red-400'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  {cat.missing.length > 0 && (
                    <p className="text-xs text-red-400 mt-1">
                        Missing: {cat.missing.slice(0, 3).join(', ')}
                        {cat.missing.length > 3 && ` +${cat.missing.length - 3} more`}
                    </p>
                    )}
                    {cat.warning && (
                    <p className="text-xs text-orange-500 mt-1">
                        ⚠️ {cat.warning}
                    </p>
                    )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
