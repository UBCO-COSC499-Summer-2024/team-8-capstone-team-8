const express = require('express');
const router = express.Router();
const { pool } = require('../dbConfig');
const bcrypt = require('bcryptjs');

// Check if authenticated middleware
function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/eval-api/login');
}

// Get all evaluators
router.get('/evaluators', checkAuthenticated, async (req, res) => {
    try {
        const result = await pool.query('SELECT "instructorId", "firstName", "lastName", "hasFullAccess" FROM "Instructor"');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching evaluators:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

// Get evaluator details
router.get('/evaluator/:instructorId', checkAuthenticated, async (req, res) => {
    const { instructorId } = req.params;
    try {
        const result = await pool.query('SELECT * FROM "Instructor" WHERE "instructorId" = $1', [instructorId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Evaluator not found' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching evaluator details:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

// Get courses by evaluator
router.get('/evaluator/:instructorId/courses', checkAuthenticated, async (req, res) => {
    const { instructorId } = req.params;
    try {
        const result = await pool.query('SELECT "courseId", "courseCode", "courseName" FROM "Course" WHERE "instructorId" = $1', [instructorId]);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching courses:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

// Register a new evaluator
router.post('/evaluator', checkAuthenticated, async (req, res) => {
    const { firstName, lastName, email, password, department, hasFullAccess } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query(
            'INSERT INTO "Instructor" ("firstName", "lastName", "email", "userPassword", "department", "hasFullAccess") VALUES ($1, $2, $3, $4, $5, $6)',
            [firstName, lastName, email, hashedPassword, department, hasFullAccess]
        );
        res.status(201).json({ message: 'Evaluator registered successfully' });
    } catch (error) {
        console.error('Error registering evaluator:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

// Delete evaluator
router.delete('/evaluator/:instructorId', checkAuthenticated, async (req, res) => {
    const { instructorId } = req.params;
    try {
        await pool.query('DELETE FROM "Instructor" WHERE "instructorId" = $1', [instructorId]);
        res.status(200).json({ message: 'Evaluator deleted successfully' });
    } catch (error) {
        console.error('Error deleting evaluator:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

// Remove course from evaluator
router.delete('/evaluator/:instructorId/course/:courseId', checkAuthenticated, async (req, res) => {
    const { instructorId, courseId } = req.params;
    try {
        await pool.query('UPDATE "Course" SET "instructorId" = NULL WHERE "courseId" = $1 AND "instructorId" = $2', [courseId, instructorId]);
        res.status(200).json({ message: 'Course removed from evaluator successfully' });
    } catch (error) {
        console.error('Error removing course from evaluator:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

router.get('/me', checkAuthenticated, async (req, res) => {
    const instructorId = req.user.instructorId;
    try {
        const result = await pool.query('SELECT * FROM "Instructor" WHERE "instructorId" = $1', [instructorId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Evaluator not found' });
        }
        res.json({ instructorId: result.rows[0].instructorId });
    } catch (error) {
        console.error('Error fetching evaluator details:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

module.exports = router;
