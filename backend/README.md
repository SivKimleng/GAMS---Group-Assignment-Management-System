# GAMS Backend

Node.js, Express, MySQL, JWT, bcrypt, and Swagger backend for the Group Assignment Management System.

## Install

```bash
cd backend
npm install
```

## Configure

Create `backend/.env` from `backend/.env.example`:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=GAMS
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=1d
CLIENT_URL=http://localhost:5173
```

Do not commit the real `.env`.

## Database

Run these files in MySQL from the project root:

```sql
SOURCE database/schemas/schema.sql;
SOURCE database/Data_insertion/insert_data.sql;
SOURCE database/indexes.sql;
```

The seed users all use this demo password:

```text
Password123!
```

## Run

```bash
cd backend
npm run dev
```

Backend URL: `http://localhost:5000`

Swagger UI: `http://localhost:5000/api-docs`

## Example Auth

Register:

```json
{
  "first_name": "Demo",
  "last_name": "Student",
  "email": "demo.student@gams.edu",
  "password": "Password123!",
  "role": "Student"
}
```

Login:

```json
{
  "email": "demo.student@gams.edu",
  "password": "Password123!"
}
```

Use the login response `data.token` as a Bearer token:

```http
Authorization: Bearer token_here
```

Example protected request:

```bash
curl -H "Authorization: Bearer token_here" http://localhost:5000/api/auth/me
```

## Main Routes

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/users`
- `GET /api/users/:id`
- `PUT /api/users/:id`
- `DELETE /api/users/:id`
- `POST /api/groupworks`
- `GET /api/groupworks`
- `GET /api/groupworks/:id`
- `PUT /api/groupworks/:id`
- `DELETE /api/groupworks/:id`
- `POST /api/groupworks/:id/join`
- `GET /api/groupworks/:id/members`
- `POST /api/assignments`
- `GET /api/assignments`
- `GET /api/assignments/:id`
- `PUT /api/assignments/:id`
- `DELETE /api/assignments/:id`
- `GET /api/groupworks/:groupworkId/assignments`
- `POST /api/tasks`
- `GET /api/tasks`
- `GET /api/tasks/:id`
- `PUT /api/tasks/:id`
- `PATCH /api/tasks/:id/status`
- `DELETE /api/tasks/:id`
- `GET /api/assignments/:assignmentId/tasks`
- `GET /api/assignments/:assignmentId/progress`
- `GET /api/progress/assignments/:assignmentId`

## Response Shape

Success:

```json
{
  "success": true,
  "message": "Request successful",
  "data": {}
}
```

Error:

```json
{
  "success": false,
  "message": "Error message here"
}
```
