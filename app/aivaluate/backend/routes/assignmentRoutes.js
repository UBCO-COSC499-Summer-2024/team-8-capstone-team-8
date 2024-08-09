const express = require('express');
const router = express.Router();
const { pool } = require('../dbConfig');
const { formatDueDate } = require('../util');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const baseDir = path.resolve('/app/aivaluate/backend/assignmentSubmissions');

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
        const result = await pool.query('SELECT * FROM "Assignment" WHERE "courseId" = $1 AND "isPublished" = TRUE', [courseId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'No assignments found for this course' });
        }

        const assignments = result.rows.map(assignment => ({
            ...assignment,
            dueDate: assignment.dueDate //formatDueDate(assignment.dueDate)
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

// Get solution by assignment ID
router.get('/assignments/:assignmentId/solutions', async (req, res) => {
    const { assignmentId } = req.params;

    try {
        const result = await pool.query('SELECT "assignmentKey" FROM "Assignment" WHERE "assignmentId" = $1', [assignmentId]);
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
    const { assignmentKey } = req.body;

    try {
        const result = await pool.query(
            'UPDATE "Assignment" SET "assignmentKey" = $1 WHERE "assignmentId" = $2 RETURNING *',
            [assignmentKey, assignmentId]
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
            'UPDATE "Assignment" SET "assignmentKey" = NULL WHERE "assignmentId" = $1 RETURNING *',
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

// retrieve assignment details for the SubmitAssignment.jsx page
router.get('/assignment/:courseId/:assignmentId', async (req, res) => {
    const { courseId, assignmentId } = req.params;
    const studentId = req.session.studentId;

    if (!studentId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const assignmentQuery = `
            SELECT 
                a."assignmentName",
                a."assignmentDescription",
                ar."rubricName",
                ar."criteria",
                a."dueDate",
                a."maxObtainableGrade",
                ag."InstructorAssignedFinalGrade",
                ag."isGraded",
                sfr."InstructorFeedbackText"
            FROM "Assignment" a
            LEFT JOIN "useRubric" ur ON a."assignmentId" = ur."assignmentId"
            LEFT JOIN "AssignmentRubric" ar ON ur."assignmentRubricId" = ar."assignmentRubricId"
            LEFT JOIN "AssignmentGrade" ag ON a."assignmentId" = ag."assignmentId"
            AND ag."assignmentSubmissionId" = (
                SELECT "assignmentSubmissionId"
                FROM "AssignmentSubmission"
                WHERE "assignmentId" = $1 AND "studentId" = $2 AND "courseId" = $3
                LIMIT 1
            )
            LEFT JOIN "StudentFeedbackReport" sfr ON a."assignmentId" = sfr."assignmentId"
            AND sfr."studentId" = $2 AND sfr."courseId" = $3
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

const removeEmptyDirs = (directory) => {
    if (!fs.existsSync(directory)) {
        return;
    }
    const files = fs.readdirSync(directory);
    if (files.length > 0) {
        files.forEach((file) => {
            const fullPath = path.join(directory, file);
            if (fs.lstatSync(fullPath).isDirectory()) {
                removeEmptyDirs(fullPath);
            }
        });
    }

    if (fs.readdirSync(directory).length === 0) {
        fs.rmdirSync(directory);
    }
};

const fileFilter = (req, file, cb) => {
    const allowedExtensions = /(\.css|\.html|\.js|\.jsx)$/i;
    if (!allowedExtensions.exec(file.originalname)) {
        return cb(new Error('Please upload file having extensions .css, .html, .js, or .jsx only.'));
    }
    cb(null, true);
};

const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        const { courseId, assignmentId } = req.params;
        const studentId = req.session.studentId;

        if (!studentId) {
            console.error('Student ID not found in session');
            return cb(new Error('Student ID not found in session'), false);
        }

        try {
            const dir = path.resolve(__dirname, `../assignmentSubmissions/${studentId}/${courseId}/${assignmentId}`);
            fs.mkdirSync(dir, { recursive: true });
            req.assignmentDir = dir;
            cb(null, dir);
        } catch (err) {
            console.error('Error creating directory:', err);
            cb(err);
        }
    },
    filename: (req, file, cb) => {
        const { assignmentDir } = req;
        const filePath = path.resolve(assignmentDir, file.originalname);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        cb(null, file.originalname);
    },
});

const upload = multer({ storage: storage, fileFilter: fileFilter });

router.post('/upload/:courseId/:assignmentId', upload.array('files', 10), async (req, res) => {
    const { courseId, assignmentId } = req.params;
    const studentId = req.session.studentId;
    const currentDate = new Date();
    const formattedDate = currentDate.toISOString();
    const submissionLink = req.body.submissionLink || '';

    if (!studentId) {
        return res.status(401).send('Unauthorized');
    }

    try {
        if (req.files && req.files.length > 0) {
            // Handles the case of file uploads
            const filePromises = req.files.map(async (file) => {
                const newPath = path.join(req.assignmentDir, file.originalname);
                fs.mkdirSync(path.dirname(newPath), { recursive: true });
                fs.renameSync(file.path, newPath);

                const relativePath = path.relative(path.resolve(__dirname, '../'), newPath);
                const submissionFile = `${relativePath}`;

                const existingSubmission = await pool.query(
                    `SELECT "assignmentSubmissionId" FROM "AssignmentSubmission"
                    WHERE "studentId" = $1 AND "courseId" = $2 AND "assignmentId" = $3 AND "submissionFile" = $4`,
                    [studentId, courseId, assignmentId, submissionFile]
                );

                if (existingSubmission.rows.length > 0) {
                    const assignmentSubmissionId = existingSubmission.rows[0].assignmentSubmissionId;
                    await pool.query(
                        `UPDATE "AssignmentSubmission" SET "submittedAt" = $1, "updatedAt" = $1, "submissionLink" = $2 WHERE "assignmentSubmissionId" = $3`,
                        [formattedDate, submissionLink, assignmentSubmissionId]
                    );
                } else {
                    await pool.query(
                        `INSERT INTO "AssignmentSubmission" ("studentId", "courseId", "assignmentId", "submissionFile", "submissionLink", "submittedAt", "updatedAt", "isSubmitted")
                        VALUES ($1, $2, $3, $4, $5, $6, $6,true)`,
                        [studentId, courseId, assignmentId, submissionFile, submissionLink, formattedDate]
                    );
                }

                return { relativePath };
            });

            const validFiles = (await Promise.all(filePromises)).filter(Boolean);
            if (validFiles.length > 0) {
                const rootDir = path.resolve(__dirname, `../assignmentSubmissions/${studentId}/${courseId}/${assignmentId}`);
                removeEmptyDirs(rootDir);

                res.status(200).send('Files uploaded and paths saved successfully with links');
            } else {
                res.status(400).send('No valid files uploaded');
            }
        } else if (submissionLink) {
            // Handles the case of only submission links
            const existingSubmission = await pool.query(
                `SELECT "assignmentSubmissionId" FROM "AssignmentSubmission"
                WHERE "studentId" = $1 AND "courseId" = $2 AND "assignmentId" = $3`,
                [studentId, courseId, assignmentId]
            );

            if (existingSubmission.rows.length > 0) {
                const assignmentSubmissionId = existingSubmission.rows[0].assignmentSubmissionId;
                await pool.query(
                    `UPDATE "AssignmentSubmission" SET "submittedAt" = $1, "updatedAt" = $1, "submissionLink" = $2 WHERE "assignmentSubmissionId" = $3`,
                    [formattedDate, submissionLink, assignmentSubmissionId]
                );
            } else {
                await pool.query(
                    `INSERT INTO "AssignmentSubmission" ("studentId", "courseId", "assignmentId", "submissionLink", "submittedAt", "updatedAt", "isSubmitted")
                    VALUES ($1, $2, $3, $4, $5, $5, true)`,
                    [studentId, courseId, assignmentId, submissionLink, formattedDate]
                );
            }

            res.status(200).send('Link submitted successfully');
        } else {
            res.status(400).send('No files or links uploaded');
        }
    } catch (error) {
        console.error('Error saving submission:', error);
        res.status(500).send('Internal Server Error');
    }
});

router.get('/submission/:courseId/:assignmentId', async (req, res) => {
    const { courseId, assignmentId } = req.params;
    const studentId = req.session.studentId;

    if (!studentId) {
        return res.status(401).send('Unauthorized');
    }

    try {
        const result = await pool.query(
            `SELECT "assignmentSubmissionId", "submissionFile", "submissionLink" FROM "AssignmentSubmission" WHERE "studentId" = $1 AND "courseId" = $2 AND "assignmentId" = $3`,
            [studentId, courseId, assignmentId]
        );

        if (result.rows.length === 0) {
            return res.status(404).send('Submission not found');
        }

        res.status(200).send(result.rows.map(row => ({
            assignmentSubmissionId: row.assignmentSubmissionId,
            files: row.submissionFile ? row.submissionFile.split(',') : [],
            submissionLink: row.submissionLink
        })));
    } catch (error) {
        console.error('Error retrieving file paths from database:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Serve submission file
router.get('/download-submission/:studentId/:courseId/:assignmentId/:fileName', async (req, res) => {
    const { studentId, courseId, assignmentId, fileName } = req.params;
    console.log(`Received params - Student ID: ${studentId}, Course ID: ${courseId}, Assignment ID: ${assignmentId}, File Name: ${fileName}`);
    if (!assignmentId || assignmentId === 'undefined') {
        return res.status(400).send('Assignment ID is required');
    }

    try {
        const result = await pool.query(
            'SELECT "submissionFile" FROM "AssignmentSubmission" WHERE "studentId" = $1 AND "courseId" = $2 AND "assignmentId" = $3',
            [studentId, courseId, assignmentId]
        );

        if (result.rows.length === 0) {
            return res.status(404).send('Submission not found');
        }
        const fullFilePath = path.join(baseDir, studentId, courseId, assignmentId, fileName);
        console.log(`Full file path: ${fullFilePath}`);
        res.download(fullFilePath, fileName, (err) => {
            if (err) {
                console.error('Error downloading file:', err);
                res.status(500).send('Error downloading file');
            }
        });
    } catch (error) {
        console.error('Error fetching submission file from database:', error);
        res.status(500).send('Error fetching submission file');
    }
});

module.exports = router;