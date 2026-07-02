import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const [users] = await pool.query(
      `SELECT user_id, first_name, last_name, email, role, created_at, updated_at
       FROM users
       ORDER BY user_id`
    );

    res.json(users);
  } catch (error) {
    console.error('GET /api/users failed:', error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

export default router;
