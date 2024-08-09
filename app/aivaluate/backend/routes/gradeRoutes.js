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
        // Query to get student name and grade sums for visible grades
        const studentInfoQuery = `
            SELECT s."firstName", 
                   COALESCE(SUM(ag."InstructorAssignedFinalGrade"), 0) AS "totalGrade",
                   COALESCE(SUM(a."maxObtainableGrade"), 0) AS "totalMaxGrade"
            FROM "Student" s
            LEFT JOIN "AssignmentSubmission" asub ON s."studentId" = asub."studentId"
            LEFT JOIN "AssignmentGrade" ag ON asub."assignmentSubmissionId" = ag."assignmentSubmissionId"
            LEFT JOIN "Assignment" a ON asub."assignmentId" = a."assignmentId"
            WHERE s."studentId" = $1 
              AND asub."courseId" = $2 
              AND ag."isGraded" = true  
              AND a."isPublished" = true 
              AND a."gradeHidden" = false
            GROUP BY s."firstName"
        `;
        const studentInfoResult = await pool.query(studentInfoQuery, [studentId, courseId]);
        const studentInfo = studentInfoResult.rows[0];

        // Query to get assignment details
        const query = `
            SELECT 
                a."assignmentId",
                a."assignmentName" AS name,
                a."dueDate" AS due,
                COALESCE(MAX(ag."InstructorAssignedFinalGrade"), 0) AS score,
                a."maxObtainableGrade" AS total,
                MAX(COALESCE(s."submittedAt", '1970-01-01'::date)) > '1970-01-01'::date AS submitted,
                BOOL_OR(s."isGraded") AS marked,
                BOOL_OR(a."isPublished") AS published,
                BOOL_OR(a."gradeHidden") AS hidden
            FROM "Assignment" a
            LEFT JOIN "AssignmentSubmission" s ON a."assignmentId" = s."assignmentId" AND s."studentId" = $1
            LEFT JOIN "AssignmentGrade" ag ON s."assignmentSubmissionId" = ag."assignmentSubmissionId"
            WHERE a."courseId" = $2 
              AND a."isPublished" = true
            GROUP BY a."assignmentId"
        `;
        const result = await pool.query(query, [studentId, courseId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'No grades found' });
        }

        // Calculate the total visible grades
        const totalGrade = result.rows.reduce((sum, row) => {
            return row.hidden ? sum : sum + row.score;
        }, 0);
        
        const totalMaxGrade = result.rows.reduce((sum, row) => {
            return row.hidden ? sum : sum + row.total;
        }, 0);

        res.status(200).json({
            studentName: studentInfo ? studentInfo.firstName : 'Student',
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
