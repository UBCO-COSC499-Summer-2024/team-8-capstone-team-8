const express = require('express');
const router = express.Router();
const { pool } = require('../dbConfig'); 

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/stu-api/login');
}

router.get('/student-grades/:courseId', checkAuthenticated, async (req, res) => {
    const { courseId } = req.params;
    const studentId = req.user.studentId;

    if (!studentId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const query = `
            SELECT 
                a."assignmentName" AS name,
                a."dueDate" AS due,
                COALESCE(MAX(ag."InstructorAssignedFinalGrade"), 0) AS score,
                a."maxObtainableGrade" AS total,
                MAX(COALESCE(s."submittedAt", '1970-01-01'::date)) > '1970-01-01'::date AS submitted,
                BOOL_OR(s."isGraded") AS marked
            FROM "Assignment" a
            LEFT JOIN "AssignmentSubmission" s ON a."assignmentId" = s."assignmentId" AND s."studentId" = $1
            LEFT JOIN "AssignmentGrade" ag ON s."assignmentSubmissionId" = ag."assignmentSubmissionId"
            WHERE a."courseId" = $2
            GROUP BY a."assignmentId"
        `;
        const result = await pool.query(query, [studentId, courseId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'No grades found' });
        }

        const totalGrade = result.rows.reduce((sum, row) => sum + row.score, 0);
        const totalMaxGrade = result.rows.reduce((sum, row) => sum + row.total, 0);

        res.status(200).json({
            studentName: req.user.name,
            totalGrade,
            totalMaxGrade,
            assignments: result.rows
        });
    } catch (error) {
        console.error('Error fetching student grades:', error);
        res.status(500).json({ message: 'Error fetching student grades' });
    }
});

module.exports = router;