const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const logger = require('../logger'); // Make sure this path is correct

jest.mock('pg', () => ({
    Pool: jest.fn(() => ({
        query: jest.fn()
    }))
}));

// jest.mock('bcryptjs', () => ({
//     compare: jest.fn()
// }));
const pool = new Pool();

const app = express();
app.use(bodyParser.json());

const checkAuthenticated = (req, res, next) => {
    req.isAuthenticated = () => true; // Simulate always authenticated
    req.user = { studentId: '1' }; // Mocked user
    next();
};

app.use(checkAuthenticated);



// async function sendMail(to, subject, text) {
//     const mailOptions = {
//         from: 'noreply@example.com',
//         to,
//         subject,
//         text
//     };

//     try {
//         await transporter.sendMail(mailOptions);
//     } catch (error) {
//         logger.error('Failed to send email:', error);
//         throw error;
//     }
// }

app.get('/student/me', (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'Not authenticated' });
    }
    res.status(200).json({ studentId: req.user.studentId });
});

app.get('/student/:studentId/firstName', async (req, res) => {
    const studentId = parseInt(req.params.studentId);

    try {
        const result = await pool.query('SELECT "firstName" FROM "Student" WHERE "studentId" = $1', [studentId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Student not found' });
        }
        res.status(200).json({ firstName: result.rows[0].firstName });
    } catch (error) {
        logger.error('Error fetching student firstName:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.put('/student/:studentId/firstName', async (req, res) => {
    const studentId = parseInt(req.params.studentId);
    const { firstName } = req.body;

    try {
        const result = await pool.query('UPDATE "Student" SET "firstName" = $1 WHERE "studentId" = $2', [firstName, studentId]);
        if (result.rowCount > 0) {
            res.status(200).json({ message: 'First name updated successfully' });
        } else {
            res.status(404).json({ message: 'Student not found' });
        }
    } catch (error) {
        logger.error('Error updating student firstName:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.get('/student/:studentId/lastName', async (req, res) => {
    const studentId = parseInt(req.params.studentId);

    try {
        const result = await pool.query('SELECT "lastName" FROM "Student" WHERE "studentId" = $1', [studentId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Student not found' });
        }
        res.status(200).json({ lastName: result.rows[0].lastName });
    } catch (error) {
        logger.error('Error fetching student lastName:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Route to get student email by studentId
app.get('/student/:studentId/email', async (req, res) => {
    const studentId = parseInt(req.params.studentId);

    try {
        const result = await pool.query('SELECT "email" FROM "Student" WHERE "studentId" = $1', [studentId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Student not found' });
        }
        res.status(200).json({ email: result.rows[0].email });
    } catch (error) {
        logger.error('Error fetching student email:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
// Route to set student email by studentId
app.put('/student/:studentId/email', async (req, res) => {
    const studentId = parseInt(req.params.studentId);
    const { email } = req.body;

    try {
        await pool.query('UPDATE "Student" SET "email" = $1 WHERE "studentId" = $2', [email, studentId]);
        res.status(200).json({ message: 'Email updated successfully' });
    } catch (error) {
        logger.error('Error updating student email:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Route to get student password by studentId
app.get('/student/:studentId/password', async (req, res) => {
    const studentId = parseInt(req.params.studentId);

    try {
        const result = await pool.query('SELECT "password" FROM "Student" WHERE "studentId" = $1', [studentId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Student not found' });
        }
        res.status(200).json({ password: result.rows[0].password });
    } catch (error) {
        logger.error('Error fetching student password:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// // Route to verify student password by studentId
// app.post('/student/:studentId/verifyPassword', async (req, res) => {
//     const studentId = parseInt(req.params.studentId);
//     const { currentPassword } = req.body;

//     try {
//         const result = await pool.query('SELECT "password" FROM "Student" WHERE "studentId" = $1', [studentId]);
//         if (result.rows.length === 0) {
//             return res.status(404).json({ message: 'Student not found' });
//         }

//         bcrypt.compare.mockResolvedValue(currentPassword === 'correctPassword');
//         const isMatch = await bcrypt.compare(currentPassword, result.rows[0].password);
//         if (isMatch) {
//             res.status(200).json({ success: true });
//         } else {
//             res.status(401).json({ success: false, message: 'Incorrect password' });
//         }
//     } catch (error) {
//         logger.error('Error verifying password:', error);
//         res.status(500).json({ message: 'Internal server error' });
//     }
// });

// Route to set student password by studentId
// app.put('/student/:studentId/password', async (req, res) => {
//     const studentId = parseInt(req.params.studentId);
//     const { password } = req.body;
//     const hashedPassword = await bcrypt.hash(password, 10);

//     try {
//         await pool.query('UPDATE "Student" SET "password" = $1 WHERE "studentId" = $2', [hashedPassword, studentId]);
//         res.status(200).json({ message: 'Password updated successfully' });
//     } catch (error) {
//         logger.error('Error updating student password:', error);
//         res.status(500).json({ message: 'Internal server error' });
//     }
// });

// Forgot password route
// app.post('/stu/forgotpassword', async (req, res) => {
//     const { email } = req.body;
//     const token = cryptoRandomString({ length: 20, type: 'url-safe' });
  
//     try {
//       const result = await pool.query('SELECT * FROM "Student" WHERE email = $1', [email]);
//       if (result.rows.length === 0) {
//         return res.status(404).json({ message: 'No account with that email found' });
//       }
  
//       const student = result.rows[0];
//       const tokenExpiration = new Date(Date.now() + 3600000); // 1 hour
  
//       await pool.query('UPDATE "Student" SET "resetPasswordToken" = $1, "resetPasswordExpires" = $2 WHERE "studentId" = $3', [token, tokenExpiration, student.studentId]);
  
//       await sendMail(student.email, 'AIvaluate Password Reset', `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
//                Please click on the following link, or paste this into your browser to complete the process within one hour of receiving it:\n\n
//                http://localhost:5173/resetpassword/${token}\n\n
//                If you did not request this, please ignore this email and your password will remain unchanged.\n`);
//       res.status(200).json({ message: 'Recovery email sent' });
//     } catch (error) {
//       logger.error('Error during forgot password process:', error);
//       res.status(500).json({ message: 'Server error' });
//     }
// });

app.get('/students/display/:courseId', async (req, res) => {
    const { courseId } = req.params;

    try {
        const query = `
            SELECT s."firstName", s."lastName"
            FROM "Student" s
            JOIN "EnrolledIn" e ON s."studentId" = e."studentId"
            WHERE e."courseId" = $1
        `;
        const result = await pool.query(query, [courseId]);

        res.json(result.rows);
    } catch (err) {
        logger.error('Error fetching students:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

app.get('/stu/submissions/:courseId/:studentId', async (req, res) => {
    const { studentId, courseId } = req.params;

    try {
        const query = `
            SELECT s."assignmentSubmissionId", s."assignmentId", s."submittedAt", s."submissionFile", s."isSubmitted", s."updatedAt", s."isGraded",
                   a."assignmentKey", a."assignmentDescription"
            FROM "AssignmentSubmission" s
            JOIN "Assignment" a ON s."assignmentId" = a."assignmentId"
            WHERE s."studentId" = $2 AND s."courseId" = $1
        `;
        const result = await pool.query(query, [courseId, studentId]);

        if (result.rows.length === 0) {
            return res.status(404).send({ message: 'No submissions found for the given studentId and courseId' });
        }
        res.status(200).json(result.rows);
    } catch (error) {
        logger.error('Error fetching submissions:', error);
        res.status(500).send({ message: 'Error fetching submissions' });
    }
});

// Tests for Student Routes
describe('Student Routes', () => {
    describe('GET /student/me', () => {
        it('should return the current student ID if authenticated', async () => {
            const response = await request(app).get('/student/me');

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ studentId: '1' });
        });

        
    });

    describe('GET /student/:studentId/firstName', () => {
        it('should fetch student first name successfully', async () => {
            const mockStudent = {
                firstName: 'John'
            };
            pool.query.mockResolvedValue({ rows: [mockStudent], rowCount: 1 });

            const response = await request(app).get('/student/1/firstName');

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ firstName: 'John' });
        });

        it('should return 404 if the student is not found', async () => {
            pool.query.mockResolvedValue({ rows: [], rowCount: 0 });

            const response = await request(app).get('/student/1/firstName');

            expect(response.status).toBe(404);
            expect(response.body).toEqual({ message: 'Student not found' });
        });

        it('should handle database errors', async () => {
            pool.query.mockRejectedValue(new Error('Database error'));

            const response = await request(app).get('/student/1/firstName');

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ message: 'Internal server error' });
        });
    });
});

describe('Student Routes', () => {
    describe('PUT /student/:studentId/firstName', () => {
        it('should successfully update student first name', async () => {
            pool.query.mockResolvedValueOnce({ rowCount: 1 });

            const response = await request(app).put('/student/1/firstName').send({ firstName: 'Jane' });
            expect(response.status).toBe(200);
            expect(response.body).toEqual({ message: 'First name updated successfully' });
        });

        it('should return 404 if the student is not found', async () => {
            pool.query.mockResolvedValueOnce({ rowCount: 0 });

            const response = await request(app).put('/student/1/firstName').send({ firstName: 'Jane' });
            expect(response.status).toBe(404);
            expect(response.body).toEqual({ message: 'Student not found' });
        });

        it('should handle database errors', async () => {
            pool.query.mockRejectedValue(new Error('Database error'));

            const response = await request(app).put('/student/1/firstName').send({ firstName: 'Jane' });

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ message: 'Internal server error' });
        });
    });

    describe('Student Routes', () => {
        describe('GET /student/:studentId/lastName', () => {
            it('should fetch student last name successfully', async () => {
                const mockStudent = { lastName: 'Doe' };
                pool.query.mockResolvedValue({ rows: [mockStudent], rowCount: 1 });
    
                const response = await request(app).get('/student/1/lastName');
    
                expect(response.status).toBe(200);
                expect(response.body).toEqual({ lastName: 'Doe' });
            });
    
            it('should return 404 if the student is not found', async () => {
                pool.query.mockResolvedValue({ rows: [], rowCount: 0 });
    
                const response = await request(app).get('/student/1/lastName');
    
                expect(response.status).toBe(404);
                expect(response.body).toEqual({ message: 'Student not found' });
            });
    
            it('should handle database errors', async () => {
                pool.query.mockRejectedValue(new Error('Database error'));
    
                const response = await request(app).get('/student/1/lastName');
    
                expect(response.status).toBe(500);
                expect(response.body).toEqual({ message: 'Internal server error' });
            });
        });
    });

    // Tests for Student Email Routes
describe('Student Email Routes', () => {
    describe('GET /student/:studentId/email', () => {
        it('should fetch student email successfully', async () => {
            const mockStudent = { email: 'john.doe@example.com' };
            pool.query.mockResolvedValue({ rows: [mockStudent], rowCount: 1 });

            const response = await request(app).get('/student/1/email');

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ email: 'john.doe@example.com' });
        });

        it('should return 404 if the student is not found', async () => {
            pool.query.mockResolvedValue({ rows: [], rowCount: 0 });

            const response = await request(app).get('/student/1/email');

            expect(response.status).toBe(404);
            expect(response.body).toEqual({ message: 'Student not found' });
        });

        it('should handle database errors', async () => {
            pool.query.mockRejectedValue(new Error('Database error'));

            const response = await request(app).get('/student/1/email');

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ message: 'Internal server error' });
        });
    });

    describe('PUT /student/:studentId/email', () => {
        it('should update student email successfully', async () => {
            pool.query.mockResolvedValue({ rowCount: 1 });

            const response = await request(app).put('/student/1/email').send({ email: 'new.john.doe@example.com' });

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ message: 'Email updated successfully' });
        });

        it('should handle database errors during update', async () => {
            pool.query.mockRejectedValue(new Error('Database error'));

            const response = await request(app).put('/student/1/email').send({ email: 'new.john.doe@example.com' });

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ message: 'Internal server error' });
        });
    });
});

// Tests for Student Password Routes
describe('Student Password Routes', () => {
    describe('GET /student/:studentId/password', () => {
        it('should fetch student password successfully', async () => {
            const mockPassword = { password: 'hashedpassword' };
            pool.query.mockResolvedValue({ rows: [mockPassword], rowCount: 1 });

            const response = await request(app).get('/student/1/password');

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ password: 'hashedpassword' });
        });

        it('should return 404 if the student is not found', async () => {
            pool.query.mockResolvedValue({ rows: [], rowCount: 0 });

            const response = await request(app).get('/student/1/password');

            expect(response.status).toBe(404);
            expect(response.body).toEqual({ message: 'Student not found' });
        });

        it('should handle database errors', async () => {
            pool.query.mockRejectedValue(new Error('Database error'));

            const response = await request(app).get('/student/1/password');

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ message: 'Internal server error' });
        });
    });

//     describe('POST /student/:studentId/verifyPassword', () => {
//         it('should verify student password successfully', async () => {
//             const mockPassword = { password: 'hashedpassword' };
//             pool.query.mockResolvedValue({ rows: [mockPassword], rowCount: 1 });
//             bcrypt.compare.mockResolvedValue(true);

//             const response = await request(app).post('/student/1/verifyPassword').send({ currentPassword: 'correctPassword' });

//             expect(response.status).toBe(200);
//             expect(response.body).toEqual({ success: true });
//         });

//         it('should return 401 for incorrect password', async () => {
//             const mockPassword = { password: 'hashedpassword' };
//             pool.query.mockResolvedValue({ rows: [mockPassword], rowCount: 1 });
//             bcrypt.compare.mockResolvedValue(false);

//             const response = await request(app).post('/student/1/verifyPassword').send({ currentPassword: 'wrongPassword' });

//             expect(response.status).toBe(401);
//             expect(response.body).toEqual({ success: false, message: 'Incorrect password' });
//         });

//         it('should handle database errors during verification', async () => {
//             pool.query.mockRejectedValue(new Error('Database error'));

//             const response = await request(app).post('/student/1/verifyPassword').send({ currentPassword: 'anyPassword' });

//             expect(response.status).toBe(500);
//             expect(response.body).toEqual({ message: 'Internal server error' });
//         });
//     });


// describe('PUT /student/:studentId/password', () => {
//     it('should successfully update student password', async () => {
//         bcrypt.hash.mockResolvedValue('hashednewpassword');
//         pool.query.mockResolvedValue({ rowCount: 1 });

//         const response = await request(app).put('/student/1/password').send({ password: 'newpassword' });

//         expect(response.status).toBe(200);
//         expect(response.body).toEqual({ message: 'Password updated successfully' });
//     });

//     it('should handle database errors during update', async () => {
//         bcrypt.hash.mockResolvedValue('hashednewpassword');
//         pool.query.mockRejectedValue(new Error('Database error'));

//         const response = await request(app).put('/student/1/password').send({ password: 'newpassword' });

//         expect(response.status).toBe(500);
//         expect(response.body).toEqual({ message: 'Internal server error' });
//     });
// });

// // Tests for Forgot Password Route
// describe('POST /stu/forgotpassword', () => {
//     it('should send a recovery email if the email exists', async () => {
//         pool.query.mockResolvedValueOnce({ rows: [{ studentId: '1', email: 'test@example.com' }], rowCount: 1 });
//         cryptoRandomString.mockReturnValue('random-token-1234');
//         const sendMailMock = jest.spyOn(nodemailer, 'sendMail').mockResolvedValue(true);

//         const response = await request(app).post('/stu/forgotpassword').send({ email: 'test@example.com' });

//         expect(response.status).toBe(200);
//         expect(response.body).toEqual({ message: 'Recovery email sent' });
//         expect(sendMailMock).toHaveBeenCalled();
//     });

//     it('should return 404 if no account is found with the email', async () => {
//         pool.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });

//         const response = await request(app).post('/stu/forgotpassword').send({ email: 'nonexistent@example.com' });

//         expect(response.status).toBe(404);
//         expect(response.body).toEqual({ message: 'No account with that email found' });
//     });

//     it('should handle errors during the process', async () => {
//         pool.query.mockRejectedValue(new Error('Database error'));

//         const response = await request(app).post('/stu/forgotpassword').send({ email: 'error@example.com' });

//         expect(response.status).toBe(500);
//         expect(response.body).toEqual({ message: 'Server error' });
//     });
 });



describe('GET /students/display/:courseId', () => {
    it('should fetch all students enrolled in a specified course', async () => {
        const mockStudents = [
            { firstName: 'John', lastName: 'Doe' },
            { firstName: 'Jane', lastName: 'Smith' }
        ];

        pool.query.mockResolvedValue({ rows: mockStudents });

        const courseId = '101';
        const response = await request(app).get(`/students/display/${courseId}`);

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockStudents);
    });

    it('should handle database errors', async () => {
        pool.query.mockRejectedValue(new Error('Database error'));

        const courseId = '101';
        const response = await request(app).get(`/students/display/${courseId}`);

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ error: 'Database error' });
    });
});
describe('GET /stu/submissions/:courseId/:studentId', () => {
    it('should fetch all submissions for a student in a course', async () => {
        const mockSubmissions = [
            { assignmentSubmissionId: 1, assignmentId: 10, submittedAt: '2021-09-15', submissionFile: 'url_to_file', isSubmitted: true, updatedAt: '2021-09-15', isGraded: true, assignmentKey: 'assignment-001', assignmentDescription: 'First assignment' }
        ];

        pool.query.mockResolvedValue({ rows: mockSubmissions });

        const courseId = '100';
        const studentId = '1';
        const response = await request(app).get(`/stu/submissions/${courseId}/${studentId}`);

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockSubmissions);
    });

    it('should handle the case when no submissions are found', async () => {
        pool.query.mockResolvedValue({ rows: [] });

        const courseId = '100';
        const studentId = '1';
        const response = await request(app).get(`/stu/submissions/${courseId}/${studentId}`);

        expect(response.status).toBe(404);
        expect(response.body).toEqual({ message: 'No submissions found for the given studentId and courseId' });
    });

    it('should handle database errors', async () => {
        pool.query.mockRejectedValue(new Error('Database error'));

        const courseId = '100';
        const studentId = '1';
        const response = await request(app).get(`/stu/submissions/${courseId}/${studentId}`);

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ message: 'Error fetching submissions' });
    });
});


});


module.exports = app; // Exporting for testing purposes
