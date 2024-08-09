const express = require('express');
const router = express.Router();
const { pool } = require('../dbConfig'); 

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/stu-api/login');
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

// Get all courses with certain studentID
router.get('/enrolled-courses', checkAuthenticated, (req, res) => {
    const studentId = req.user.studentId; // Access the studentId from the session
    console.log('Student ID:', studentId); // Log student ID to verify

    pool.query(
        `SELECT "Course"."courseId", "Course"."courseCode", "Course"."courseName"
         FROM "EnrolledIn" 
         JOIN "Course" ON "EnrolledIn"."courseId" = "Course"."courseId" 
         WHERE "EnrolledIn"."studentId" = $1`,
        [studentId],
        (err, results) => {
            if (err) {
                console.error('Error executing query:', err);
                return res.status(500).json({ error: 'Database error' });
            }
            console.log('Courses:', results.rows); // Log query results to verify
            res.json(results.rows);
        }
    );
});

// Get all active courses with certain studentID
router.get('/enrolled-courses/active', checkAuthenticated, (req, res) => {
    const studentId = req.user.studentId; // Access the studentId from the session
    console.log('Student ID:', studentId); // Log student ID to verify

    pool.query(
        `SELECT "Course"."courseId", "Course"."courseCode", "Course"."courseName"
         FROM "EnrolledIn" 
         JOIN "Course" ON "EnrolledIn"."courseId" = "Course"."courseId" 
         WHERE "EnrolledIn"."studentId" = $1
         AND "Course"."isArchived" = FALSE`,
        [studentId],
        (err, results) => {
            if (err) {
                console.error('Error executing query:', err);
                return res.status(500).json({ error: 'Database error' });
            }
            console.log('Courses:', results.rows); // Log query results to verify
            res.json(results.rows);
        }
    );
});

//Return all the courses that the current student is not registered in
router.get('/not-enrolled-courses', checkAuthenticated, (req, res) => {
    const studentId = req.user.studentId; // Access the studentId from the session

    pool.query(
        `SELECT "Course"."courseId", "Course"."courseCode", "Course"."courseName", "Course"."maxStudents" 
         FROM "Course"
         LEFT JOIN "EnrolledIn" 
         ON "Course"."courseId" = "EnrolledIn"."courseId" 
         AND "EnrolledIn"."studentId" = $1
         WHERE "EnrolledIn"."studentId" IS NULL`,
        [studentId],
        (err, results) => {
            if (err) {
                console.error('Error executing query:', err);
                return res.status(500).json({ error: 'Database error' });
            }
            res.json(results.rows);
        }
    );
});

//Return all the active courses that the current student is not registered in
router.get('/not-enrolled-courses/active', checkAuthenticated, (req, res) => {
    const studentId = req.user.studentId; // Access the studentId from the session

    pool.query(
        `SELECT "Course"."courseId", "Course"."courseCode", "Course"."courseName", "Course"."maxStudents" 
         FROM "Course"
         LEFT JOIN "EnrolledIn" 
         ON "Course"."courseId" = "EnrolledIn"."courseId" 
         AND "EnrolledIn"."studentId" = $1
         WHERE "EnrolledIn"."studentId" IS NULL 
         AND "Course"."isArchived" = FALSE`,
        [studentId],
        (err, results) => {
            if (err) {
                console.error('Error executing query:', err);
                return res.status(500).json({ error: 'Database error' });
            }
            res.json(results.rows);
        }
    );
});

//Add a student to a course
router.post('/enroll-course', checkAuthenticated, (req, res) => {
    const studentId = req.user.studentId; // Access the studentId from the session
    // const { courseId } = req.body;
    const courseId = req.body.courseId;

    pool.query(
        `INSERT INTO "EnrolledIn" ("studentId", "courseId") VALUES ($1, $2)`,
        [studentId, courseId],
        (err, results) => {
            if (err) {
                console.error('Error enrolling student:', err);
                return res.status(500).json({ error: 'Database error' });
            }
            res.status(200).json({ message: 'Successfully enrolled in the course' });
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

// Fetch all submissions for a course
router.get('/courses/:courseId/submissions', checkAuthenticated, async (req, res) => {
    const courseId = parseInt(req.params.courseId, 10);
    const studentId = req.user.studentId;

    try {
        const result = await pool.query(
            `SELECT 
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
            WHERE "AssignmentSubmission"."courseId" = $1 AND "AssignmentSubmission"."studentId" = $2`,
            [courseId, studentId]
        );
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching submissions:', error);
        res.status(500).json({ message: 'Error fetching submissions' });
    }
});


// Fetch all TAs for a course
router.get('/courses/:id/tas', async (req, res) => {
    const courseId = req.params.id;

    try {
        const tas = await pool.query(`
            SELECT I."instructorId", I."firstName", I."lastName", I."email"
            FROM "Instructor" I
            JOIN "Teaches" T ON I."instructorId" = T."instructorId"
            WHERE T."courseId" = $1 AND I."isTA" = TRUE
        `, [courseId]);

        if (tas.rowCount > 0) {
            res.status(200).send(tas.rows);
        } else {
            // Sending an empty array with a 200 status code instead of treating it as an error
            res.status(200).send([]);
        }
    } catch (error) {
        console.error('Error fetching TAs:', error);
        res.status(500).send({ message: 'Error fetching TAs' });
    }
});

// Fetch Instructor for a course
router.get('/courses/:id/instructor', async (req, res) => {
    const courseId = req.params.id;

    try {
        // Adjusted SQL query to join Instructor and Teaches tables and filter for Instructor
        const query = `
            SELECT I."instructorId", I."firstName", I."lastName", I."email"
            FROM "Instructor" I
            JOIN "Teaches" T ON I."instructorId" = T."instructorId"
            WHERE T."courseId" = $1 AND I."isTA" = FALSE;
        `;
        const instructor = await pool.query(query, [courseId]);

        if (instructor.rowCount > 0) {
            res.status(200).send(instructor.rows[0]);
        } else {
            res.status(200).send([]);
        }
    } catch (error) {
        console.error('Error fetching Instructor:', error);
        res.status(500).send({ message: 'Error fetching Instructor' });
    }
});

// Fetch course details by courseId
router.get('/courses/:courseId', async (req, res) => {
    const { courseId } = req.params;

    try {
        const query = `
            SELECT "courseCode", "courseName"
            FROM "Course"
            WHERE "courseId" = $1
        `;
        const result = await pool.query(query, [courseId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Course not found' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching course details:', error);
        res.status(500).json({ message: 'Error fetching course details' });
    }
});


// Fetch course name for a given course ID
router.get('/courses/:id/name', async (req, res) => {
    const courseId = req.params.id;

    try {
        const course = await pool.query('SELECT "courseName" FROM "Course" WHERE "courseId" = $1', [courseId]);

        if (course.rowCount > 0) {
            res.status(200).send(course.rows[0]);
        } else {
            res.status(404).send({ message: 'Course not found' });
        }
    } catch (error) {
        console.error('Error fetching course name:', error);
        res.status(500).send({ message: 'Error fetching course name' });
    }
});

// Fetch course code for a given course ID
router.get('/courses/:id/code', async (req, res) => {
    const courseId = req.params.id;

    try {
        const course = await pool.query('SELECT "courseCode" FROM "Course" WHERE "courseId" = $1', [courseId]);

        if (course.rowCount > 0) {
            res.status(200).send(course.rows[0]);
        } else {
            res.status(404).send({ message: 'Course not found' });
        }
    } catch (error) {
        console.error('Error fetching course code:', error);
        res.status(500).send({ message: 'Error fetching course code' });
    }
});

module.exports = router;