# GAMS Frontend

React frontend for the Group Assignment Management System.

## Pages

- Landing Page: `/`
- Login Page: `/login`
- Sign Up Page: `/signup`
- Dashboard Page: `/dashboard`
- Workspace Page: `/workspace`
- Group Leader Panel: `/leader`
- Timeline Page: `/timeline`

## Tech Stack

- React
- Vite
- Tailwind CSS
- React Router DOM

## Source Structure

- `src/assets/images`: image assets used by pages.
- `src/assets/icons`: future icon assets.
- `src/components/ui`: reusable UI pieces.
- `src/components/layouts`: shared navigation and layout components.
- `src/components/<feature>`: feature-specific components.
- `src/pages/<feature>`: route-level pages grouped by feature.
- `src/routes`: app route definitions.
- `src/data`, `src/utils`, `src/services`, `src/hooks`, `src/contexts`: app data, helpers, API service space, reusable hooks, and shared state.

## Run Locally

```bash
npm install
npm run dev
```

Open:

```text
http://127.0.0.1:5173/
```

If Vite says port `5173` is in use, open the new local URL it prints in the terminal.

## Notes

- This frontend uses mock data only.
- There is no backend connection.
- There is no database connection.
- Login and sign up validation use React state only.
- `npm run dev` builds the frontend first and serves the built preview to avoid local Vite dependency optimizer issues on this Windows/OneDrive path.
