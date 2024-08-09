const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const logger = require('../evallogger'); // Adjust this path if it's not correct

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
    req.isAuthenticated = () => true; // Assume user is always authenticated for testing
    req.user = { evaluatorId: '123' }; // Mocked user
    next();
};

app.use(checkAuthenticated);

// Define the route to get evaluator grades for a course
app.get('/evaluator-grades/:courseId', async (req, res) => {
    const { courseId } = req.params;

    try {
        const result = await pool.query(
            `SELECT a."assignmentKey" AS "name", 
                    a."dueDate" AS "due",
                    COALESCE(SUM(ag."InstructorAssignedFinalGrade"), 0) AS "avgGrade",
                    COALESCE(SUM(a."maxObtainableGrade"), 0) AS "totalGrade"
             FROM "Assignment" a
             LEFT JOIN "AssignmentSubmission" asub ON a."assignmentId" = asub."assignmentId"
             LEFT JOIN "AssignmentGrade" ag ON asub."assignmentSubmissionId" = ag."assignmentSubmissionId"
             WHERE a."courseId" = $1
             GROUP BY a."assignmentKey", a."dueDate"
             ORDER BY a."dueDate" ASC`,
            [courseId]
        );
        res.status(200).json(result.rows);
    } catch (error) {
        logger.error('Error fetching evaluator grades:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

// Tests for Evaluator Grades Route
describe('GET /evaluator-grades/:courseId', () => {
    it('should fetch assignment details with grades', async () => {
        const mockGrades = [
            { name: 'Assignment1', due: '2024-10-01', avgGrade: 85, totalGrade: 100 },
            { name: 'Assignment2', due: '2024-12-01', avgGrade: 90, totalGrade: 100 }
        ];

        pool.query.mockResolvedValue({ rows: mockGrades });

        const response = await request(app).get('/evaluator-grades/1');

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockGrades);
    });

    it('should handle database errors', async () => {
        pool.query.mockRejectedValue(new Error('Database error'));

        const response = await request(app).get('/evaluator-grades/1');

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ error: 'Database error' });
    });
});

module.exports = app; // Exporting for testing purposes
