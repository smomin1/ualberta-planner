import { useState, useEffect } from 'react';
import axios from 'axios';
import type {
  Course, DegreeRequirements, DegreeProgress,
  EligibilityResult, Conflict, CareerTrack
} from '../types';
import CompletedPanel from './CompletedPanel';
import SemesterPanel from './SemesterPanel';
import AIAdvisorPanel from './AIAdvisorPanel';
import coursesData from '../../../server/data/courses.json';

interface PlannerProps {
  completedCourses: string[];
  requirements: DegreeRequirements;
  careerTrack: CareerTrack;
}

const API = 'http://localhost:3001/api';

export default function Planner({
  completedCourses,
  requirements,
  careerTrack
}: PlannerProps) {
  const [selectedCourses, setSelectedCourses] = useState<Course[]>([]);
  const [eligibility, setEligibility] = useState<EligibilityResult[]>([]);
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [degreeProgress, setDegreeProgress] = useState<DegreeProgress | null>(null);
  const [recommendation, setRecommendation] = useState('');
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  // Call /api/analyze whenever selected courses change
  useEffect(() => {
    if (selectedCourses.length === 0) {
      // Still get degree progress even with no courses selected
      analyze();
      return;
    }
    analyze();
  }, [selectedCourses]);

  const analyze = async () => {
    try {
      const res = await axios.post(`${API}/analyze`, {
        completedCourses,
        selectedCourses,
        degreeRequirements: requirements
      });
      setEligibility(res.data.eligibility);
      setConflicts(res.data.conflicts);
      setDegreeProgress(res.data.degreeProgress);
    } catch (err) {
      console.error('Analyze error:', err);
    }
  };

  const getRecommendation = async () => {
    if (!degreeProgress) return;
    setIsLoadingAI(true);
    console.log('Sending career track:', careerTrack);
    try {
      const res = await axios.post(`${API}/recommend`, {
        completedCourses,
        degreeProgress,
        careerTrack,
        degreeRequirements: requirements
      });
      setRecommendation(res.data.recommendation);
    } catch (err) {
      setRecommendation('Unable to get recommendations right now. Please try again.');
    } finally {
      setIsLoadingAI(false);
    }
  };

  const handleAddCourse = (course: Course) => {
    if (!selectedCourses.find(c => c.code === course.code)) {
      setSelectedCourses([...selectedCourses, course]);
    }
  };

  const handleRemoveCourse = (code: string) => {
    setSelectedCourses(selectedCourses.filter(c => c.code !== code));
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-green-700 text-white px-8 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">🎓 UAlberta Course Planner</h1>
          <p className="text-green-200 text-sm">{requirements.programName}</p>
        </div>
        <button
          onClick={getRecommendation}
          disabled={isLoadingAI}
          className="bg-white text-green-700 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-green-50 transition disabled:opacity-50"
        >
          {isLoadingAI ? '⏳ Thinking...' : '✨ Get AI Advice'}
        </button>
      </div>

      {/* Three column layout */}
      <div className="grid grid-cols-3 gap-6 p-6 max-w-7xl mx-auto">
        <CompletedPanel
          completedCourses={completedCourses}
          degreeProgress={degreeProgress}
        />
        <SemesterPanel
          allCourses={coursesData as Course[]}
          selectedCourses={selectedCourses}
          eligibility={eligibility}
          conflicts={conflicts}
          onAddCourse={handleAddCourse}
          onRemoveCourse={handleRemoveCourse}
        />
        <AIAdvisorPanel
          recommendation={recommendation}
          isLoading={isLoadingAI}
          careerTrack={careerTrack}
          onRefresh={getRecommendation}
        />
      </div>
    </div>
  );
}