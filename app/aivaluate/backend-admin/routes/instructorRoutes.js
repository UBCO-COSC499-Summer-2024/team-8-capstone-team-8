const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { pool } = require('../dbConfig');

router.get('/tas', async (req, res) => {
    try {
        const tas = await pool.query('SELECT * FROM "Instructor" WHERE "isTA" = TRUE');
        res.status(200).send(tas.rows);
    } catch (error) {
        console.error('Error fetching TAs:', error);
        res.status(500).send({ message: 'Error fetching TAs' });
    }
});

router.delete('/teaches/:courseId/:instructorId', async (req, res) => {
    const { courseId, instructorId } = req.params;
    try {
        await pool.query('DELETE FROM "Teaches" WHERE "courseId" = $1 AND "instructorId" = $2', [courseId, instructorId]);
        res.status(200).send({ message: 'Instructor/TA removed from course successfully' });
    } catch (error) {
        console.error('Error removing Instructor/TA from course:', error);
        res.status(500).send({ message: 'Error removing Instructor/TA from course' });
    }
});

// Check if authenticated middleware
function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/admin-api/login');
}

// Get evaluator details
router.get('/evaluator/:instructorId', checkAuthenticated, async (req, res) => {
    const { instructorId } = req.params;
    try {
        const result = await pool.query('SELECT * FROM "Instructor" WHERE "instructorId" = $1', [instructorId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Evaluator not found' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching evaluator details:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

// Get courses by evaluator
router.get('/evaluator/:instructorId/courses', checkAuthenticated, async (req, res) => {
    const { instructorId } = req.params;
    try {
        const result = await pool.query('SELECT "Course"."courseName","Course"."courseCode" FROM "Course" JOIN "Teaches" ON "Course"."courseId" = "Teaches"."courseId" WHERE "Teaches"."instructorId" = $1;', [instructorId]);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching courses:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

// Register a new evaluator
router.post('/evaluatorRegister', checkAuthenticated, async (req, res) => {
    const { firstName, lastName, email, password, isTA, department } = req.body;
    try {
        const emailCheckQuery = 'SELECT * FROM "Instructor" WHERE "email" = $1';
        const emailCheckResult = await pool.query(emailCheckQuery, [email]);
        if (emailCheckResult.rows.length > 0) {
            return res.status(400).json({ error: 'Email already in use' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        // Insert without specifying instructorId to let PostgreSQL handle it
        await pool.query(
            'INSERT INTO "Instructor" ("firstName", "lastName", "email", "password", "isTA", "department") VALUES ($1, $2, $3, $4, $5, $6)',
            [firstName, lastName, email, hashedPassword, isTA, department]
        );
        res.status(201).json({ message: 'Instructor registered successfully' });
    } catch (error) {
        console.error('Error registering instructor:', error);
        console.error('Request body:', req.body);
        if (error.stack) {
            console.error(error.stack);
        }
        res.status(500).json({ error: 'Database error' });
    }
});

// Fetch all deleted evaluators
router.get('/deleted-evaluators', checkAuthenticated, async (req, res) => {
    try {
        const result = await pool.query('SELECT "instructorId", "firstName", "lastName", "email", "department", "isTA", "deleted_at" FROM "BackupInstructor"');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching deleted evaluators:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

// Delete evaluator (soft delete)
router.delete('/evaluator/:instructorId', checkAuthenticated, async (req, res) => {
    const { instructorId } = req.params;
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Fetch the instructor to be deleted
        const selectQuery = 'SELECT * FROM "Instructor" WHERE "instructorId" = $1';
        const result = await client.query(selectQuery, [instructorId]);
        if (result.rows.length === 0) {
            await client.query('ROLLBACK');
            console.log('Evaluator not found, rolling back');
            return res.status(404).json({ error: 'Evaluator not found' });
        }
        const instructor = result.rows[0];

        console.log('Instructor to be deleted:', instructor); // Debug log

        // Backup the instructor
        const insertBackupQuery = `
            INSERT INTO "BackupInstructor" ("instructorId", "firstName", "lastName", "email", "password", "department", "isTA", "resetPasswordToken", "resetPasswordExpires", "deleted_at")
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
        `;
        await client.query(insertBackupQuery, [
            instructor.instructorId,
            instructor.firstName,
            instructor.lastName,
            instructor.email,
            instructor.password,
            instructor.department,
            instructor.isTA,
            instructor.resetPasswordToken,
            instructor.resetPasswordExpires
        ]);

        console.log('Instructor backed up successfully'); // Debug log

        // Backup related courses
        const coursesResult = await client.query('SELECT * FROM "Teaches" WHERE "instructorId" = $1', [instructorId]);
        for (const course of coursesResult.rows) {
            await client.query(`
                INSERT INTO "BackupTeaches" ("instructorId", "courseId", "deleted_at")
                VALUES ($1, $2, NOW())
            `, [course.instructorId, course.courseId]);
        }
        console.log('Related courses backed up successfully'); // Debug log

        // Backup related prompts
        const promptsResult = await client.query('SELECT * FROM "Prompt" WHERE "instructorId" = $1', [instructorId]);
        for (const prompt of promptsResult.rows) {
            await client.query(`
                INSERT INTO "BackupPrompt" ("promptId", "promptName", "promptText", "instructorId", "isSelected", "deleted_at")
                VALUES ($1, $2, $3, $4, $5, NOW())
            `, [
                prompt.promptId,
                prompt.promptName,
                prompt.promptText,
                prompt.instructorId,
                prompt.isSelected
            ]);
        }
        console.log('Related prompts backed up successfully'); // Debug log

        // Delete the instructor from the main table
        const deleteQuery = 'DELETE FROM "Instructor" WHERE "instructorId" = $1';
        await client.query(deleteQuery, [instructorId]);

        console.log('Instructor deleted from main table'); // Debug log

        await client.query('COMMIT');
        res.status(200).json({ message: 'Evaluator deleted successfully' });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error deleting evaluator:', error);
        res.status(500).json({ error: 'Database error' });
    } finally {
        client.release();
    }
});

// Restore evaluator
router.post('/evaluator/restore/:instructorId', checkAuthenticated, async (req, res) => {
    const { instructorId } = req.params;
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Fetch the instructor from the backup table
        const selectQuery = 'SELECT * FROM "BackupInstructor" WHERE "instructorId" = $1';
        const result = await client.query(selectQuery, [instructorId]);
        if (result.rows.length === 0) {
            await client.query('ROLLBACK');
            console.log('Evaluator not found in backup, rolling back');
            return res.status(404).json({ error: 'Evaluator not found in backup' });
        }
        const instructor = result.rows[0];

        console.log('Instructor to be restored:', instructor); // Debug log

        // Restore the instructor to the main table
        const insertMainQuery = `
            INSERT INTO "Instructor" ("instructorId", "firstName", "lastName", "email", "password", "department", "isTA", "resetPasswordToken", "resetPasswordExpires")
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            ON CONFLICT DO NOTHING
        `;
        await client.query(insertMainQuery, [
            instructor.instructorId,
            instructor.firstName,
            instructor.lastName,
            instructor.email,
            instructor.password,
            instructor.department,
            instructor.isTA,
            instructor.resetPasswordToken,
            instructor.resetPasswordExpires
        ]);

        console.log('Instructor restored to main table'); // Debug log

        // Restore related courses
        const backupCoursesResult = await client.query('SELECT * FROM "BackupTeaches" WHERE "instructorId" = $1', [instructorId]);
        for (const backupCourse of backupCoursesResult.rows) {
            await client.query(`
                INSERT INTO "Teaches" ("instructorId", "courseId")
                VALUES ($1, $2)
                ON CONFLICT DO NOTHING
            `, [backupCourse.instructorId, backupCourse.courseId]);
        }
        console.log('Related courses restored successfully'); // Debug log

        // Restore related prompts
        const backupPromptsResult = await client.query('SELECT * FROM "BackupPrompt" WHERE "instructorId" = $1', [instructorId]);
        for (const backupPrompt of backupPromptsResult.rows) {
            await client.query(`
                INSERT INTO "Prompt" ("promptId", "promptName", "promptText", "instructorId", "isSelected")
                VALUES ($1, $2, $3, $4, $5)
                ON CONFLICT DO NOTHING
            `, [
                backupPrompt.promptId,
                backupPrompt.promptName,
                backupPrompt.promptText,
                backupPrompt.instructorId,
                backupPrompt.isSelected
            ]);
        }
        console.log('Related prompts restored successfully'); // Debug log

        // Delete the backup entries for the restored instructor
        await client.query('DELETE FROM "BackupInstructor" WHERE "instructorId" = $1', [instructorId]);
        await client.query('DELETE FROM "BackupTeaches" WHERE "instructorId" = $1', [instructorId]);
        await client.query('DELETE FROM "BackupPrompt" WHERE "instructorId" = $1', [instructorId]);

        await client.query('COMMIT');
        res.status(200).json({ message: 'Evaluator restored successfully' });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error restoring evaluator:', error);
        res.status(500).json({ error: 'Database error' });
    } finally {
        client.release();
    }
});

// Remove course from evaluator
router.delete('/evaluator/:instructorId/drop/:courseCode', checkAuthenticated, async (req, res) => {
    const { instructorId, courseCode } = req.params;
    try {
        const dropQuery = `DELETE FROM "Teaches" WHERE "instructorId" = $1 AND "courseId" = (SELECT "courseId" FROM "Course" WHERE "courseCode" = $2)`;
        await pool.query(dropQuery, [instructorId, courseCode]);
        res.status(200).json({ message: 'Course removed from instructor successfully' });
    } catch (error) {
        console.error('Error removing course from evaluator:', error);
        res.status(500).json({ error: 'Database error' });
    }
});





router.put('/evaluator/:instructorId', checkAuthenticated, async (req, res) => {
    const { instructorId } = req.params;
    const { firstName, lastName, email } = req.body;

    console.log('Updating evaluator with ID:', instructorId); // Debugging line
    console.log('Received data:', req.body); // Debugging line

    try {
        const result = await pool.query(
            'UPDATE "Instructor" SET "firstName" = $1, "lastName" = $2, "email" = $3 WHERE "instructorId" = $4',
            [firstName, lastName, email, instructorId]
        );
        console.log('Update result:', result); // Debugging line
        res.status(200).json({ message: 'Evaluator updated successfully' });
    } catch (error) {
        console.error('Error updating evaluator:', error); // Detailed error logging
        res.status(500).json({ message: 'Server error' });
    }
});

// In your routes file

router.put('/evaluator/:id/role', async (req, res) => {
    const { id } = req.params;
    const { isTA } = req.body;

    try {
        await pool.query('UPDATE "Instructor" SET "isTA" = $1 WHERE "instructorId" = $2', [isTA, id]);
        res.status(200).json({ message: 'Role updated successfully' });
    } catch (error) {
        console.error('Error updating role:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});



module.exports = router;
