import { useState } from 'react';
import Onboarding from './components/Onboarding';
import Planner from './components/Planner';
import type { DegreeRequirements, CareerTrack } from './types';

function App() {
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [requirements, setRequirements] = useState<DegreeRequirements | null>(null);
  const [completedCourses, setCompletedCourses] = useState<string[]>([]);
  const [careerTrack, setCareerTrack] = useState<CareerTrack>('Not sure yet');

  const handleOnboardingComplete = (
    req: DegreeRequirements,
    courses: string[],
    track: CareerTrack
  ) => {
    setRequirements(req);
    setCompletedCourses(courses);
    setCareerTrack(track);
    setOnboardingComplete(true);
  };

  if (!onboardingComplete || !requirements) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <Planner
      completedCourses={completedCourses}
      requirements={requirements}
      careerTrack={careerTrack}
    />
  );
}

export default App;