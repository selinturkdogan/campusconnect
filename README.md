# CampusConnect — Frontend

Academic social platform for university students.

## Setup

```bash
npm install
npm run dev
```

## Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── Avatar.tsx       # User avatar with initials fallback
│   │   ├── Button.tsx       # Button variants: primary, secondary, outline, ghost
│   │   ├── Card.tsx         # Card container
│   │   ├── Layout.tsx       # Root layout (Navbar + Sidebar + Outlet)
│   │   ├── Navbar.tsx       # Top navbar with search and notifications
│   │   ├── Sidebar.tsx      # Left sidebar navigation
│   │   └── Tag.tsx          # Tag/badge component
│   ├── pages/
│   │   ├── Dashboard.tsx    # Home feed, stats, suggested projects
│   │   ├── Profile.tsx      # User profile with AI insights
│   │   ├── Clubs.tsx        # Club discovery and listing
│   │   ├── ClubDetail.tsx   # Single club page with events & members
│   │   ├── Events.tsx       # Event calendar and listing
│   │   ├── Projects.tsx     # Project listing with apply flow
│   │   ├── StudyGroups.tsx  # Study groups with realtime chat UI
│   │   └── Notifications.tsx # Notification center
│   └── routes.ts            # React Router v7 routes
├── lib/
│   └── utils.ts             # cn() helper for Tailwind
└── styles/
    └── index.css            # Tailwind v4 + CSS variables (design tokens)
```

## Tech Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS v4
- React Router v7
- Lucide React (icons)
- react-hook-form

## Design Tokens

Primary color: `#dc2626` (red)
Background: `#fafafa`
Card: `#ffffff`
Border: `#e2e8f0`

All tokens are in `src/styles/index.css` as CSS variables.

## Next Steps

1. Connect Supabase Auth (replace mock user)
2. Replace static data with React Query + Supabase API calls
3. Add FastAPI backend endpoints
4. Implement Supabase Realtime for chat
