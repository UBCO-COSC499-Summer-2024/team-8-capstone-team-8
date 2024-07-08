const express = require('express');
const router = express.Router();
const { pool } = require('../dbConfig');
const { formatDueDate } = require('../util');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create a new assignment
router.post('/assignments', async (req, res) => {
    const { courseId, dueDate, assignmentKey, maxObtainableGrade, assignmentDescription } = req.body;

    try {
        const result = await pool.query(
            'INSERT INTO "Assignment" ("courseId", "dueDate", "assignmentKey", "maxObtainableGrade", "assignmentDescription") VALUES ($1, $2, $3, $4, $5) RETURNING "assignmentId"',
            [courseId, dueDate, assignmentKey, maxObtainableGrade, assignmentDescription]
        );
        res.status(201).send({ assignmentId: result.rows[0].assignmentId, message: 'Assignment created successfully' });
    } catch (error) {
        console.error('Error creating assignment:', error);
        res.status(500).send({ message: 'Error creating assignment' });
    }
});

// Get all assignments
router.get('/assignments', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM "Assignment"');
        res.status(200).send(result.rows);
    } catch (error) {
        console.error('Error fetching assignments:', error);
        res.status(500).send({ message: 'Error fetching assignments' });
    }
});

// Get assignment by ID
router.get('/assignments/:assignmentId', async (req, res) => {
    const { assignmentId } = req.params;

    try {
        const result = await pool.query('SELECT * FROM "Assignment" WHERE "assignmentId" = $1', [assignmentId]);
        if (result.rows.length === 0) {
            return res.status(404).send({ message: 'Assignment not found' });
        }
        res.status(200).send(result.rows[0]);
    } catch (error) {
        console.error('Error fetching assignment:', error);
        res.status(500).send({ message: 'Error fetching assignment' });
    }
});

// Get assignments by course ID
router.get('/assignments/course/:courseId', async (req, res) => {
    const courseId = parseInt(req.params.courseId, 10);

    if (isNaN(courseId)) {
        return res.status(400).json({ message: 'Invalid course ID' });
    }

    try {
        const result = await pool.query('SELECT * FROM "Assignment" WHERE "courseId" = $1', [courseId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'No assignments found for this course' });
        }

        const assignments = result.rows.map(assignment => ({
            ...assignment,
            dueDate: formatDueDate(assignment.dueDate)
        }));

        res.status(200).json(assignments);
    } catch (error) {
        console.error('Error fetching assignments:', error.message);
        res.status(500).json({ message: 'Error fetching assignments' });
    }
});


// Update an assignment
router.put('/assignments/:assignmentId', async (req, res) => {
    const { assignmentId } = req.params;
    const { courseId, dueDate, assignmentKey, maxObtainableGrade, assignmentDescription } = req.body;

    try {
        const result = await pool.query(
            'UPDATE "Assignment" SET "courseId" = $1, "dueDate" = $2, "assignmentKey" = $3, "maxObtainableGrade" = $4, "assignmentDescription" = $5 WHERE "assignmentId" = $6 RETURNING *',
            [courseId, dueDate, assignmentKey, maxObtainableGrade, assignmentDescription, assignmentId]
        );
        if (result.rows.length === 0) {
            return res.status(404).send({ message: 'Assignment not found' });
        }
        res.status(200).send(result.rows[0]);
    } catch (error) {
        console.error('Error updating assignment:', error);
        res.status(500).send({ message: 'Error updating assignment' });
    }
});

// Delete an assignment
router.delete('/assignments/:assignmentId', async (req, res) => {
    const { assignmentId } = req.params;

    try {
        const result = await pool.query('DELETE FROM "Assignment" WHERE "assignmentId" = $1 RETURNING *', [assignmentId]);
        if (result.rows.length === 0) {
            return res.status(404).send({ message: 'Assignment not found' });
        }
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting assignment:', error);
        res.status(500).send({ message: 'Error deleting assignment' });
    }
});

// Fetch rubrics
router.get('/rubrics', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM "AssignmentRubric"');
        res.status(200).send(result.rows);
    } catch (error) {
        console.error('Error fetching rubrics:', error);
        res.status(500).send({ message: 'Error fetching rubrics' });
    }
});

// Add a rubric
router.post('/rubrics', async (req, res) => {
    const { assignmentId, courseId, criteria } = req.body;

    try {
        const result = await pool.query(
            'INSERT INTO "AssignmentRubric" ("assignmentId", "courseId", "criteria") VALUES ($1, $2, $3) RETURNING *',
            [assignmentId, courseId, criteria]
        );
        res.status(201).send(result.rows[0]);
    } catch (error) {
        console.error('Error adding rubric:', error);
        res.status(500).send({ message: 'Error adding rubric' });
    }
});

// Update a rubric
router.put('/rubrics/:rubricId', async (req, res) => {
    const { rubricId } = req.params;
    const { assignmentId, courseId, criteria } = req.body;

    try {
        const result = await pool.query(
            'UPDATE "AssignmentRubric" SET "assignmentId" = $1, "courseId" = $2, "criteria" = $3 WHERE "assignmentRubricId" = $4 RETURNING *',
            [assignmentId, courseId, criteria, rubricId]
        );
        if (result.rows.length === 0) {
            return res.status(404).send({ message: 'Rubric not found' });
        }
        res.status(200).send(result.rows[0]);
    } catch (error) {
        console.error('Error updating rubric:', error);
        res.status(500).send({ message: 'Error updating rubric' });
    }
});

// Delete a rubric
router.delete('/rubrics/:rubricId', async (req, res) => {
    const { rubricId } = req.params;

    try {
        const result = await pool.query('DELETE FROM "AssignmentRubric" WHERE "assignmentRubricId" = $1 RETURNING *', [rubricId]);
        if (result.rows.length === 0) {
            return res.status(404).send({ message: 'Rubric not found' });
        }
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting rubric:', error);
        res.status(500).send({ message: 'Error deleting rubric' });
    }
});

// Add a solution
router.post('/assignments/:assignmentId/solutions', async (req, res) => {
    const { assignmentId } = req.params;
    const { solutionFile } = req.body;

    try {
        await pool.query(
            'UPDATE "Assignment" SET "solutionFile" = $1 WHERE "assignmentId" = $2',
            [solutionFile, assignmentId]
        );
        res.status(200).send({ message: 'Solution added successfully' });
    } catch (error) {
        console.error('Error adding solution:', error);
        res.status(500).send({ message: 'Error adding solution' });
    }
});

// Get solution by assignment ID
router.get('/assignments/:assignmentId/solutions', async (req, res) => {
    const { assignmentId } = req.params;

    try {
        const result = await pool.query('SELECT "solutionFile" FROM "Assignment" WHERE "assignmentId" = $1', [assignmentId]);
        if (result.rows.length === 0) {
            return res.status(404).send({ message: 'Solution not found' });
        }
        res.status(200).send(result.rows[0]);
    } catch (error) {
        console.error('Error fetching solution:', error);
        res.status(500).send({ message: 'Error fetching solution' });
    }
});


// Update solution by assignment ID
router.put('/assignments/:assignmentId/solutions', async (req, res) => {
    const { assignmentId } = req.params;
    const { solutionFile } = req.body;

    try {
        const result = await pool.query(
            'UPDATE "Assignment" SET "solutionFile" = $1 WHERE "assignmentId" = $2 RETURNING *',
            [solutionFile, assignmentId]
        );
        if (result.rows.length === 0) {
            return res.status(404).send({ message: 'Solution not found' });
        }
        res.status(200).send(result.rows[0]);
    } catch (error) {
        console.error('Error updating solution:', error);
        res.status(500).send({ message: 'Error updating solution' });
    }
});

// Delete solution by assignment ID
router.delete('/assignments/:assignmentId/solutions', async (req, res) => {
    const { assignmentId } = req.params;

    try {
        const result = await pool.query(
            'UPDATE "Assignment" SET "solutionFile" = NULL WHERE "assignmentId" = $1 RETURNING *',
            [assignmentId]
        );
        if (result.rows.length === 0) {
            return res.status(404).send({ message: 'Solution not found' });
        }
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting solution:', error);
        res.status(500).send({ message: 'Error deleting solution' });
    }
});


router.get('/assignment/:courseId/:assignmentId', async (req, res) => {
    const { courseId, assignmentId } = req.params;
    const studentId = req.session.studentId; // Assuming studentId is saved in the session storage

    if (!studentId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const assignmentQuery = `
            SELECT 
                a."assignmentName",
                ar."rubricName",
                ar."criteria",
                a."dueDate",
                a."maxObtainableGrade",
                ag."InstructorAssignedFinalGrade"
            FROM "Assignment" a
            LEFT JOIN "AssignmentRubric" ar ON a."assignmentId" = ar."assignmentId"
            LEFT JOIN "AssignmentGrade" ag ON a."assignmentId" = ag."assignmentId"
            AND ag."assignmentSubmissionId" = (
                SELECT "assignmentSubmissionId"
                FROM "AssignmentSubmission"
                WHERE "assignmentId" = $1 AND "studentId" = $2 AND "courseId" = $3
                LIMIT 1
            )
            WHERE a."assignmentId" = $1 AND a."courseId" = $3
        `;
        const result = await pool.query(assignmentQuery, [assignmentId, studentId, courseId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Assignment not found' });
        }

        const assignment = result.rows[0];
        assignment.InstructorAssignedFinalGrade = assignment.InstructorAssignedFinalGrade || "--";

        res.json(assignment);
    } catch (err) {
        console.error('Error fetching assignment details:', err);
        res.status(500).json({ message: 'Server error' });
    }
});


// Configure multer for file storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const { courseId, assignmentId } = req.params;
      const studentId = req.user.studentId;
  
      if (!studentId) {
        return cb(new Error('Student ID not found in session'), false);
      }
  
      const dir = `./assignmentSubmissions/${courseId}/${assignmentId}/${studentId}`;
      console.log(`Destination directory: ${dir}`);

      // Create the directory if it doesn't exist
      fs.mkdirSync(dir, { recursive: true });
  
      cb(null, dir);
    },
    filename: (req, file, cb) => {
        console.log(`Filename: ${file.originalname}`);
      cb(null, file.originalname);
    },
  });
  
  const upload = multer({ storage: storage });
  
  router.post('/upload/:courseId/:assignmentId', upload.single('file'), (req, res) => {
    if (req.file) {
        console.log('File uploaded successfully:', req.file);
        res.send('File uploaded successfully');
    } else {
        console.error('File upload failed');
        res.status(500).send('File upload failed');
    }
});


module.exports = router;