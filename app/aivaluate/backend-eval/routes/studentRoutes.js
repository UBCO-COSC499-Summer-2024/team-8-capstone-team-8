const express = require('express');
const router = express.Router();
const { pool } = require('../dbConfig');
require('dotenv').config();

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/eval-api/login');
}

router.get('/students/show/:courseId', checkAuthenticated, async (req, res) => {
    const { courseId } = req.params;
    console.log('Received courseId:', courseId);

    try {
        console.log('Received courseId:', courseId);

        const query = `
            SELECT s."firstName", s."lastName"
            FROM "Student" s
            JOIN "EnrolledIn" e ON s."studentId" = e."studentId"
            WHERE e."courseId" = $1
        `;
        const result = await pool.query(query, [courseId]);

        console.log('Query result:', result.rows);

        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching students:', err);
        res.status(500).json({ error: 'Database error' }); 
    }
});

module.exports = router;
