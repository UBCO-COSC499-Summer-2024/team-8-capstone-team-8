const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const logger = require('../adminlogger'); // Adjust this path if it's not correct

// Mock the pg module correctly
jest.mock('pg', () => ({
    Pool: jest.fn(() => ({
        query: jest.fn()
    }))
}));

const pool = new Pool();

const app = express();
app.use(bodyParser.json());

app.get('/tas', async (req, res) => {
    try {
        const tas = await pool.query('SELECT * FROM "Instructor" WHERE "isTA" = TRUE');
        res.status(200).json(tas.rows);
    } catch (error) {
        logger.error('Error fetching TAs: ' + error.message);
        res.status(500).json({ message: 'Error fetching TAs' });
    }
});

app.delete('/teaches/:courseId/:instructorId', async (req, res) => {
    const { courseId, instructorId } = req.params;
    try {
        await pool.query('DELETE FROM "Teaches" WHERE "courseId" = $1 AND "instructorId" = $2', [courseId, instructorId]);
        res.status(200).json({ message: 'Instructor/TA removed from course successfully' });
    } catch (error) {
        logger.error('Error removing Instructor/TA from course: ' + error.message);
        res.status(500).json({ message: 'Error removing Instructor/TA from course' });
    }
});

describe('Instructor/TA Management Routes', () => {
    describe('GET /tas', () => {
        it('should fetch all TAs', async () => {
            pool.query.mockResolvedValue({
                rows: [{ instructorId: 2, firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@example.com', isTA: true }]
            });

            const response = await request(app).get('/tas');

            expect(response.status).toBe(200);
            expect(response.body).toEqual([
                { instructorId: 2, firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@example.com', isTA: true }
            ]);
        });

        it('should return an error when fetching TAs', async () => {
            pool.query.mockRejectedValue(new Error('Database error'));

            const response = await request(app).get('/tas');

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ message: 'Error fetching TAs' });
        });
    });

    describe('DELETE /teaches/:courseId/:instructorId', () => {
        it('should remove an instructor or TA from a course', async () => {
            pool.query.mockResolvedValue({ rowCount: 1 });

            const response = await request(app).delete('/teaches/1/2');

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ message: 'Instructor/TA removed from course successfully' });
        });

        it('should return an error when removing an instructor or TA from a course', async () => {
            pool.query.mockRejectedValue(new Error('Database error'));

            const response = await request(app).delete('/teaches/1/2');

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ message: 'Error removing Instructor/TA from course' });
        });
    });
});

module.exports = app; // Exporting for testing purposes
