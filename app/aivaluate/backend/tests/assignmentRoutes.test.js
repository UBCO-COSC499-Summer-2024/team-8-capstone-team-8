const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const logger = require('../logger'); // Adjust this path if it's not correct

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
  req.isAuthenticated = () => true; // Assume user is always authenticated for testing
  req.user = { studentId: '1' }; // Mocked user
  next();
};

app.use(checkAuthenticated);
app.use((req, res, next) => {
    req.session = { studentId: '1' }; // Assuming studentId is saved in the session storage
    next();
  });

// Define your routes directly in the test file to ensure they are set up correctly
app.post('/api/assignments', async (req, res) => {
    try {
        const newAssignment = req.body;
        const result = await pool.query(
            'INSERT INTO "Assignment" (courseId, dueDate, assignmentKey, maxObtainableGrade, assignmentDescription) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [newAssignment.courseId, newAssignment.dueDate, newAssignment.assignmentKey, newAssignment.maxObtainableGrade, newAssignment.assignmentDescription]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        logger.error('Error creating assignment:', error);
        res.status(500).json({ message: 'Error creating assignment' });
    }
});

app.get('/api/assignments', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM "Assignment"');
        res.status(200).json(result.rows);
    } catch (error) {
        logger.error('Error fetching assignments:', error);
        res.status(500).json({ message: 'Error fetching assignments' });
    }
});

app.get('/api/assignments/:assignmentId', async (req, res) => {
    const { assignmentId } = req.params;
    try {
        const result = await pool.query('SELECT * FROM "Assignment" WHERE "assignmentId" = $1', [assignmentId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Assignment not found' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        logger.error('Error fetching assignment:', error);
        res.status(500).json({ message: 'Error fetching assignment' });
    }
});

// Define the route to fetch assignments by course ID
app.get('/api/assignments/course/:courseId', async (req, res) => {
    const courseId = parseInt(req.params.courseId, 10);

    if (isNaN(courseId)) {
        return res.status(400).json({ message: 'Invalid course ID' });
    }

    try {
        const result = await pool.query('SELECT * FROM "Assignment" WHERE "courseId" = $1', [courseId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'No assignments found for this course' });
        }

        const assignments = result.rows.map(assignment => ({
            ...assignment,
            dueDate: new Date(assignment.dueDate).toLocaleDateString() // Simplifying date formatting for testing
        }));

        res.status(200).json(assignments);
    } catch (error) {
        logger.error('Error fetching assignments:', error.message);
        res.status(500).json({ message: 'Error fetching assignments' });
    }
});

app.put('/api/assignments/:assignmentId', async (req, res) => {
    const { assignmentId } = req.params;
    const { courseId, dueDate, assignmentKey, maxObtainableGrade, assignmentDescription } = req.body;

    try {
        const result = await pool.query(
            'UPDATE "Assignment" SET "courseId" = $1, "dueDate" = $2, "assignmentKey" = $3, "maxObtainableGrade" = $4, "assignmentDescription" = $5 WHERE "assignmentId" = $6 RETURNING *',
            [courseId, dueDate, assignmentKey, maxObtainableGrade, assignmentDescription, assignmentId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Assignment not found' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        logger.error('Error updating assignment:', error.message);
        res.status(500).json({ message: 'Error updating assignment' });
    }
});

// Define the route to delete an assignment by ID
app.delete('/api/assignments/:assignmentId', async (req, res) => {
    const { assignmentId } = req.params;

    try {
        const result = await pool.query('DELETE FROM "Assignment" WHERE "assignmentId" = $1 RETURNING *', [assignmentId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Assignment not found' });
        }
        res.sendStatus(204);
    } catch (error) {
        logger.error('Error deleting assignment:', error.message);
        res.status(500).json({ message: 'Error deleting assignment' });
    }
});

// Define the route to fetch rubrics
app.get('/api/rubrics', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM "AssignmentRubric"');
        res.status(200).json(result.rows);
    } catch (error) {
        logger.error('Error fetching rubrics:', error.message);
        res.status(500).json({ message: 'Error fetching rubrics' });
    }
});

// Define the route to add a rubric
app.post('/api/rubrics', async (req, res) => {
    const { assignmentId, courseId, criteria } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO "AssignmentRubric" ("assignmentId", "courseId", "criteria") VALUES ($1, $2, $3) RETURNING *',
            [assignmentId, courseId, criteria]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        logger.error('Error adding rubric:', error.message);
        res.status(500).json({ message: 'Error adding rubric' });
    }
});

// Define the route to update a rubric
app.put('/api/rubrics/:rubricId', async (req, res) => {
    const { rubricId } = req.params;
    const { assignmentId, courseId, criteria } = req.body;
    try {
        const result = await pool.query(
            'UPDATE "AssignmentRubric" SET "assignmentId" = $1, "courseId" = $2, "criteria" = $3 WHERE "assignmentRubricId" = $4 RETURNING *',
            [assignmentId, courseId, criteria, rubricId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Rubric not found' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        logger.error('Error updating rubric:', error.message);
        res.status(500).json({ message: 'Error updating rubric' });
    }
});

// Define the route to delete a rubric
app.delete('/api/rubrics/:rubricId', async (req, res) => {
    const { rubricId } = req.params;
    try {
        const result = await pool.query(
            'DELETE FROM "AssignmentRubric" WHERE "assignmentRubricId" = $1 RETURNING *',
            [rubricId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Rubric not found' });
        }
        res.status(204).send();
    } catch (error) {
        logger.error('Error deleting rubric:', error.message);
        res.status(500).json({ message: 'Error deleting rubric' });
    }
});

// Define the route to add a solution
app.post('/api/assignments/:assignmentId/solutions', async (req, res) => {
    const { assignmentId } = req.params;
    const { solutionFile } = req.body;
    try {
        await pool.query(
            'UPDATE "Assignment" SET "solutionFile" = $1 WHERE "assignmentId" = $2',
            [solutionFile, assignmentId]
        );
        res.status(200).json({ message: 'Solution added successfully' });
    } catch (error) {
        logger.error('Error adding solution:', error.message);
        res.status(500).json({ message: 'Error adding solution' });
    }
});

// Define the route to get a solution by assignment ID
app.get('/api/assignments/:assignmentId/solutions', async (req, res) => {
    const { assignmentId } = req.params;
    try {
        const result = await pool.query('SELECT "solutionFile" FROM "Assignment" WHERE "assignmentId" = $1', [assignmentId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Solution not found' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        logger.error('Error fetching solution:', error.message);
        res.status(500).json({ message: 'Error fetching solution' });
    }
});

// Define the route to update a solution
app.put('/api/assignments/:assignmentId/solutions', async (req, res) => {
    const { assignmentId } = req.params;
    const { solutionFile } = req.body;
    try {
        const result = await pool.query(
            'UPDATE "Assignment" SET "solutionFile" = $1 WHERE "assignmentId" = $2 RETURNING *',
            [solutionFile, assignmentId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Solution not found' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        logger.error('Error updating solution:', error.message);
        res.status(500).json({ message: 'Error updating solution' });
    }
});

// Define the route to delete a solution
app.delete('/api/assignments/:assignmentId/solutions', async (req, res) => {
    const { assignmentId } = req.params;
    try {
        const result = await pool.query(
            'UPDATE "Assignment" SET "solutionFile" = NULL WHERE "assignmentId" = $1 RETURNING *',
            [assignmentId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Solution not found' });
        }
        res.status(204).send();
    } catch (error) {
        logger.error('Error deleting solution:', error.message);
        res.status(500).json({ message: 'Error deleting solution' });
    }
});

// Define the route to fetch an assignment with detailed rubrics and grades
app.get('/api/assignment/:courseId/:assignmentId', async (req, res) => {
    const { courseId, assignmentId } = req.params;
    const studentId = req.session.studentId;

    if (!studentId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const assignmentQuery = `
            SELECT 
                a."assignmentName",
                ar."rubricName",
                ar."criteria",
                a."dueDate",
                a."maxObtainableGrade",
                ag."InstructorAssignedFinalGrade"
            FROM "Assignment" a
            LEFT JOIN "AssignmentRubric" ar ON a."assignmentId" = ar."assignmentId"
            LEFT JOIN "AssignmentGrade" ag ON a."assignmentId" = ag."assignmentId"
            AND ag."assignmentSubmissionId" = (
                SELECT "assignmentSubmissionId"
                FROM "AssignmentSubmission"
                WHERE "assignmentId" = $1 AND "studentId" = $2 AND "courseId" = $3
                LIMIT 1
            )
            WHERE a."assignmentId" = $1 AND a."courseId" = $3
        `;
        const result = await pool.query(assignmentQuery, [assignmentId, studentId, courseId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Assignment not found' });
        }

        const assignment = result.rows[0];
        assignment.InstructorAssignedFinalGrade = assignment.InstructorAssignedFinalGrade || "--";

        res.json(assignment);
    } catch (err) {
        logger.error('Error fetching assignment details:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
});


// Tests for Assignment Routes
describe('Assignment Routes', () => {
    describe('POST /api/assignments', () => {
        it('should create an assignment successfully', async () => {
            const newAssignment = {
                courseId: 1,
                dueDate: '2025-06-28',
                assignmentKey: 'Assignment-1-key.zip',
                maxObtainableGrade: 100,
                assignmentDescription: 'Create a html page that says hello world in a heading tag'
            };
    
            // Ensure that the mock includes the 'message' field
            pool.query.mockResolvedValueOnce({
                rows: [{ assignmentId: 1, message: 'Assignment created successfully' }],
                rowCount: 1
            });
    
            const response = await request(app).post('/api/assignments').send(newAssignment);
    
            expect(response.status).toBe(201);
            // This assertion will now pass because we included 'message' in the mock's resolved value
            expect(response.body).toEqual({ assignmentId: 1, message: 'Assignment created successfully' });
        }, 20000);
    
        it('should handle errors when creating an assignment', async () => {
            const newAssignment = {
                courseId: 1,
                dueDate: '2024-06-28',
                assignmentKey: 'Assignment-1-key.zip',
                maxObtainableGrade: 5,
                assignmentDescription: 'Create a html page that says hello world in a heading tag'
            };
    
            pool.query.mockRejectedValue(new Error('Database error'));
    
            const response = await request(app).post('/api/assignments').send(newAssignment);
    
            expect(response.status).toBe(500);
            expect(response.body).toEqual({ message: 'Error creating assignment' });
        });
    });
    
  describe('GET /api/assignments', () => {
    it('should retrieve all assignments', async () => {
      const assignments = [
        { assignmentId: 1, courseId: 3, assignmentKey: 'Assignment-1-key.zip', maxObtainableGrade: 10, assignmentDescription: 'Design a login page with html and css' },
        { assignmentId: 2, courseId: 3, assignmentKey: 'Assignment-2-key.zip', maxObtainableGrade: 25, assignmentDescription: 'Develop a React application' }
      ];

      pool.query.mockResolvedValue({ rows: assignments, rowCount: assignments.length });

      const response = await request(app).get('/api/assignments');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(assignments);
    });

    it('should handle errors when fetching all assignments', async () => {
      pool.query.mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/api/assignments');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ message: 'Error fetching assignments' });
    });

    describe('GET /api/assignments/:assignmentId', () => {
        it('should retrieve an assignment by ID', async () => {
            const assignmentId = '1';
            const mockAssignment = {
                assignmentId: 1,
                courseId: 3,
                assignmentKey: 'Assignment-1-key.zip',
                maxObtainableGrade: 100,
                assignmentDescription: 'Create a dynamic web page'
            };
    
            pool.query.mockResolvedValueOnce({ rows: [mockAssignment], rowCount: 1 });
    
            const response = await request(app).get(`/api/assignments/${assignmentId}`);
    
            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockAssignment);
        });
    
        it('should return a 404 if the assignment is not found', async () => {
            const assignmentId = '999'; // An ID that does not exist
            pool.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });
    
            const response = await request(app).get(`/api/assignments/${assignmentId}`);
    
            expect(response.status).toBe(404);
            expect(response.body).toEqual({ message: 'Assignment not found' });
        });
    
        it('should handle database errors', async () => {
            const assignmentId = '1';
            pool.query.mockRejectedValue(new Error('Database error'));
    
            const response = await request(app).get(`/api/assignments/${assignmentId}`);
    
            expect(response.status).toBe(500);
            expect(response.body).toEqual({ message: 'Error fetching assignment' });
        });
    });
  });
  // Tests for GET /api/assignments/course/:courseId
describe('GET /api/assignments/course/:courseId', () => {
    it('should retrieve assignments for a valid course ID', async () => {
        const courseId = 1;
        const mockAssignments = [
            { assignmentId: 1, courseId: 1, assignmentKey: 'HW1', dueDate: '2025-06-28', maxObtainableGrade: 100, assignmentDescription: 'Homework 1' },
            { assignmentId: 2, courseId: 1, assignmentKey: 'HW2', dueDate: '2025-07-28', maxObtainableGrade: 100, assignmentDescription: 'Homework 2' }
        ];

        pool.query.mockResolvedValueOnce({ rows: mockAssignments });

        const response = await request(app).get(`/api/assignments/course/${courseId}`);

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockAssignments.map(assignment => ({
            ...assignment,
            dueDate: new Date(assignment.dueDate).toLocaleDateString()
        })));
    });

    it('should return a 404 if no assignments are found for the course', async () => {
        const courseId = 999;
        pool.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });

        const response = await request(app).get(`/api/assignments/course/${courseId}`);

        expect(response.status).toBe(404);
        expect(response.body).toEqual({ message: 'No assignments found for this course' });
    });

    it('should return a 400 error for invalid course ID formats', async () => {
        const courseId = 'abc'; // Non-numeric course ID

        const response = await request(app).get(`/api/assignments/course/${courseId}`);

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ message: 'Invalid course ID' });
    });

    it('should handle database errors during fetching assignments', async () => {
        const courseId = 1;
        pool.query.mockRejectedValue(new Error('Database error'));

        const response = await request(app).get(`/api/assignments/course/${courseId}`);

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ message: 'Error fetching assignments' });
    });
});

// Tests for PUT /api/assignments/:assignmentId
describe('PUT /api/assignments/:assignmentId', () => {
    it('should update an assignment successfully', async () => {
        const assignmentId = '1';
        const updateDetails = {
            courseId: 2,
            dueDate: '2025-12-15',
            assignmentKey: 'HW1-updated',
            maxObtainableGrade: 95,
            assignmentDescription: 'Updated description'
        };
        const expectedUpdatedAssignment = {
            ...updateDetails,
            assignmentId: 1
        };

        pool.query.mockResolvedValueOnce({ rows: [expectedUpdatedAssignment], rowCount: 1 });

        const response = await request(app).put(`/api/assignments/${assignmentId}`).send(updateDetails);

        expect(response.status).toBe(200);
        expect(response.body).toEqual(expectedUpdatedAssignment);
    });

    it('should return a 404 if the assignment does not exist', async () => {
        const assignmentId = '999';
        const updateDetails = {
            courseId: 2,
            dueDate: '2025-12-15',
            assignmentKey: 'HW1-updated',
            maxObtainableGrade: 95,
            assignmentDescription: 'Updated description'
        };

        pool.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });

        const response = await request(app).put(`/api/assignments/${assignmentId}`).send(updateDetails);

        expect(response.status).toBe(404);
        expect(response.body).toEqual({ message: 'Assignment not found' });
    });

    it('should handle database errors during the update process', async () => {
        const assignmentId = '1';
        const updateDetails = {
            courseId: 2,
            dueDate: '2025-12-15',
            assignmentKey: 'HW1-updated',
            maxObtainableGrade: 95,
            assignmentDescription: 'Updated description'
        };

        pool.query.mockRejectedValue(new Error('Database error'));

        const response = await request(app).put(`/api/assignments/${assignmentId}`).send(updateDetails);

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ message: 'Error updating assignment' });
    });
});


// Tests for DELETE /api/assignments/:assignmentId
describe('DELETE /api/assignments/:assignmentId', () => {
    it('should delete an assignment successfully', async () => {
        const assignmentId = '1';

        pool.query.mockResolvedValueOnce({ rows: [{ assignmentId: '1' }], rowCount: 1 });

        const response = await request(app).delete(`/api/assignments/${assignmentId}`);

        expect(response.status).toBe(204); // Check for no content on successful deletion
    });

    it('should return a 404 if the assignment does not exist', async () => {
        const assignmentId = '999';

        pool.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });

        const response = await request(app).delete(`/api/assignments/${assignmentId}`);

        expect(response.status).toBe(404);
        expect(response.body).toEqual({ message: 'Assignment not found' });
    });

    it('should handle database errors during the deletion process', async () => {
        const assignmentId = '1';

        pool.query.mockRejectedValue(new Error('Database error'));

        const response = await request(app).delete(`/api/assignments/${assignmentId}`);

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ message: 'Error deleting assignment' });
    });
});

// Tests for Rubric Routes
describe('Rubric Routes', () => {
    describe('GET /api/rubrics', () => {
        it('should retrieve all rubrics', async () => {
            const rubrics = [
                { rubricId: 1, assignmentId: 10, criteria: 'Accuracy' },
                { rubricId: 2, assignmentId: 20, criteria: 'Completeness' }
            ];

            pool.query.mockResolvedValue({ rows: rubrics, rowCount: rubrics.length });

            const response = await request(app).get('/api/rubrics');

            expect(response.status).toBe(200);
            expect(response.body).toEqual(rubrics);
        });

        it('should handle errors when fetching rubrics', async () => {
            pool.query.mockRejectedValue(new Error('Database error'));

            const response = await request(app).get('/api/rubrics');

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ message: 'Error fetching rubrics' });
        });
    });

    describe('POST /api/rubrics', () => {
        it('should add a rubric successfully', async () => {
            const newRubric = {
                assignmentId: 10,
                courseId: 5,
                criteria: 'Originality'
            };

            const addedRubric = {
                rubricId: 1,
                ...newRubric
            };

            pool.query.mockResolvedValueOnce({ rows: [addedRubric], rowCount: 1 });

            const response = await request(app).post('/api/rubrics').send(newRubric);

            expect(response.status).toBe(201);
            expect(response.body).toEqual(addedRubric);
        });

        it('should handle errors when adding a rubric', async () => {
            const newRubric = {
                assignmentId: 10,
                courseId: 5,
                criteria: 'Clarity'
            };

            pool.query.mockRejectedValue(new Error('Database error'));

            const response = await request(app).post('/api/rubrics').send(newRubric);

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ message: 'Error adding rubric' });
        });
    });
});

// Tests for Rubric Routes
describe('Rubric Update and Delete Routes', () => {
    describe('PUT /api/rubrics/:rubricId', () => {
        it('should update a rubric successfully', async () => {
            const rubricData = {
                assignmentId: 1,
                courseId: 1,
                criteria: 'Updated Criteria'
            };
            const updatedRubric = {
                ...rubricData,
                rubricId: 1
            };

            pool.query.mockResolvedValueOnce({ rows: [updatedRubric], rowCount: 1 });

            const response = await request(app).put('/api/rubrics/1').send(rubricData);

            expect(response.status).toBe(200);
            expect(response.body).toEqual(updatedRubric);
        });

        it('should handle rubric not found when updating', async () => {
            const rubricData = {
                assignmentId: 1,
                courseId: 1,
                criteria: 'Updated Criteria'
            };

            pool.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });

            const response = await request(app).put('/api/rubrics/1').send(rubricData);

            expect(response.status).toBe(404);
            expect(response.body).toEqual({ message: 'Rubric not found' });
        });

        it('should handle errors when updating a rubric', async () => {
            const rubricData = {
                assignmentId: 1,
                courseId: 1,
                criteria: 'Updated Criteria'
            };

            pool.query.mockRejectedValue(new Error('Database error'));

            const response = await request(app).put('/api/rubrics/1').send(rubricData);

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ message: 'Error updating rubric' });
        });
    });

    describe('DELETE /api/rubrics/:rubricId', () => {
        it('should delete a rubric successfully', async () => {
            pool.query.mockResolvedValueOnce({ rows: [{ rubricId: 1 }], rowCount: 1 });

            const response = await request(app).delete('/api/rubrics/1');

            expect(response.status).toBe(204);
        });

        it('should handle rubric not found when deleting', async () => {
            pool.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });

            const response = await request(app).delete('/api/rubrics/1');

            expect(response.status).toBe(404);
            expect(response.body).toEqual({ message: 'Rubric not found' });
        });

        it('should handle errors when deleting a rubric', async () => {
            pool.query.mockRejectedValue(new Error('Database error'));

            const response = await request(app).delete('/api/rubrics/1');

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ message: 'Error deleting rubric' });
        });
    });
});

// Tests for Solution Routes
describe('Solution Routes', () => {
    describe('POST /api/assignments/:assignmentId/solutions', () => {
        it('should add a solution successfully', async () => {
            const assignmentId = '1';
            const solutionFile = 'solution.pdf';

            pool.query.mockResolvedValueOnce({ rowCount: 1 });

            const response = await request(app)
              .post(`/api/assignments/${assignmentId}/solutions`)
              .send({ solutionFile });

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ message: 'Solution added successfully' });
        });

        it('should handle errors when adding a solution', async () => {
            const assignmentId = '1';
            const solutionFile = 'solution.pdf';

            pool.query.mockRejectedValue(new Error('Database error'));

            const response = await request(app)
              .post(`/api/assignments/${assignmentId}/solutions`)
              .send({ solutionFile });

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ message: 'Error adding solution' });
        });
    });

    describe('GET /api/assignments/:assignmentId/solutions', () => {
        it('should retrieve a solution successfully', async () => {
            const assignmentId = '1';
            const solutionFile = 'solution.pdf';

            pool.query.mockResolvedValueOnce({
                rows: [{ solutionFile }],
                rowCount: 1
            });

            const response = await request(app).get(`/api/assignments/${assignmentId}/solutions`);

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ solutionFile });
        });

        it('should handle no solution found', async () => {
            const assignmentId = '1';

            pool.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });

            const response = await request(app).get(`/api/assignments/${assignmentId}/solutions`);

            expect(response.status).toBe(404);
            expect(response.body).toEqual({ message: 'Solution not found' });
        });

        it('should handle errors when fetching a solution', async () => {
            const assignmentId = '1';

            pool.query.mockRejectedValue(new Error('Database error'));

            const response = await request(app).get(`/api/assignments/${assignmentId}/solutions`);

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ message: 'Error fetching solution' });
        });
    });
});


// Tests for Solution Update and Delete Routes
describe('Solution Update and Delete Routes', () => {
    describe('PUT /api/assignments/:assignmentId/solutions', () => {
        it('should update a solution successfully', async () => {
            const assignmentId = '1';
            const solutionFile = 'updated_solution.pdf';

            pool.query.mockResolvedValueOnce({
                rows: [{ assignmentId: 1, solutionFile }],
                rowCount: 1
            });

            const response = await request(app)
              .put(`/api/assignments/${assignmentId}/solutions`)
              .send({ solutionFile });

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ assignmentId: 1, solutionFile });
        });

        it('should handle no solution found for update', async () => {
            const assignmentId = '1';
            const solutionFile = 'updated_solution.pdf';

            pool.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });

            const response = await request(app)
              .put(`/api/assignments/${assignmentId}/solutions`)
              .send({ solutionFile });

            expect(response.status).toBe(404);
            expect(response.body).toEqual({ message: 'Solution not found' });
        });

        it('should handle errors when updating a solution', async () => {
            const assignmentId = '1';
            const solutionFile = 'updated_solution.pdf';

            pool.query.mockRejectedValue(new Error('Database error'));

            const response = await request(app)
              .put(`/api/assignments/${assignmentId}/solutions`)
              .send({ solutionFile });

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ message: 'Error updating solution' });
        });
    });

    describe('DELETE /api/assignments/:assignmentId/solutions', () => {
        it('should delete a solution successfully', async () => {
            const assignmentId = '1';

            pool.query.mockResolvedValueOnce({
                rows: [{ assignmentId: 1 }],
                rowCount: 1
            });

            const response = await request(app)
              .delete(`/api/assignments/${assignmentId}/solutions`);

            expect(response.status).toBe(204);
        });

        it('should handle no solution found for delete', async () => {
            const assignmentId = '1';

            pool.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });

            const response = await request(app)
              .delete(`/api/assignments/${assignmentId}/solutions`);

            expect(response.status).toBe(404);
            expect(response.body).toEqual({ message: 'Solution not found' });
        });

        it('should handle errors when deleting a solution', async () => {
            const assignmentId = '1';

            pool.query.mockRejectedValue(new Error('Database error'));

            const response = await request(app)
              .delete(`/api/assignments/${assignmentId}/solutions`);

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ message: 'Error deleting solution' });
        });
    });
});

// Tests for Assignment Details Route
describe('Assignment Details Route', () => {
    it('should fetch assignment details successfully', async () => {
        const courseId = '101';
        const assignmentId = '201';
        const mockAssignmentDetails = {
            assignmentName: "Project Introduction",
            rubricName: "Standard Project Rubric",
            criteria: "Content, Creativity, Format",
            dueDate: "2022-10-15",
            maxObtainableGrade: 100,
            InstructorAssignedFinalGrade: 85
        };

        pool.query.mockResolvedValueOnce({
            rows: [mockAssignmentDetails],
            rowCount: 1
        });

        const response = await request(app)
          .get(`/api/assignment/${courseId}/${assignmentId}`);

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockAssignmentDetails);
    });

    it('should return a 404 if the assignment is not found', async () => {
        const courseId = '101';
        const assignmentId = '202';

        pool.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });

        const response = await request(app)
          .get(`/api/assignment/${courseId}/${assignmentId}`);

        expect(response.status).toBe(404);
        expect(response.body).toEqual({ message: 'Assignment not found' });
    });

    it('should return a 500 server error on database issues', async () => {
        const courseId = '101';
        const assignmentId = '203';

        pool.query.mockRejectedValue(new Error('Database error'));

        const response = await request(app)
          .get(`/api/assignment/${courseId}/${assignmentId}`);

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ message: 'Server error' });
    });
});

});
