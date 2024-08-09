const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const logger = require('../evallogger'); // Adjust this path if it's not correct

// Mock the pg module correctly
jest.mock('pg', () => ({
    Pool: jest.fn(() => ({
        query: jest.fn().mockImplementation((query) => {
            if (query.includes('BEGIN')) return Promise.resolve();
            if (query.includes('COMMIT')) return Promise.resolve();
            if (query.includes('ROLLBACK')) return Promise.resolve();
            if (query.includes('INSERT INTO "Assignment"')) return Promise.resolve({ rows: [{ assignmentId: 1 }] });
            if (query.includes('INSERT INTO "AssignmentRubric"')) return Promise.resolve({ rows: [{ assignmentRubricId: 1 }] });
            if (query.includes('INSERT INTO "useRubric"')) return Promise.resolve();
        })
    }))
}));

const pool = new Pool();

const app = express();
app.use(bodyParser.json());

// Define the route to create an assignment and its rubric
app.post('/assignments', async (req, res) => {
    const { courseId, dueDate, assignmentName, maxObtainableGrade, rubricName, criteria, assignmentKey } = req.body;

    try {
        // Begin transaction
        await pool.query('BEGIN');
 
        // Insert the new assignment
        const assignmentResult = await pool.query(
            'INSERT INTO "Assignment" ("courseId", "dueDate", "assignmentName", "maxObtainableGrade", "assignmentKey") VALUES ($1, $2, $3, $4, $5) RETURNING "assignmentId"',
            [courseId, dueDate, assignmentName, maxObtainableGrade, assignmentKey]
        );

        const assignmentId = assignmentResult.rows[0].assignmentId;

        // Insert the corresponding rubric
        const rubricResult = await pool.query(
            'INSERT INTO "AssignmentRubric" ("rubricName", "criteria", "courseId") VALUES ($1, $2, $3) RETURNING "assignmentRubricId"',
            [rubricName, criteria, courseId]
        );

        const assignmentRubricId = rubricResult.rows[0].assignmentRubricId;

        // Insert into useRubric table
        await pool.query(
            'INSERT INTO "useRubric" ("assignmentId", "assignmentRubricId") VALUES ($1, $2)',
            [assignmentId, assignmentRubricId]
        );

        // Commit transaction
        await pool.query('COMMIT');

        res.status(201).json({ assignmentId, assignmentRubricId, message: 'Assignment and rubric created successfully' });
    } catch (error) {
        // Rollback transaction in case of error
        await pool.query('ROLLBACK');
        logger.error('Error creating assignment and rubric:', error);
        res.status(500).json({ message: 'Error creating assignment and rubric' });
    }
});


// Define the route to get all assignments
app.get('/assignments', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM "Assignment"');
        res.status(200).json(result.rows);
    } catch (error) {
        logger.error('Error fetching assignments:', error);
        res.status(500).json({ message: 'Error fetching assignments' });
    }
});

// Define the route to get all rubrics
app.get('/rubrics', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM "AssignmentRubric"');
        res.status(200).json(result.rows);
    } catch (error) {
        logger.error('Error fetching rubrics:', error);
        res.status(500).json({ message: 'Error fetching rubrics' });
    }
});

// Define the route to add a rubric
app.post('/rubrics', async (req, res) => {
    const { assignmentId, courseId, criteria } = req.body;

    try {
        const result = await pool.query(
            'INSERT INTO "AssignmentRubric" ("assignmentId", "courseId", "criteria") VALUES ($1, $2, $3) RETURNING *',
            [assignmentId, courseId, criteria]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        logger.error('Error adding rubric:', error);
        res.status(500).json({ message: 'Error adding rubric' });
    }
});

// Define the route to get a solution by assignment ID
app.get('/assignments/:assignmentId/solutions', async (req, res) => {
    const { assignmentId } = req.params;

    try {
        const result = await pool.query('SELECT "solutionFile" FROM "Assignment" WHERE "assignmentId" = $1', [assignmentId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Solution not found' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        logger.error('Error fetching solution:', error);
        res.status(500).json({ message: 'Error fetching solution' });
    }
});

// Define the route to update a solution by assignment ID
app.put('/assignments/:assignmentId/solutions', async (req, res) => {
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
        logger.error('Error updating solution:', error);
        res.status(500).json({ message: 'Error updating solution' });
    }
});


// Define the route to delete a solution by assignment ID
app.delete('/assignments/:assignmentId/solutions', async (req, res) => {
    const { assignmentId } = req.params;

    try {
        const result = await pool.query(
            'UPDATE "Assignment" SET "solutionFile" = NULL WHERE "assignmentId" = $1 RETURNING *',
            [assignmentId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Solution not found' });
        }
        res.status(204).json({ message: 'Solution deleted successfully' });
    } catch (error) {
        logger.error('Error deleting solution:', error);
        res.status(500).json({ message: 'Error deleting solution' });
    }
});


// Define the route to mark a submission as graded
app.post('/submissions/:submissionId/grade', async (req, res) => {
    const { submissionId } = req.params;

    try {
        const result = await pool.query(
            'UPDATE "AssignmentSubmission" SET "isGraded" = true WHERE "assignmentSubmissionId" = $1 RETURNING *',
            [submissionId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Submission not found' });
        }
        res.status(200).json({ message: 'Submission marked as graded', submission: result.rows[0] });
    } catch (error) {
        logger.error('Error marking submission as graded:', error);
        res.status(500).json({ message: 'Error marking submission as graded' });
    }
});

// Define the route to fetch submissions by assignment ID
app.get('/assignments/:assignmentId/submissions', async (req, res) => {
    const { assignmentId } = req.params;

    try {
        const result = await pool.query('SELECT * FROM "AssignmentSubmission" WHERE "assignmentId" = $1', [assignmentId]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'No submissions found for this assignment.' });
        }

        res.status(200).json(result.rows);
    } catch (error) {
        logger.error('Error fetching submissions:', error);
        res.status(500).send('Server error');
    }
});

// Fetch rubrics for a specific instructor
app.get('/instructors/:instructorId/rubrics', async (req, res) => {
    const { instructorId } = req.params;

    try {
        const result = await pool.query(
            'SELECT * FROM "AssignmentRubric" WHERE "instructorId" = $1',
            [instructorId]
        );
        res.status(200).json(result.rows);
    } catch (error) {
        logger.error('Error fetching rubrics:', error);
        res.status(500).json({ message: 'Error fetching rubrics' });
    }
});

// Fetch rubrics by courseId
app.get('/rubrics/:courseId', async (req, res) => {
    const { courseId } = req.params;
    try {
        const result = await pool.query(
            'SELECT * FROM "AssignmentRubric" WHERE "courseId" = $1',
            [courseId]
        );
        res.status(200).json(result.rows);
    } catch (error) {
        logger.error('Error fetching rubrics:', error);
        res.status(500).json({ message: 'Error fetching rubrics' });
    }
});

// Fetch rubrics by rubricId
app.get('/rubric/:rubricId', async (req, res) => {
    const { rubricId } = req.params;
    try {
        const result = await pool.query(
            'SELECT * FROM "AssignmentRubric" WHERE "assignmentRubricId" = $1',
            [rubricId]
        );
        res.status(200).json(result.rows);
    } catch (error) {
        logger.error('Error fetching rubric:', error);
        res.status(500).json({ message: 'Error fetching rubric' });
    }
});


// Define the route to get published assignments by course ID
app.get('/assignments/course/:courseId', async (req, res) => {
    const courseId = parseInt(req.params.courseId, 10);

    if (isNaN(courseId)) {
        return res.status(400).json({ message: 'Invalid course ID' });
    }

    try {
        const result = await pool.query('SELECT * FROM "Assignment" WHERE "courseId" = $1 AND "isPublished" = true', [courseId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'No assignments found for this course' });
        }

        const assignments = result.rows.map(assignment => ({
            ...assignment,
            dueDate: new Date(assignment.dueDate).toLocaleDateString() // Simulating formatDueDate function
        }));

        res.status(200).json(assignments);
    } catch (error) {
        logger.error('Error fetching assignments:', error);
        res.status(500).json({ message: 'Error fetching assignments' });
    }
});


// Define the route to get all assignments by course ID
app.get('/assignments/course/:courseId/all', async (req, res) => {
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
            dueDate: new Date(assignment.dueDate).toLocaleDateString() // Simulating formatDueDate function
        }));

        res.status(200).json(assignments);
    } catch (error) {
        logger.error('Error fetching assignments:', error);
        res.status(500).json({ message: 'Error fetching assignments' });
    }
});

// Define the route to count published assignments by course ID
app.get('/assignments/count/:courseId', async (req, res) => {
    const courseId = parseInt(req.params.courseId, 10);

    if (isNaN(courseId)) {
        return res.status(400).json({ message: 'Invalid course ID' });
    }

    try {
        const result = await pool.query('SELECT COUNT(*) FROM "Assignment" WHERE "courseId" = $1 AND "isPublished" = true', [courseId]);
        const totalAssignments = parseInt(result.rows[0].count, 10);
        res.status(200).json({ totalAssignments });
    } catch (error) {
        logger.error('Error fetching total assignments:', error);
        res.status(500).json({ message: 'Error fetching total assignments' });
    }
});

// Define the route to fetch an assignment by ID with rubric creation if missing
app.get('/assignments/:assignmentId', async (req, res) => {
    const { assignmentId } = req.params;

    try {
        const result = await pool.query(
            `SELECT a."assignmentName", a."dueDate", a."isPublished", ar."criteria" 
             FROM "Assignment" a 
             LEFT JOIN "useRubric" ur ON a."assignmentId" = ur."assignmentId" 
             LEFT JOIN "AssignmentRubric" ar ON ur."assignmentRubricId" = ar."assignmentRubricId" 
             WHERE a."assignmentId" = $1`,
            [assignmentId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Assignment not found' });
        }

        let assignment = result.rows[0];

        // If the assignment has no rubric, create a blank rubric
        if (!assignment.criteria) {
            const rubricResult = await pool.query(
                'INSERT INTO "AssignmentRubric" ("rubricName", "criteria", "courseId") VALUES ($1, $2, $3) RETURNING "assignmentRubricId"',
                [assignment.assignmentName, '', assignment.courseId]
            );

            const assignmentRubricId = rubricResult.rows[0].assignmentRubricId;

            // Link the new rubric to the assignment
            await pool.query(
                'INSERT INTO "useRubric" ("assignmentId", "assignmentRubricId") VALUES ($1, $2)',
                [assignmentId, assignmentRubricId]
            );

            // Fetch the updated assignment with the new rubric
            const updatedResult = await pool.query(
                `SELECT a."assignmentName", a."dueDate", a."isPublished", ar."criteria" 
                 FROM "Assignment" a 
                 JOIN "useRubric" ur ON a."assignmentId" = ur."assignmentId" 
                 JOIN "AssignmentRubric" ar ON ur."assignmentRubricId" = ar."assignmentRubricId" 
                 WHERE a."assignmentId" = $1`,
                [assignmentId]
            );

            assignment = updatedResult.rows[0];
        }

        res.status(200).json(assignment);
    } catch (error) {
        logger.error('Error fetching assignment:', error);
        res.status(500).json({ message: 'Error fetching assignment' });
    }
});

// Define the route to update an assignment by ID with rubric creation if missing
app.put('/assignments/:assignmentId', async (req, res) => {
    const { assignmentId } = req.params;
    const { assignmentName, dueDate, criteria } = req.body;

    try {
        // Begin transaction
        await pool.query('BEGIN');

        // Update the assignment
        const result = await pool.query(
            'UPDATE "Assignment" SET "assignmentName" = $1, "dueDate" = $2 WHERE "assignmentId" = $3 RETURNING *',
            [assignmentName, dueDate, assignmentId]
        );

        if (result.rows.length === 0) {
            await pool.query('ROLLBACK');
            return res.status(404).json({ message: 'Assignment not found' });
        }

        // Check if the assignment has an associated rubric
        const rubricResult = await pool.query(
            `SELECT ar."assignmentRubricId" 
             FROM "AssignmentRubric" ar 
             JOIN "useRubric" ur ON ar."assignmentRubricId" = ur."assignmentRubricId" 
             WHERE ur."assignmentId" = $1`,
            [assignmentId]
        );

        let assignmentRubricId;

        if (rubricResult.rows.length === 0) {
            // If no rubric is associated, create a blank rubric
            const newRubricResult = await pool.query(
                'INSERT INTO "AssignmentRubric" ("rubricName", "criteria", "courseId") VALUES ($1, $2, $3) RETURNING "assignmentRubricId"',
                [assignmentName, criteria, result.rows[0].courseId]
            );
            assignmentRubricId = newRubricResult.rows[0].assignmentRubricId;

            // Link the new rubric to the assignment
            await pool.query(
                'INSERT INTO "useRubric" ("assignmentId", "assignmentRubricId") VALUES ($1, $2)',
                [assignmentId, assignmentRubricId]
            );
        } else {
            // Update the existing rubric
            assignmentRubricId = rubricResult.rows[0].assignmentRubricId;
            await pool.query(
                'UPDATE "AssignmentRubric" SET "criteria" = $1 WHERE "assignmentRubricId" = $2',
                [criteria, assignmentRubricId]
            );
        }

        // Commit transaction
        await pool.query('COMMIT');

        res.status(200).json(result.rows[0]);
    } catch (error) {
        await pool.query('ROLLBACK');
        logger.error('Error updating assignment:', error);
        res.status(500).json({ message: 'Error updating assignment' });
    }
});

app.put('/assignments/:assignmentId/toggle-publish', async (req, res) => {
    const { assignmentId } = req.params;

    try {
        // Fetch the current isPublished status
        const result = await pool.query(
            'SELECT "isPublished" FROM "Assignment" WHERE "assignmentId" = $1',
            [assignmentId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Assignment not found' });
        }

        const currentStatus = result.rows[0].isPublished;

        // Toggle the isPublished status
        const updatedResult = await pool.query(
            'UPDATE "Assignment" SET "isPublished" = $1 WHERE "assignmentId" = $2 RETURNING *',
            [!currentStatus, assignmentId]
        );

        res.status(200).json({ message: 'Assignment publish status updated successfully', assignment: updatedResult.rows[0] });
    } catch (error) {
        logger.error('Error toggling publish status:', error);
        res.status(500).json({ message: 'Error toggling publish status' });
    }
});


app.get('/assignments/:assignmentId/isPublished', async (req, res) => {
    const { assignmentId } = req.params;

    try {
        const result = await pool.query(
            'SELECT "isPublished" FROM "Assignment" WHERE "assignmentId" = $1',
            [assignmentId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Assignment not found' });
        }

        res.status(200).json({ isPublished: result.rows[0].isPublished });
    } catch (error) {
        logger.error('Error checking publish status:', error);
        res.status(500).json({ message: 'Error checking publish status' });
    }
});

app.put('/assignments/:assignmentId/publish', async (req, res) => {
    const { assignmentId } = req.params;

    try {
        const result = await pool.query(
            'UPDATE "Assignment" SET "isPublished" = true WHERE "assignmentId" = $1 RETURNING *',
            [assignmentId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Assignment not found' });
        }

        res.status(200).json({ message: 'Assignment published successfully', assignment: result.rows[0] });
    } catch (error) {
        logger.error('Error publishing assignment:', error);
        res.status(500).json({ message: 'Error publishing assignment' });
    }
});

app.put('/assignments/:assignmentId/unpublish', async (req, res) => {
    const { assignmentId } = req.params;

    try {
        const result = await pool.query(
            'UPDATE "Assignment" SET "isPublished" = false WHERE "assignmentId" = $1 RETURNING *',
            [assignmentId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Assignment not found' });
        }

        res.status(200).json({ message: 'Assignment unpublished successfully', assignment: result.rows[0] });
    } catch (error) {
        logger.error('Error unpublishing assignment:', error);
        res.status(500).json({ message: 'Error unpublishing assignment' });
    }
});

app.put('/rubric/:rubricId', async (req, res) => {
    const { rubricId } = req.params;
    const { rubricName, criteria } = req.body;

    try {
        // Begin transaction
        await pool.query('BEGIN');

        // Update the rubric
        const result = await pool.query(
            'UPDATE "AssignmentRubric" SET "rubricName" = $1, "criteria" = $2 WHERE "assignmentRubricId" = $3 RETURNING *',
            [rubricName, criteria, rubricId]
        );

        if (result.rows.length === 0) {
            await pool.query('ROLLBACK');
            return res.status(404).json({ message: 'Rubric not found' });
        }

        // Commit transaction
        await pool.query('COMMIT');

        res.status(200).json(result.rows[0]);
    } catch (error) {
        await pool.query('ROLLBACK');
        logger.error('Error updating rubric:', error);
        res.status(500).json({ message: 'Error updating rubric' });
    }
});


// Tests for Create Assignment Route
describe('POST /assignments', () => {
    it('should create an assignment and rubric successfully', async () => {
        const newAssignment = {
            courseId: 1,
            dueDate: '2024-10-05',
            assignmentName: 'New Assignment',
            maxObtainableGrade: 100,
            rubricName: 'New Rubric',
            criteria: 'Excellent, Good, Fair, Poor',
            assignmentKey: 'Assignment-001'
        };

        const response = await request(app)
            .post('/assignments')
            .send(newAssignment);

        expect(response.status).toBe(201);
        expect(response.body).toEqual({ 
            assignmentId: 1, 
            assignmentRubricId: 1, 
            message: 'Assignment and rubric created successfully'
        });
    });

    it('should handle errors during assignment creation', async () => {
        pool.query.mockImplementationOnce(() => Promise.reject(new Error('Database error')));

        const response = await request(app)
            .post('/assignments')
            .send({
                courseId: 1,
                dueDate: '2024-10-05',
                assignmentName: 'New Assignment',
                maxObtainableGrade: 100,
                rubricName: 'New Rubric',
                criteria: 'Excellent, Good, Fair, Poor',
                assignmentKey: 'Assignment-001'
            });

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ message: 'Error creating assignment and rubric' });
    });
// Tests for Assignment and Rubric Routes
describe('Assignment and Rubric Routes', () => {
    describe('GET /assignments', () => {
        it('should fetch all assignments successfully', async () => {
            const mockAssignments = [{ id: 1, name: 'Assignment 1' }];

            pool.query.mockResolvedValue({ rows: mockAssignments });

            const response = await request(app).get('/assignments');

            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockAssignments);
        });

        it('should handle errors while fetching assignments', async () => {
            pool.query.mockRejectedValue(new Error('Database error'));

            const response = await request(app).get('/assignments');

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ message: 'Error fetching assignments' });
        });
    });

    describe('GET /rubrics', () => {
        it('should fetch all rubrics successfully', async () => {
            const mockRubrics = [{ id: 1, criteria: 'Quality' }];

            pool.query.mockResolvedValue({ rows: mockRubrics });

            const response = await request(app).get('/rubrics');

            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockRubrics);
        });

        it('should handle errors while fetching rubrics', async () => {
            pool.query.mockRejectedValue(new Error('Database error'));

            const response = await request(app).get('/rubrics');

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ message: 'Error fetching rubrics' });
        });
    });

    describe('POST /rubrics', () => {
        it('should add a rubric successfully', async () => {
            const newRubric = { assignmentId: 1, courseId: 1, criteria: 'Excellent' };
            const mockRubric = { id: 1, ...newRubric };

            pool.query.mockResolvedValue({ rows: [mockRubric] });

            const response = await request(app)
                .post('/rubrics')
                .send(newRubric);

            expect(response.status).toBe(201);
            expect(response.body).toEqual(mockRubric);
        });

        it('should handle errors while adding a rubric', async () => {
            pool.query.mockRejectedValue(new Error('Database error'));

            const response = await request(app)
                .post('/rubrics')
                .send({ assignmentId: 1, courseId: 1, criteria: 'Excellent' });

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ message: 'Error adding rubric' });
        });
    });
});

// Tests for Solution Management Routes
describe('Solution Management Routes', () => {
    describe('GET /assignments/:assignmentId/solutions', () => {
        it('should fetch a solution successfully', async () => {
            const mockSolution = { solutionFile: 'solution.pdf' };

            pool.query.mockResolvedValue({ rows: [mockSolution] });

            const response = await request(app).get('/assignments/1/solutions');

            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockSolution);
        });

        it('should return an error when the solution is not found', async () => {
            pool.query.mockResolvedValue({ rows: [] });

            const response = await request(app).get('/assignments/1/solutions');

            expect(response.status).toBe(404);
            expect(response.body).toEqual({ message: 'Solution not found' });
        });
    });

    describe('PUT /assignments/:assignmentId/solutions', () => {
        it('should update a solution successfully', async () => {
            const updatedSolution = { solutionFile: 'updated_solution.pdf' };
            const mockSolution = { assignmentId: 1, solutionFile: 'updated_solution.pdf' };

            pool.query.mockResolvedValue({ rows: [mockSolution] });

            const response = await request(app)
                .put('/assignments/1/solutions')
                .send({ solutionFile: 'updated_solution.pdf' });

            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockSolution);
        });

        it('should return an error when trying to update a non-existing solution', async () => {
            pool.query.mockResolvedValue({ rows: [] });

            const response = await request(app)
                .put('/assignments/1/solutions')
                .send({ solutionFile: 'updated_solution.pdf' });

            expect(response.status).toBe(404);
            expect(response.body).toEqual({ message: 'Solution not found' });
        });
    });
});


    describe('POST /submissions/:submissionId/grade', () => {
        it('should mark a submission as graded successfully', async () => {
            const mockSubmission = { assignmentSubmissionId: 1, isGraded: true };

            pool.query.mockResolvedValue({ rows: [mockSubmission], rowCount: 1 });

            const response = await request(app).post('/submissions/1/grade');

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ message: 'Submission marked as graded', submission: mockSubmission });
        });

        it('should return an error when the submission is not found', async () => {
            pool.query.mockResolvedValue({ rows: [], rowCount: 0 });

            const response = await request(app).post('/submissions/1/grade');

            expect(response.status).toBe(404);
            expect(response.body).toEqual({ message: 'Submission not found' });
        });
    });

    describe('GET /assignments/:assignmentId/submissions', () => {
        it('should fetch submissions for an assignment successfully', async () => {
            const mockSubmissions = [{ assignmentSubmissionId: 1, studentId: 123 }];

            pool.query.mockResolvedValue({ rows: mockSubmissions, rowCount: mockSubmissions.length });

            const response = await request(app).get('/assignments/1/submissions');

            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockSubmissions);
        });

        it('should return an error when no submissions are found', async () => {
            pool.query.mockResolvedValue({ rows: [], rowCount: 0 });

            const response = await request(app).get('/assignments/1/submissions');

            expect(response.status).toBe(404);
            expect(response.body).toEqual({ message: 'No submissions found for this assignment.' });
        });
    });

    describe('Rubric Fetch Routes', () => {
        describe('GET /instructors/:instructorId/rubrics', () => {
            it('should fetch rubrics for a specific instructor', async () => {
                const mockRubrics = [{ id: 1, name: 'Rubric 1', criteria: 'Criteria 1' }];
                pool.query.mockResolvedValue({ rows: mockRubrics });
    
                const response = await request(app).get('/instructors/123/rubrics');
    
                expect(response.status).toBe(200);
                expect(response.body).toEqual(mockRubrics);
            });
        });
    
        describe('GET /rubrics/:courseId', () => {
            it('should fetch rubrics by courseId', async () => {
                const mockRubrics = [{ id: 2, name: 'Rubric 2', criteria: 'Criteria 2' }];
                pool.query.mockResolvedValue({ rows: mockRubrics });
    
                const response = await request(app).get('/rubrics/456');
    
                expect(response.status).toBe(200);
                expect(response.body).toEqual(mockRubrics);
            });
        });
    
        describe('GET /rubric/:rubricId', () => {
            it('should fetch a rubric by rubricId', async () => {
                const mockRubric = { id: 3, name: 'Rubric 3', criteria: 'Criteria 3' };
                pool.query.mockResolvedValue({ rows: [mockRubric] });
    
                const response = await request(app).get('/rubric/789');
    
                expect(response.status).toBe(200);
                expect(response.body).toEqual([mockRubric]);
            });
        });
    });

    // Tests for Fetching Published Assignments
describe('GET /assignments/course/:courseId', () => {
    it('should fetch all published assignments for a course', async () => {
        const mockAssignments = [
            { id: 1, name: 'Assignment 1', courseId: 101, dueDate: '2021-09-10', isPublished: true },
            { id: 2, name: 'Assignment 2', courseId: 101, dueDate: '2021-10-10', isPublished: true }
        ];
        pool.query.mockResolvedValue({ rows: mockAssignments });

        const response = await request(app).get('/assignments/course/101');

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockAssignments.map(a => ({
            ...a,
            dueDate: new Date(a.dueDate).toLocaleDateString()
        })));
    });

    it('should handle the case where the course ID is invalid', async () => {
        const response = await request(app).get('/assignments/course/not-a-number');

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ message: 'Invalid course ID' });
    });

    it('should return a 404 if no assignments are found', async () => {
        pool.query.mockResolvedValue({ rows: [] });

        const response = await request(app).get('/assignments/course/999');

        expect(response.status).toBe(404);
        expect(response.body).toEqual({ message: 'No assignments found for this course' });
    });

    it('should return an error when there is a database error', async () => {
        pool.query.mockRejectedValue(new Error('Database error'));

        const response = await request(app).get('/assignments/course/101');

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ message: 'Error fetching assignments' });
    });
});

// Tests for Fetching All Assignments
describe('GET /assignments/course/:courseId/all', () => {
    it('should fetch all assignments for a course', async () => {
        const mockAssignments = [
            { id: 1, name: 'Assignment 1', courseId: 101, dueDate: '2021-09-10' },
            { id: 2, name: 'Assignment 2', courseId: 101, dueDate: '2021-10-10' }
        ];
        pool.query.mockResolvedValue({ rows: mockAssignments });

        const response = await request(app).get('/assignments/course/101/all');

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockAssignments.map(a => ({
            ...a,
            dueDate: new Date(a.dueDate).toLocaleDateString()
        })));
    });

    it('should handle the case where the course ID is invalid', async () => {
        const response = await request(app).get('/assignments/course/not-a-number/all');

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ message: 'Invalid course ID' });
    });

    it('should return a 404 if no assignments are found', async () => {
        pool.query.mockResolvedValue({ rows: [] });

        const response = await request(app).get('/assignments/course/999/all');

        expect(response.status).toBe(404);
        expect(response.body).toEqual({ message: 'No assignments found for this course' });
    });

    it('should return an error when there is a database error', async () => {
        pool.query.mockRejectedValue(new Error('Database error'));

        const response = await request(app).get('/assignments/course/101/all');

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ message: 'Error fetching assignments' });
    });
});

// Tests for Counting Published Assignments
describe('GET /assignments/count/:courseId', () => {
    it('should correctly count published assignments for a course', async () => {
        pool.query.mockResolvedValue({ rows: [{ count: '5' }] });

        const response = await request(app).get('/assignments/count/101');

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ totalAssignments: 5 });
    });

    it('should handle the case where the course ID is invalid', async () => {
        const response = await request(app).get('/assignments/count/not-a-number');

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ message: 'Invalid course ID' });
    });

    it('should return a 500 error if there is a problem fetching data', async () => {
        pool.query.mockRejectedValue(new Error('Database error'));

        const response = await request(app).get('/assignments/count/101');

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ message: 'Error fetching total assignments' });
    });
});

// Tests for Fetching an Assignment by ID
describe('GET /assignments/:assignmentId', () => {
    it('should fetch an assignment successfully', async () => {
        const mockAssignment = {
            assignmentName: 'Calculus Assignment',
            dueDate: '2024-09-01',
            isPublished: true,
            criteria: 'All calculus problems'
        };

        pool.query.mockResolvedValue({ rows: [mockAssignment], rowCount: 1 });

        const response = await request(app).get('/assignments/123');

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockAssignment);
    });

    it('should create a rubric if none exists and fetch the updated assignment', async () => {
        const mockAssignment = {
            assignmentName: 'Calculus Assignment',
            dueDate: '2024-09-01',
            isPublished: true,
            criteria: null
        };

        const updatedAssignment = {
            ...mockAssignment,
            criteria: 'Basic criteria'
        };

        pool.query
            .mockResolvedValueOnce({ rows: [mockAssignment], rowCount: 1 })
            .mockResolvedValueOnce({ rows: [{ assignmentRubricId: '1' }], rowCount: 1 })
            .mockResolvedValueOnce({ rowCount: 1 })
            .mockResolvedValueOnce({ rows: [updatedAssignment], rowCount: 1 });

        const response = await request(app).get('/assignments/123');

        expect(response.status).toBe(200);
        expect(response.body).toEqual(updatedAssignment);
    });

    it('should handle database errors', async () => {
        pool.query.mockRejectedValue(new Error('Database error'));

        const response = await request(app).get('/assignments/123');

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ message: 'Error fetching assignment' });
    });
});

// // Tests for Updating an Assignment by ID
// describe('PUT /assignments/:assignmentId', () => {
//     it('should update an assignment successfully', async () => {
//         const mockAssignment = {
//             assignmentName: 'Updated Assignment',
//             dueDate: '2024-12-01',
//             courseId: 1
//         };

//         pool.query.mockResolvedValueOnce({ rows: [mockAssignment], rowCount: 1 })  // Mock the update operation
//                  .mockResolvedValueOnce({ rows: [{ assignmentRubricId: '1' }], rowCount: 1 })  // Mock checking for existing rubric
//                  .mockResolvedValueOnce({ rowCount: 1 });  // Mock updating rubric criteria

//         const response = await request(app).put('/assignments/123').send({
//             assignmentName: 'Updated Assignment',
//             dueDate: '2024-12-01',
//             criteria: 'Updated criteria'
//         });

//         expect(response.status).toBe(200);
//         expect(response.body).toEqual(mockAssignment);
//     });

//     it('should create a rubric if none exists and update the assignment', async () => {
//         const mockAssignment = {
//             assignmentName: 'Updated Assignment',
//             dueDate: '2024-12-01',
//             courseId: 1
//         };

//         const updatedAssignment = {
//             ...mockAssignment,
//             criteria: 'Updated criteria'
//         };

//         pool.query
//             .mockResolvedValueOnce({ rows: [mockAssignment], rowCount: 1 })  // Mock the update operation
//             .mockResolvedValueOnce({ rows: [], rowCount: 0 })  // Mock checking for existing rubric
//             .mockResolvedValueOnce({ rows: [{ assignmentRubricId: '1' }], rowCount: 1 })  // Mock rubric creation
//             .mockResolvedValueOnce({ rowCount: 1 });  // Mock linking new rubric to assignment

//         const response = await request(app).put('/assignments/123').send({
//             assignmentName: 'Updated Assignment',
//             dueDate: '2024-12-01',
//             criteria: 'Updated criteria'
//         });

//         expect(response.status).toBe(200);
//         expect(response.body).toEqual(mockAssignment);
//     });

//     it('should handle not found assignments', async () => {
//         pool.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });  // Mock no assignment found

//         const response = await request(app).put('/assignments/123').send({
//             assignmentName: 'Updated Assignment',
//             dueDate: '2024-12-01',
//             criteria: 'Updated criteria'
//         });

//         expect(response.status).toBe(404);
//         expect(response.body).toEqual({ message: 'Assignment not found' });
//     });

//     it('should handle database errors', async () => {
//         pool.query.mockRejectedValue(new Error('Database error'));

//         const response = await request(app).put('/assignments/123').send({
//             assignmentName: 'Updated Assignment',
//             dueDate: '2024-12-01',
//             criteria: 'Updated criteria'
//         });

//         expect(response.status).toBe(500);
//         expect(response.body).toEqual({ message: 'Error updating assignment' });
//     });
//});


describe('PUT /assignments/:assignmentId/toggle-publish', () => {
    it('should toggle the publication status of an assignment', async () => {
        const mockAssignment = {
            assignmentId: 1,
            isPublished: true
        };

        // Mock the select query
        pool.query.mockResolvedValueOnce({ rows: [mockAssignment], rowCount: 1 });

        // Mock the update query
        pool.query.mockResolvedValueOnce({ rows: [{ ...mockAssignment, isPublished: false }], rowCount: 1 });

        const response = await request(app).put('/assignments/1/toggle-publish');

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: 'Assignment publish status updated successfully', assignment: { ...mockAssignment, isPublished: false } });
    });

    it('should return an error if the assignment is not found', async () => {
        pool.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });

        const response = await request(app).put('/assignments/1/toggle-publish');

        expect(response.status).toBe(404);
        expect(response.body).toEqual({ message: 'Assignment not found' });
    });

    it('should handle database errors', async () => {
        pool.query.mockRejectedValueOnce(new Error('Database error'));

        const response = await request(app).put('/assignments/1/toggle-publish');

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ message: 'Error toggling publish status' });
    });
});

describe('GET /assignments/:assignmentId/isPublished', () => {
    it('should check if an assignment is published', async () => {
        const mockData = { isPublished: true };

        pool.query.mockResolvedValueOnce({ rows: [mockData], rowCount: 1 });

        const response = await request(app).get('/assignments/123/isPublished');

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ isPublished: true });
    });

    it('should return an error if the assignment is not found', async () => {
        pool.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });

        const response = await request(app).get('/assignments/123/isPublished');

        expect(response.status).toBe(404);
        expect(response.body).toEqual({ message: 'Assignment not found' });
    });

    it('should handle database errors during the query', async () => {
        pool.query.mockRejectedValueOnce(new Error('Database error'));

        const response = await request(app).get('/assignments/123/isPublished');

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ message: 'Error checking publish status' });
    });
});

describe('PUT /assignments/:assignmentId/publish', () => {
    it('should publish an assignment successfully', async () => {
        const mockAssignment = { assignmentId: 123, isPublished: true };

        pool.query.mockResolvedValueOnce({ rows: [mockAssignment], rowCount: 1 });

        const response = await request(app).put('/assignments/123/publish');

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: 'Assignment published successfully', assignment: mockAssignment });
    });

    it('should return an error if the assignment is not found', async () => {
        pool.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });

        const response = await request(app).put('/assignments/123/publish');

        expect(response.status).toBe(404);
        expect(response.body).toEqual({ message: 'Assignment not found' });
    });

    it('should handle database errors during the update', async () => {
        pool.query.mockRejectedValueOnce(new Error('Database error'));

        const response = await request(app).put('/assignments/123/publish');

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ message: 'Error publishing assignment' });
    });
});

describe('PUT /assignments/:assignmentId/unpublish', () => {
    it('should unpublish an assignment successfully', async () => {
        const mockAssignment = { assignmentId: 123, isPublished: false };

        pool.query.mockResolvedValueOnce({ rows: [mockAssignment], rowCount: 1 });

        const response = await request(app).put('/assignments/123/unpublish');

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: 'Assignment unpublished successfully', assignment: mockAssignment });
    });

    it('should return an error if the assignment is not found', async () => {
        pool.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });

        const response = await request(app).put('/assignments/123/unpublish');

        expect(response.status).toBe(404);
        expect(response.body).toEqual({ message: 'Assignment not found' });
    });

    it('should handle database errors during the update', async () => {
        pool.query.mockRejectedValueOnce(new Error('Database error'));

        const response = await request(app).put('/assignments/123/unpublish');

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ message: 'Error unpublishing assignment' });
    });
});

// describe('PUT /rubric/:rubricId', () => {
//     it('should update a rubric successfully', async () => {
//         const mockRubric = { rubricId: 1, rubricName: 'Updated Rubric', criteria: 'New Criteria' };

//         pool.query.mockResolvedValueOnce({ rows: [mockRubric], rowCount: 1 });

//         const response = await request(app).put('/rubric/1').send({
//             rubricName: 'Updated Rubric',
//             criteria: 'New Criteria'
//         });

//         expect(response.status).toBe(200);
//         expect(response.body).toEqual(mockRubric);
//     });

//     it('should return an error if the rubric is not found', async () => {
//         pool.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });

//         const response = await request(app).put('/rubric/1').send({
//             rubricName: 'Updated Rubric',
//             criteria: 'New Criteria'
//         });

//         expect(response.status).toBe(404);
//         expect(response.body).toEqual({ message: 'Rubric not found' });
//     });

//     it('should handle database errors during the update', async () => {
//         pool.query.mockRejectedValueOnce(new Error('Database error'));

//         const response = await request(app).put('/rubric/1').send({
//             rubricName: 'Updated Rubric',
//             criteria: 'New Criteria'
//         });

//         expect(response.status).toBe(500);
//         expect(response.body).toEqual({ message: 'Error updating rubric' });
//     });
// });

});

module.exports = app; // Exporting for testing purposes








// const request = require('supertest');
// const express = require('express');
// const router = require('../routes/courseRoutes');
// const { pool } = require('../dbConfig');
// const session = require('express-session');

// const app = express();

// app.use(session({
//     secret: 'test_secret',
//     resave: false,
//     saveUninitialized: true,
// }));
// app.use((req, res, next) => {
//     req.isAuthenticated = () => true;
//     req.user = { instructorId: 1 };
//     next();
// });
// app.use('/eval-api', router);

// jest.mock('../dbConfig', () => {
//     const pool = {
//         query: jest.fn(),
//     };
//     return { pool };
// });

// describe('Course Archive API Tests', () => {
//     afterEach(() => {
//         jest.clearAllMocks();
//     });

//     describe('GET /eval-api/courses/archived', () => {
//         it('should fetch all archived courses', async () => {
//             const archivedCourses = {
//                 rows: [
//                     { courseId: 1, courseName: 'Archived Course 1', courseCode: 'AC101', isArchived: true },
//                     { courseId: 2, courseName: 'Archived Course 2', courseCode: 'AC102', isArchived: true },
//                 ],
//             };

//             pool.query.mockResolvedValueOnce(archivedCourses);

//             const res = await request(app).get('/eval-api/courses/archived');

//             expect(res.status).toBe(200);
//             expect(res.body).toEqual(archivedCourses.rows);
//         });

//         it('should return 500 on database error', async () => {
//             pool.query.mockRejectedValueOnce(new Error('Database error'));

//             const res = await request(app).get('/eval-api/courses/archived');

//             expect(res.status).toBe(500);
//             expect(res.body).toEqual({ message: 'Error fetching courses' });
//         });
//     });

//     describe('GET /eval-api/courses/active', () => {
//         it('should fetch all active courses', async () => {
//             const activeCourses = {
//                 rows: [
//                     { courseId: 1, courseName: 'Active Course 1', courseCode: 'AC101', isArchived: false },
//                     { courseId: 2, courseName: 'Active Course 2', courseCode: 'AC102', isArchived: false },
//                 ],
//             };

//             pool.query.mockResolvedValueOnce(activeCourses);

//             const res = await request(app).get('/eval-api/courses/active');

//             expect(res.status).toBe(200);
//             expect(res.body).toEqual(activeCourses.rows);
//         });

//         it('should return 500 on database error', async () => {
//             pool.query.mockRejectedValueOnce(new Error('Database error'));

//             const res = await request(app).get('/eval-api/courses/active');

//             expect(res.status).toBe(500);
//             expect(res.body).toEqual({ message: 'Error fetching courses' });
//         });
//     });

//     describe('PUT /eval-api/courses/:courseId/archive', () => {
//         it('should archive a course', async () => {
//             const courseId = 1;
//             const mockResult = { rowCount: 1 };

//             pool.query.mockResolvedValueOnce(mockResult);

//             const res = await request(app).put(`/eval-api/courses/${courseId}/archive`);

//             expect(res.status).toBe(200);
//             expect(res.body).toEqual({ message: 'Course archived successfully' });
//         });

//         it('should return 404 if course not found', async () => {
//             const courseId = 1;
//             const mockResult = { rowCount: 0 };

//             pool.query.mockResolvedValueOnce(mockResult);

//             const res = await request(app).put(`/eval-api/courses/${courseId}/archive`);

//             expect(res.status).toBe(404);
//             expect(res.body).toEqual({ message: 'Course not found' });
//         });

//         it('should return 500 on database error', async () => {
//             const courseId = 1;
//             pool.query.mockRejectedValueOnce(new Error('Database error'));

//             const res = await request(app).put(`/eval-api/courses/${courseId}/archive`);

//             expect(res.status).toBe(500);
//             expect(res.body).toEqual({ message: 'Error archiving course' });
//         });
//     });

//     describe('PUT /eval-api/courses/:courseId/unarchive', () => {
//         it('should unarchive a course', async () => {
//             const courseId = 1;
//             const mockResult = { rowCount: 1 };

//             pool.query.mockResolvedValueOnce(mockResult);

//             const res = await request(app).put(`/eval-api/courses/${courseId}/unarchive`);

//             expect(res.status).toBe(200);
//             expect(res.body).toEqual({ message: 'Course unarchived successfully' });
//         });

//         it('should return 404 if course not found', async () => {
//             const courseId = 1;
//             const mockResult = { rowCount: 0 };

//             pool.query.mockResolvedValueOnce(mockResult);

//             const res = await request(app).put(`/eval-api/courses/${courseId}/unarchive`);

//             expect(res.status).toBe(404);
//             expect(res.body).toEqual({ message: 'Course not found' });
//         });

//         it('should return 500 on database error', async () => {
//             const courseId = 1;
//             pool.query.mockRejectedValueOnce(new Error('Database error'));

//             const res = await request(app).put(`/eval-api/courses/${courseId}/unarchive`);

//             expect(res.status).toBe(500);
//             expect(res.body).toEqual({ message: 'Error unarchiving course' });
//         });
//     });

//     describe('GET /eval-api/courses/:courseId/is-archived', () => {
//         it('should determine if a course is archived', async () => {
//             const courseId = 1;
//             const mockResult = { rows: [{ isArchived: true }] };

//             pool.query.mockResolvedValueOnce(mockResult);

//             const res = await request(app).get(`/eval-api/courses/${courseId}/is-archived`);

//             expect(res.status).toBe(200);
//             expect(res.body).toEqual({ isArchived: true });
//         });

//         it('should return 404 if course not found', async () => {
//             const courseId = 1;
//             const mockResult = { rowCount: 0 };

//             pool.query.mockResolvedValueOnce(mockResult);

//             const res = await request(app).get(`/eval-api/courses/${courseId}/is-archived`);

//             expect(res.status).toBe(404);
//             expect(res.body).toEqual({ message: 'Course not found' });
//         });

//         it('should return 500 on database error', async () => {
//             const courseId = 1;
//             pool.query.mockRejectedValueOnce(new Error('Database error'));

//             const res = await request(app).get(`/eval-api/courses/${courseId}/is-archived`);

//             expect(res.status).toBe(500);
//             expect(res.body).toEqual({ message: 'Error fetching course' });
//         });
//     });
// });
