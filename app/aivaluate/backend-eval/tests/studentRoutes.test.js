const request = require('supertest');
const express = require('express');
const session = require('express-session');
const { pool } = require('../dbConfig');
const router = require('../routes/studentRoutes'); // Adjust the path to your router file

jest.mock('pg', () => {
    const mPool = {
      connect: jest.fn(),
      query: jest.fn(),
      end: jest.fn(),
    };
    return { Pool: jest.fn(() => mPool) };
});

const app = express();
app.use(express.json());
app.use(session({
    secret: 'test_secret',
    resave: false,
    saveUninitialized: true,
}));
app.use((req, res, next) => {
    req.isAuthenticated = () => true; // Mock isAuthenticated to always return true
    req.user = { instructorId: 1 }; // Mock user object for testing
    next();
});
app.use('/eval-api', router);

describe('Student Routes', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /students/show/:courseId', () => {
        it('should fetch students enrolled in a course', async () => {
            const courseId = 1;
            const mockStudents = [
                { firstName: 'John', lastName: 'Doe' },
                { firstName: 'Jane', lastName: 'Smith' }
            ];
            pool.query.mockResolvedValueOnce({ rows: mockStudents });

            const res = await request(app).get(`/eval-api/students/show/${courseId}`);

            expect(res.status).toBe(200);
            expect(res.body).toEqual(mockStudents);
            expect(pool.query).toHaveBeenCalledWith(expect.any(String), [courseId]);
        });

        it('should return 500 on database error', async () => {
            const courseId = 1;
            pool.query.mockRejectedValueOnce(new Error('Database error'));

            const res = await request(app).get(`/eval-api/students/show/${courseId}`);

            expect(res.status).toBe(500);
            expect(res.body).toEqual({ error: 'Database error' });
        });
    });
    
    describe('GET /students/show/:courseId', () => {
        it('should fetch students enrolled in a course', async () => {
            const studentsResult = {
                rows: [
                    { firstName: 'John', lastName: 'Doe' },
                    { firstName: 'Jane', lastName: 'Smith' }
                ]
            };
            pool.query.mockResolvedValueOnce(studentsResult);
    
            const res = await request(app).get('/eval-api/students/show/1');
    
            expect(res.status).toBe(200);
            expect(res.body).toEqual(studentsResult.rows);
        });
    
        it('should return 500 on database error', async () => {
            pool.query.mockRejectedValueOnce(new Error('Database error'));
    
            const res = await request(app).get('/eval-api/students/show/1');
    
            expect(res.status).toBe(500);
            expect(res.body).toEqual({ error: 'Database error' });
        });
    });
    
});
