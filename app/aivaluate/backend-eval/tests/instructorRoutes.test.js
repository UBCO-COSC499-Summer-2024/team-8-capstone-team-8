const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const logger = require('../evallogger'); // Adjust this path if it's not correct

jest.mock('pg', () => {
    const mPool = {
        query: jest.fn()
    };
    return { Pool: jest.fn(() => mPool) };
});

const pool = new Pool();

const app = express();
app.use(bodyParser.json());

const checkAuthenticated = (req, res, next) => {
    req.isAuthenticated = () => true;
    req.user = { instructorId: 42 }; // Simulated logged-in instructor
    next();
};

app.use(checkAuthenticated);


// Define the route to add an instructor or TA to a course
app.post('/teaches', async (req, res) => {
    const { courseId, instructorId } = req.body;
    try {
        await pool.query('INSERT INTO "Teaches" ("courseId", "instructorId") VALUES ($1, $2)', [courseId, instructorId]);
        res.status(201).send({ message: 'Instructor/TA added to course successfully' });
    } catch (error) {
        logger.error('Error adding Instructor/TA to course:', error);
        res.status(500).send({ message: 'Error adding Instructor/TA to course' });
    }
});
app.get('/instructor/me', (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'Not authenticated' });
    }
    res.status(200).json({ instructorId: req.user.instructorId });
  });
  

  // Define the route to get evaluator firstName by instructorId
app.get('/instructor/:instructorId/firstName', async (req, res) => {
    const instructorId = parseInt(req.params.instructorId);
  
    try {
        const result = await pool.query('SELECT "firstName" FROM "Instructor" WHERE "instructorId" = $1', [instructorId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Instructor not found' });
        }
        res.status(200).json({ firstName: result.rows[0].firstName });
    } catch (error) {
        logger.error('Error fetching instructor firstName:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Define the route to get evaluator firstName by instructorId
app.get('/instructor/:instructorId/firstName', async (req, res) => {
    const instructorId = parseInt(req.params.instructorId);
  
    try {
        const result = await pool.query('SELECT "firstName" FROM "Instructor" WHERE "instructorId" = $1', [instructorId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Instructor not found' });
        }
        res.status(200).json({ firstName: result.rows[0].firstName });
    } catch (error) {
        logger.error('Error fetching instructor firstName:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Define the route to get evaluator lastName by instructorId
app.get('/instructor/:instructorId/lastName', async (req, res) => {
    const instructorId = parseInt(req.params.instructorId);
  
    try {
        const result = await pool.query('SELECT "lastName" FROM "Instructor" WHERE "instructorId" = $1', [instructorId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Instructor not found' });
        }
        res.status(200).json({ lastName: result.rows[0].lastName });
    } catch (error) {
        logger.error('Error fetching instructor lastName:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
  });

 // Define the route to get instructor email by instructorId
app.get('/instructor/:instructorId/email', async (req, res) => {
    const instructorId = parseInt(req.params.instructorId);
  
    try {
        const result = await pool.query('SELECT "email" FROM "Instructor" WHERE "instructorId" = $1', [instructorId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Instructor not found' });
        }
        res.status(200).json({ email: result.rows[0].email });
    } catch (error) {
        logger.error('Error fetching instructor email:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  // Define the route to get instructor password by instructorId
  app.get('/instructor/:instructorId/password', async (req, res) => {
    const instructorId = parseInt(req.params.instructorId);
  
    try {
        const result = await pool.query('SELECT "password" FROM "Instructor" WHERE "instructorId" = $1', [instructorId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Instructor not found' });
        }
        res.status(200).json({ password: result.rows[0].password });
    } catch (error) {
        logger.error('Error fetching instructor password:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  // Define the route to verify instructor password by instructorId
app.post('/instructor/:instructorId/verifyPassword', async (req, res) => {
    const instructorId = parseInt(req.params.instructorId);
    const { currentPassword } = req.body;

    try {
        const result = await pool.query('SELECT "password" FROM "Instructor" WHERE "instructorId" = $1', [instructorId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Instructor not found' });
        }

        const isMatch = await bcrypt.compare(currentPassword, result.rows[0].password);
        if (isMatch) {
            res.status(200).json({ success: true });
        } else {
            res.status(401).json({ success: false, message: 'Incorrect password' });
        }
    } catch (error) {
        logger.error('Error verifying password:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
  
  // Define the route to set an instructor's password by their ID
  app.put('/instructor/:instructorId/password', async (req, res) => {
    const instructorId = parseInt(req.params.instructorId);
    const { password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
  
    try {
        await pool.query('UPDATE "Instructor" SET "password" = $1 WHERE "instructorId" = $2', [hashedPassword, instructorId]);
        res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        logger.error('Error updating instructor password:', error);
        res.status(500).json({ message: 'Internal server error' });
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
        res.status(201).send({ courseId: result.rows[0].courseId, message: 'Course created successfully' });
    } catch (error) {
        logger.error('Error creating course:', error);
        res.status(500).send({ message: 'Error creating course' });
    }
});

  // Define the route to fetch all courses
app.get('/courses', async (req, res) => {
    try {
        const courses = await pool.query('SELECT * FROM "Course"');
        res.status(200).json(courses.rows);
    } catch (error) {
        logger.error('Error fetching courses:', error);
        res.status(500).json({ message: 'Error fetching courses' });
    }
});

// Define the route to fetch all instructors
app.get('/instructors', async (req, res) => {
    try {
        const instructors = await pool.query('SELECT * FROM "Instructor" WHERE "isTA" = FALSE');
        res.status(200).json(instructors.rows);
    } catch (error) {
        logger.error('Error fetching instructors:', error);
        res.status(500).json({ message: 'Error fetching instructors' });
    }
});

// Define the route to fetch all TAs
app.get('/tas', async (req, res) => {
    try {
        const tas = await pool.query('SELECT * FROM "Instructor" WHERE "isTA" = TRUE');
        res.status(200).json(tas.rows);
    } catch (error) {
        logger.error('Error fetching TAs:', error);
        res.status(500).json({ message: 'Error fetching TAs' });
    }
});

// Define the route to determine if the evaluator is a professor or a TA
app.get('/instructor/:id/isTA', async (req, res) => {
    const instructorId = req.params.id;

    try {
        const result = await pool.query('SELECT "isTA" FROM "Instructor" WHERE "instructorId" = $1', [instructorId]);
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Instructor not found' });
        }

        res.status(200).json({ isTA: result.rows[0].isTA });
    } catch (error) {
        logger.error('Error fetching instructor:', error);
        res.status(500).json({ message: 'Error fetching instructor' });
    }
});

// // Fetch all TAs for a course
// router.get('/courses/:id/tas', async (req, res) => {
//     const courseId = req.params.id;

//     try {
//         const tas = await pool.query(`
//             SELECT I."instructorId", I."firstName", I."lastName", I."email"
//             FROM "Instructor" I
//             JOIN "Teaches" T ON I."instructorId" = T."instructorId"
//             WHERE T."courseId" = $1 AND I."isTA" = TRUE
//         `, [courseId]);

//         if (tas.rowCount > 0) {
//             res.status(200).send(tas.rows);
//         } else {
//             // Sending an empty array with a 200 status code instead of treating it as an error
//             res.status(200).send([]);
//         }
//     } catch (error) {
//         console.error('Error fetching TAs:', error);
//         res.status(500).send({ message: 'Error fetching TAs' });
//     }
// });

describe('POST /teaches', () => {
    it('should add an instructor/TA to a course successfully', async () => {
        pool.query.mockResolvedValue({});

        const response = await request(app)
            .post('/teaches')
            .send({
                courseId: 1,
                instructorId: 123
            });

        expect(response.status).toBe(201);
        expect(response.body).toEqual({ message: 'Instructor/TA added to course successfully' });
    });

    it('should handle database errors', async () => {
        pool.query.mockRejectedValue(new Error('Database error'));

        const response = await request(app)
            .post('/teaches')
            .send({
                courseId: 1,
                instructorId: 123
            });

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ message: 'Error adding Instructor/TA to course' });
    });

    // describe('GET /instructor/me', () => {
    //     it('should return the current instructor ID', async () => {
    //         const response = await request(app).get('/instructor/me');
    
    //         expect(response.status).toBe(200);
    //         expect(response.body).toEqual({ instructorId: 42 });
    //     });
    
    //     it('should return 401 if not authenticated', async () => {
    //         app.use((req, res, next) => {
    //             req.isAuthenticated = () => false; // Override to simulate not being logged in
    //             next();
    //         });
    
    //         const response = await request(app).get('/instructor/me');
    
    //         expect(response.status).toBe(401);
    //         expect(response.body).toEqual({ message: 'Not authenticated' });
    //     });
    // });
    

    describe('GET /instructor/:instructorId/firstName', () => {
        it('should fetch the first name of the instructor successfully', async () => {
            pool.query.mockResolvedValue({
                rows: [{ firstName: 'John' }],
                rowCount: 1
            });
    
            const response = await request(app).get('/instructor/123/firstName');
    
            expect(response.status).toBe(200);
            expect(response.body).toEqual({ firstName: 'John' });
        });
    
        it('should return 404 if the instructor is not found', async () => {
            pool.query.mockResolvedValue({
                rows: [],
                rowCount: 0
            });
    
            const response = await request(app).get('/instructor/123/firstName');
    
            expect(response.status).toBe(404);
            expect(response.body).toEqual({ message: 'Instructor not found' });
        });
    
        it('should return 500 on a database error', async () => {
            pool.query.mockRejectedValue(new Error('Database error'));
    
            const response = await request(app).get('/instructor/123/firstName');
    
            expect(response.status).toBe(500);
            expect(response.body).toEqual({ message: 'Internal server error' });
        });
    });

    describe('GET /instructor/:instructorId/firstName', () => {
        it('should fetch the first name of the instructor successfully', async () => {
            pool.query.mockResolvedValue({
                rows: [{ firstName: 'John' }],
                rowCount: 1
            });
    
            const response = await request(app).get('/instructor/123/firstName');
    
            expect(response.status).toBe(200);
            expect(response.body).toEqual({ firstName: 'John' });
        });
    
        it('should return 404 if the instructor is not found', async () => {
            pool.query.mockResolvedValue({
                rows: [],
                rowCount: 0
            });
    
            const response = await request(app).get('/instructor/123/firstName');
    
            expect(response.status).toBe(404);
            expect(response.body).toEqual({ message: 'Instructor not found' });
        });
    
        it('should return 500 on a database error', async () => {
            pool.query.mockRejectedValue(new Error('Database error'));
    
            const response = await request(app).get('/instructor/123/firstName');
    
            expect(response.status).toBe(500);
            expect(response.body).toEqual({ message: 'Internal server error' });
        });
    });

    describe('GET /instructor/:instructorId/lastName', () => {
        it('should fetch the last name of the instructor successfully', async () => {
            pool.query.mockResolvedValue({
                rows: [{ lastName: 'Doe' }],
                rowCount: 1
            });
    
            const response = await request(app).get('/instructor/123/lastName');
    
            expect(response.status).toBe(200);
            expect(response.body).toEqual({ lastName: 'Doe' });
        });
    
        it('should return 404 if the instructor is not found', async () => {
            pool.query.mockResolvedValue({
                rows: [],
                rowCount: 0
            });
    
            const response = await request(app).get('/instructor/123/lastName');
    
            expect(response.status).toBe(404);
            expect(response.body).toEqual({ message: 'Instructor not found' });
        });
    
        it('should return 500 on a database error', async () => {
            pool.query.mockRejectedValue(new Error('Database error'));
    
            const response = await request(app).get('/instructor/123/lastName');
    
            expect(response.status).toBe(500);
            expect(response.body).toEqual({ message: 'Internal server error' });
        });
    });
    
    describe('Instructor Credential Routes', () => {
        describe('GET /instructor/:instructorId/email', () => {
            it('should fetch the instructor email successfully', async () => {
                pool.query.mockResolvedValue({
                    rows: [{ email: 'john.doe@example.com' }],
                    rowCount: 1
                });
    
                const response = await request(app).get('/instructor/123/email');
    
                expect(response.status).toBe(200);
                expect(response.body).toEqual({ email: 'john.doe@example.com' });
            });
    
            it('should return 404 if the instructor is not found', async () => {
                pool.query.mockResolvedValue({
                    rows: [],
                    rowCount: 0
                });
    
                const response = await request(app).get('/instructor/123/email');
    
                expect(response.status).toBe(404);
                expect(response.body).toEqual({ message: 'Instructor not found' });
            });
    
            it('should return 500 on a database error', async () => {
                pool.query.mockRejectedValue(new Error('Database error'));
    
                const response = await request(app).get('/instructor/123/email');
    
                expect(response.status).toBe(500);
                expect(response.body).toEqual({ message: 'Internal server error' });
            });
        });
    
        describe('GET /instructor/:instructorId/password', () => {
            it('should fetch the instructor password successfully', async () => {
                pool.query.mockResolvedValue({
                    rows: [{ password: 'hashedpassword' }],
                    rowCount: 1
                });
    
                const response = await request(app).get('/instructor/123/password');
    
                expect(response.status).toBe(200);
                expect(response.body).toEqual({ password: 'hashedpassword' });
            });
    
            it('should return 404 if the instructor is not found', async () => {
                pool.query.mockResolvedValue({
                    rows: [],
                    rowCount: 0
                });
    
                const response = await request(app).get('/instructor/123/password');
    
                expect(response.status).toBe(404);
                expect(response.body).toEqual({ message: 'Instructor not found' });
            });
    
            it('should return 500 on a database error', async () => {
                pool.query.mockRejectedValue(new Error('Database error'));
    
                const response = await request(app).get('/instructor/123/password');
    
                expect(response.status).toBe(500);
                expect(response.body).toEqual({ message: 'Internal server error' });
            });
        });
    });

//     // Tests for Verifying Instructor Password by InstructorId
// describe('POST /instructor/:instructorId/verifyPassword', () => {
//     it('should verify the password successfully', async () => {
//         pool.query.mockResolvedValueOnce({ rows: [{ password: 'hashedPassword' }] });
//         bcrypt.compare.mockResolvedValueOnce(true);

//         const response = await request(app)
//             .post('/instructor/1/verifyPassword')
//             .send({ currentPassword: 'testPassword' });

//         expect(response.status).toBe(200);
//         expect(response.body).toEqual({ success: true });
//     });

//     it('should return 401 for incorrect password', async () => {
//         pool.query.mockResolvedValueOnce({ rows: [{ password: 'hashedPassword' }] });
//         bcrypt.compare.mockResolvedValueOnce(false);

//         const response = await request(app)
//             .post('/instructor/1/verifyPassword')
//             .send({ currentPassword: 'wrongPassword' });

//         expect(response.status).toBe(401);
//         expect(response.body).toEqual({ success: false, message: 'Incorrect password' });
//     });

//     it('should return 404 if instructor not found', async () => {
//         pool.query.mockResolvedValueOnce({ rows: [] });

//         const response = await request(app)
//             .post('/instructor/1/verifyPassword')
//             .send({ currentPassword: 'testPassword' });

//         expect(response.status).toBe(404);
//         expect(response.body).toEqual({ message: 'Instructor not found' });
//     });

//     it('should handle database errors', async () => {
//         pool.query.mockRejectedValue(new Error('Database error'));

//         const response = await request(app)
//             .post('/instructor/1/verifyPassword')
//             .send({ currentPassword: 'testPassword' });

//         expect(response.status).toBe(500);
//         expect(response.body).toEqual({ message: 'Internal server error' });
//     });
// //});

    
//         describe('PUT /instructor/:instructorId/password', () => {
//             it('should update the instructor password successfully', async () => {
//                 pool.query.mockResolvedValue({
//                     rowCount: 1
//                 });
    
//                 const response = await request(app).put('/instructor/123/password').send({ password: 'newpassword' });
    
//                 expect(response.status).toBe(200);
//                 expect(response.body).toEqual({ message: 'Password updated successfully' });
//             });
    
//             it('should handle errors during password update', async () => {
//                 pool.query.mockRejectedValue(new Error('Database error'));
    
//                 const response = await request(app).put('/instructor/123/password').send({ password: 'newpassword' });
    
//                 expect(response.status).toBe(500);
//                 expect(response.body).toEqual({ message: 'Internal server error' });
//             });
//         });
//     });

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

// Tests for Fetch All Courses Route
describe('GET /courses', () => {
    it('should fetch all courses successfully', async () => {
        const mockCourses = [
            { courseId: 1, courseName: "Introduction to Programming", courseCode: "CS101", maxStudents: 30 },
            { courseId: 2, courseName: "Advanced Databases", courseCode: "CS201", maxStudents: 25 }
        ];

        pool.query.mockResolvedValue({ rows: mockCourses });

        const response = await request(app).get('/courses');

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockCourses);
    });

    it('should handle database errors', async () => {
        pool.query.mockRejectedValue(new Error('Database error'));

        const response = await request(app).get('/courses');

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ message: 'Error fetching courses' });
    });
});

// Tests for Fetch All Instructors Route
describe('GET /instructors', () => {
    it('should fetch all instructors successfully', async () => {
        const mockInstructors = [
            { instructorId: 1, firstName: "John", lastName: "Doe", email: "john.doe@example.com" },
            { instructorId: 2, firstName: "Jane", lastName: "Doe", email: "jane.doe@example.com" }
        ];

        pool.query.mockResolvedValue({ rows: mockInstructors });

        const response = await request(app).get('/instructors');

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockInstructors);
    });

    it('should handle database errors', async () => {
        pool.query.mockRejectedValue(new Error('Database error'));

        const response = await request(app).get('/instructors');

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ message: 'Error fetching instructors' });
    });
});

// Tests for Fetch All TAs Route
describe('GET /tas', () => {
    it('should fetch all TAs successfully', async () => {
        const mockTAs = [
            { instructorId: 3, firstName: "Alice", lastName: "Johnson", email: "alice.johnson@example.com" },
            { instructorId: 4, firstName: "Bob", lastName: "Smith", email: "bob.smith@example.com" }
        ];

        pool.query.mockResolvedValue({ rows: mockTAs });

        const response = await request(app).get('/tas');

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockTAs);
    });

    it('should handle database errors', async () => {
        pool.query.mockRejectedValue(new Error('Database error'));

        const response = await request(app).get('/tas');

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ message: 'Error fetching TAs' });
    });
});

// // Tests for Fetch All TAs for a Course Route
// describe('GET /courses/:id/tas', () => {
//     it('should fetch all TAs for a course successfully', async () => {
//         const courseId = '123';
//         const mockTAs = [
//             { instructorId: 3, firstName: "Alice", lastName: "Johnson", email: "alice.johnson@example.com" },
//             { instructorId: 4, firstName: "Bob", lastName: "Smith", email: "bob.smith@example.com" }
//         ];

//         pool.query.mockResolvedValue({ rowCount: mockTAs.length, rows: mockTAs });

//         const response = await request(app).get(`/courses/${courseId}/tas`);

//         expect(response.status).toBe(200);
//         expect(response.body).toEqual(mockTAs);
//     });

//     it('should return an empty array if no TAs are associated with the course', async () => {
//         const courseId = '456';
//         pool.query.mockResolvedValue({ rowCount: 0, rows: [] });

//         const response = await request(app).get(`/courses/${courseId}/tas`);

//         expect(response.status).toBe(200);
//         expect(response.body).toEqual([]);
//     });

//     it('should handle database errors', async () => {
//         const courseId = '789';
//         pool.query.mockRejectedValue(new Error('Database error'));

//         const response = await request(app).get(`/courses/${courseId}/tas`);

//         expect(response.status).toBe(500);
//         expect(response.body).toEqual({ message: 'Error fetching TAs' });
//     });
// });

// Tests for Determine Whether the Evaluator is a Prof or a TA Route
describe('GET /instructor/:id/isTA', () => {
    it('should fetch the TA status of the instructor successfully', async () => {
        const instructorId = '123';
        const mockIsTA = { isTA: true };

        pool.query.mockResolvedValue({ rowCount: 1, rows: [mockIsTA] });

        const response = await request(app).get(`/instructor/${instructorId}/isTA`);

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockIsTA);
    });

    it('should return a 404 if the instructor is not found', async () => {
        const instructorId = '456';
        pool.query.mockResolvedValue({ rowCount: 0, rows: [] });

        const response = await request(app).get(`/instructor/${instructorId}/isTA`);

        expect(response.status).toBe(404);
        expect(response.body).toEqual({ message: 'Instructor not found' });
    });

    it('should handle database errors', async () => {
        const instructorId = '789';
        pool.query.mockRejectedValue(new Error('Database error'));

        const response = await request(app).get(`/instructor/${instructorId}/isTA`);

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ message: 'Error fetching instructor' });
    });
});
    

});

module.exports = app; // Exporting for testing purposes
