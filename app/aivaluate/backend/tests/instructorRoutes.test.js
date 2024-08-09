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

// Adding routes directly in this example for clarity
app.get('/instructors', async (req, res) => {
    try {
        const instructors = await pool.query('SELECT * FROM "Instructor" WHERE "isTA" = FALSE');
        res.status(200).json(instructors.rows);
    } catch (error) {
        logger.error('Error fetching instructors: ' + error.message);
        res.status(500).json({ error: 'Database error' });
    }
});

app.get('/tas', async (req, res) => {
    try {
        const tas = await pool.query('SELECT * FROM "Instructor" WHERE "isTA" = TRUE');
        res.status(200).json(tas.rows);
    } catch (error) {
        logger.error('Error fetching TAs: ' + error.message);
        res.status(500).json({ error: 'Database error' });
    }
});

app.post('/teaches', async (req, res) => {
    const { courseId, instructorId } = req.body;
    try {
        await pool.query('INSERT INTO "Teaches" ("courseId", "instructorId") VALUES ($1, $2)', [courseId, instructorId]);
        res.status(201).json({ message: 'Instructor/TA added to course successfully' });
    } catch (error) {
        logger.error('Error adding instructor/TA to course: ' + error.message);
        res.status(500).json({ error: 'Database error' });
    }
});

app.delete('/teaches/:courseId/:instructorId', async (req, res) => {
    const { courseId, instructorId } = req.params;
    try {
        await pool.query('DELETE FROM "Teaches" WHERE "courseId" = $1 AND "instructorId" = $2', [courseId, instructorId]);
        res.status(200).json({ message: 'Instructor/TA removed from course successfully' });
    } catch (error) {
        logger.error('Error removing instructor/TA from course: ' + error.message);
        res.status(500).json({ error: 'Database error' });
    }
});

// Tests for instructor routes
describe('Instructor Routes', () => {
    it('should fetch all instructors successfully', async () => {
        const mockInstructors = [
            { id: 1, name: 'John Doe', isTA: false },
            { id: 2, name: 'Jane Doe', isTA: false }
        ];
        pool.query.mockResolvedValue({ rows: mockInstructors });

        const response = await request(app).get('/instructors');
        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockInstructors);
    });

    it('should fetch all TAs successfully', async () => {
        const mockTAs = [
            { id: 3, name: 'Alice Johnson', isTA: true }
        ];
        pool.query.mockResolvedValue({ rows: mockTAs });

        const response = await request(app).get('/tas');
        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockTAs);
    });

    it('should handle errors when fetching instructors', async () => {
        pool.query.mockRejectedValue(new Error('Database error'));

        const response = await request(app).get('/instructors');
        expect(response.status).toBe(500);
        expect(response.body).toEqual({ error: 'Database error' });
    });

    it('should add an instructor to a course successfully', async () => {
        const postData = { courseId: 1, instructorId: 2 };
        pool.query.mockResolvedValueOnce({ rowCount: 1 });

        const response = await request(app).post('/teaches').send(postData);
        expect(response.status).toBe(201);
        expect(response.body).toEqual({ message: 'Instructor/TA added to course successfully' });
    });

    it('should remove an instructor from a course successfully', async () => {
        const courseId = 1;
        const instructorId = 2;
        pool.query.mockResolvedValueOnce({ rowCount: 1 });

        const response = await request(app).delete(`/teaches/${courseId}/${instructorId}`);
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: 'Instructor/TA removed from course successfully' });
    });

    it('should handle errors when removing an instructor from a course', async () => {
        const courseId = 1;
        const instructorId = 2;
        pool.query.mockRejectedValue(new Error('Database error'));

        const response = await request(app).delete(`/teaches/${courseId}/${instructorId}`);
        expect(response.status).toBe(500);
        expect(response.body).toEqual({ error: 'Database error' });
    });
});

module.exports = app; // Exporting for testing
