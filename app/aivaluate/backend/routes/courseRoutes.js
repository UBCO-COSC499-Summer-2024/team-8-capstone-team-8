const express = require('express');
const router = express.Router();
const { pool } = require('../dbConfig'); 

router.post('/courses', async (req, res) => {
    const { courseName, courseCode, maxStudents } = req.body;

    console.log(req.body);

    try {
        const result = await pool.query(
            'INSERT INTO "Course" ("courseName", "courseCode", "maxStudents") VALUES ($1, $2, $3) RETURNING "courseId"',
            [courseName, courseCode, maxStudents]
        );
        res.status(201).send({ courseId: result.rows[0].courseId, message: 'Course created successfully' });
    } catch (error) {
        console.error('Error creating course:', error);
        res.status(500).send({ message: 'Error creating course' });
    }
});

router.get('/courses', async (req, res) => {
    try {
        const courses = await pool.query('SELECT * FROM "Course"');
        res.status(200).send(courses.rows);
    } catch (error) {
        console.error('Error fetching courses:', error);
        res.status(500).send({ message: 'Error fetching courses' });
    }
});

// Drop a course
router.delete('/courses/:courseId', (req, res) => {
    const courseId = req.params.courseId;
    pool.query('DELETE FROM "Course" WHERE "courseId" = $1', [courseId], (err, results) => {
        if (err) {
            console.error('Error dropping course:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.status(204).send();
    });
});

module.exports = router;
