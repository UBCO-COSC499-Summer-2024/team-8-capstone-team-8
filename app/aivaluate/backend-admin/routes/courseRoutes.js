const express = require('express');
const router = express.Router();
const { pool } = require('../dbConfig'); 

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/admin-api/login');
}

// Create a course
router.post('/courses', async (req, res) => {
    const { courseName, courseCode, maxStudents } = req.body;
    console.log(req.body);

    try {
        const result = await pool.query(
            'INSERT INTO "Course" ("courseName", "courseCode", "maxStudents") VALUES ($1, $2, $3) RETURNING "courseId"',
            [courseName, courseCode, maxStudents]
        );
        res.status(201).send({ courseId: result.rows[0].courseId, message: 'Course created successfully' });
    } catch (error) {
        console.error('Error creating course:', error);
        res.status(500).send({ message: 'Error creating course' });
    }
});

// Get all courses
router.get('/courses', async (req, res) => {
    try {
        const courses = await pool.query('SELECT * FROM "Course"');
        res.status(200).send(courses.rows);
    } catch (error) {
        console.error('Error fetching courses:', error);
        res.status(500).send({ message: 'Error fetching courses' });
    }
});

// Get all archived courses
router.get('/courses/archived', async (req, res) => {
    try {
        const courses = await pool.query('SELECT * FROM "Course" WHERE "isArchived" = TRUE');
        res.status(200).send(courses.rows);
    } catch (error) {
        console.error('Error fetching courses:', error);
        res.status(500).send({ message: 'Error fetching courses' });
    }
});

// Get all active courses
router.get('/courses/active', async (req, res) => {
    try {
        const courses = await pool.query('SELECT * FROM "Course" WHERE "isArchived" = FALSE');
        res.status(200).send(courses.rows);
    } catch (error) {
        console.error('Error fetching courses:', error);
        res.status(500).send({ message: 'Error fetching courses' });
    }
});

router.get('/enrolled-courses', checkAuthenticated, (req, res) => {
    const instructorId = req.user.instructorId;
    console.log('instructor ID:', instructorId);

    pool.query(
        `SELECT "Course"."courseId", "Course"."courseCode", "Course"."courseName" 
         FROM "Teaches" 
         JOIN "Course" ON "Teaches"."courseId" = "Course"."courseId" 
         WHERE "Teaches"."instructorId" = $1`,
        [instructorId],
        (err, results) => {
            if (err) {
                console.error('Error executing query:', err);
                return res.status(500).json({ error: 'Database error' });
            }
            console.log('Courses:', results.rows);
            res.json(results.rows);
        }
    );
});

router.get('/courses/:courseId', async (req, res) => {
    const courseId = parseInt(req.params.courseId, 10);

    try {
        const courseQuery = 'SELECT * FROM "Course" WHERE "courseId" = $1';
        const courseResult = await pool.query(courseQuery, [courseId]);

        if (courseResult.rowCount === 0) {
            return res.status(404).json({ message: 'Course not found' });
        }

        const course = courseResult.rows[0];

        // Fetch the primary instructor for the course
        const instructorQuery = `
            SELECT "Instructor"."instructorId", "Instructor"."firstName", "Instructor"."lastName"
            FROM "Instructor"
            JOIN "Teaches" ON "Instructor"."instructorId" = "Teaches"."instructorId"
            WHERE "Teaches"."courseId" = $1 AND "Instructor"."isTA" = FALSE
        `;
        const instructorResult = await pool.query(instructorQuery, [courseId]);

        // Fetch all TAs for the course
        const tasQuery = `
            SELECT "Instructor"."instructorId", "Instructor"."firstName", "Instructor"."lastName"
            FROM "Instructor"
            JOIN "Teaches" ON "Instructor"."instructorId" = "Teaches"."instructorId"
            WHERE "Teaches"."courseId" = $1 AND "Instructor"."isTA" = TRUE
        `;
        const tasResult = await pool.query(tasQuery, [courseId]);

        const instructor = instructorResult.rows[0] || null;
        const tas = tasResult.rows;

        res.status(200).json({ ...course, instructor, tas });
    } catch (error) {
        console.error('Error fetching course:', error);
        res.status(500).json({ message: 'Error fetching course' });
    }
});

// Update a course
router.put('/courses/:id', async (req, res) => {
    const courseId = req.params.id;
    const { courseName, courseCode, maxStudents } = req.body;

    try {
        const result = await pool.query(
            'UPDATE "Course" SET "courseName" = $1, "courseCode" = $2, "maxStudents" = $3 WHERE "courseId" = $4',
            [courseName, courseCode, maxStudents, courseId]
        );

        if (result.rowCount > 0) {
            res.status(200).send({ message: 'Course updated successfully' });
        } else {
            res.status(404).send({ message: 'Course not found' });
        }
    } catch (error) {
        console.error('Error updating course:', error);
        res.status(500).send({ message: 'Error updating course' });
    }
});

// Create a course
router.post('/courses', async (req, res) => {
    const { courseName, courseCode, maxStudents } = req.body;

    console.log(req.body);

    try {
        const result = await pool.query(
            'INSERT INTO "Course" ("courseName", "courseCode", "maxStudents") VALUES ($1, $2, $3) RETURNING "courseId"',
            [courseName, courseCode, maxStudents]
        );
        res.status(201).send({ courseId: result.rows[0].courseId, message: 'Course created successfully' });
    } catch (error) {
        console.error('Error creating course:', error);
        res.status(500).send({ message: 'Error creating course' });
    }
});



// Fetch all submissions for a course
router.get('/courses/:courseId/submissions', async (req, res) => {
    const courseId = parseInt(req.params.courseId, 10);

    if (!courseId) {
        return res.status(400).json({ message: 'Invalid course ID' });
    }

    try {
        const query = `
            SELECT 
                "AssignmentSubmission"."assignmentSubmissionId",
                "AssignmentSubmission"."studentId",
                "Student"."firstName",
                "Student"."lastName",
                "Assignment"."assignmentKey",
                "Assignment"."assignmentId",
                "AssignmentSubmission"."isGraded",
                "AssignmentSubmission"."submissionFile"
            FROM "AssignmentSubmission"
            JOIN "Assignment" ON "AssignmentSubmission"."assignmentId" = "Assignment"."assignmentId"
            JOIN "Student" ON "AssignmentSubmission"."studentId" = "Student"."studentId"
            WHERE "AssignmentSubmission"."courseId" = $1
        `;
        const result = await pool.query(query, [courseId]);
        console.log(result.rows);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'No submissions found for this course' });
        }

        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching submissions:', error);
        res.status(500).json({ message: 'Error fetching submissions' });
    }
});

// Fetch course details for an instructor
router.get('/instructors/:instructorId/courses', async (req, res) => {
    const instructorId = parseInt(req.params.instructorId, 10);

    try {
        const result = await pool.query(
            `SELECT "Course"."courseId", "Course"."courseName", "Course"."courseCode"
             FROM "Teaches"
             JOIN "Course" ON "Teaches"."courseId" = "Course"."courseId"
             WHERE "Teaches"."instructorId" = $1`,
            [instructorId]
        );
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching courses:', error);
        res.status(500).json({ message: 'Error fetching courses' });
    }
});

// Archive a course
router.put('/courses/:courseId/archive', async (req, res) => {
    const courseId = parseInt(req.params.courseId, 10);

    try {
        const result = await pool.query('UPDATE "Course" SET "isArchived" = TRUE WHERE "courseId" = $1', [courseId]);

        if (result.rowCount > 0) {
            res.status(200).json({ message: 'Course archived successfully' });
        } else {
            res.status(404).json({ message: 'Course not found' });
        }
    } catch (error) {
        console.error('Error archiving course:', error);
        res.status(500).json({ message: 'Error archiving course' });
    }
});

// Unarchive a course
router.put('/courses/:courseId/unarchive', async (req, res) => {
    const courseId = parseInt(req.params.courseId, 10);

    try {
        const result = await pool.query('UPDATE "Course" SET "isArchived" = FALSE WHERE "courseId" = $1', [courseId]);

        if (result.rowCount > 0) {
            res.status(200).json({ message: 'Course unarchived successfully' });
        } else {
            res.status(404).json({ message: 'Course not found' });
        }
    } catch (error) {
        console.error('Error unarchiving course:', error);
        res.status(500).json({ message: 'Error unarchiving course' });
    }
});

// Determine if a course is archived
router.get('/courses/:courseId/is-archived', async (req, res) => {
    const courseId = parseInt(req.params.courseId, 10);

    try {
        const result = await pool.query('SELECT "isArchived" FROM "Course" WHERE "courseId" = $1', [courseId]);

        if (result.rowCount > 0) {
            res.status(200).json({ isArchived: result.rows[0].isArchived });
        } else {
            res.status(404).json({ message: 'Course not found' });
        }
    } catch (error) {
        console.error('Error fetching course:', error);
        res.status(500).json({ message: 'Error fetching course' });
    }
});

// Assign a professor to a course
router.post('/courses/:courseId/instructors', async (req, res) => {
    const courseId = parseInt(req.params.courseId, 10);
    const { instructorId } = req.body;

    try {
        const result = await pool.query(
            'INSERT INTO "Teaches" ("instructorId", "courseId") VALUES ($1, $2)',
            [instructorId, courseId]
        );
        res.status(201).json({ message: 'Professor assigned to course successfully' });
    } catch (error) {
        console.error('Error assigning professor to course:', error);
        res.status(500).json({ message: 'Error assigning professor to course' });
    }
});

// Soft delete a course and backup dependent data
router.delete('/courses/:id', async (req, res) => {
    const courseId = req.params.id;

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Backup dependent data
        await client.query(`
            INSERT INTO "BackupEnrolledIn" ("studentId", "courseId", "studentGrade", "deleted_at")
            SELECT "studentId", "courseId", "studentGrade", NOW()
            FROM "EnrolledIn"
            WHERE "courseId" = $1
        `, [courseId]);

        await client.query(`
            INSERT INTO "BackupTeaches" ("instructorId", "courseId", "deleted_at")
            SELECT "instructorId", "courseId", NOW()
            FROM "Teaches"
            WHERE "courseId" = $1
        `, [courseId]);

        await client.query(`
            INSERT INTO "BackupAssignment" ("assignmentId", "assignmentName", "courseId", "dueDate", "assignmentKey", "maxObtainableGrade", "assignmentDescription", "isPublished", "isGraded", "deleted_at")
            SELECT "assignmentId", "assignmentName", "courseId", "dueDate", "assignmentKey", "maxObtainableGrade", "assignmentDescription", "isPublished", "isGraded", NOW()
            FROM "Assignment"
            WHERE "courseId" = $1
        `, [courseId]);

        await client.query(`
            INSERT INTO "BackupAssignmentSubmission" ("assignmentSubmissionId", "studentId", "courseId", "assignmentId", "submittedAt", "submissionFile", "isSubmitted", "updatedAt", "isGraded", "deleted_at")
            SELECT "assignmentSubmissionId", "studentId", "courseId", "assignmentId", "submittedAt", "submissionFile", "isSubmitted", "updatedAt", "isGraded", NOW()
            FROM "AssignmentSubmission"
            WHERE "courseId" = $1
        `, [courseId]);

        await client.query(`
            INSERT INTO "BackupAssignmentGrade" ("assignmentSubmissionId", "assignmentId", "maxObtainableGrade", "AIassignedGrade", "InstructorAssignedFinalGrade", "isGraded", "deleted_at")
            SELECT "assignmentSubmissionId", "assignmentId", "maxObtainableGrade", "AIassignedGrade", "InstructorAssignedFinalGrade", "isGraded", NOW()
            FROM "AssignmentGrade"
            WHERE "assignmentSubmissionId" IN (
                SELECT "assignmentSubmissionId" FROM "AssignmentSubmission" WHERE "courseId" = $1
            )
        `, [courseId]);

        await client.query(`
            INSERT INTO "BackupCourseNotification" ("senderId", "receiverId", "courseId", "notificationMessage", "isRead", "deleted_at")
            SELECT "senderId", "receiverId", "courseId", "notificationMessage", "isRead", NOW()
            FROM "CourseNotification"
            WHERE "courseId" = $1
        `, [courseId]);

        await client.query(`
            INSERT INTO "BackupStudentFeedback" ("studentFeedbackId", "studentId", "assignmentId", "courseId", "AIFeedbackText", "InstructorFeedbackText", "deleted_at")
            SELECT "studentFeedbackId", "studentId", "assignmentId", "courseId", "AIFeedbackText", "InstructorFeedbackText", NOW()
            FROM "StudentFeedback"
            WHERE "courseId" = $1
        `, [courseId]);

        await client.query(`
            INSERT INTO "BackupStudentFeedbackReport" ("studentFeedbackReportId", "studentFeedbackReportText", "isResolved", "studentId", "assignmentId", "courseId", "AIFeedbackText", "InstructorFeedbackText", "deleted_at")
            SELECT "studentFeedbackReportId", "studentFeedbackReportText", "isResolved", "studentId", "assignmentId", "courseId", "AIFeedbackText", "InstructorFeedbackText", NOW()
            FROM "StudentFeedbackReport"
            WHERE "courseId" = $1
        `, [courseId]);

        await client.query(`
            INSERT INTO "BackupAssignmentRubric" ("assignmentRubricId", "rubricName", "criteria", "courseId", "deleted_at")
            SELECT "assignmentRubricId", "rubricName", "criteria", "courseId", NOW()
            FROM "AssignmentRubric"
            WHERE "courseId" = $1
        `, [courseId]);

        await client.query(`
            INSERT INTO "BackupUseRubric" ("assignmentId", "assignmentRubricId", "deleted_at")
            SELECT "assignmentId", "assignmentRubricId", NOW()
            FROM "useRubric"
            WHERE "assignmentId" IN (
                SELECT "assignmentId" FROM "Assignment" WHERE "courseId" = $1
            )
        `, [courseId]);

        // Backup course data
        await client.query(`
            INSERT INTO "BackupCourse" ("courseId", "courseName", "courseCode", "maxStudents", "courseDescription", "isArchived", "deleted_at")
            SELECT "courseId", "courseName", "courseCode", "maxStudents", "courseDescription", "isArchived", NOW()
            FROM "Course"
            WHERE "courseId" = $1
            RETURNING "courseId"
        `, [courseId]);

        // Delete dependent data
        await client.query('DELETE FROM "EnrolledIn" WHERE "courseId" = $1', [courseId]);
        await client.query('DELETE FROM "Teaches" WHERE "courseId" = $1', [courseId]);
        await client.query('DELETE FROM "AssignmentGrade" WHERE "assignmentSubmissionId" IN (SELECT "assignmentSubmissionId" FROM "AssignmentSubmission" WHERE "courseId" = $1)', [courseId]);
        await client.query('DELETE FROM "AssignmentSubmission" WHERE "courseId" = $1', [courseId]);
        await client.query('DELETE FROM "Assignment" WHERE "courseId" = $1', [courseId]);
        await client.query('DELETE FROM "CourseNotification" WHERE "courseId" = $1', [courseId]);
        await client.query('DELETE FROM "StudentFeedback" WHERE "courseId" = $1', [courseId]);
        await client.query('DELETE FROM "StudentFeedbackReport" WHERE "courseId" = $1', [courseId]);
        await client.query('DELETE FROM "AssignmentRubric" WHERE "courseId" = $1', [courseId]);
        await client.query('DELETE FROM "useRubric" WHERE "assignmentId" IN (SELECT "assignmentId" FROM "Assignment" WHERE "courseId" = $1)', [courseId]);

        // Delete course data
        await client.query('DELETE FROM "Course" WHERE "courseId" = $1', [courseId]);

        await client.query('COMMIT');
        res.status(200).json({ message: 'Course and dependencies deleted and backed up successfully' });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error deleting course:', error);
        res.status(500).json({ message: 'Error deleting course' });
    } finally {
        client.release();
    }
});

// Restore a course and its dependencies from the backup table
router.post('/course/restore/:id', async (req, res) => {
    const courseId = req.params.id;
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Restore course data
        const courseResult = await client.query(`
            INSERT INTO "Course" ("courseId", "courseName", "courseCode", "maxStudents", "courseDescription", "isArchived")
            SELECT "courseId", "courseName", "courseCode", "maxStudents", "courseDescription", "isArchived"
            FROM "BackupCourse"
            WHERE "courseId" = $1
            RETURNING "courseId"
        `, [courseId]);

        if (courseResult.rowCount > 0) {
            // Restore dependent data

            // Restore EnrolledIn
            const enrolledInResult = await client.query(`
                SELECT * FROM "BackupEnrolledIn"
                WHERE "courseId" = $1
            `, [courseId]);

            for (const enrolled of enrolledInResult.rows) {
                const studentExists = await client.query('SELECT 1 FROM "Student" WHERE "studentId" = $1', [enrolled.studentId]);
                if (studentExists.rows.length > 0) {
                    await client.query(`
                        INSERT INTO "EnrolledIn" ("studentId", "courseId", "studentGrade")
                        VALUES ($1, $2, $3)
                        ON CONFLICT DO NOTHING
                    `, [enrolled.studentId, enrolled.courseId, enrolled.studentGrade]);
                    console.log(`Enrollment for studentId ${enrolled.studentId} restored successfully.`);
                } else {
                    console.log(`Student with ID ${enrolled.studentId} does not exist. Skipping enrollment restoration.`);
                }
            }

            // Restore Teaches
            const teachesResult = await client.query(`
                SELECT * FROM "BackupTeaches"
                WHERE "courseId" = $1
            `, [courseId]);

            for (const teach of teachesResult.rows) {
                const instructorExists = await client.query('SELECT 1 FROM "Instructor" WHERE "instructorId" = $1', [teach.instructorId]);
                if (instructorExists.rows.length > 0) {
                    await client.query(`
                        INSERT INTO "Teaches" ("instructorId", "courseId")
                        VALUES ($1, $2)
                        ON CONFLICT DO NOTHING
                    `, [teach.instructorId, teach.courseId]);
                    console.log(`Teaches entry for instructorId ${teach.instructorId} restored successfully.`);
                } else {
                    console.log(`Instructor with ID ${teach.instructorId} does not exist. Skipping teaches restoration.`);
                }
            }

            // Restore Assignments
            const assignmentsResult = await client.query(`
                SELECT * FROM "BackupAssignment"
                WHERE "courseId" = $1
            `, [courseId]);

            for (const assignment of assignmentsResult.rows) {
                await client.query(`
                    INSERT INTO "Assignment" ("assignmentId", "assignmentName", "courseId", "dueDate", "assignmentKey", "maxObtainableGrade", "assignmentDescription", "isPublished", "isGraded")
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                    ON CONFLICT DO NOTHING
                `, [
                    assignment.assignmentId,
                    assignment.assignmentName,
                    assignment.courseId,
                    assignment.dueDate,
                    assignment.assignmentKey,
                    assignment.maxObtainableGrade,
                    assignment.assignmentDescription,
                    assignment.isPublished,
                    assignment.isGraded
                ]);
                console.log(`Assignment ${assignment.assignmentId} restored successfully.`);
            }

            // Restore Assignment Submissions
            const submissionsResult = await client.query(`
                SELECT * FROM "BackupAssignmentSubmission"
                WHERE "courseId" = $1
            `, [courseId]);

            for (const submission of submissionsResult.rows) {
                const studentExists = await client.query('SELECT 1 FROM "Student" WHERE "studentId" = $1', [submission.studentId]);
                const assignmentExists = await client.query('SELECT 1 FROM "Assignment" WHERE "assignmentId" = $1', [submission.assignmentId]);

                if (studentExists.rows.length > 0 && assignmentExists.rows.length > 0) {
                    await client.query(`
                        INSERT INTO "AssignmentSubmission" ("assignmentSubmissionId", "studentId", "courseId", "assignmentId", "submittedAt", "submissionFile", "isSubmitted", "updatedAt", "isGraded")
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                        ON CONFLICT DO NOTHING
                    `, [
                        submission.assignmentSubmissionId,
                        submission.studentId,
                        submission.courseId,
                        submission.assignmentId,
                        submission.submittedAt,
                        submission.submissionFile,
                        submission.isSubmitted,
                        submission.updatedAt,
                        submission.isGraded
                    ]);
                    console.log(`Assignment submission ${submission.assignmentSubmissionId} restored successfully.`);
                } else {
                    console.log(`Skipping submission restoration for studentId ${submission.studentId} or assignmentId ${submission.assignmentId} due to missing dependencies.`);
                }
            }

            // Restore Assignment Grades
            const gradesResult = await client.query(`
                SELECT * FROM "BackupAssignmentGrade"
                WHERE "assignmentSubmissionId" IN (
                    SELECT "assignmentSubmissionId" FROM "BackupAssignmentSubmission" WHERE "courseId" = $1
                )
            `, [courseId]);

            for (const grade of gradesResult.rows) {
                const submissionExists = await client.query('SELECT 1 FROM "AssignmentSubmission" WHERE "assignmentSubmissionId" = $1', [grade.assignmentSubmissionId]);
                if (submissionExists.rows.length > 0) {
                    await client.query(`
                        INSERT INTO "AssignmentGrade" ("assignmentSubmissionId", "assignmentId", "maxObtainableGrade", "AIassignedGrade", "InstructorAssignedFinalGrade", "isGraded")
                        VALUES ($1, $2, $3, $4, $5, $6)
                        ON CONFLICT DO NOTHING
                    `, [
                        grade.assignmentSubmissionId,
                        grade.assignmentId,
                        grade.maxObtainableGrade,
                        grade.AIassignedGrade,
                        grade.InstructorAssignedFinalGrade,
                        grade.isGraded
                    ]);
                    console.log(`Assignment grade for submission ID ${grade.assignmentSubmissionId} restored successfully.`);
                } else {
                    console.log(`Skipping grade restoration for assignmentSubmissionId ${grade.assignmentSubmissionId} due to missing dependencies.`);
                }
            }

            // Restore Course Notifications
            const notificationsResult = await client.query(`
                SELECT * FROM "BackupCourseNotification"
                WHERE "courseId" = $1
            `, [courseId]);

            for (const notification of notificationsResult.rows) {
                const senderExists = await client.query('SELECT 1 FROM "Student" WHERE "studentId" = $1', [notification.senderId]);
                const receiverExists = await client.query('SELECT 1 FROM "Student" WHERE "studentId" = $1', [notification.receiverId]);

                if (senderExists.rows.length > 0 && receiverExists.rows.length > 0) {
                    await client.query(`
                        INSERT INTO "CourseNotification" ("senderId", "receiverId", "courseId", "notificationMessage", "isRead")
                        VALUES ($1, $2, $3, $4, $5)
                        ON CONFLICT DO NOTHING
                    `, [
                        notification.senderId,
                        notification.receiverId,
                        notification.courseId,
                        notification.notificationMessage,
                        notification.isRead
                    ]);
                    console.log(`Course notification for senderId ${notification.senderId} and receiverId ${notification.receiverId} restored successfully.`);
                } else {
                    console.log(`Skipping notification restoration for senderId ${notification.senderId} or receiverId ${notification.receiverId} due to missing dependencies.`);
                }
            }

            // Restore Student Feedback
            const feedbackResult = await client.query(`
                SELECT * FROM "BackupStudentFeedback"
                WHERE "courseId" = $1
            `, [courseId]);

            for (const feedback of feedbackResult.rows) {
                const studentExists = await client.query('SELECT 1 FROM "Student" WHERE "studentId" = $1', [feedback.studentId]);
                const assignmentExists = await client.query('SELECT 1 FROM "Assignment" WHERE "assignmentId" = $1', [feedback.assignmentId]);

                if (studentExists.rows.length > 0 && assignmentExists.rows.length > 0) {
                    await client.query(`
                        INSERT INTO "StudentFeedback" ("studentFeedbackId", "studentId", "assignmentId", "courseId", "AIFeedbackText", "InstructorFeedbackText")
                        VALUES ($1, $2, $3, $4, $5, $6)
                        ON CONFLICT DO NOTHING
                    `, [
                        feedback.studentFeedbackId,
                        feedback.studentId,
                        feedback.assignmentId,
                        feedback.courseId,
                        feedback.AIFeedbackText,
                        feedback.InstructorFeedbackText
                    ]);
                    console.log(`Feedback for studentId ${feedback.studentId} and assignmentId ${feedback.assignmentId} restored successfully.`);
                } else {
                    console.log(`Skipping feedback restoration for studentId ${feedback.studentId} or assignmentId ${feedback.assignmentId} due to missing dependencies.`);
                }
            }

            // Restore Student Feedback Reports
            const feedbackReportsResult = await client.query(`
                SELECT * FROM "BackupStudentFeedbackReport"
                WHERE "courseId" = $1
            `, [courseId]);

            for (const report of feedbackReportsResult.rows) {
                const studentExists = await client.query('SELECT 1 FROM "Student" WHERE "studentId" = $1', [report.studentId]);
                const assignmentExists = await client.query('SELECT 1 FROM "Assignment" WHERE "assignmentId" = $1', [report.assignmentId]);

                if (studentExists.rows.length > 0 && assignmentExists.rows.length > 0) {
                    await client.query(`
                        INSERT INTO "StudentFeedbackReport" ("studentFeedbackReportId", "studentFeedbackReportText", "isResolved", "studentId", "assignmentId", "courseId", "AIFeedbackText", "InstructorFeedbackText")
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                        ON CONFLICT DO NOTHING
                    `, [
                        report.studentFeedbackReportId,
                        report.studentFeedbackReportText,
                        report.isResolved,
                        report.studentId,
                        report.assignmentId,
                        report.courseId,
                        report.AIFeedbackText,
                        report.InstructorFeedbackText
                    ]);
                    console.log(`Feedback report for studentId ${report.studentId} and assignmentId ${report.assignmentId} restored successfully.`);
                } else {
                    console.log(`Skipping feedback report restoration for studentId ${report.studentId} or assignmentId ${report.assignmentId} due to missing dependencies.`);
                }
            }

            // Restore Assignment Rubrics
            const rubricsResult = await client.query(`
                SELECT * FROM "BackupAssignmentRubric"
                WHERE "courseId" = $1
            `, [courseId]);

            for (const rubric of rubricsResult.rows) {
                await client.query(`
                    INSERT INTO "AssignmentRubric" ("assignmentRubricId", "rubricName", "criteria", "courseId")
                    VALUES ($1, $2, $3, $4)
                    ON CONFLICT DO NOTHING
                `, [
                    rubric.assignmentRubricId,
                    rubric.rubricName,
                    rubric.criteria,
                    rubric.courseId
                ]);
                console.log(`Rubric ${rubric.assignmentRubricId} restored successfully.`);
            }

            // Restore Use Rubric
            const useRubricsResult = await client.query(`
                SELECT * FROM "BackupUseRubric"
                WHERE "assignmentId" IN (
                    SELECT "assignmentId" FROM "BackupAssignment" WHERE "courseId" = $1
                )
            `, [courseId]);

            for (const useRubric of useRubricsResult.rows) {
                const assignmentExists = await client.query('SELECT 1 FROM "Assignment" WHERE "assignmentId" = $1', [useRubric.assignmentId]);
                const rubricExists = await client.query('SELECT 1 FROM "AssignmentRubric" WHERE "assignmentRubricId" = $1', [useRubric.assignmentRubricId]);

                if (assignmentExists.rows.length > 0 && rubricExists.rows.length > 0) {
                    await client.query(`
                        INSERT INTO "useRubric" ("assignmentId", "assignmentRubricId")
                        VALUES ($1, $2)
                        ON CONFLICT DO NOTHING
                    `, [
                        useRubric.assignmentId,
                        useRubric.assignmentRubricId
                    ]);
                    console.log(`UseRubric entry for assignmentId ${useRubric.assignmentId} restored successfully.`);
                } else {
                    console.log(`Skipping useRubric restoration for assignmentId ${useRubric.assignmentId} due to missing dependencies.`);
                }
            }

            // Delete data from backup tables
            await client.query('DELETE FROM "BackupEnrolledIn" WHERE "courseId" = $1', [courseId]);
            await client.query('DELETE FROM "BackupTeaches" WHERE "courseId" = $1', [courseId]);
            await client.query('DELETE FROM "BackupAssignment" WHERE "courseId" = $1', [courseId]);
            await client.query('DELETE FROM "BackupAssignmentSubmission" WHERE "courseId" = $1', [courseId]);
            await client.query('DELETE FROM "BackupAssignmentGrade" WHERE "assignmentSubmissionId" IN (SELECT "assignmentSubmissionId" FROM "AssignmentSubmission" WHERE "courseId" = $1)', [courseId]);
            await client.query('DELETE FROM "BackupCourseNotification" WHERE "courseId" = $1', [courseId]);
            await client.query('DELETE FROM "BackupStudentFeedback" WHERE "courseId" = $1', [courseId]);
            await client.query('DELETE FROM "BackupStudentFeedbackReport" WHERE "courseId" = $1', [courseId]);
            await client.query('DELETE FROM "BackupAssignmentRubric" WHERE "courseId" = $1', [courseId]);
            await client.query('DELETE FROM "BackupUseRubric" WHERE "assignmentId" IN (SELECT "assignmentId" FROM "Assignment" WHERE "courseId" = $1)', [courseId]);
            await client.query('DELETE FROM "BackupCourse" WHERE "courseId" = $1', [courseId]);

            await client.query('COMMIT');
            res.status(200).json({ message: 'Course and dependencies restored successfully' });
        } else {
            await client.query('ROLLBACK');
            res.status(404).json({ message: 'Course not found in backup' });
        }
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error restoring course:', error);
        res.status(500).json({ message: 'Error restoring course' });
    } finally {
        client.release();
    }
});


// Get all deleted courses
router.get('/deleted-courses', async (req, res) => {
    try {
        const deletedCourses = await pool.query('SELECT * FROM "BackupCourse"');
        res.status(200).send(deletedCourses.rows);
    } catch (error) {
        console.error('Error fetching deleted courses:', error);
        res.status(500).send({ message: 'Error fetching deleted courses' });
    }
});

// Clear all backup tables
router.delete('/clear-backups', checkAuthenticated, async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const backupTables = [
            "BackupStudent",
            "BackupInstructor",
            "BackupCourse",
            "BackupEnrolledIn",
            "BackupTeaches",
            "BackupAssignment",
            "BackupAssignmentSubmission",
            "BackupAssignmentGrade",
            "BackupStudentFeedback",
            "BackupStudentFeedbackReport",
            "BackupAssignmentRubric",
            "BackupUseRubric",
            "BackupCourseNotification",
            "BackupPrompt"
        ];

        for (const table of backupTables) {
            await client.query(`DELETE FROM "${table}"`);
        }

        await client.query('COMMIT');
        res.status(200).json({ message: 'All backup tables cleared successfully' });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error clearing backup tables:', error);
        res.status(500).json({ error: 'Database error' });
    } finally {
        client.release();
    }
});

module.exports = router;