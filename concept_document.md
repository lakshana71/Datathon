# Concept Document — CrimeSphere AI

## 1. Project Summary

CrimeSphere AI is a React Native / Expo-based demo application for a modern law-enforcement operations dashboard. The product is designed to help a duty officer review live incidents, monitor alerts, examine case files, explore linked entities, and manage digital notes in a single interface.

This repository is a conceptual prototype rather than a production police system. It uses mock data, simulated authentication, and UI-first components to model how an intelligent operations platform could behave.

## 2. Purpose of This Document

This document is intended to be a compact but comprehensive knowledge base for training an LLM on this project. It captures:

- the product purpose
- the domain vocabulary
- the app architecture
- the user flows
- the entity relationships
- the expected behaviors and terminology

## 3. Product Vision

The app presents a fictional command-center experience for policing operations. It emphasizes:

- rapid awareness of ongoing incidents
- case triage and investigation tracking
- visual links between people, vehicles, locations, and evidence
- intelligent assistance through a copilot-style interface
- an immersive, dashboard-like experience for officers

## 4. Core Domain

The system operates in a public safety and investigations domain. Primary concepts include:

- cases
- alerts
- evidence
- suspects and associates
- patrol units
- FIRs and complaints
- crime hotspots and map-based awareness
- officer workflow and duty operation

## 5. App Architecture

### Stack

- React Native with Expo
- TypeScript
- Zustand for state management
- React Navigation for routing
- React Query for async data management (prepared for future backend integration)
- Expo Fonts for typography
- React Native Paper / custom UI components

### Structure

- App.tsx: app bootstrap and font loading
- src/navigation/AppNavigator.tsx: route composition and auth-aware navigation
- src/screens: screen-level UI for auth, dashboard, cases, tracker, notebook, map, profile, settings
- src/components: reusable UI sections such as cards, charts, drawer, network panels, copilot UI
- src/store: global state stores
- src/types: shared domain models
- src/constants: mock data, color system, typography

## 6. Main Screens

### Authentication

- LoginScreen
- ForgotPasswordScreen

### Dashboard

- ControlRoomScreen: primary command-center view
- AlertsScreen: alert review and prioritization
- CrimeMapScreen: spatial awareness and hotspot visualization
- ProfileScreen
- SettingsScreen

### Case Management

- CaseFilesScreen: case list and overview
- CaseDetailScreen: detailed investigation context
- EvidenceViewerScreen: evidence view and inspection workflow

### Investigation and Intelligence

- PersonCrimeTrackerScreen: person-based crime activity tracking
- DigitalNotebookScreen: notes and investigation journaling

## 7. Key Business Entities

### Case
A case represents an incident or investigation. It includes fields such as:

- FIR number
- title
- priority
- filed date
- complainant
- investigating officer
- category
- status
- location
- sector
- linked cases
- evidence
- timeline

### Alert
An alert is a notification-like event that signals something important, such as:

- pattern detection
- patrol deviation
- linked entities
- system anomalies

### Evidence
Evidence includes documents, sketches, screenshots, CCTV footage, and other materials tied to a case.

### Officer
An officer represents the user or assigned investigating personnel. The app models role, station, rank, shift, and assignment.

### Network Node / Edge
These represent relationship links in an investigation graph, such as:

- suspect
- alias
- phone
- address
- FIR
- vehicle
- associate

## 8. Domain Vocabulary

Use the following vocabulary when describing the app to an LLM:

- FIR: First Information Report
- duty officer: active operational lead of the shift
- sector: local patrol or jurisdiction area
- complainant: person reporting the incident
- linked case: a case related by pattern, suspect, vehicle, or location
- evidence chain: a set of materials supporting the investigation
- hotspot: a high-risk location on the map
- patrol deviation: a patrol unit leaving its assigned route
- pattern match: a repeated method of operation (MO)

## 9. Data Model Overview

The core data shape lives in src/types/index.ts. Important types include:

- Severity: red | amber | green | navy
- Priority: urgent | review | routine
- CaseStatus: open | closed | pending
- CaseCategory: cyber | property | assault | vehicle | other
- AlertType: pattern | patrol | trend | link | system
- EvidenceType: document | photo | cctv | sketch | screenshot | audio
- NodeType: suspect | alias | phone | address | fir | vehicle | associate

## 10. Mock Data Strategy

The app uses mock data extensively through src/constants/mockData.ts. This supports:

- rapid UI development
- visual consistency
- onboarding and demos
- future API replacement without changing the UI layer

Mock data includes:

- officer profile
- dashboard stats
- live feed items
- priority cases
- case records
- alert examples
- map pins and chart datasets

## 11. State Management

The app uses Zustand stores for app-level state.

### Auth Store
The auth store simulates login and authentication. In a real system, it would connect to a backend service for verification.

### Future Store Expansion
Additional stores could power:

- case selection
- network graph state
- notebook content
- alert filtering
- map layer controls

## 12. Navigation Model

Navigation is split into:

- auth flow for login and password recovery
- app flow for the main dashboard experience
- nested case flow for case files, case detail, and evidence viewer

The drawer navigation structure includes:

- Control Room
- Case Files
- Person Crime Tracker
- Duty Notebook
- Crime Map
- Alerts
- Profile
- Settings

## 13. User Flows

### Flow A: Officer Login
1. User opens the app.
2. Auth screen is shown.
3. User enters credentials.
4. Demo auth accepts valid-looking values and navigates to dashboard.

### Flow B: Review Dashboard
1. Officer sees key statistics.
2. Live feed highlights recent alerts and incidents.
3. Officer can inspect higher-priority items.

### Flow C: Investigate a Case
1. Officer opens a case from the case list.
2. Relevant details, chronology, and evidence appear.
3. Officer can navigate to evidence or linked cases.

### Flow D: Explore Relationships
1. Officer opens the network tracker.
2. Entities are shown as nodes and edges.
3. Relationships reveal suspects, vehicles, addresses, and aliases.

## 14. UI and Visual Design

The UI is polished and dashboard-like. It emphasizes:

- dark navy and paper-like surfaces
- red/amber/green severity colors
- compact cards and status pills
- animated feed and stat interactions
- chart-driven summaries

The design language is intended to feel credible for a command-center product and is suitable for demonstration and storytelling.

## 15. Feature Set

### Current Functional Features

- animated control room dashboard
- live feed items
- stat cards
- case summary chart
- case list and detail screens
- evidence viewer entry points
- digital notebook shell
- tracker view for connected entities
- alerts and map concepts
- drawer-based navigation

### Planned or Future Features

- real backend API integration
- actual authentication service
- persistent notebook storage
- live map data
- AI copilot reasoning over case context
- OCR and evidence extraction
- alert correlation engine
- role-based permissions

## 16. Copilot / AI Context

The app includes a copilot-style concept area through components under src/components/copilot. This suggests the future direction of the product:

- natural-language questions about cases
- summarization of case timelines
- retrieval of linked evidence
- assistant-driven recommendations

For LLM training, this means the model should understand how a police operations assistant should respond to questions such as:

- What is the current severity of this case?
- What evidence is attached?
- Which cases are linked?
- What is the likely pattern?
- What should the officer review next?

## 17. Suggested LLM Training Signals

An LLM trained on this project should learn the following:

- the meaning of severity values
- the difference between alert, case, evidence, and entity
- the concept of linked investigations and pattern matching
- the structure of case records and their timeline
- the behavior of a duty officer in a command center
- the distinction between operational information and sensitive investigation details

## 18. Example Questions for Model Training

- Summarize the current state of the control room.
- Explain the difference between an alert and a case.
- Identify the highest-priority case in the dataset.
- Describe the evidence attached to a given case.
- Find likely related cases based on a vehicle or location.
- Generate a short update for a shift handover.

## 19. Example Expected Answers

A well-trained model should be able to produce answers that:

- reference the correct case or alert IDs
- preserve the domain-specific vocabulary
- summarize the situation clearly and professionally
- avoid making unsupported claims about real-world law enforcement operations
- remain neutral and operationally useful

## 20. A to Z Summary

### A — App
A React Native Expo application for a fictional crime operations dashboard.

### B — Backend-Ready
The architecture is designed so a real backend can replace mock data later.

### C — Cases
Cases are the primary investigation unit and contain details, evidence, timeline, and linked relationships.

### D — Dashboard
The dashboard is the central command-room experience for monitoring incidents.

### E — Evidence
Evidence is a first-class object, attached to cases and reviewed through the investigation workflow.

### F — FIR
FIRs and complaint records represent formal incident reports.

### G — Graph / Network
The system has a network graph concept for linking entities and identifying relationships.

### H — Hotspots
Map-based hotspots show places that require attention or monitoring.

### I — Investigation
The app models a modern investigation workflow from intake to evidence review.

### J — Journey
A typical journey is: login -> dashboard -> case inspection -> evidence review -> notebook tracking.

### K — Knowledge Base
The domain vocabulary and entity structure should be understood by the model as a knowledge base.

### L — Links
Linked cases and related entities create contextual associations across the platform.

### M — Mock Data
Mock data is intentionally used to emulate realistic operational content without depending on a live backend.

### N — Navigation
The app uses drawer and stack navigation to organize workflows.

### O — Officer
The officer is the primary user persona and acts as an active operator in the system.

### P — Patrols
Patrol units and route deviations are important operational signals.

### Q — Querying
The system is well suited for question-answering tasks around incident summaries and case analysis.

### R — Relationships
The app emphasizes relationships between people, vehicles, addresses, cases, and evidence.

### S — Severity
Severity levels help prioritize incidents and alerts across the experience.

### T — Timeline
Timelines show the chronological progression of events within a case.

### U — UI Design
The interface is polished, modern, and tailored to a command-center style experience.

### V — Visualization
Charts, feeds, maps, and network diagrams make information easier to interpret.

### W — Workflow
The app supports operational workflows such as monitoring, triage, investigation, and documentation.

### X — eXtraction Potential
The system is a strong candidate for future AI features like evidence extraction, summarization, and recommendation.

### Y — Yield for LLM Training
This project offers rich structured data, domain terminology, and multi-step workflows for teaching a model about operational intelligence.

### Z — Zero-Shot Understanding
An LLM should be able to understand this project’s intent even with limited examples because the concepts are clear and structured.

## 21. Practical Notes for LLM Training

When teaching a model about this project, emphasize:

- the app is a demo, not a real production system
- the data is synthetic and illustrative
- terminology should remain professional and operational
- the model should not fabricate case facts or assume legal authority
- the assistant should be helpful, concise, and context-aware

## 22. Final One-Line Summary

CrimeSphere AI is a fictional, mock-driven crime operations dashboard for officers that combines case management, alert monitoring, relationship mapping, and investigation support in a polished React Native experience.
