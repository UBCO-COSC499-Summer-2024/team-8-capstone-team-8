const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const logger = require('../logger'); // Ensure this path is correct

// Mock the pg module correctly
jest.mock('pg', () => ({
    Pool: jest.fn(() => ({
        query: jest.fn()
    }))
}));


// Instantiate the mocked pool
const pool = new Pool();

const app = express();
app.use(bodyParser.json());

// Mocking the authentication
const checkAuthenticated = (req, res, next) => {
    req.user = { studentId: '1' }; // Mocked user
    next();
};
app.use(checkAuthenticated);

// Create a course endpoint
app.post('/courses', async (req, res) => {
    const { courseName, courseCode, maxStudents } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO "Course" ("courseName", "courseCode", "maxStudents") VALUES ($1, $2, $3) RETURNING "courseId"',
            [courseName, courseCode, maxStudents]
        );
        res.status(201).send({ courseId: result.rows[0].courseId, message: 'Course created successfully' });
    } catch (error) {
        logger.error('Error creating course: ' + error.message);
        res.status(500).send({ message: 'Error creating course' });
    }
});


app.get('/courses', async (req, res) => {
    try {
        const courses = await pool.query('SELECT * FROM "Course"');
        res.status(200).send(courses.rows);
    } catch (error) {
        logger.error('Error fetching courses: ' + error.message);
        res.status(500).send({ message: 'Error fetching courses' });
    }
});

app.get('/enrolled-courses', async (req, res) => {
    const studentId = req.user.studentId; // Use mocked user's studentId
    try {
        const results = await pool.query(
            `SELECT "Course"."courseId", "Course"."courseCode", "Course"."courseName"
             FROM "EnrolledIn" 
             JOIN "Course" ON "EnrolledIn"."courseId" = "Course"."courseId" 
             WHERE "EnrolledIn"."studentId" = $1`,
            [studentId]
        );
        res.json(results.rows);
    } catch (error) {
        logger.error('Error fetching enrolled courses: ' + error.message);
        res.status(500).json({ error: 'Database error' });
    }
});

app.get('/not-enrolled-courses', async (req, res) => {
    const studentId = req.user.studentId; // Use mocked user's studentId
    try {
        const results = await pool.query(
            `SELECT "Course"."courseId", "Course"."courseCode", "Course"."courseName", "Course"."maxStudents"
             FROM "Course"
             LEFT JOIN "EnrolledIn" 
             ON "Course"."courseId" = "EnrolledIn"."courseId" 
             AND "EnrolledIn"."studentId" = $1
             WHERE "EnrolledIn"."studentId" IS NULL`,
            [studentId]
        );
        res.json(results.rows);
    } catch (error) {
        logger.error('Error fetching courses student is not enrolled in: ' + error.message);
        res.status(500).json({ error: 'Database error' });
    }
});

app.post('/enroll-course', async (req, res) => {
    const studentId = req.user.studentId; // Use mocked user's studentId
    const courseId = req.body.courseId;

    try {
        await pool.query(
            `INSERT INTO "EnrolledIn" ("studentId", "courseId") VALUES ($1, $2)`,
            [studentId, courseId]
        );
        res.status(200).json({ message: 'Successfully enrolled in the course' });
    } catch (error) {
        logger.error('Error enrolling student: ' + error.message);
        res.status(500).json({ error: 'Database error' });
    }
});

app.get('/courses/:id', async (req, res) => {
    const courseId = req.params.id;

    try {
        const course = await pool.query('SELECT * FROM "Course" WHERE "courseId" = $1', [courseId]);

        if (course.rowCount > 0) {
            res.status(200).send(course.rows[0]);
        } else {
            res.status(404).send({ message: 'Course not found' });
        }
    } catch (error) {
        logger.error('Error fetching course: ' + error.message);
        res.status(500).send({ message: 'Error fetching course' });
    }
});

app.delete('/courses/:id', async (req, res) => {
    const courseId = req.params.id;

    try {
        const result = await pool.query('DELETE FROM "Course" WHERE "courseId" = $1', [courseId]);

        if (result.rowCount > 0) {
            res.status(200).send({ message: 'Course deleted successfully' });
        } else {
            res.status(404).send({ message: 'Course not found' });
        }
    } catch (error) {
        logger.error('Error deleting course: ' + error.message);
        res.status(500).send({ message: 'Error deleting course' });
    }
});

app.put('/courses/:id', async (req, res) => {
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
        logger.error('Error updating course: ' + error.message);
        res.status(500).send({ message: 'Error updating course' });
    }
});

app.get('/courses/:courseId/submissions', async (req, res) => {
    const courseId = parseInt(req.params.courseId, 10);
    const studentId = req.user.studentId; // Simulated user authentication

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
            WHERE "AssignmentSubmission"."courseId" = $1 AND "AssignmentSubmission"."studentId" = $2`,
            [courseId, studentId]
        );
        res.status(200).json(result.rows);
    } catch (error) {
        logger.error('Error fetching submissions: ' + error.message);
        res.status(500).json({ message: 'Error fetching submissions' });
    }
});

app.get('/courses/:id/tas', async (req, res) => {
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
            res.status(200).send([]);
        }
    } catch (error) {
        logger.error('Error fetching TAs: ' + error.message);
        res.status(500).send({ message: 'Error fetching TAs' });
    }
});

app.get('/courses/:id/instructor', async (req, res) => {
    const courseId = req.params.id;

    try {
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
        logger.error('Error fetching Instructor: ' + error.message);
        res.status(500).send({ message: 'Error fetching Instructor' });
    }
});

app.get('/courses/:courseId', async (req, res) => {
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
        logger.error('Error fetching course details: ' + error.message);
        res.status(500).json({ message: 'Error fetching course details' });
    }
});

app.get('/courses/:id/name', async (req, res) => {
    const courseId = req.params.id;

    try {
        const course = await pool.query('SELECT "courseName" FROM "Course" WHERE "courseId" = $1', [courseId]);

        if (course.rowCount > 0) {
            res.status(200).send(course.rows[0]);
        } else {
            res.status(404).send({ message: 'Course not found' });
        }
    } catch (error) {
        logger.error('Error fetching course name: ' + error.message);
        res.status(500).send({ message: 'Error fetching course name' });
    }
});

app.get('/courses/:id/code', async (req, res) => {
    const courseId = req.params.id;

    try {
        const course = await pool.query('SELECT "courseCode" FROM "Course" WHERE "courseId" = $1', [courseId]);

        if (course.rowCount > 0) {
            res.status(200).send(course.rows[0]);
        } else {
            res.status(404).send({ message: 'Course not found' });
        }
    } catch (error) {
        logger.error('Error fetching course code: ' + error.message);
        res.status(500).send({ message: 'Error fetching course code' });
    }
});

// Tests should now recognize `pool`
describe('GET /courses', () => {
    it('should fetch all courses successfully', async () => {
        const mockCourses = [
            { courseId: 1, courseName: "Introduction to Programming", courseDescription: "An introductory course on programming" },
            { courseId: 2, courseName: "Advanced CSS", courseDescription: "A course on advanced CSS techniques" }
        ];

        pool.query.mockResolvedValue({ rows: mockCourses });

        const response = await request(app).get('/courses');

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockCourses);
    }, 20000);

    it('should handle database errors', async () => {
        pool.query.mockRejectedValue(new Error('Database error'));

        const response = await request(app).get('/courses');

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ message: 'Error fetching courses' });
    });

    // Tests for the POST /courses route
describe('POST /courses', () => {
    it('should create a course successfully', async () => {
        const newCourse = {
            courseName: "Machine Learning",
            courseCode: "ML101",
            maxStudents: 50
        };

        const expectedResponse = {
            courseId: 1,
            message: 'Course created successfully'
        };

        pool.query.mockResolvedValue({ rows: [expectedResponse], rowCount: 1 });

        const response = await request(app).post('/courses').send(newCourse);

        expect(response.status).toBe(201);
        expect(response.body).toEqual(expectedResponse);
    });

    it('should handle database errors during course creation', async () => {
        const newCourse = {
            courseName: "Data Science",
            courseCode: "DS101",
            maxStudents: 30
        };

        pool.query.mockRejectedValue(new Error('Database error'));

        const response = await request(app).post('/courses').send(newCourse);

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ message: 'Error creating course' });
    });
});

// Tests for GET /enrolled-courses
describe('GET /enrolled-courses', () => {
    it('should fetch all enrolled courses for the authenticated student', async () => {
        const mockCourses = [
            { courseId: 1, courseCode: 'CS101', courseName: 'Introduction to Computer Science' },
            { courseId: 2, courseCode: 'CS102', courseName: 'Data Structures' }
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
        expect(response.body).toEqual({ error: 'Database error' });
    });
});

describe('GET /not-enrolled-courses', () => {
    it('should fetch all courses that the student is not enrolled in', async () => {
        const mockCourses = [
            { courseId: 3, courseCode: 'CS201', courseName: 'Operating Systems', maxStudents: 30 },
            { courseId: 4, courseCode: 'CS202', courseName: 'Machine Learning', maxStudents: 25 }
        ];

        pool.query.mockResolvedValue({ rows: mockCourses });

        const response = await request(app).get('/not-enrolled-courses');

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockCourses);
    });

    it('should handle database errors', async () => {
        pool.query.mockRejectedValue(new Error('Database error'));

        const response = await request(app).get('/not-enrolled-courses');

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ error: 'Database error' });
    });
});

// Tests for Course Enrollment Routes
describe('Course Enrollment Routes', () => {
    describe('POST /enroll-course', () => {
        it('should enroll a student to a course successfully', async () => {
            const courseId = '1001';

            pool.query.mockResolvedValueOnce();

            const response = await request(app).post('/enroll-course').send({ courseId });

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ message: 'Successfully enrolled in the course' });
        });

        it('should handle database errors during enrollment', async () => {
            const courseId = '1002';

            pool.query.mockRejectedValue(new Error('Database error'));

            const response = await request(app).post('/enroll-course').send({ courseId });

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ error: 'Database error' });
        });
    });

    describe('GET /courses/:id', () => {
        it('should fetch a course by ID successfully', async () => {
            const courseId = '1001';
            const mockCourse = { courseId: '1001', courseName: "Introduction to AI", courseDescription: "Learn about AI" };

            pool.query.mockResolvedValue({ rowCount: 1, rows: [mockCourse] });

            const response = await request(app).get(`/courses/${courseId}`);

            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockCourse);
        });

        it('should return a 404 if the course is not found', async () => {
            const courseId = '1003';

            pool.query.mockResolvedValue({ rowCount: 0, rows: [] });

            const response = await request(app).get(`/courses/${courseId}`);

            expect(response.status).toBe(404);
            expect(response.body).toEqual({ message: 'Course not found' });
        });

        it('should handle database errors when fetching a course', async () => {
            const courseId = '1004';

            pool.query.mockRejectedValue(new Error('Database error'));

            const response = await request(app).get(`/courses/${courseId}`);

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ message: 'Error fetching course' });
        });
    });
});

// Tests for Fetching TAs for a Course
describe('Fetching TAs for a Course', () => {
    it('should fetch all TAs for a course successfully', async () => {
        const courseId = '1';
        const mockTAs = [
            { instructorId: 1, firstName: "John", lastName: "Doe", email: "john.doe@example.com" },
            { instructorId: 2, firstName: "Jane", lastName: "Doe", email: "jane.doe@example.com" }
        ];

        pool.query.mockResolvedValue({ rows: mockTAs, rowCount: mockTAs.length });

        const response = await request(app).get(`/courses/${courseId}/tas`);

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockTAs);
    });

    it('should return an empty array if no TAs are found', async () => {
        const courseId = '2';
        
        pool.query.mockResolvedValue({ rows: [], rowCount: 0 });

        const response = await request(app).get(`/courses/${courseId}/tas`);

        expect(response.status).toBe(200);
        expect(response.body).toEqual([]);
    });

    it('should handle database errors when fetching TAs', async () => {
        const courseId = '3';
        
        pool.query.mockRejectedValue(new Error('Database error'));

        const response = await request(app).get(`/courses/${courseId}/tas`);

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ message: 'Error fetching TAs' });
    });
});

describe('Course Management Routes', () => {
    describe('DELETE /courses/:id', () => {
        it('should delete a course successfully', async () => {
            const courseId = '101';

            pool.query.mockResolvedValueOnce({ rowCount: 1 });

            const response = await request(app).delete(`/courses/${courseId}`);

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ message: 'Course deleted successfully' });
        });

        it('should return a 404 if the course is not found', async () => {
            const courseId = '102';

            pool.query.mockResolvedValueOnce({ rowCount: 0 });

            const response = await request(app).delete(`/courses/${courseId}`);

            expect(response.status).toBe(404);
            expect(response.body).toEqual({ message: 'Course not found' });
        });

        it('should handle database errors', async () => {
            const courseId = '103';

            pool.query.mockRejectedValue(new Error('Database error'));

            const response = await request(app).delete(`/courses/${courseId}`);

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ message: 'Error deleting course' });
        });
    });

    describe('PUT /courses/:id', () => {
        it('should update a course successfully', async () => {
            const courseId = '104';
            const updateDetails = {
                courseName: "Advanced Programming",
                courseCode: "AP101",
                maxStudents: 30
            };

            pool.query.mockResolvedValueOnce({ rowCount: 1 });

            const response = await request(app).put(`/courses/${courseId}`).send(updateDetails);

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ message: 'Course updated successfully' });
        });

        it('should return a 404 if the course to update is not found', async () => {
            const courseId = '105';
            const updateDetails = {
                courseName: "Advanced Programming",
                courseCode: "AP101",
                maxStudents: 30
            };

            pool.query.mockResolvedValueOnce({ rowCount: 0 });

            const response = await request(app).put(`/courses/${courseId}`).send(updateDetails);

            expect(response.status).toBe(404);
            expect(response.body).toEqual({ message: 'Course not found' });
        });

        it('should handle database errors during update', async () => {
            const courseId = '106';
            const updateDetails = {
                courseName: "Advanced Programming",
                courseCode: "AP101",
                maxStudents: 30
            };

            pool.query.mockRejectedValue(new Error('Database error'));

            const response = await request(app).put(`/courses/${courseId}`).send(updateDetails);

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ message: 'Error updating course' });
        });
    });
});

// Tests for Course Management Routes
describe('Course Management Routes', () => {
    describe('GET /courses/:courseId/submissions', () => {
        it('should fetch all submissions for a course successfully', async () => {
            const courseId = 101;
            const mockSubmissions = [
                { assignmentSubmissionId: 1, studentId: 1, firstName: "John", lastName: "Doe", assignmentKey: "HW1", isGraded: true },
                { assignmentSubmissionId: 2, studentId: 2, firstName: "Jane", lastName: "Doe", assignmentKey: "HW2", isGraded: false }
            ];

            pool.query.mockResolvedValue({ rows: mockSubmissions });

            const response = await request(app).get(`/courses/${courseId}/submissions`);

            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockSubmissions);
        });

        it('should handle database errors when fetching submissions', async () => {
            const courseId = 102;
            pool.query.mockRejectedValue(new Error('Database error'));

            const response = await request(app).get(`/courses/${courseId}/submissions`);

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ message: 'Error fetching submissions' });
        });
    });

    
});

// Tests for Instructor Retrieval Routes
describe('Instructor Retrieval Routes', () => {
    it('should fetch the instructor for a course successfully', async () => {
        const courseId = '101';
        const mockInstructor = {
            instructorId: 1,
            firstName: "Alice",
            lastName: "Johnson",
            email: "alice.johnson@example.com"
        };

        pool.query.mockResolvedValue({ rows: [mockInstructor], rowCount: 1 });

        const response = await request(app).get(`/courses/${courseId}/instructor`);

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockInstructor);
    });

    it('should return an empty array if no instructor is found', async () => {
        const courseId = '102';
        
        pool.query.mockResolvedValue({ rows: [], rowCount: 0 });

        const response = await request(app).get(`/courses/${courseId}/instructor`);

        expect(response.status).toBe(200);
        expect(response.body).toEqual([]);
    });

    it('should handle database errors when fetching the instructor', async () => {
        const courseId = '103';
        
        pool.query.mockRejectedValue(new Error('Database error'));

        const response = await request(app).get(`/courses/${courseId}/instructor`);

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ message: 'Error fetching Instructor' });
    });
});

describe('Course Details Retrieval', () => {
    it('should fetch course details successfully', async () => {
        const courseId = '1';
        const mockCourseDetails = {
            courseCode: "CS101",
            courseName: "Introduction to Computer Science"
        };

        pool.query.mockResolvedValue({ rows: [mockCourseDetails], rowCount: 1 });

        const response = await request(app).get(`/courses/${courseId}`);

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockCourseDetails);
    });

    it('should return a 404 if no course is found', async () => {
        const courseId = '2';
        
        pool.query.mockResolvedValue({ rows: [], rowCount: 0 });

        const response = await request(app).get(`/courses/${courseId}`);

        expect(response.status).toBe(404);
        expect(response.body).toEqual({ message: 'Course not found' });
    });

  
});

describe('Fetching Course Name by ID', () => {
    it('should fetch course name successfully', async () => {
        const courseId = '101';
        const mockCourseName = { courseName: "Introduction to Programming" };

        pool.query.mockResolvedValue({ rows: [mockCourseName], rowCount: 1 });

        const response = await request(app).get(`/courses/${courseId}/name`);

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockCourseName);
    });

    it('should return a 404 if the course is not found', async () => {
        const courseId = '102';

        pool.query.mockResolvedValue({ rows: [], rowCount: 0 });

        const response = await request(app).get(`/courses/${courseId}/name`);

        expect(response.status).toBe(404);
        expect(response.body).toEqual({ message: 'Course not found' });
    });

    it('should handle database errors when fetching course name', async () => {
        const courseId = '103';

        pool.query.mockRejectedValue(new Error('Database error'));

        const response = await request(app).get(`/courses/${courseId}/name`);

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ message: 'Error fetching course name' });
    });
});

// Tests for Fetching Course Code by ID
describe('Fetching Course Code by ID', () => {
    it('should fetch course code successfully', async () => {
        const courseId = '101';
        const mockCourseCode = { courseCode: "CS101" };

        pool.query.mockResolvedValue({ rows: [mockCourseCode], rowCount: 1 });

        const response = await request(app).get(`/courses/${courseId}/code`);

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockCourseCode);
    });

    it('should return a 404 if the course is not found', async () => {
        const courseId = '102';

        pool.query.mockResolvedValue({ rows: [], rowCount: 0 });

        const response = await request(app).get(`/courses/${courseId}/code`);

        expect(response.status).toBe(404);
        expect(response.body).toEqual({ message: 'Course not found' });
    });

    it('should handle database errors when fetching course code', async () => {
        const courseId = '103';

        pool.query.mockRejectedValue(new Error('Database error'));

        const response = await request(app).get(`/courses/${courseId}/code`);

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ message: 'Error fetching course code' });
    });
});

});
