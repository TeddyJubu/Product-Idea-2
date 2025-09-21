# PRD — Idea ICE (Idea Management & Validation)

## Problem
Solo founders and small teams lose ideas across tools, struggle to prioritize objectively, and delay validation—wasting cycles on low-signal work.

## Goal
A minimal, calm app that makes it trivial to:
1) Capture ideas,
2) Prioritize via ICE,
3) Validate with lightweight checklists & evidence,
4) Decide (validate or archive) fast.

## Target Users
- Solo founders / solopreneurs
- Internal product teams (≤ 15 users)
- Startup studios / accelerators light usage

## Success Metrics (MVP)
- TTM: < 1 day from first login to first **validated/archived** decision
- 80% users add ≥ 3 ideas in week 1
- 50% of ideas have ≥ 1 validation task completed within 7 days

## Core Use Cases
- Add an idea in under 30 seconds
- Rank by ICE automatically
- Run 2–3 quick validation tasks and log evidence
- Update Confidence based on evidence; see rank change
- Archive low-signal ideas guilt-free

## Features (MVP)
- Workspaces, Auth (magic link), Members
- Ideas: CRUD, tags, status (PENDING → VALIDATING → VALIDATED/ARCHIVED)
- ICE scores (1–10 integers; ICE = (Impact×Confidence)/Effort)
- Validation tasks (INTERVIEW, SMOKE_TEST, MARKET_RESEARCH, PROTOTYPE, OTHER)
- Evidence log (title, summary, URL)
- Comments (thread per idea)
- Search + tag filter
- Import CSV, Export JSON
- Activity log (lightweight)

## Non-Goals (MVP)
- Heavy roadmapping (Gantt/Kanban), SSO, complex roles, third-party integrations

## UX Principles
- Single source of truth; zero bloat
- Shadcn components; clear defaults; keyboard friendly
- Friendly empty states; helpful microcopy; WCAG AA

## IA / Screens
- **Dashboard:** ideas table (Title, Impact, Confidence, Effort, ICE, Status, Updated)
- **New Idea Dialog:** Title, Description, Impact/Confidence/Effort, Tags
- **Idea Detail:** Tabs → Overview, Validation, Evidence, Comments
- **Validation:** checklist with quick add; status changes; confidence nudge option

## Data Model (summary)
User, Workspace, Membership, Idea, Tag, IdeaTag, ValidationTask, Evidence, Comment, Activity

## Release Plan
- v0.1 Scaffold + Auth + Ideas CRUD + ICE
- v0.2 Detail page + Validation + Evidence
- v0.3 Comments + Activity + Import/Export
- v0.4 Search/Tags + Perf/A11y polish → Public beta
