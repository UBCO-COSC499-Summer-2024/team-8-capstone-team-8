// Last Edited: June 14, 2024
// Contributor: Omar Hemed
// Purpose: Backend Logic for course creation and fetching
// This file is currently not ultilized in the frontend

const express = require('express');
const router = express.Router();
const { pool } = require('../dbConfig');
const bcrypt = require('bcryptjs');

// Fetch user details
router.get('/users/me', (req, res) => {
    if (req.isAuthenticated()) {
        const userId = req.user.studentId;

        pool.query(
            'SELECT "firstName", "lastName", email, "studentId" FROM "Student" WHERE "studentId" = $1',
            [userId],
            (err, results) => {
                if (err) {
                    console.error('Error fetching user details:', err);
                    return res.status(500).json({ error: 'Database error' });
                }
                if (results.rows.length > 0) {
                    res.json(results.rows[0]);
                } else {
                    res.status(404).json({ error: 'User not found' });
                }
            }
        );
    } else {
        res.status(401).json({ error: 'Unauthorized' });
    }
});

// Update user details
router.put('/users/update', async (req, res) => {
    if (req.isAuthenticated()) {
        const userId = req.user.studentId;
        const { firstName, lastName, email, password } = req.body;

        try {
            let hashedPassword;
            if (password) {
                hashedPassword = await bcrypt.hash(password, 10);
            }

            pool.query(
                `UPDATE "Student" 
                SET "firstName" = $1, "lastName" = $2, email = $3, "password" = COALESCE($4, "password")
                WHERE "studentId" = $5
                RETURNING "firstName", "lastName", email, "studentId"`,
                [firstName, lastName, email, hashedPassword, userId],
                (err, results) => {
                    if (err) {
                        console.error('Error updating user details:', err);
                        return res.status(500).json({ error: 'Database error' });
                    }
                    res.json(results.rows[0]);
                }
            );
        } catch (error) {
            console.error('Error processing request:', error);
            res.status(500).json({ error: 'Server error' });
        }
    } else {
        res.status(401).json({ error: 'Unauthorized' });
    }
});

module.exports = router;
