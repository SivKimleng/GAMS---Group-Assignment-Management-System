# GAMS Folder Structure

This project is organized as a full-stack Group Assignment Management System with a React frontend, backend API area, database files, documentation, and shared tests.

```text
Final Cross Project/
|-- frontend/
|   |-- public/
|   |-- scripts/
|   |-- src/
|   |   |-- assets/
|   |   |   |-- icons/
|   |   |   `-- images/
|   |   |-- components/
|   |   |   |-- assignments/
|   |   |   |-- dashboard/
|   |   |   |-- groups/
|   |   |   |-- landing/
|   |   |   |-- layouts/
|   |   |   |-- notifications/
|   |   |   |-- tasks/
|   |   |   |-- timeline/
|   |   |   `-- ui/
|   |   |-- contexts/
|   |   |-- data/
|   |   |-- hooks/
|   |   |-- pages/
|   |   |   |-- assignments/
|   |   |   |-- auth/
|   |   |   |-- dashboard/
|   |   |   |-- groups/
|   |   |   |-- timeline/
|   |   |   |-- workspace/
|   |   |   `-- LandingPage.jsx
|   |   |-- routes/
|   |   |-- services/
|   |   |-- styles/
|   |   |-- utils/
|   |   |-- App.jsx
|   |   `-- main.jsx
|   |-- index.html
|   |-- package.json
|   `-- README.md
|-- backend/
|   `-- src/
|-- database/
|-- docs/
`-- tests/
```

## Frontend Notes

- `assets/images`: project images, including the GAMS hero image.
- `assets/icons`: SVGs or icon images when needed.
- `components/ui`: reusable controls such as buttons, inputs, logos, and headings.
- `components/layouts`: shared layout/navigation components used across pages.
- `components/dashboard`, `components/landing`, and other feature folders: domain-specific components.
- `pages/auth`, `pages/dashboard`, `pages/timeline`, and `pages/workspace`: route-level pages grouped by feature.
- `routes`: React Router route definitions.
- `data`: mock data used by the current frontend.
- `utils`: frontend utility helpers, including mock auth.
- `services`, `hooks`, and `contexts`: reserved for API services, reusable hooks, and shared React state as the app grows.

## Suggested Main Modules

- `auth`: login, registration, password handling, and protected access.
- `users`: student profiles and account information.
- `groups`: create groups, join groups, and manage members.
- `assignments`: assignment records, deadlines, descriptions, and status.
- `tasks`: task assignment, task status, priority, and ownership.
- `notifications`: deadline reminders and task update alerts.
- `timeline`: assignment schedule and progress visualization.
