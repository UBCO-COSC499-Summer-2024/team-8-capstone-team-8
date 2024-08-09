const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const logger = require('../evallogger'); // Ensure this path is correct

// Mock the pg module correctly
jest.mock('pg', () => ({
    Pool: jest.fn(() => ({
        query: jest.fn()
    }))
}));

const pool = new Pool();

const app = express();
app.use(bodyParser.json());

const checkAuthenticated = (req, res, next) => {
    req.isAuthenticated = () => true; // Simulate always authenticated
    req.user = { instructorId: '123' }; // Mocked user
    next();
};

app.use(checkAuthenticated);


// Define the route to create a course
app.post('/courses', async (req, res) => {
    const { courseName, courseCode, maxStudents } = req.body;

    try {
        const result = await pool.query(
            'INSERT INTO "Course" ("courseName", "courseCode", "maxStudents") VALUES ($1, $2, $3) RETURNING "courseId"',
            [courseName, courseCode, maxStudents]
        );
        res.status(201).json({ courseId: result.rows[0].courseId, message: 'Course created successfully' });
    } catch (error) {
        logger.error('Error creating course:', error);
        res.status(500).json({ message: 'Error creating course' });
    }
});

// Define the route to get all courses
app.get('/courses', async (req, res) => {
    try {
        const courses = await pool.query('SELECT * FROM "Course"');
        res.status(200).json(courses.rows);
    } catch (error) {
        logger.error('Error fetching courses:', error);
        res.status(500).json({ message: 'Error fetching courses' });
    }
});

// Define the route to get enrolled courses for an instructor
app.get('/enrolled-courses', async (req, res) => {
    const instructorId = req.user.instructorId; // Access the instructorId from the session

    try {
        const results = await pool.query(
            `SELECT "Course"."courseId", "Course"."courseCode", "Course"."courseName" 
             FROM "Teaches" 
             JOIN "Course" ON "Teaches"."courseId" = "Course"."courseId" 
             WHERE "Teaches"."instructorId" = $1`,
            [instructorId]
        );
        res.status(200).json(results.rows);
    } catch (error) {
        logger.error('Error fetching courses:', error);
        res.status(500).json({ message: 'Error fetching courses' });
    }
});
 
// Define the route to get a single course by ID
app.get('/courses/:id', async (req, res) => {
    const courseId = req.params.id;

    try {
        const course = await pool.query('SELECT * FROM "Course" WHERE "courseId" = $1', [courseId]);

        if (course.rowCount > 0) {
            res.status(200).json(course.rows[0]);
        } else {
            res.status(404).json({ message: 'Course not found' });
        }
    } catch (error) {
        logger.error('Error fetching course:', error);
        res.status(500).json({ message: 'Error fetching course' });
    }
});

// Define the route to delete a course
app.delete('/courses/:id', async (req, res) => {
    const courseId = req.params.id;

    try {
        const result = await pool.query('DELETE FROM "Course" WHERE "courseId" = $1', [courseId]);

        if (result.rowCount > 0) {
            res.status(200).json({ message: 'Course deleted successfully' });
        } else {
            res.status(404).json({ message: 'Course not found' });
        }
    } catch (error) {
        logger.error('Error deleting course:', error);
        res.status(500).json({ message: 'Error deleting course' });
    }
});

// Define the route to update a course
app.put('/courses/:id', async (req, res) => {
    const courseId = req.params.id;
    const { courseName, courseCode, maxStudents } = req.body;

    try {
        const result = await pool.query(
            'UPDATE "Course" SET "courseName" = $1, "courseCode" = $2, "maxStudents" = $3 WHERE "courseId" = $4',
            [courseName, courseCode, maxStudents, courseId]
        );

        if (result.rowCount > 0) {
            res.status(200).json({ message: 'Course updated successfully' });
        } else {
            res.status(404).json({ message: 'Course not found' });
        }
    } catch (error) {
        logger.error('Error updating course:', error);
        res.status(500).json({ message: 'Error updating course' });
    }
});

// Define the route to create a course
app.post('/courses', async (req, res) => {
    const { courseName, courseCode, maxStudents } = req.body;

    try {
        const result = await pool.query(
            'INSERT INTO "Course" ("courseName", "courseCode", "maxStudents") VALUES ($1, $2, $3) RETURNING "courseId"',
            [courseName, courseCode, maxStudents]
        );
        res.status(201).json({ courseId: result.rows[0].courseId, message: 'Course created successfully' });
    } catch (error) {
        logger.error('Error creating course:', error);
        res.status(500).json({ message: 'Error creating course' });
    }
});


// Define the route to get a single course by ID
app.get('/courses/:courseId', async (req, res) => {
    const courseId = parseInt(req.params.courseId, 10);

    try {
        const course = await pool.query('SELECT * FROM "Course" WHERE "courseId" = $1', [courseId]);

        if (course.rowCount > 0) {
            res.status(200).json(course.rows[0]);
        } else {
            res.status(404).json({ message: 'Course not found' });
        }
    } catch (error) {
        logger.error('Error fetching course:', error);
        res.status(500).json({ message: 'Error fetching course' });
    }
});


// Define the route to fetch all submissions for a course
app.get('/courses/:courseId/submissions', async (req, res) => {
    const courseId = parseInt(req.params.courseId, 10);

    try {
        const result = await pool.query(
            `SELECT 
                "AssignmentSubmission"."assignmentSubmissionId",
                "AssignmentSubmission"."studentId",
                "Student"."firstName",
                "Student"."lastName",
                "Assignment"."assignmentKey",
                "AssignmentSubmission"."isGraded"
            FROM "AssignmentSubmission"
            JOIN "Assignment" ON "AssignmentSubmission"."assignmentId" = "Assignment"."assignmentId"
            JOIN "Student" ON "AssignmentSubmission"."studentId" = "Student"."studentId"
            WHERE "AssignmentSubmission"."courseId" = $1`,
            [courseId]
        );
        res.status(200).json(result.rows);
    } catch (error) {
        logger.error('Error fetching submissions:', error);
        res.status(500).json({ message: 'Error fetching submissions' });
    }
});


// Define the route to fetch course details for an instructor
app.get('/instructors/:instructorId/courses', async (req, res) => {
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
        logger.error('Error fetching courses:', error);
        res.status(500).json({ message: 'Error fetching courses' });
    }
});


// Tests for Create Course Route
describe('POST /courses', () => {
    beforeEach(() => {
        pool.query.mockClear();
    });

    it('should create a course successfully', async () => {
        const mockCourse = { courseId: 1 };
        pool.query.mockResolvedValue({ rows: [mockCourse], rowCount: 1 });

        const response = await request(app)
            .post('/courses')
            .send({
                courseName: 'New Course',
                courseCode: 'NC101',
                maxStudents: 30
            });

        expect(response.status).toBe(201);
        expect(response.body).toEqual({ courseId: 1, message: 'Course created successfully' });
    });

    it('should handle database errors', async () => {
        pool.query.mockRejectedValue(new Error('Database error'));

        const response = await request(app)
            .post('/courses')
            .send({
                courseName: 'New Course',
                courseCode: 'NC101',
                maxStudents: 30
            });

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ message: 'Error creating course' });
    });

    // Tests for Get All Courses Route
describe('GET /courses', () => {
    beforeEach(() => {
        pool.query.mockClear();
    });

    it('should fetch all courses successfully', async () => {
        const mockCourses = [
            { courseId: 1, courseName: 'Intro to Programming', courseCode: 'ITP101' },
            { courseId: 2, courseName: 'Advanced Databases', courseCode: 'ADB102' }
        ];
        pool.query.mockResolvedValue({ rows: mockCourses, rowCount: mockCourses.length });

        const response = await request(app).get('/courses');

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockCourses);
    });

    it('should handle database errors when fetching courses', async () => {
        pool.query.mockRejectedValue(new Error('Database error'));

        const response = await request(app).get('/courses');

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ message: 'Error fetching courses' });
    });
});

// Tests for Fetch Enrolled Courses Route
describe('GET /enrolled-courses', () => {
    it('should fetch enrolled courses for the instructor', async () => {
        const mockCourses = [
            { courseId: 1, courseCode: 'CS101', courseName: 'Intro to Programming' },
            { courseId: 2, courseCode: 'DB202', courseName: 'Advanced Databases' }
        ];

        pool.query.mockResolvedValue({ rows: mockCourses });

        const response = await request(app).get('/enrolled-courses');

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockCourses);
    });

    it('should handle database errors', async () => {
        pool.query.mockRejectedValue(new Error('Database error'));

        const response = await request(app).get('/enrolled-courses');

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ message: 'Error fetching courses' });
    });
});

// Tests for Get Single Course Route
describe('GET /courses/:id', () => {
    it('should fetch a single course successfully', async () => {
        const mockCourse = { courseId: 1, courseName: 'Introduction to Programming', courseCode: 'INT100' };
        pool.query.mockResolvedValue({ rows: [mockCourse], rowCount: 1 });

        const response = await request(app).get('/courses/1');

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockCourse);
    });

    it('should return a 404 if the course is not found', async () => {
        pool.query.mockResolvedValue({ rows: [], rowCount: 0 });

        const response = await request(app).get('/courses/999');

        expect(response.status).toBe(404);
        expect(response.body).toEqual({ message: 'Course not found' });
    });

    it('should handle database errors when fetching a course', async () => {
        pool.query.mockRejectedValue(new Error('Database error'));

        const response = await request(app).get('/courses/1');

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ message: 'Error fetching course' });
    });
});


// Tests for Delete Course Route
describe('DELETE /courses/:id', () => {
    it('should delete a course successfully', async () => {
        pool.query.mockResolvedValue({ rowCount: 1 });

        const response = await request(app).delete('/courses/1');

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: 'Course deleted successfully' });
    });

    it('should return a 404 if the course is not found', async () => {
        pool.query.mockResolvedValue({ rowCount: 0 });

        const response = await request(app).delete('/courses/999');

        expect(response.status).toBe(404);
        expect(response.body).toEqual({ message: 'Course not found' });
    });

    it('should handle database errors when deleting a course', async () => {
        pool.query.mockRejectedValue(new Error('Database error'));

        const response = await request(app).delete('/courses/1');

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ message: 'Error deleting course' });
    });
});

// Tests for Update Course Route
describe('PUT /courses/:id', () => {
    it('should update a course successfully', async () => {
        pool.query.mockResolvedValue({ rowCount: 1 });

        const response = await request(app).put('/courses/1').send({
            courseName: 'Updated Course',
            courseCode: 'UC101',
            maxStudents: 40
        });

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: 'Course updated successfully' });
    });

    it('should return a 404 if the course is not found for update', async () => {
        pool.query.mockResolvedValue({ rowCount: 0 });

        const response = await request(app).put('/courses/999').send({
            courseName: 'Updated Course',
            courseCode: 'UC101',
            maxStudents: 40
        });

        expect(response.status).toBe(404);
        expect(response.body).toEqual({ message: 'Course not found' });
    });

    it('should handle database errors when updating a course', async () => {
        pool.query.mockRejectedValue(new Error('Database error'));

        const response = await request(app).put('/courses/1').send({
            courseName: 'Updated Course',
            courseCode: 'UC101',
            maxStudents: 40
        });

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ message: 'Error updating course' });
    });
});

// Tests for Create Course Route
describe('POST /courses', () => {
    it('should create a course successfully', async () => {
        const mockCourse = { courseId: 1 };

        pool.query.mockResolvedValue({ rows: [mockCourse] });

        const response = await request(app)
            .post('/courses')
            .send({
                courseName: 'New Course',
                courseCode: 'NC101',
                maxStudents: 30
            });

        expect(response.status).toBe(201);
        expect(response.body).toEqual({ courseId: 1, message: 'Course created successfully' });
    });

    it('should handle database errors', async () => {
        pool.query.mockRejectedValue(new Error('Database error'));

        const response = await request(app)
            .post('/courses')
            .send({
                courseName: 'New Course',
                courseCode: 'NC101',
                maxStudents: 30
            });

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ message: 'Error creating course' });
    });
});

// Tests for Get Single Course by ID Route
describe('GET /courses/:courseId', () => {
    it('should retrieve the course details successfully', async () => {
        const mockCourse = { courseId: 1, courseName: 'Introduction to Programming', courseCode: 'CS101', maxStudents: 30 };

        pool.query.mockResolvedValue({ rowCount: 1, rows: [mockCourse] });

        const response = await request(app).get('/courses/1');

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockCourse);
    });

    it('should return a 404 if the course is not found', async () => {
        pool.query.mockResolvedValue({ rowCount: 0, rows: [] });

        const response = await request(app).get('/courses/1');

        expect(response.status).toBe(404);
        expect(response.body).toEqual({ message: 'Course not found' });
    });

    it('should handle database errors', async () => {
        pool.query.mockRejectedValue(new Error('Database error'));

        const response = await request(app).get('/courses/1');

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ message: 'Error fetching course' });
    });
});

// Tests for Fetch All Submissions Route
describe('GET /courses/:courseId/submissions', () => {
    it('should fetch all submissions for the course', async () => {
        const mockSubmissions = [
            { assignmentSubmissionId: 1, studentId: 101, firstName: 'Alice', lastName: 'Johnson', assignmentKey: 'Assignment1', isGraded: true },
            { assignmentSubmissionId: 2, studentId: 102, firstName: 'Bob', lastName: 'Smith', assignmentKey: 'Assignment2', isGraded: false }
        ];

        pool.query.mockResolvedValue({ rows: mockSubmissions });

        const response = await request(app).get('/courses/123/submissions');

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockSubmissions);
    });

    it('should handle database errors', async () => {
        pool.query.mockRejectedValue(new Error('Database error'));

        const response = await request(app).get('/courses/123/submissions');

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ message: 'Error fetching submissions' });
    });
});


// Tests for Fetch Course Details for Instructor Route
describe('GET /instructors/:instructorId/courses', () => {
    it('should fetch course details for the instructor', async () => {
        const mockCourses = [
            { courseId: 1, courseName: 'Intro to Programming', courseCode: 'CS101' },
            { courseId: 2, courseName: 'Advanced Databases', courseCode: 'DB202' }
        ];

        pool.query.mockResolvedValue({ rows: mockCourses });

        const response = await request(app).get('/instructors/123/courses');

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockCourses);
    });

    it('should handle database errors', async () => {
        pool.query.mockRejectedValue(new Error('Database error'));

        const response = await request(app).get('/instructors/123/courses');

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ message: 'Error fetching courses' });
    });
});

});

module.exports = app; // Exporting for testing purposes
