import { useState } from 'react';
import type { DegreeRequirements, CareerTrack } from '../types';
import coursesData from '../../../server/data/courses.json';
import RequirementsBuilder from './RequirementsBuilder';

const CS_TEMPLATE: DegreeRequirements = {
  programName: 'Computing Science BSc',
  totalUnitsRequired: 120,
  categories: [
    {
      label: 'Core CS',
      type: 'required',
      requiredCourses: [
        'CMPUT 114', 'CMPUT 115', 'CMPUT 175', 'CMPUT 201',
        'CMPUT 204', 'CMPUT 229', 'CMPUT 272', 'CMPUT 291',
        'CMPUT 301', 'CMPUT 304'
      ],
      minUnits: 30
    },
    {
      label: 'Mathematics',
      type: 'required',
      requiredCourses: ['MATH 114', 'MATH 115', 'MATH 125', 'MATH 225'],
      minUnits: 12
    },
    {
      label: 'Statistics',
      type: 'required',
      requiredCourses: ['STAT 235'],
      minUnits: 3
    },
    {
      label: 'Senior CS Electives',
      type: 'required',
      requiredCourses: [],
      minUnits: 24,
      minLevel: 300
    },
    {
      label: 'Natural Science — Pick 2',
      type: 'pick_n',
      requiredCourses: [],
      pickN: 2,
      pickFromList: ['PHYS 124', 'PHYS 126', 'CHEM 101', 'BIOL 107'],
      minUnits: 6
    },
    {
      label: 'Max 100-level Units',
      type: 'max_level',
      requiredCourses: [],
      minUnits: 48,
      maxLevel: 199,
      maxUnits: 48
    }
  ]
};

const CAREER_TRACKS: CareerTrack[] = [
  'Machine Learning',
  'Software Engineering',
  'Systems & Infrastructure',
  'Research & Academia',
  'Not sure yet'
];

const CAREER_ICONS: Record<CareerTrack, string> = {
  'Machine Learning': '🤖',
  'Software Engineering': '💻',
  'Systems & Infrastructure': '⚙️',
  'Research & Academia': '🔬',
  'Not sure yet': '🧭'
};

interface OnboardingProps {
  onComplete: (
    requirements: DegreeRequirements,
    completedCourses: string[],
    careerTrack: CareerTrack
  ) => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const [requirements, setRequirements] = useState<DegreeRequirements>(CS_TEMPLATE);
  const [completedInput, setCompletedInput] = useState('');
  const [completedCourses, setCompletedCourses] = useState<string[]>([]);
  const [careerTrack, setCareerTrack] = useState<CareerTrack>('Not sure yet');
  const [useTemplate, setUseTemplate] = useState(true);
  const [inputError, setInputError] = useState('');

  const addCourse = () => {
  const code = completedInput.trim().toUpperCase();
  const exists = coursesData.some((c: any) => c.code === code);

  if (!code) return;

  if (!exists) {
    setInputError(`"${code}" was not found in our course database`);
    return;
  }

  if (!completedCourses.includes(code)) {
    setCompletedCourses([...completedCourses, code]);
    setCompletedInput('');
    setInputError('');
  }
};

  const removeCourse = (code: string) => {
    setCompletedCourses(completedCourses.filter(c => c !== code));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') addCourse();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 to-yellow-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-8">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">🎓</div>
          <h1 className="text-2xl font-bold text-gray-800">UAlberta Course Planner</h1>
          <p className="text-gray-500 mt-1">Let's set up your degree plan</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center mb-8 gap-2">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                ${step >= s ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                {s}
              </div>
              {s < 3 && <div className={`w-12 h-1 ${step > s ? 'bg-green-600' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        {/* Step 1 — Degree Requirements */}
        {step === 1 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              Step 1: Your Degree Requirements
            </h2>
            <p className="text-gray-500 mb-6">
              Use our pre-built CS template or enter your own program requirements.
            </p>

            <div className="flex gap-4 mb-6">
              <button
                onClick={() => { setUseTemplate(true); setRequirements(CS_TEMPLATE); }}
                className={`flex-1 p-4 rounded-xl border-2 text-left transition
                  ${useTemplate ? 'border-green-600 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}
              >
                <div className="font-semibold text-gray-800">🎓 CS Template</div>
                <div className="text-sm text-gray-500 mt-1">Pre-built Computing Science BSc requirements</div>
              </button>
              <button
                onClick={() => {
                  setUseTemplate(false);
                  setRequirements({
                    programName: '',
                    totalUnitsRequired: 120,
                    categories: []
                  });
                }}
                className={`flex-1 p-4 rounded-xl border-2 text-left transition
                  ${!useTemplate ? 'border-green-600 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}
              >
                <div className="font-semibold text-gray-800">✏️ Custom Program</div>
                <div className="text-sm text-gray-500 mt-1">Enter your own degree requirements</div>
              </button>
            </div>

            {useTemplate ? (
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="font-semibold text-gray-700 mb-2">{CS_TEMPLATE.programName}</div>
                <div className="text-sm text-gray-500 mb-3">{CS_TEMPLATE.totalUnitsRequired} total units required</div>
                {CS_TEMPLATE.categories.map(cat => (
                  <div key={cat.label} className="flex justify-between text-sm py-1 border-b border-gray-200 last:border-0">
                    <span className="text-gray-600">{cat.label}</span>
                    <span className="text-gray-400">{cat.minUnits} units</span>
                  </div>
                ))}
              </div>
            ) : (
            <div className="space-y-4">
                <input
                className="w-full border rounded-lg p-3 text-sm"
                placeholder="Program name (e.g. Computing Science BSc)"
                value={requirements.programName}
                onChange={e => setRequirements({ ...requirements, programName: e.target.value })}
                />
                <input
                className="w-full border rounded-lg p-3 text-sm"
                placeholder="Total units required (e.g. 120)"
                type="number"
                value={requirements.totalUnitsRequired}
                onChange={e => setRequirements({ ...requirements, totalUnitsRequired: Number(e.target.value) })}
                />
                <div>
                <label className="text-xs font-medium text-gray-500 mb-2 block">
                    Requirement Categories
                </label>
                <RequirementsBuilder
                    categories={requirements.categories}
                    onChange={cats => setRequirements({ ...requirements, categories: cats })}
                />
                </div>
            </div>
            )}

            <button
              onClick={() => setStep(2)}
              className="w-full mt-6 bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition"
            >
              Next →
            </button>
          </div>
        )}

        {/* Step 2 — Completed Courses */}
        {step === 2 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              Step 2: Courses You've Completed
            </h2>
            <p className="text-gray-500 mb-6">
              Add all courses you've already passed. Type the course code and press Enter.
            </p>

            <div className="flex gap-2 mb-4">
              <input
                className="flex-1 border rounded-lg p-3 text-sm uppercase"
                placeholder="e.g. CMPUT 101"
                value={completedInput}
                onChange={e => {
                setCompletedInput(e.target.value);
                setInputError('');
                }}
                onKeyDown={handleKeyDown}
              />
              <button
                onClick={addCourse}
                className="bg-green-600 text-white px-4 rounded-lg font-semibold hover:bg-green-700 transition"
              >
                Add
              </button>
            </div>
            {inputError && (
            <p className="text-xs text-red-500 -mt-2 mb-2">
                ⚠️ {inputError}
            </p>
            )}

            <div className="flex flex-wrap gap-2 min-h-16 bg-gray-50 rounded-xl p-3 mb-4">
              {completedCourses.length === 0 ? (
                <p className="text-gray-400 text-sm self-center">
                  No courses added yet — type a course code above
                </p>
              ) : (
                completedCourses.map(code => (
                  <span
                    key={code}
                    className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center gap-1"
                  >
                    {code}
                    <button
                      onClick={() => removeCourse(code)}
                      className="text-green-600 hover:text-green-900 ml-1"
                    >×</button>
                  </span>
                ))
              )}
            </div>

            <p className="text-xs text-gray-400 mb-6">
              {completedCourses.length} course{completedCourses.length !== 1 ? 's' : ''} added
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 border border-gray-300 text-gray-600 py-3 rounded-xl font-semibold hover:bg-gray-50 transition"
              >
                ← Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex-1 bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition"
              >
                Next →
              </button>
            </div>
          </div>
        )}

        {/* Step 3 — Career Track */}
        {step === 3 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              Step 3: Where do you want to go?
            </h2>
            <p className="text-gray-500 mb-6">
              Your AI advisor will tailor recommendations based on your career goals.
            </p>

            <div className="space-y-3 mb-8">
              {CAREER_TRACKS.map(track => (
                <button
                  key={track}
                  onClick={() => setCareerTrack(track)}
                  className={`w-full p-4 rounded-xl border-2 text-left transition
                    ${careerTrack === track
                      ? 'border-green-600 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <span className="mr-3">{CAREER_ICONS[track]}</span>
                  <span className="font-medium text-gray-800">{track}</span>
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="flex-1 border border-gray-300 text-gray-600 py-3 rounded-xl font-semibold hover:bg-gray-50 transition"
              >
                ← Back
              </button>
              <button
                onClick={() => onComplete(requirements, completedCourses, careerTrack)}
                className="flex-1 bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition"
              >
                Start Planning 🚀
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}