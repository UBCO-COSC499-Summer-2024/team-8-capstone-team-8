CREATE TABLE IF NOT EXISTS "Student" (
    "studentId" SERIAL PRIMARY KEY,
    "firstName" VARCHAR(100),
    "lastName" VARCHAR(100),
    "email" VARCHAR(200) UNIQUE NOT NULL,
    "password" VARCHAR(300),
    "resetPasswordToken" VARCHAR(300),
    "resetPasswordExpires" TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS "Instructor"(
    "instructorId" SERIAL NOT NULL PRIMARY KEY,
    "firstName" VARCHAR(100),
    "lastName" VARCHAR(100),
    "email" VARCHAR(200),
    "password" VARCHAR(300),
    "department" VARCHAR(100), 
    "isTA" BOOLEAN DEFAULT FALSE,
    "resetPasswordToken" VARCHAR(300),
    "resetPasswordExpires" TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS "Course" (
    "courseId" SERIAL NOT NULL PRIMARY KEY,
    "courseName" VARCHAR(100),
    "courseCode" VARCHAR(100),
    "maxStudents" INT CHECK ("maxStudents" > 0),
    "courseDescription" VARCHAR(1000),
    "isArchived" BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "Teaches"(
    "instructorId" INT NOT NULL,
    "courseId" INT NOT NULL,
    PRIMARY KEY ("instructorId", "courseId"),
    FOREIGN KEY ("instructorId") REFERENCES "Instructor"("instructorId")
    ON DELETE CASCADE,
    FOREIGN KEY ("courseId") REFERENCES "Course"("courseId")
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "EnrolledIn"(
    "studentId" INT NOT NULL,
    "courseId" INT NOT NULL,
    "studentGrade" FLOAT,
    PRIMARY KEY ("studentId", "courseId"),
    FOREIGN KEY ("studentId") REFERENCES "Student"("studentId") ON DELETE CASCADE,
    FOREIGN KEY ("courseId") REFERENCES "Course"("courseId") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "SystemAdministrator"(
    "adminId" SERIAL NOT NULL PRIMARY KEY,
    "firstName" VARCHAR(100),
    "lastName" VARCHAR(100),
    "email" VARCHAR(200) UNIQUE NOT NULL,
    "password" VARCHAR(300),
    "resetPasswordToken" VARCHAR(300),
    "resetPasswordExpires" TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS "Assignment"(
    "assignmentId" SERIAL NOT NULL PRIMARY KEY,
    "assignmentName" VARCHAR(100),
    "courseId" INT,
    "dueDate" TIMESTAMPTZ,
    "assignmentKey" VARCHAR(500),
    "maxObtainableGrade" FLOAT,
    "assignmentDescription" VARCHAR(20000),
    "isPublished" BOOLEAN DEFAULT true,
    "isGraded" BOOLEAN DEFAULT false,
    "gradeHidden" BOOLEAN DEFAULT false,
    FOREIGN KEY ("courseId") REFERENCES "Course"("courseId") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "CourseNotification"(
    "senderId" SERIAL NOT NULL,
    "receiverId" INT NOT NULL,
    PRIMARY KEY ("senderId", "receiverId"),
    "courseId" INT,
    "notificationMessage" VARCHAR(1000),
    "isRead" BOOLEAN DEFAULT false,
    FOREIGN KEY ("courseId") REFERENCES "Course"("courseId") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "AssignmentSubmission" (
    "assignmentSubmissionId" SERIAL NOT NULL PRIMARY KEY,
    "studentId" INT NOT NULL,
    "courseId" INT NOT NULL,
    "assignmentId" INT NOT NULL,
    "submittedAt" TIMESTAMPTZ,
    "submissionFile" VARCHAR(500),
    "submissionLink" VARCHAR(1000),
    "isSubmitted" BOOLEAN,
    "updatedAt" TIMESTAMPTZ,
    "isGraded" BOOLEAN DEFAULT false,
    FOREIGN KEY ("studentId") REFERENCES "Student"("studentId") ON DELETE CASCADE,
    FOREIGN KEY ("assignmentId") REFERENCES "Assignment"("assignmentId") ON DELETE CASCADE,
    FOREIGN KEY ("courseId") REFERENCES "Course"("courseId") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "AssignmentGrade"(
    "assignmentSubmissionId" INT NOT NULL,
    "assignmentId" INT NOT NULL,
    PRIMARY KEY ("assignmentSubmissionId", "assignmentId"),
    "maxObtainableGrade" FLOAT,
    "AIassignedGrade" FLOAT,
    "InstructorAssignedFinalGrade" FLOAT,
    "isGraded" BOOLEAN DEFAULT false,
    "notificationSent" BOOLEAN DEFAULT false,
    CONSTRAINT unique_assignment_grade UNIQUE ("assignmentSubmissionId", "assignmentId"),
    FOREIGN KEY ("assignmentSubmissionId") REFERENCES "AssignmentSubmission"("assignmentSubmissionId") ON DELETE CASCADE,
    FOREIGN KEY ("assignmentId") REFERENCES "Assignment"("assignmentId") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "StudentFeedback"(
    "studentFeedbackId" SERIAL NOT NULL PRIMARY KEY,
    "studentId" INT NOT NULL,
    "assignmentId" INT NOT NULL,
    "courseId" INT NOT NULL,
    "AIFeedbackText" VARCHAR(20000),
    "InstructorFeedbackText" VARCHAR(20000),
    CONSTRAINT "unique_feedback" UNIQUE ("studentId", "assignmentId", "courseId"),
    FOREIGN KEY ("studentId") REFERENCES "Student"("studentId") ON DELETE CASCADE,
    FOREIGN KEY ("assignmentId") REFERENCES "Assignment"("assignmentId") ON DELETE CASCADE,
    FOREIGN KEY ("courseId") REFERENCES "Course"("courseId") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "StudentFeedbackReport"(
    "studentFeedbackReportId" SERIAL NOT NULL PRIMARY KEY,
    "studentFeedbackReportText" VARCHAR(10000),
    "isResolved" BOOLEAN,
    "studentId" INT NOT NULL,
    "assignmentId" INT NOT NULL,
    "courseId" INT NOT NULL,
    "AIFeedbackText" VARCHAR(20000),
    "InstructorFeedbackText" VARCHAR(20000),
    FOREIGN KEY ("studentId") REFERENCES "Student"("studentId") ON DELETE CASCADE,
    FOREIGN KEY ("assignmentId") REFERENCES "Assignment"("assignmentId") ON DELETE CASCADE,
    FOREIGN KEY ("courseId") REFERENCES "Course"("courseId")
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "AssignmentRubric"(
    "assignmentRubricId" SERIAL NOT NULL PRIMARY KEY,
    "rubricName" VARCHAR(150),
    "criteria" VARCHAR(20000),
    "courseId" INT,
    FOREIGN KEY ("courseId") REFERENCES "Course"("courseId") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "useRubric"(
    "assignmentId" INT NOT NULL,
    "assignmentRubricId" INT NOT NULL,
    PRIMARY KEY ("assignmentId", "assignmentRubricId"),
    FOREIGN KEY ("assignmentId") REFERENCES "Assignment"("assignmentId") ON DELETE CASCADE,
    FOREIGN KEY ("assignmentRubricId") REFERENCES "AssignmentRubric"("assignmentRubricId") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "Prompt"(
    "promptId" SERIAL NOT NULL PRIMARY KEY,
    "promptName" VARCHAR(100),
    "promptText" VARCHAR(2000),
    "instructorId" INT,
    "isSelected" BOOLEAN DEFAULT false,
    FOREIGN KEY ("instructorId") REFERENCES "Instructor"("instructorId") ON DELETE CASCADE
);

-- Insert dummy data for testing
INSERT INTO "Student" ("firstName", "lastName", "email", "password")
VALUES ('John', 'Doe', 'john.doe@example.com', 'password1'),
       ('Jane', 'Smith', 'jane.smith@example.com', 'password2'),
       ('Mike', 'Johnson', 'mike.johnson@example.com', 'password3'),
       ('Omar', 'Hemed', 'omar@email.com', '$2a$10$/4wPUiyTEj/pMZn3P1Zvp.neJO/FQYknhz0D0xpaPRoH.jHKDFgW.'),
       ('Colton', 'Palfrey', 'colton@email.com', '$2a$10$/4wPUiyTEj/pMZn3P1Zvp.neJO/FQYknhz0D0xpaPRoH.jHKDFgW.'),
       ('Jerry', 'Fan', 'jerry@email.com', '$2a$10$/4wPUiyTEj/pMZn3P1Zvp.neJO/FQYknhz0D0xpaPRoH.jHKDFgW.'),
       ('Chinmay', 'Arvind', 'chinmay@email.com', '$2a$10$/4wPUiyTEj/pMZn3P1Zvp.neJO/FQYknhz0D0xpaPRoH.jHKDFgW.'),
       ('Aayush', 'Chaudhary', 'aayush@email.com', '$2a$10$/4wPUiyTEj/pMZn3P1Zvp.neJO/FQYknhz0D0xpaPRoH.jHKDFgW.')
ON CONFLICT DO NOTHING;

-- Insert dummy data into Instructor table
INSERT INTO "Instructor" ("firstName", "lastName", "email", "password", "department", "isTA")
VALUES 
    ('Robert', 'Brown', 'robert.brown@example.com', 'password4', 'Computer Science', false),
    ('Emily', 'Davis', 'emily.davis@example.com', 'password5', 'Mathematics', true),
    ('Michael', 'Wilson', 'michael.wilson@example.com', 'password6', 'Physics', false),
    ('Kevin', 'Zhang', 'kevin.zhang@example.com', 'password7', 'Computer Science', true),
    ('Prof', 'Test', 'testprof@email.com', '$2a$10$/4wPUiyTEj/pMZn3P1Zvp.neJO/FQYknhz0D0xpaPRoH.jHKDFgW.', 'Computer Science', false),
    ('TA', 'Test', 'testta@email.com', '$2a$10$/4wPUiyTEj/pMZn3P1Zvp.neJO/FQYknhz0D0xpaPRoH.jHKDFgW.', 'Computer Science', true)
ON CONFLICT DO NOTHING;

INSERT INTO "Course" ("courseId", "courseName", "courseCode", "courseDescription")
VALUES (1, 'Introduction to Programming', 'CS101', 'An introductory course on programming'),
    (2, 'Advanced CSS', 'COSC 455', 'A course on advanced CSS techniques'),
    (3, 'Intro to Web Developement', 'COSC 360', 'An introductory course on web development'),
    (4, 'Itermidiate JavaScript', 'COSC 388', 'A course on JavaScript programming'),
    (5, 'Software Engineering Capstone', 'COSC 499', 'Final project for software engineering students')
    ON CONFLICT DO NOTHING;

-- Insert dummy data into EnrolledIn table
INSERT INTO "EnrolledIn" ("studentId", "courseId", "studentGrade")
VALUES (2, 1, 85),
    (3, 2, 92),
    (5, 5, 88),
    (5, 2, 90),
    (5, 4, 83),
    (6, 5, 88),
    (6, 2, 90),
    (7, 4, 83),
    (7, 5, 88),
    (4, 5, 90),
    (4, 4, 83),
    (1, 5, 60),
    (2, 5, 78),
    (3, 5, 81)
ON CONFLICT DO NOTHING;

INSERT INTO "Teaches" ("instructorId", "courseId")
VALUES (5, 5),
       (5, 1),
       (5, 4)
ON CONFLICT DO NOTHING;

-- Insert dummy data into SystemAdministrator table
INSERT INTO "SystemAdministrator" ("firstName", "lastName", "email", "password")
VALUES 
    ('Admin', 'Test', 'admin@email.com', '$2a$10$/4wPUiyTEj/pMZn3P1Zvp.neJO/FQYknhz0D0xpaPRoH.jHKDFgW.')
ON CONFLICT DO NOTHING;

INSERT INTO "Assignment" ("courseId", "dueDate", "assignmentName", "assignmentKey", "maxObtainableGrade", "assignmentDescription", "isPublished")
VALUES (3, '2024-06-30 12:00:00', 'Assignment 1', 'Assignment-1-key.zip',  10, 'Design a login page with html and css', true),
       (3, '2024-07-05 12:00:00', 'Assignment 2', 'Assignment-2-key.zip',  25, 'Design an account page with html and css', true),
       (3, '2024-07-15 12:00:00', 'Assignment 3', 'Assignment-3-key.zip',  12, 'Design a home page with html and css', false),
       (4, '2024-06-12 12:00:00', 'Lab 1', 'Lab-1-key.zip',  12, 'Create a login page with JavaScript validation', true),
       (4, '2024-07-11 12:00:00', 'Lab 2', 'Lab-2-key.zip',  12, 'Create a sign up page with JavaScript validation', true),
       (4, '2024-07-15 12:00:00', 'Lab 3', 'Lab-3-key.zip',  12, 'Create a dashboard page with JavaScript variables and functions', false),
       (2, '2024-06-25 12:00:00', 'Assignment 1', 'Assignment-1-key.zip',  20, 'Design a interactive page with html and css', true),
       (2, '2024-07-01 12:00:00', 'Lab 1', 'Lab-1-key.zip',  35, 'Design a menu that pops down from the nav bar when the html loads', true),
       (2, '2024-07-06 12:00:00', 'Assignment 2', 'Assignment-2-key.zip',  65, 'Make a moving background with html and css', false),
       (5, '2024-06-05 12:00:00', 'Assignment 1', 'Assignment-1-key.zip',  100, 'Create design plan document with html', true),
       (5, '2024-06-15 12:00:00', 'Assignment 2', 'Assignment-2-key.zip',  88, 'Create project plan document with html', true),
       (5, '2024-07-09 12:00:00', 'Assignment 3', 'Assignment-3-key.zip',  50, 'Design you sign in page with html, css, and javascript', false),
       (1, '2024-06-28 12:00:00', 'Assignment 1', 'Assignment-1-key.zip',  5, 'Create a html page that says hello world in a heading tag', true),
       (1, '2024-07-03 12:00:00', 'Assignment 2', 'Assignment-2-key.zip',  10, 'Create a html page that has a list of your favorite things in a list tag', true),
       (1, '2024-07-09 12:00:00', 'Lab 1', 'Lab-1-key.zip',  10, 'Create a html page that has a table of your favorite things in a table tag', false)
ON CONFLICT DO NOTHING;

-- Insert dummy data into CourseNotification table
INSERT INTO "CourseNotification" ("senderId", "receiverId", "courseId", "notificationMessage", "isRead")
VALUES 
    (1, 2, 1, 'Reminder: Assignment 1 is due tomorrow', false),
    (2, 1, 2, 'New lecture notes uploaded for Calculus I', true),
    (3, 1, 3, 'Physics lab scheduled for next week', false)
ON CONFLICT DO NOTHING;

-- Creating Tables (No changes needed here)

-- Insert dummy data into AssignmentSubmission table with conflict handling
INSERT INTO "AssignmentSubmission" ("studentId", "courseId", "assignmentId", "submittedAt", "submissionFile", "submissionLink", "isSubmitted", "updatedAt", "isGraded")
VALUES (1, 1, 1, '2022-01-14 12:00:00', 'submission1.zip', 'http://example.com/submission1', true, '2022-01-14 12:00:00', true),
       (2, 2, 1, '2022-01-15 12:00:00', 'submission2.zip','http://example.com/submission2', true, '2022-01-15 12:00:00', true),
       (3, 3, 2, '2022-02-10 12:00:00', 'submission3.zip','http://example.com/submission3', true, '2022-02-10 12:00:00', false),
       (5, 5, 10, '2024-06-04 12:00:00', 'assignment-1-files','http://example.com/submission3', true, '2024-06-04 12:00:00', true),
       (5, 5, 11, '2024-06-14 12:00:00', 'assignment-2-files','http://example.com/submission2', true, '2024-06-14 12:00:00', true),
       (5, 5, 12, '2024-07-08 12:00:00', 'assignment-3-files','http://example.com/submission1', true, '2024-07-08 12:00:00', false),
       (6, 5, 10, '2024-06-04 12:00:00', 'assignment-1-files','http://example.com/submission1', true, '2024-06-04 12:00:00', true),
       (6, 5, 11, '2024-06-14 12:00:00', 'assignment-2-files','http://example.com/submission2', true, '2024-06-14 12:00:00', true),
       (6, 5, 12, '2024-07-08 12:00:00', 'assignment-3-files','http://example.com/submission3', true, '2024-07-08 12:00:00', false),
       (7, 5, 10, '2024-06-04 12:00:00', 'assignment-1-files','http://example.com/submission3', true, '2024-06-04 12:00:00', true),
       (7, 5, 11, '2024-06-14 12:00:00', 'assignment-2-files','http://example.com/submission2', true, '2024-06-14 12:00:00', true),
       (7, 5, 12, '2024-07-08 12:00:00', 'assignment-3-files','http://example.com/submission1', true, '2024-07-08 12:00:00', false),
       (4, 5, 10, '2024-06-04 12:00:00', 'assignment-1-files','http://example.com/submission2', true, '2024-06-04 12:00:00', true),
       (4, 5, 11, '2024-06-14 12:00:00', 'assignment-2-files','http://example.com/submission3', true, '2024-06-14 12:00:00', true),
       (4, 5, 12, '2024-07-08 12:00:00', 'assignment-3-files','http://example.com/submission1', true, '2024-07-08 12:00:00', false),
       (4, 4, 5, '2024-07-11 12:00:00', 'lab-2-files','http://example.com/submission2', true, '2024-07-11 12:00:00', false),
       (4, 4, 6, '2024-07-15 12:00:00', 'lab-3-files','http://example.com/submission3', true, '2024-07-15 12:00:00', false),
       (4, 4, 4, '2024-06-12 12:00:00', 'lab-1-files','http://example.com/submission1', true, '2024-06-12 12:00:00', true),
       (5, 2, 7, '2024-06-25 12:00:00', 'assignment-1-files','http://example.com/submission2', true, '2024-06-25 12:00:00', true),
       (5, 2, 8, '2024-07-01 12:00:00', 'lab-1-files','http://example.com/submission3', true, '2024-07-01 12:00:00', false),
       (5, 2, 9, '2024-07-06 12:00:00', 'assignment-2-files','http://example.com/submission4', true, '2024-07-06 12:00:00', false),
       (6, 2, 7, '2024-06-25 12:00:00', 'assignment-1-files','http://example.com/submission5', true, '2024-06-25 12:00:00', true),
       (6, 2, 8, '2024-07-01 12:00:00', 'lab-1-files','http://example.com/submission6', true, '2024-07-01 12:00:00', false),
       (6, 2, 9, '2024-07-06 12:00:00', 'assignment-2-files','http://example.com/submission1', true, '2024-07-06 12:00:00', false),
       (7, 4, 4, '2024-06-12 12:00:00', 'lab-1-files','http://example.com/submission2', true, '2024-06-12 12:00:00', true),
       (7, 4, 5, '2024-07-11 12:00:00', 'lab-2-files','http://example.com/submission3', true, '2024-07-11 12:00:00', false),
       (7, 4, 6, '2024-07-15 12:00:00', 'lab-3-files','http://example.com/submission4', true, '2024-07-15 12:00:00', false),
       (8, 4, 4, '2024-06-12 12:00:00', 'lab-1-files','http://example.com/submission5', true, '2024-06-12 12:00:00', true),
       (8, 4, 5, '2024-07-11 12:00:00', 'lab-2-files','http://example.com/submission6', true, '2024-07-11 12:00:00', false),
       (8, 4, 6, '2024-07-15 12:00:00', 'lab-3-files','http://example.com/submission7', true, '2024-07-15 12:00:00', false)
       ON CONFLICT DO NOTHING;

-- Insert dummy data into AssignmentGrade table with conflict handling
INSERT INTO "AssignmentGrade" ("assignmentSubmissionId", "assignmentId", "maxObtainableGrade", "AIassignedGrade", "InstructorAssignedFinalGrade", "isGraded")
VALUES (1, 1, 10, 8, 8, true),
       (2, 1, 10, 9, 9, true),
       (3, 2, 25, 0, 0, false),
       (4, 10, 100, 67, 67, true),
       (5, 11, 88, 85, 85, true),
       (6, 12, 50, 0, 0, false),
       (7, 10, 100, 73, 73, true),
       (8, 11, 35, 23, 23, true),
       (9, 12, 50, 0, 0, false),
       (10, 10, 100, 91, 91, true),
       (11, 11, 35, 85, 85, true),
       (12, 12, 50, 0, 0, false),
       (13, 10, 100, 90, 90, true),
       (14, 11, 35, 33, 33, true),
       (15, 12, 50, 0, 0, false),
       (16, 5, 12, 12, 12, true),
       (17, 6, 12, 11, 11, true),
       (18, 4, 12, 0, 0, false),
       (19, 7, 20, 17, 17, true),
       (20, 8, 35, 34, 34, true),
       (21, 9, 65, 0, 0, false),
       (22, 7, 20, 18, 18, true),
       (23, 8, 35, 30, 30, true),
       (24, 9, 65, 0, 0, false),
       (25, 4, 12, 9, 9, true),
       (26, 5, 12, 11, 11, true),
       (27, 6, 12, 0, 0, false),
       (28, 4, 12, 12, 12, true),
       (29, 5, 12, 12, 12, true),
       (30, 6, 12, 0, 0, false)
ON CONFLICT ("assignmentSubmissionId", "assignmentId") DO NOTHING;

-- Insert dummy data into StudentFeedback table
INSERT INTO "StudentFeedback" ("studentId", "assignmentId", "courseId", "AIFeedbackText", "InstructorFeedbackText")
VALUES 
    (1, 1, 1, 'Great job!', 'Good effort, but could be improved'),
    (2, 2, 1, 'Well done!', 'Excellent work'),
    (3, 3, 2, 'Needs improvement', 'Good attempt')
ON CONFLICT DO NOTHING;

-- Insert dummy data into StudentFeedbackReport table
INSERT INTO "StudentFeedbackReport" ("studentId", "assignmentId", "courseId", "AIFeedbackText", "InstructorFeedbackText")
VALUES 
    (5, 10, 5, 'Great job!', 'Good effort, but could be improved'),
    (5, 11, 5, 'Well done!', 'Excellent work'),
    (5, 12, 5, 'Needs improvement', '## Good attempt. This code looks really good!')
ON CONFLICT DO NOTHING;

-- Insert dummy data into AssignmentRubric table
INSERT INTO "AssignmentRubric" ("criteria", "rubricName", "courseId")
VALUES 
    ('Correctness, Efficiency, Documentation', 'Rubric 1', '1'),
    ('Problem Solving, Mathematical Reasoning', 'Rubric 2', '2'),
    ('Experimental Design, Analysis', 'Rubric 3', '3')
ON CONFLICT DO NOTHING;

-- Insert dummy data into Prompt table
INSERT INTO "Prompt" ("promptName", "promptText", "instructorId")
VALUES 
    ('Prompt 1', 'Prompt 1 description', '5'),
    ('Prompt 2', 'Prompt 2 description', '5'),
    ('Prompt 3', 'Prompt 3 description', '5')
ON CONFLICT DO NOTHING;

INSERT INTO "useRubric" ("assignmentId", "assignmentRubricId")
VALUES (6, 1),
       (5, 2),
       (4, 3)
ON CONFLICT DO NOTHING;

INSERT INTO "AssignmentRubric" ("criteria", "rubricName", "courseId")
VALUES 
    ('Correctness, Efficiency, Documentation', 'Rubric 1', '1'),
    ('Problem Solving, Mathematical Reasoning', 'Rubric 2', '2'),
    ('Experimental Design, Analysis', 'Rubric 3', '3')
ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS "BackupStudent" AS TABLE "Student" WITH NO DATA;
ALTER TABLE "BackupStudent" ADD COLUMN "deleted_at" TIMESTAMP;

CREATE TABLE IF NOT EXISTS "BackupInstructor" AS TABLE "Instructor" WITH NO DATA;
ALTER TABLE "BackupInstructor" ADD COLUMN "deleted_at" TIMESTAMP;

CREATE TABLE IF NOT EXISTS "BackupCourse" AS TABLE "Course" WITH NO DATA;
ALTER TABLE "BackupCourse" ADD COLUMN "deleted_at" TIMESTAMP;

CREATE TABLE IF NOT EXISTS "BackupEnrolledIn" AS TABLE "EnrolledIn" WITH NO DATA;
ALTER TABLE "BackupEnrolledIn" ADD COLUMN "deleted_at" TIMESTAMP;

CREATE TABLE IF NOT EXISTS "BackupTeaches" AS TABLE "Teaches" WITH NO DATA;
ALTER TABLE "BackupTeaches" ADD COLUMN "deleted_at" TIMESTAMP;

CREATE TABLE IF NOT EXISTS "BackupAssignment" AS TABLE "Assignment" WITH NO DATA;
ALTER TABLE "BackupAssignment" ADD COLUMN "deleted_at" TIMESTAMP;

CREATE TABLE IF NOT EXISTS "BackupAssignmentSubmission" AS TABLE "AssignmentSubmission" WITH NO DATA;
ALTER TABLE "BackupAssignmentSubmission" ADD COLUMN "deleted_at" TIMESTAMP;

CREATE TABLE IF NOT EXISTS "BackupAssignmentGrade" AS TABLE "AssignmentGrade" WITH NO DATA;
ALTER TABLE "BackupAssignmentGrade" ADD COLUMN "deleted_at" TIMESTAMP;

CREATE TABLE IF NOT EXISTS "BackupStudentFeedback" AS TABLE "StudentFeedback" WITH NO DATA;
ALTER TABLE "BackupStudentFeedback" ADD COLUMN "deleted_at" TIMESTAMP;

CREATE TABLE IF NOT EXISTS "BackupStudentFeedbackReport" AS TABLE "StudentFeedbackReport" WITH NO DATA;
ALTER TABLE "BackupStudentFeedbackReport" ADD COLUMN "deleted_at" TIMESTAMP;

CREATE TABLE IF NOT EXISTS "BackupAssignmentRubric" AS TABLE "AssignmentRubric" WITH NO DATA;
ALTER TABLE "BackupAssignmentRubric" ADD COLUMN "deleted_at" TIMESTAMP;

CREATE TABLE IF NOT EXISTS "BackupPrompt" AS TABLE "Prompt" WITH NO DATA;
ALTER TABLE "BackupPrompt" ADD COLUMN "deleted_at" TIMESTAMP;

CREATE TABLE IF NOT EXISTS "BackupUseRubric" AS TABLE "useRubric" WITH NO DATA;
ALTER TABLE "BackupUseRubric" ADD COLUMN "deleted_at" TIMESTAMP;

CREATE TABLE IF NOT EXISTS "BackupCourseNotification" AS TABLE "CourseNotification" WITH NO DATA;
ALTER TABLE "BackupCourseNotification" ADD COLUMN "deleted_at" TIMESTAMP;

-- Reset sequences for tables with SERIAL primary keys
SELECT setval(pg_get_serial_sequence('"Student"', 'studentId'), COALESCE(MAX("studentId"), 1) + 1, false) FROM "Student";
SELECT setval(pg_get_serial_sequence('"Instructor"', 'instructorId'), COALESCE(MAX("instructorId"), 1) + 1, false) FROM "Instructor";
SELECT setval(pg_get_serial_sequence('"Course"', 'courseId'), COALESCE(MAX("courseId"), 1) + 1, false) FROM "Course";
SELECT setval(pg_get_serial_sequence('"Assignment"', 'assignmentId'), COALESCE(MAX("assignmentId"), 1) + 1, false) FROM "Assignment";
SELECT setval(pg_get_serial_sequence('"AssignmentSubmission"', 'assignmentSubmissionId'), COALESCE(MAX("assignmentSubmissionId"), 1) + 1, false) FROM "AssignmentSubmission";
SELECT setval(pg_get_serial_sequence('"AssignmentRubric"', 'assignmentRubricId'), COALESCE(MAX("assignmentRubricId"), 1) + 1, false) FROM "AssignmentRubric";
SELECT setval(pg_get_serial_sequence('"Prompt"', 'promptId'), COALESCE(MAX("promptId"), 1) + 1, false) FROM "Prompt";
SELECT setval(pg_get_serial_sequence('"StudentFeedback"', 'studentFeedbackId'), COALESCE(MAX("studentFeedbackId"), 1) + 1, false) FROM "StudentFeedback";
SELECT setval(pg_get_serial_sequence('"StudentFeedbackReport"', 'studentFeedbackReportId'), COALESCE(MAX("studentFeedbackReportId"), 1) + 1, false) FROM "StudentFeedbackReport";

CREATE OR REPLACE FUNCTION notify_assignment_creation() RETURNS trigger AS $$
DECLARE
    courseId INT;
    assignmentId INT;
BEGIN
    courseId := NEW."courseId";
    assignmentId := NEW."assignmentId";
    PERFORM pg_notify('assignment_created', json_build_object('courseId', courseId, 'assignmentId', assignmentId)::text);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER trigger_assignment_creation
AFTER INSERT ON "Assignment"
FOR EACH ROW
EXECUTE FUNCTION notify_assignment_creation();

CREATE OR REPLACE FUNCTION notify_student_after_grading() RETURNS trigger AS $$
DECLARE
    studentEmail TEXT;
    courseName TEXT;
    assignmentName TEXT;
    courseId INT;
BEGIN
    IF NEW."isGraded" = TRUE AND NEW."notificationSent" = FALSE AND NEW."InstructorAssignedFinalGrade" IS NOT NULL THEN
        SELECT a."courseId", c."courseName", a."assignmentName"
        INTO courseId, courseName, assignmentName
        FROM "Assignment" a
        JOIN "Course" c ON a."courseId" = c."courseId"
        WHERE a."assignmentId" = NEW."assignmentId" AND a."gradeHidden" = FALSE;
        FOR studentEmail IN
            SELECT s."email"
            FROM "Student" s
            JOIN "EnrolledIn" e ON s."studentId" = e."studentId"
            WHERE e."courseId" = courseId
        LOOP
            PERFORM pg_notify('assignment_graded', json_build_object(
                'email', studentEmail,
                'courseName', courseName,
                'assignmentName', assignmentName,
                'courseId', courseId
            )::text);
        END LOOP;
        UPDATE "AssignmentGrade"
        SET "notificationSent" = TRUE
        WHERE "assignmentSubmissionId" = NEW."assignmentSubmissionId";
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notify_student_after_grading
AFTER UPDATE ON "AssignmentGrade"
FOR EACH ROW
WHEN (NEW."isGraded" = TRUE AND NEW."notificationSent" = FALSE AND NEW."InstructorAssignedFinalGrade" IS NOT NULL)
EXECUTE FUNCTION notify_student_after_grading();