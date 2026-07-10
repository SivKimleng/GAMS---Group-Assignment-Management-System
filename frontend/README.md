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

- Dashboard, workspace, leader, and timeline pages load data from the backend API.
- Login and sign up call the backend auth routes and store the JWT locally.
- Set `VITE_API_URL` in `.env` when the backend is not running at `http://127.0.0.1:5000/api`.
- `npm run dev` starts the Vite frontend on `http://127.0.0.1:5173/`.
