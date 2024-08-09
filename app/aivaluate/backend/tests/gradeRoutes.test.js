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

const pool = new Pool();

const app = express();
app.use(bodyParser.json());

// Mocking the authentication
const checkAuthenticated = (req, res, next) => {
  req.isAuthenticated = () => true; // Assume all requests are authenticated
  req.user = { studentId: '1' }; // Mocked user
  next();
};

app.use(checkAuthenticated);
app.get('/student-grades/:courseId', async (req, res) => {
  const { courseId } = req.params;
  try {
    const studentInfo = await pool.query(
      `SELECT s."firstName", COALESCE(SUM(ag."InstructorAssignedFinalGrade"), 0) AS "totalGrade", COALESCE(SUM(a."maxObtainableGrade"), 0) AS "totalMaxGrade"
       FROM "Student" s
       JOIN "AssignmentSubmission" asub ON s."studentId" = asub."studentId"
       JOIN "AssignmentGrade" ag ON asub."assignmentSubmissionId" = ag."assignmentSubmissionId"
       JOIN "Assignment" a ON asub."assignmentId" = a."assignmentId"
       WHERE s."studentId" = $1 AND asub."courseId" = $2 AND ag."isGraded" = true
       GROUP BY s."firstName"`, [req.user.studentId, courseId]
    );
    const assignments = await pool.query(
      `SELECT a."assignmentDescription" AS "name", a."dueDate" AS "due", asub."isSubmitted" AS "submitted", 
       COALESCE(ag."InstructorAssignedFinalGrade", 0) AS "score", a."maxObtainableGrade" AS "total", ag."isGraded" AS "marked"
       FROM "Assignment" a
       JOIN "AssignmentSubmission" asub ON a."assignmentId" = asub."assignmentId"
       JOIN "AssignmentGrade" ag ON asub."assignmentSubmissionId" = ag."assignmentSubmissionId"
       WHERE asub."studentId" = $1 AND a."courseId" = $2`, [req.user.studentId, courseId]
    );
    if (studentInfo.rows.length === 0 || assignments.rows.length === 0) {
      res.status(404).json({ error: "No data found" });
    } else {
      res.json({
        studentName: studentInfo.rows[0].firstName,
        totalGrade: studentInfo.rows[0].totalGrade,
        totalMaxGrade: studentInfo.rows[0].totalMaxGrade,
        assignments: assignments.rows
      });
    }
  } catch (error) {
    logger.error('Error fetching student grades: ' + error.message);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = app; // Exporting for testing

describe('GET /student-grades/:courseId', () => {
  it('should return student grades and assignments for the course', async () => {
    const courseId = '1';
    pool.query.mockResolvedValueOnce({
      rows: [{ firstName: 'John', totalGrade: 95, totalMaxGrade: 100 }]
    }).mockResolvedValueOnce({
      rows: [
        { name: 'Assignment 1', due: '2022-01-15', submitted: true, score: 95, total: 100, marked: true },
        { name: 'Assignment 2', due: '2022-02-10', submitted: false, score: 0, total: 100, marked: false }
      ]
    });

    const response = await request(app)
      .get('/student-grades/1')
      .set('Accept', 'application/json');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      studentName: 'John',
      totalGrade: 95,
      totalMaxGrade: 100,
      assignments: [
        { name: 'Assignment 1', due: '2022-01-15', submitted: true, score: 95, total: 100, marked: true },
        { name: 'Assignment 2', due: '2022-02-10', submitted: false, score: 0, total: 100, marked: false }
      ]
    });
  }, 20000);

  it('should return a 404 if no grades or assignments are found', async () => {
    const courseId = '2';
    pool.query.mockResolvedValueOnce({ rows: [] }).mockResolvedValueOnce({ rows: [] });

    const response = await request(app)
      .get('/student-grades/2')
      .set('Accept', 'application/json');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: "No data found" });
  });

  it('should return a database error', async () => {
    const courseId = '1';
    pool.query.mockRejectedValue(new Error('Database error'));

    const response = await request(app)
      .get('/student-grades/1')
      .set('Accept', 'application/json');

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: 'Database error' });
  });
});
