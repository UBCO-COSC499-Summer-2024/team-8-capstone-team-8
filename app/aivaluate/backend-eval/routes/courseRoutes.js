const express = require('express');
const router = express.Router();
const { pool } = require('../dbConfig'); 

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/eval-api/login');
}

// Create a course
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

// Get all courses
router.get('/courses', async (req, res) => {
    try {
        const courses = await pool.query('SELECT * FROM "Course"');
        res.status(200).send(courses.rows);
    } catch (error) {
        console.error('Error fetching courses:', error);
        res.status(500).send({ message: 'Error fetching courses' });
    }
});

// Get all archived courses
router.get('/courses/archived', async (req, res) => {
    try {
        const courses = await pool.query('SELECT * FROM "Course" WHERE "isArchived" = TRUE');
        res.status(200).send(courses.rows);
    } catch (error) {
        console.error('Error fetching courses:', error);
        res.status(500).send({ message: 'Error fetching courses' });
    }
});

// Get all active courses
router.get('/courses/active', async (req, res) => {
    try {
        const courses = await pool.query('SELECT * FROM "Course" WHERE "isArchived" = FALSE');
        res.status(200).send(courses.rows);
    } catch (error) {
        console.error('Error fetching courses:', error);
        res.status(500).send({ message: 'Error fetching courses' });
    }
});

router.get('/enrolled-courses', checkAuthenticated, (req, res) => {
    const instructorId = req.user.instructorId;
    console.log('instructor ID:', instructorId);

    pool.query(
        `SELECT "Course"."courseId", "Course"."courseCode", "Course"."courseName" 
         FROM "Teaches" 
         JOIN "Course" ON "Teaches"."courseId" = "Course"."courseId" 
         WHERE "Teaches"."instructorId" = $1`,
        [instructorId],
        (err, results) => {
            if (err) {
                console.error('Error executing query:', err);
                return res.status(500).json({ error: 'Database error' });
            }
            console.log('Courses:', results.rows);
            res.json(results.rows);
        }
    );
});

// Get a single course by ID
router.get('/courses/:id', async (req, res) => {
    const courseId = req.params.id;

    try {
        const course = await pool.query('SELECT * FROM "Course" WHERE "courseId" = $1', [courseId]);

        if (course.rowCount > 0) {
            res.status(200).send(course.rows[0]);
        } else {
            res.status(404).send({ message: 'Course not found' });
        }
    } catch (error) {
        console.error('Error fetching course:', error);
        res.status(500).send({ message: 'Error fetching course' });
    }
});
// Delete a course
router.delete('/courses/:id', async (req, res) => {
    const courseId = req.params.id;

    try {
        const result = await pool.query('DELETE FROM "Course" WHERE "courseId" = $1', [courseId]);

        if (result.rowCount > 0) {
            res.status(200).send({ message: 'Course deleted successfully' });
        } else {
            res.status(404).send({ message: 'Course not found' });
        }
    } catch (error) {
        console.error('Error deleting course:', error);
        res.status(500).send({ message: 'Error deleting course' });
    }
});

// Update a course
router.put('/courses/:id', async (req, res) => {
    const courseId = req.params.id;
    const { courseName, courseCode, maxStudents } = req.body;

    try {
        const result = await pool.query(
            'UPDATE "Course" SET "courseName" = $1, "courseCode" = $2, "maxStudents" = $3 WHERE "courseId" = $4',
            [courseName, courseCode, maxStudents, courseId]
        );

        if (result.rowCount > 0) {
            res.status(200).send({ message: 'Course updated successfully' });
        } else {
            res.status(404).send({ message: 'Course not found' });
        }
    } catch (error) {
        console.error('Error updating course:', error);
        res.status(500).send({ message: 'Error updating course' });
    }
});

// Create a course
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


// Get a single course by ID
router.get('/courses/:courseId', async (req, res) => {
    const courseId = parseInt(req.params.courseId, 10);

    try {
        const course = await pool.query('SELECT * FROM "Course" WHERE "courseId" = $1', [courseId]);

        if (course.rowCount > 0) {
            res.status(200).send(course.rows[0]);
        } else {
            res.status(404).send({ message: 'Course not found' });
        }
    } catch (error) {
        console.error('Error fetching course:', error);
        res.status(500).send({ message: 'Error fetching course' });
    }
});

// Fetch all submissions for a course
router.get('/courses/:courseId/submissions', async (req, res) => {
    const courseId = parseInt(req.params.courseId, 10);

    if (!courseId) {
        return res.status(400).json({ message: 'Invalid course ID' });
    }

    try {
        const query = `
            SELECT 
                "AssignmentSubmission"."assignmentSubmissionId",
                "AssignmentSubmission"."studentId",
                "Student"."firstName",
                "Student"."lastName",
                "Assignment"."assignmentKey",
                "Assignment"."assignmentId",
                "AssignmentSubmission"."isGraded",
                "AssignmentSubmission"."submissionFile"
            FROM "AssignmentSubmission"
            JOIN "Assignment" ON "AssignmentSubmission"."assignmentId" = "Assignment"."assignmentId"
            JOIN "Student" ON "AssignmentSubmission"."studentId" = "Student"."studentId"
            WHERE "AssignmentSubmission"."courseId" = $1
        `;
        const result = await pool.query(query, [courseId]);
        console.log(result.rows);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'No submissions found for this course' });
        }

        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching submissions:', error);
        res.status(500).json({ message: 'Error fetching submissions' });
    }
});

// Fetch course details for an instructor
router.get('/instructors/:instructorId/courses', async (req, res) => {
    const instructorId = parseInt(req.params.instructorId, 10);

    try {
        const result = await pool.query(
            `SELECT "Course"."courseId", "Course"."courseName", "Course"."courseCode"
             FROM "Teaches"
             JOIN "Course" ON "Teaches"."courseId" = "Course"."courseId"
             WHERE "Teaches"."instructorId" = $1`,
            [instructorId]
        );
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching courses:', error);
        res.status(500).json({ message: 'Error fetching courses' });
    }
});

// Archive a course
router.put('/courses/:courseId/archive', async (req, res) => {
    const courseId = parseInt(req.params.courseId, 10);

    try {
        const result = await pool.query('UPDATE "Course" SET "isArchived" = TRUE WHERE "courseId" = $1', [courseId]);

        if (result.rowCount > 0) {
            res.status(200).json({ message: 'Course archived successfully' });
        } else {
            res.status(404).json({ message: 'Course not found' });
        }
    } catch (error) {
        console.error('Error archiving course:', error);
        res.status(500).json({ message: 'Error archiving course' });
    }
});

// Unarchive a course
router.put('/courses/:courseId/unarchive', async (req, res) => {
    const courseId = parseInt(req.params.courseId, 10);

    try {
        const result = await pool.query('UPDATE "Course" SET "isArchived" = FALSE WHERE "courseId" = $1', [courseId]);

        if (result.rowCount > 0) {
            res.status(200).json({ message: 'Course unarchived successfully' });
        } else {
            res.status(404).json({ message: 'Course not found' });
        }
    } catch (error) {
        console.error('Error unarchiving course:', error);
        res.status(500).json({ message: 'Error unarchiving course' });
    }
});

// Determine if a course is archived
router.get('/courses/:courseId/is-archived', async (req, res) => {
    const courseId = parseInt(req.params.courseId, 10);

    try {
        const result = await pool.query('SELECT "isArchived" FROM "Course" WHERE "courseId" = $1', [courseId]);

        if (result.rowCount > 0) {
            res.status(200).json({ isArchived: result.rows[0].isArchived });
        } else {
            res.status(404).json({ message: 'Course not found' });
        }
    } catch (error) {
        console.error('Error fetching course:', error);
        res.status(500).json({ message: 'Error fetching course' });
    }
});

module.exports = router;