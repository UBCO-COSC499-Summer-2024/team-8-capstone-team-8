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
    req.user = { instructorId: '123' }; // Mocked user
    next();
};

app.use(checkAuthenticated);

// Define the route to show students in a course
app.get('/students/show/:courseId', async (req, res) => {
    const { courseId } = req.params;

    try {
        const result = await pool.query(
            `SELECT s."firstName", s."lastName"
             FROM "Student" s
             JOIN "EnrolledIn" e ON s."studentId" = e."studentId"
             WHERE e."courseId" = $1`,
            [courseId]
        );
        res.status(200).json(result.rows);
    } catch (error) {
        logger.error('Error fetching students:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

// Tests for Show Students Route
describe('GET /students/show/:courseId', () => {
    it('should fetch students enrolled in a specific course', async () => {
        const mockStudents = [
            { firstName: 'John', lastName: 'Doe' },
            { firstName: 'Jane', lastName: 'Smith' }
        ];

        pool.query.mockResolvedValue({ rows: mockStudents });

        const response = await request(app).get('/students/show/1');

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockStudents);
    });

    it('should handle database errors', async () => {
        pool.query.mockRejectedValue(new Error('Database error'));

        const response = await request(app).get('/students/show/1');

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ error: 'Database error' });
    });
});

module.exports = app; // Exporting for testing purposes
