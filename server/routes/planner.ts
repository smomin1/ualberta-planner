import { Router } from 'express';
import { checkMultipleCourses } from '../logic/prerequisiteChecker';
import { detectConflicts, CourseWithTime } from '../logic/conflictDetector';
import { getDegreeProgress, DegreeRequirements } from '../logic/degreeTracker';
import courses from '../data/courses.json';

const router = Router();

// Analyze endpoint — prereqs, conflicts, degree progress
router.post('/analyze', (req, res) => {
  const { completedCourses, selectedCourses, degreeRequirements } = req.body;

  if (!completedCourses || !selectedCourses || !degreeRequirements) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const eligibility = checkMultipleCourses(
    selectedCourses.map((c: CourseWithTime) => c.code),
    completedCourses,
    courses as any
  );

  const conflicts = detectConflicts(selectedCourses);

  const degreeProgress = getDegreeProgress(
    completedCourses,
    courses as any,
    degreeRequirements as DegreeRequirements
  );

  res.json({ eligibility, conflicts, degreeProgress });
});

// AI recommend endpoint
router.post('/recommend', async (req, res) => {
  const { completedCourses, degreeProgress, careerTrack, degreeRequirements } = req.body;

  if (!completedCourses || !degreeProgress || !careerTrack) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const Groq = require('groq-sdk');
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 1024,
      messages: [
        {
          role: 'system',
          content: `You are a helpful academic advisor at the University of Alberta. 
You give concise, practical course recommendations based on a student's degree progress and career goals.
Always format your response with clear sections using emojis as headers.`
        },
        {
          role: 'user',
          content: `Program: ${degreeRequirements?.programName || 'Computing Science'}

Completed courses: ${completedCourses.join(', ') || 'None yet'}

Degree progress:
- Overall: ${degreeProgress.overallPercent}% complete (${degreeProgress.totalUnitsCompleted}/${degreeProgress.totalUnitsRequired} units)
- Missing required courses: ${degreeProgress.missingRequiredCourses.join(', ') || 'None'}
- Unfulfilled categories: ${degreeProgress.categories.filter((c: any) => !c.fulfilled).map((c: any) => c.label).join(', ') || 'None'}

Career goal: ${careerTrack}

Please provide:
1. 3-5 specific course recommendations for next semester with a reason for each
2. Any critical gaps or bottlenecks in their plan
3. A suggested 2-semester path toward their career goal

Keep it concise and student-friendly.`
        }
      ]
    });

    const recommendation = completion.choices[0]?.message?.content || 'No recommendation available';
    res.json({ recommendation });

  } catch (error: any) {
    console.error('AI recommend error:', error);
    res.status(500).json({
      error: 'AI recommendation failed',
      fallback: 'Unable to generate AI recommendations right now. Please try again.'
    });
  }
});

// Generate career tracks based on program name
router.post('/career-tracks', async (req, res) => {
  const { programName } = req.body;

  if (!programName) {
    return res.status(400).json({ error: 'Program name required' });
  }

  try {
    const Groq = require('groq-sdk');
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 512,
      messages: [
        {
          role: 'system',
          content: `You are a career advisor. When given a university program name, 
you respond ONLY with a valid JSON array of career tracks relevant to that program.
Each item has: "label" (short name), "icon" (single emoji), "description" (one sentence).
Always include "Research & Academia" as the last option.
Return exactly 5 tracks. Return ONLY the JSON array, no other text.`
        },
        {
          role: 'user',
          content: `Generate 5 career tracks for: ${programName}`
        }
      ]
    });

    const text = completion.choices[0]?.message?.content || '[]';
    const clean = text.replace(/```json|```/g, '').trim();
    const tracks = JSON.parse(clean);
    res.json({ tracks });

  } catch (error: any) {
    console.error('Career tracks error:', error);
    // Fallback to generic tracks if AI fails
    res.json({
      tracks: [
        { label: 'Industry Professional', icon: '💼', description: 'Apply your skills in industry' },
        { label: 'Research & Academia', icon: '🔬', description: 'Pursue graduate studies and research' },
        { label: 'Entrepreneurship', icon: '🚀', description: 'Start your own venture' },
        { label: 'Consulting', icon: '📊', description: 'Advise organizations in your field' },
        { label: 'Not sure yet', icon: '🧭', description: 'Explore your options' },
      ]
    });
  }
});

export default router;