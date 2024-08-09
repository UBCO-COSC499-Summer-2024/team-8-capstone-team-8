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

const checkAuthenticated = (req, res, next) => {
    req.isAuthenticated = () => true; // Assume user is always authenticated
    next();
};

app.use(checkAuthenticated);

app.get('/students', async (req, res) => {
    try {
        const students = await pool.query('SELECT * FROM "Student"');
        res.status(200).json(students.rows);
    } catch (error) {
        logger.error('Error fetching students: ' + error.message);
        res.status(500).json({ message: 'Error fetching students' });
    }
});

app.get('/student/:studentId', async (req, res) => {
    const { studentId } = req.params;

    try {
        const studentQuery = `
            SELECT s."studentId", s."firstName", s."lastName", s."email", s."password"
            FROM "Student" s
            WHERE s."studentId" = $1
        `;
        const studentResult = await pool.query(studentQuery, [studentId]);
        const student = studentResult.rows[0];

        const courseQuery = `
            SELECT c."courseCode", c."courseId"
            FROM "Course" c
            JOIN "EnrolledIn" e ON c."courseId" = e."courseId"
            WHERE e."studentId" = $1
        `;
        const courseResult = await pool.query(courseQuery, [studentId]);
        const courses = courseResult.rows;

        res.json({
            ...student,
            courses
        });
    } catch (err) {
        logger.error('Error fetching student details: ' + err.message);
        res.status(500).json({ error: 'Database error' });
    }
});

app.delete('/student/:studentId/drop/:courseCode', async (req, res) => {
    const { studentId, courseCode } = req.params;

    try {
        const dropQuery = `
            DELETE FROM "EnrolledIn"
            WHERE "studentId" = $1 AND "courseId" = (
                SELECT "courseId" FROM "Course" WHERE "courseCode" = $2
            )
        `;
        await pool.query(dropQuery, [studentId, courseCode]);
        res.status(200).json({ message: 'Course dropped successfully' });
    } catch (err) {
        logger.error('Error dropping course: ' + err.message);
        res.status(500).json({ error: 'Database error' });
    }
});

app.delete('/student/:studentId', async (req, res) => {
    const { studentId } = req.params;

    try {
        const deleteQuery = `
            DELETE FROM "Student"
            WHERE "studentId" = $1
        `;
        await pool.query(deleteQuery, [studentId]);
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (err) {
        logger.error('Error deleting user: ' + err.message);
        res.status(500).json({ error: 'Database error' });
    }
});

app.use(checkAuthenticated);

app.get('/students', async (req, res) => {
    try {
        const query = `
            SELECT "studentId", "firstName", "lastName"
            FROM "Student"
        `;
        const result = await pool.query(query);

        res.json(result.rows);
    } catch (err) {
        logger.error('Error fetching students: ' + err.message);
        res.status(500).json({ error: 'Database error' });
    }
});

describe('Student Management Routes', () => {
    describe('GET /students', () => {
        it('should fetch all students', async () => {
            pool.query.mockResolvedValue({
                rows: [
                    { studentId: 1, firstName: 'Alice', lastName: 'Johnson', email: 'alice.johnson@example.com' },
                    { studentId: 2, firstName: 'Bob', lastName: 'Smith', email: 'bob.smith@example.com' }
                ]
            });

            const response = await request(app).get('/students');

            expect(response.status).toBe(200);
            expect(response.body).toEqual([
                { studentId: 1, firstName: 'Alice', lastName: 'Johnson', email: 'alice.johnson@example.com' },
                { studentId: 2, firstName: 'Bob', lastName: 'Smith', email: 'bob.smith@example.com' }
            ]);
        });

        it('should return an error when fetching students', async () => {
            pool.query.mockRejectedValue(new Error('Database error'));

            const response = await request(app).get('/students');

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ message: 'Error fetching students' });
        });
    });

    describe('Student Course Details Route', () => {
        it('should fetch student details with courses', async () => {
            pool.query.mockResolvedValueOnce({
                rows: [{ studentId: '1', firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com', password: 'hashedpassword123' }]
            }).mockResolvedValueOnce({
                rows: [
                    { courseId: '101', courseCode: 'CS101' },
                    { courseId: '102', courseCode: 'CS102' }
                ]
            });
    
            const response = await request(app).get('/student/1');
    
            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                studentId: '1',
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
                password: 'hashedpassword123',
                courses: [
                    { courseId: '101', courseCode: 'CS101' },
                    { courseId: '102', courseCode: 'CS102' }
                ]
            });
        });
    
        it('should return a database error when fetching details fails', async () => {
            pool.query.mockRejectedValueOnce(new Error('Database error'));
    
            const response = await request(app).get('/student/1');
    
            expect(response.status).toBe(500);
            expect(response.body).toEqual({ error: 'Database error' });
        });
    });

    describe('Student Course Management', () => {
        it('should allow a student to drop a course successfully', async () => {
            pool.query.mockResolvedValueOnce({ rowCount: 1 }); // Simulate a successful deletion
    
            const response = await request(app).delete('/student/1/drop/CS101');
    
            expect(response.status).toBe(200);
            expect(response.body).toEqual({ message: 'Course dropped successfully' });
        });
    
        it('should return a database error when trying to drop a course', async () => {
            pool.query.mockRejectedValueOnce(new Error('Database error'));
    
            const response = await request(app).delete('/student/1/drop/CS101');
    
            expect(response.status).toBe(500);
            expect(response.body).toEqual({ error: 'Database error' });
        });
    });

    describe('Student Management Routes', () => {
        it('should delete a student successfully', async () => {
            pool.query.mockResolvedValueOnce({ rowCount: 1 }); // Simulate a successful deletion
    
            const response = await request(app).delete('/student/1');
    
            expect(response.status).toBe(200);
            expect(response.body).toEqual({ message: 'User deleted successfully' });
        });
    
        it('should return a database error when trying to delete a student', async () => {
            pool.query.mockRejectedValueOnce(new Error('Database error'));
    
            const response = await request(app).delete('/student/1');
    
            expect(response.status).toBe(500);
            expect(response.body).toEqual({ error: 'Database error' });
        });
    });

    describe('Student Management Routes', () => {
        it('should fetch all students', async () => {
            const mockStudents = [
                { studentId: 1, firstName: 'John', lastName: 'Doe' },
                { studentId: 2, firstName: 'Jane', lastName: 'Doe' }
            ];
    
            pool.query.mockResolvedValue({ rows: mockStudents });
    
            const response = await request(app).get('/students');
    
            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockStudents);
        });
    
    });

});

module.exports = app; // Exporting for testing purposes
