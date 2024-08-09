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
// Checks if user is authenticated
const checkAuthenticated = (req, res, next) => {
  req.user = { studentId: '1' }; // Mocked user
  next();
};

app.get('/enrolled-courses', checkAuthenticated, async (req, res) => {
  const studentId = req.user.studentId;
  try {
    const results = await pool.query(
      `SELECT "Course"."courseId", "Course"."courseCode", "Course"."courseName"
       FROM "EnrolledIn" 
       JOIN "Course" ON "EnrolledIn"."courseId" = "Course"."courseId" 
       WHERE "EnrolledIn"."studentId" = $1`, [studentId]
    );
    res.json(results.rows);
  } catch (error) {
    logger.error('Error fetching enrolled courses: ' + error.message);
    res.status(500).json({ error: 'Database error' }); // Updated to send an object with an "error" key
  }
});

module.exports = app; // Exporting for testing

// Tests for GET /enrolled-courses
describe('GET /enrolled-courses', () => {
  it('should return enrolled courses for the student', async () => {
    const mockCourses = [
      { courseId: '1', courseCode: 'CS101', courseName: 'An introductory course on programming' },
      { courseId: '2', courseCode: 'COSC 455', courseName: 'A course on advanced CSS techniques' }
    ];

    pool.query.mockResolvedValue({ rows: mockCourses });

    const response = await request(app)
      .get('/enrolled-courses')
      .set('Accept', 'application/json');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockCourses);
  });

  it('should return a database error', async () => {
    pool.query.mockRejectedValue(new Error('Database error'));

    const response = await request(app)
      .get('/enrolled-courses')
      .set('Accept', 'application/json');

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: 'Database error' });
  });
});
