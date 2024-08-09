const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const logger = require('../logger'); // Make sure this path is correct

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

app.get('/users/me', async (req, res) => {
  try {
    const user = await pool.query(
      `SELECT "firstName", "lastName", "email", "studentId" 
       FROM "Users" 
       WHERE "studentId" = $1`, [req.user.studentId]
    );
    if (user.rows.length > 0) {
      res.status(200).json(user.rows[0]);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    logger.error('Error fetching user: ' + error.message);
    res.status(500).json({ message: 'Error fetching user' });
  }
});

app.put('/users/update', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { firstName, lastName, email } = req.body;
  try {
    const result = await pool.query(
      `UPDATE "Users" SET "firstName" = $1, "lastName" = $2, "email" = $3 WHERE "studentId" = $4 RETURNING *`,
      [firstName, lastName, email, req.user.studentId]
    );

    if (result.rows.length > 0) {
      res.status(200).json(result.rows[0]);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    logger.error('Error updating user: ' + error.message);
    res.status(500).json({ message: 'Error updating user' });
  }
});

// Tests for User Routes
describe('User Routes', () => {
  describe('GET /users/me', () => {
    it('should fetch user details successfully', async () => {
      const mockUser = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        studentId: '1'
      };

      pool.query.mockResolvedValue({ rows: [mockUser] });

      const response = await request(app).get('/users/me');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUser);
    });

    it('should handle database errors', async () => {
      pool.query.mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/users/me');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ message: 'Error fetching user' });
    });
  });

  describe('PUT /users/update', () => {
    it('should update user details successfully', async () => {
      const mockUpdatedUser = {
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane.doe@example.com',
        studentId: '1'
      };

      pool.query.mockResolvedValue({ rows: [mockUpdatedUser] });

      const updateUserPayload = {
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane.doe@example.com'
      };

      const response = await request(app).put('/users/update').send(updateUserPayload);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUpdatedUser);
    });

   
      

    it('should handle database errors during update', async () => {
      pool.query.mockRejectedValue(new Error('Database error'));

      const updateUserPayload = {
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane.doe@example.com'
      };

      const response = await request(app).put('/users/update').send(updateUserPayload);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ message: 'Error updating user' });
    });
  });
});
