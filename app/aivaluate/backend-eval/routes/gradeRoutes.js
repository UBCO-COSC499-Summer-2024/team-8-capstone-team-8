const express = require('express');
const router = express.Router();
const { pool } = require('../dbConfig'); 

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/eval-api/login');
}

router.get('/evaluator-grades/:courseId', checkAuthenticated, async (req, res) => {
    const { courseId } = req.params;

    try {
        // Query to get assignment details ordered by due date
        const assignmentDetailsQuery = `
                SELECT a."assignmentId",
                    a."assignmentName" AS "name", 
                    a."dueDate" AS "due",
                    a."maxObtainableGrade",
                    COALESCE(SUM(ag."InstructorAssignedFinalGrade"), 0) AS "avgGrade",
                    COALESCE(SUM(a."maxObtainableGrade"), 0) AS "totalGrade"
                FROM "Assignment" a
                LEFT JOIN "AssignmentSubmission" asub ON a."assignmentId" = asub."assignmentId"
                LEFT JOIN "AssignmentGrade" ag ON asub."assignmentSubmissionId" = ag."assignmentSubmissionId"
                WHERE a."courseId" = $1  
                AND ag."AIassignedGrade" IS NOT NULL
                GROUP BY a."assignmentId", a."assignmentName", a."dueDate", a."maxObtainableGrade"
                ORDER BY a."dueDate" ASC
            `;
        const assignmentDetailsResult = await pool.query(assignmentDetailsQuery, [courseId]);
        const assignmentDetails = assignmentDetailsResult.rows;

        // Send the result as response
        res.json(assignmentDetails);
    } catch (err) {
        console.error('Error fetching evaluator grades:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

// Route to hide grades for an assignment
router.put('/assignments/:assignmentId/hide-grades', async (req, res) => {
    const { assignmentId } = req.params;

    try {
        // Set gradeHidden to true to hide grades
        const result = await pool.query(
            'UPDATE "Assignment" SET "gradeHidden" = true WHERE "assignmentId" = $1 RETURNING *',
            [assignmentId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Assignment not found' });
        }

        res.status(200).json({ message: 'Grades hidden successfully', assignment: result.rows[0] });
    } catch (error) {
        console.error('Error hiding grades:', error);
        res.status(500).json({ message: 'Error hiding grades' });
    }
});

// Route to release grades for an assignment
router.put('/assignments/:assignmentId/release-grades', async (req, res) => {
    const { assignmentId } = req.params;

    try {
        // Set gradeHidden to false to release grades
        const result = await pool.query(
            'UPDATE "Assignment" SET "gradeHidden" = false WHERE "assignmentId" = $1 RETURNING *',
            [assignmentId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Assignment not found' });
        }

        res.status(200).json({ message: 'Grades released successfully', assignment: result.rows[0] });
    } catch (error) {
        console.error('Error releasing grades:', error);
        res.status(500).json({ message: 'Error releasing grades' });
    }
});

// Route to determine if grades are hidden for an assignment
router.get('/assignments/:assignmentId/grades-hidden', async (req, res) => {
    const { assignmentId } = req.params;

    try {
        const result = await pool.query(
            'SELECT "gradeHidden" FROM "Assignment" WHERE "assignmentId" = $1',
            [assignmentId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Assignment not found' });
        }

        console.log('Grade Hidden Status:', result.rows[0].gradeHidden); // Log the gradeHidden value

        res.status(200).json({ gradeHidden: result.rows[0].gradeHidden });
    } catch (error) {
        console.error('Error determining if grades are hidden:', error);
        res.status(500).json({ message: 'Error determining if grades are hidden' });
    }
});

module.exports = router;