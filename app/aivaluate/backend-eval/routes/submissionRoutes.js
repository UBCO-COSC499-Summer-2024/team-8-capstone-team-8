const express = require('express');
const router = express.Router();
const { pool } = require('../dbConfig');
require('dotenv').config();

router.get('/submission/:submissionId', async (req, res) => {
    try {
        const { submissionId } = req.params;
        const submission = await pool.query(
            'SELECT * FROM "AssignmentSubmission" WHERE "assignmentSubmissionId" = $1',
            [submissionId]
        );
        res.json(submission.rows);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
