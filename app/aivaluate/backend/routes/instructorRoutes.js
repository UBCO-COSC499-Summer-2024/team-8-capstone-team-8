const express = require('express');
const router = express.Router();
const { pool } = require('../dbConfig'); 

// Get all instructors
router.get('/instructors', async (req, res) => {
    try {
        const courses = await pool.query('SELECT * FROM "Instructor" WHERE "isTA" = FALSE');
        res.status(200).send(courses.rows);
    } catch (error) {
        console.error('Error fetching courses:', error);
        res.status(500).send({ message: 'Error fetching courses' });
    }
});

// Get all TAs
router.get('/tas', async (req, res) => {   
    try {
        const tas = await pool.query('SELECT * FROM "Instructor" WHERE "isTA" = TRUE');
        res.status(200).send(tas.rows);
    } catch (error) {
        console.error('Error fetching TAs:', error);
        res.status(500).send({ message: 'Error fetching TAs' });
    }
});

// Add an instructor or TA to a course
router.post('/teaches', async (req, res) => {
    const { courseId, instructorId } = req.body;
    try {
        await pool.query('INSERT INTO "Teaches" ("courseId", "instructorId") VALUES ($1, $2)', [courseId, instructorId]);
        res.status(201).send({ message: 'Instructor/TA added to course successfully' });
    } catch (error) {
        console.error('Error adding Instructor/TA to course:', error);
        res.status(500).send({ message: 'Error adding Instructor/TA to course' });
    }
});

// Remove an instructor or TA from a course
router.delete('/teaches/:courseId/:instructorId', async (req, res) => {
    const { courseId, instructorId } = req.params;
    try {
        await pool.query('DELETE FROM "Teaches" WHERE "courseId" = $1 AND "instructorId" = $2', [courseId, instructorId]);
        res.status(200).send({ message: 'Instructor/TA removed from course successfully' });
    } catch (error) {
        console.error('Error removing Instructor/TA from course:', error);
        res.status(500).send({ message: 'Error removing Instructor/TA from course' });
    }
});

module.exports = router;