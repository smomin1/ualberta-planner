# UAlberta Course Planner

A full-stack AI-powered academic planning tool for University of Alberta students. Built with React, TypeScript, Node.js, and the Groq AI API.

**Live Demo:** [ualberta-planner.vercel.app](https://ualberta-planner.vercel.app)

---

## Overview

UAlberta Course Planner helps students plan their academic path by tracking degree requirements, checking course eligibility, detecting schedule conflicts, and providing AI-generated course recommendations tailored to their career goals.

The application supports both the Computing Science BSc program (pre-built template) and any custom degree program, making it extensible beyond a single faculty.

---

## Features

### Degree Planning
- Pre-built Computing Science BSc template with accurate course requirements
- Custom program builder supporting four requirement types: required courses, pick-N-from-list, maximum units at level, and maximum units from a department
- Real-time degree progress tracking with per-category breakdowns

### Course Intelligence
- Prerequisite and corequisite validation against a database of UAlberta courses extracted from the 2019–2020 course catalogue
- Schedule conflict detection using time-slot overlap analysis
- Course search with live filtering

### AI Advisor
- Personalized course recommendations powered by the Groq API (Llama 3.3 70B)
- Career-track aware: recommendations adapt based on the student's selected career goal
- Dynamic career track generation: for custom programs, Groq generates relevant career tracks based on the program name rather than showing CS-specific options

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| Backend | Node.js, Express, TypeScript |
| AI | Groq API (Llama 3.3 70B) |
| Deployment | Vercel (frontend), Railway (backend) |
| Data | UAlberta 2019–2020 Course Catalogue (PDF → JSON) |

---

## Architecture

```
client/                         # React + TypeScript frontend
├── src/
│   ├── components/
│   │   ├── Onboarding.tsx      # 3-step setup flow
│   │   ├── Planner.tsx         # Main layout, state management
│   │   ├── CompletedPanel.tsx  # Degree progress visualization
│   │   ├── SemesterPanel.tsx   # Course search + eligibility
│   │   ├── AIAdvisorPanel.tsx  # AI recommendations panel
│   │   └── RequirementsBuilder.tsx  # Custom degree builder
│   └── types/index.ts          # Shared TypeScript interfaces

server/                         # Node.js + Express backend
├── data/
│   └── courses.json            # UAlberta course database
├── logic/
│   ├── prerequisiteChecker.ts  # Prereq/coreq validation
│   ├── conflictDetector.ts     # Schedule conflict detection
│   └── degreeTracker.ts        # Degree progress calculation
└── routes/
    └── planner.ts              # REST API endpoints
```

### Key Design Decisions

**Separation of concerns**: All business logic lives in framework-agnostic TypeScript modules under `server/logic/`. These have no Express dependencies and can be tested or reused independently.

**User-defined requirements**: Degree requirements are passed as parameters throughout the system rather than hardcoded. This allows the app to support any program, not just Computing Science.

**Extensible requirement types**: The requirement system supports four types today (`required`, `pick_n`, `max_level`, `max_department`) and is designed to be extended with additional constraint types.

---

## API Endpoints

```
POST /api/analyze
  Body: { selectedCourses, completedCourses, degreeRequirements }
  Returns: { eligibility, conflicts, degreeProgress }

POST /api/recommend
  Body: { completedCourses, degreeProgress, careerTrack, degreeRequirements }
  Returns: { recommendation }

POST /api/career-tracks
  Body: { programName }
  Returns: { tracks }

GET /api/health
  Returns: { status, message }
```

---

## Local Development

### Prerequisites
- Node.js 18+
- A [Groq API key](https://console.groq.com) 

### Setup

```bash
# Clone the repository
git clone https://github.com/smomin1/ualberta-planner.git
cd ualberta-planner

# Install backend dependencies
cd server
npm install

# Create environment file
echo "GROQ_API_KEY=your_key_here" > .env
echo "PORT=3001" >> .env

# Start the backend
npx ts-node index.ts

# In a new terminal, install and start the frontend
cd ../client
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## Course Data

Course data was extracted from the [University of Alberta 2019–2020 Academic Calendar](https://www.ualberta.ca/en/registrar/media-library/pdfcal/19-20calendarpdf/course-listings.pdf) using a custom Python script (`extract_courses.py`) built with `pdfplumber`. The script parses course codes, names, units, prerequisites, corequisites, terms offered, and descriptions from the PDF catalogue.

To regenerate the course data from a new catalogue PDF:

```bash
pip install pdfplumber
python extract_courses.py   # Place your PDF as course-listings.pdf
cp courses.json server/data/courses.json
```

---

## Deployment

The application is deployed across two platforms:

- **Frontend**: Vercel, auto-deploys on push to `main`. Root directory set to `client`.
- **Backend**: Railway, auto-deploys on push to `main`. Root directory set to `server`.

Environment variables (`GROQ_API_KEY`, `PORT`) are configured in the Railway dashboard.

---

## Future Improvements

- Scrape live course data from Bear Tracks for up-to-date availability and time slots
- GPA tracking and GPA-based prerequisite enforcement
- Multi-semester planning view
- Export degree plan as PDF
- Support for additional UAlberta program templates (Engineering, Business, Science)

---

## Disclaimer

This project is an independent application and is not affiliated with or endorsed by the University of Alberta. Course data is sourced from the publicly available 2019–2020 UAlberta Academic Calendar.
