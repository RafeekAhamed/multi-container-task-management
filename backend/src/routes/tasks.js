const express = require('express');
const pool = require('../config/database');

const router = express.Router();

const VALID_STATUSES = ['pending', 'in_progress', 'completed'];
const MAX_TITLE_LENGTH = 200;

// Validate request body
const isValidBody = (body) =>
  body !== null &&
  typeof body === 'object' &&
  !Array.isArray(body);

// Validate positive integer task IDs
const isValidId = (id) => /^[1-9]\d*$/.test(id);

// GET /api/tasks - Retrieve all tasks
router.get('/', async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT * FROM tasks ORDER BY created_at DESC'
    );

    res.status(200).json({
      success: true,
      count: result.rowCount,
      data: result.rows,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/tasks/:id - Retrieve a task by ID
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid task ID',
      });
    }

    const result = await pool.query(
      'SELECT * FROM tasks WHERE id = $1',
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/tasks - Create a task
router.post('/', async (req, res, next) => {
  try {
    if (!isValidBody(req.body)) {
      return res.status(400).json({
        success: false,
        message: 'A valid JSON object is required',
      });
    }

    const { title, description = '' } = req.body;

    if (
      typeof title !== 'string' ||
      !title.trim() ||
      title.trim().length > MAX_TITLE_LENGTH
    ) {
      return res.status(400).json({
        success: false,
        message: 'Task title is required and must not exceed 200 characters',
      });
    }

    if (typeof description !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Task description must be a string',
      });
    }

    const result = await pool.query(
      `INSERT INTO tasks (title, description)
       VALUES ($1, $2)
       RETURNING *`,
      [title.trim(), description]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/tasks/:id - Update a task
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid task ID',
      });
    }

    if (!isValidBody(req.body)) {
      return res.status(400).json({
        success: false,
        message: 'A valid JSON object is required',
      });
    }

    const { title, description, status } = req.body;

    if (
      typeof title !== 'string' ||
      !title.trim() ||
      title.trim().length > MAX_TITLE_LENGTH ||
      typeof description !== 'string' ||
      !VALID_STATUSES.includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Valid title, description, and status are required',
      });
    }

    const result = await pool.query(
      `UPDATE tasks
       SET title = $1,
           description = $2,
           status = $3,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING *`,
      [title.trim(), description, status, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/tasks/:id - Delete a task
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid task ID',
      });
    }

    const result = await pool.query(
      'DELETE FROM tasks WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;