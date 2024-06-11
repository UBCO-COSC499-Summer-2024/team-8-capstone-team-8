-- CREATE TABLE IF NOT EXISTS "Student" (
--     "studentId" SERIAL PRIMARY KEY,
--     "firstName" VARCHAR(50) NOT NULL,
--     "lastName" VARCHAR(50) NOT NULL,
--     "email" VARCHAR(100) UNIQUE NOT NULL,
--     "password" VARCHAR(255) NOT NULL,
--     "grade" DECIMAL(3, 2)
-- );

CREATE TABLE IF NOT EXISTS "Student" (
    "studentId" SERIAL NOT NULL PRIMARY KEY,
    "firstName" VARCHAR(100),
    "lastName" VARCHAR(100),
    "email" VARCHAR(200),
    "password" VARCHAR(300)
);

CREATE TABLE IF NOT EXISTS "Instructor"(
    "instructorId" INT NOT NULL PRIMARY KEY,
    "firstName" VARCHAR(100),
    "lastName" VARCHAR(100),
    "email" VARCHAR(200),
    "password" VARCHAR(300),
    "department" VARCHAR(100),
    "hasFullAccess" BOOLEAN
);

CREATE TABLE IF NOT EXISTS "Course" (
    "courseId" INT NOT NULL PRIMARY KEY,
    "courseName" VARCHAR(100),
    "courseCode" VARCHAR(100),
    "courseDescription" VARCHAR(1000),
    "instructorId" INT,
    FOREIGN KEY ("instructorId") REFERENCES "Instructor"("instructorId")
);

CREATE TABLE IF NOT EXISTS "EnrolledIn"(
    "studentId" INT NOT NULL,
    "courseId" INT NOT NULL,
    "studentGrade" FLOAT,
    PRIMARY KEY ("studentId", "courseId"),
    FOREIGN KEY ("studentId") REFERENCES "Student"("studentId"),
    FOREIGN KEY ("courseId") REFERENCES "Course"("courseId")
);

CREATE TABLE IF NOT EXISTS "SystemAdministrator"(
    "adminId" INT NOT NULL PRIMARY KEY,
    "firstName" VARCHAR(100),
    "lastName" VARCHAR(100),
    "email" VARCHAR(200),
    "password" VARCHAR(300)
);

CREATE TABLE IF NOT EXISTS "Assignment"(
    "assignmentId" INT NOT NULL PRIMARY KEY,
    "courseId" INT,
    "dueDate" DATE,
    "assignmentKey" VARCHAR(500),
    "maxObtainableGrade" FLOAT,
    "assignmentDescription" VARCHAR(1000),
    FOREIGN KEY ("courseId") REFERENCES "Course"("courseId")
);

CREATE TABLE IF NOT EXISTS "CourseNotification"(
    "senderId" INT NOT NULL,
    "receiverId" INT NOT NULL,
    PRIMARY KEY ("senderId", "receiverId"),
    "courseId" INT,
    "notificationMessage" VARCHAR(1000),
    "isRead" BOOLEAN,
    FOREIGN KEY ("courseId") REFERENCES "Course"("courseId")
);

CREATE TABLE IF NOT EXISTS "AssignmentSubmission"(
    "assignmentSubmissionId" INT NOT NULL PRIMARY KEY,
    "studentId" INT NOT NULL,
    "courseId" INT NOT NULL,
    "assignmentId" INT NOT NULL,
    "submittedAt" DATE,
    "submissionFile" VARCHAR(500),
    "isSubmitted" BOOLEAN,
    "updatedAt" DATE,
    "isGraded" BOOLEAN,
    FOREIGN KEY ("studentId") REFERENCES "Student"("studentId"),
    FOREIGN KEY ("assignmentId") REFERENCES "Assignment"("assignmentId"),
    FOREIGN KEY ("courseId") REFERENCES "Course"("courseId")
);

CREATE TABLE IF NOT EXISTS "AssignmentGrade"(
    "assignmentSubmissionId" INT NOT NULL,
    "assignmentId" INT NOT NULL,
    PRIMARY KEY ("assignmentSubmissionId", "assignmentId"),
    "maxObtainableGrade" FLOAT,
    "AIassignedGrade" FLOAT,
    "InstructorAssignedFinalGrade" FLOAT,
    "isGraded" BOOLEAN,
    FOREIGN KEY ("assignmentSubmissionId") REFERENCES "AssignmentSubmission"("assignmentSubmissionId"),
    FOREIGN KEY ("assignmentId") REFERENCES "Assignment"("assignmentId")
);

CREATE TABLE IF NOT EXISTS "StudentFeedback"(
    "studentFeedbackId" INT NOT NULL PRIMARY KEY,
    "studentId" INT NOT NULL,
    "assignmentId" INT NOT NULL,
    "courseId" INT NOT NULL,
    "AIFeedbackText" VARCHAR(1000),
    "InstructorFeedbackText" VARCHAR(1000),
    FOREIGN KEY ("studentId") REFERENCES "Student"("studentId"),
    FOREIGN KEY ("assignmentId") REFERENCES "Assignment"("assignmentId"),
    FOREIGN KEY ("courseId") REFERENCES "Course"("courseId")
);

CREATE TABLE IF NOT EXISTS "StudentFeedbackReport"(
    "studentFeedbackReportId" INT NOT NULL PRIMARY KEY,
    "studentFeedbackReportText" VARCHAR(1000),
    "isResolved" BOOLEAN,
    "studentId" INT NOT NULL,
    "assignmentId" INT NOT NULL,
    "courseId" INT NOT NULL,
    "AIFeedbackText" VARCHAR(1000),
    "InstructorFeedbackText" VARCHAR(1000),
    FOREIGN KEY ("studentId") REFERENCES "Student"("studentId"),
    FOREIGN KEY ("assignmentId") REFERENCES "Assignment"("assignmentId"),
    FOREIGN KEY ("courseId") REFERENCES "Course"("courseId")
);

CREATE TABLE IF NOT EXISTS "AssignmentRubric"(
    "assignmentRubricId" INT NOT NULL PRIMARY KEY,
    "assignmentId" INT NOT NULL,
    "courseId" INT NOT NULL,
    "criteria" VARCHAR(1000), /* Rubric upload as a file */
    FOREIGN KEY ("assignmentId") REFERENCES "Assignment"("assignmentId"),
    FOREIGN KEY ("courseId") REFERENCES "Course"("courseId")
);

-- Insert dummy data for testing

-- Insert dummy data into Student table
INSERT INTO "Student" ("firstName", "lastName", "email", "password")
VALUES ('John', 'Doe', 'john.doe@example.com', 'password1'),
    ('Jane', 'Smith', 'jane.smith@example.com', 'password2'),
    ('Mike', 'Johnson', 'mike.johnson@example.com', 'password3')
    ON CONFLICT DO NOTHING;

-- Insert dummy data into Instructor table
INSERT INTO "Instructor" ("instructorId", "firstName", "lastName", "email", "password", "department", "hasFullAccess")
VALUES (1, 'Robert', 'Brown', 'robert.brown@example.com', 'password4', 'Computer Science', true),
    (2, 'Emily', 'Davis', 'emily.davis@example.com', 'password5', 'Mathematics', false),
    (3, 'Michael', 'Wilson', 'michael.wilson@example.com', 'password6', 'Physics', true)
    ON CONFLICT DO NOTHING;

-- Insert dummy data into Course table
INSERT INTO "Course" ("courseId", "courseName", "courseCode", "courseDescription", "instructorId")
VALUES (1, 'Introduction to Programming', 'CS101', 'An introductory course on programming', 1),
    (2, 'Calculus I', 'MATH101', 'A course on basic calculus', 2),
    (3, 'Physics I', 'PHYS101', 'An introductory course on physics', 3)
    ON CONFLICT DO NOTHING;

-- Insert dummy data into EnrolledIn table
INSERT INTO "EnrolledIn" ("studentId", "courseId", "studentGrade")
VALUES (1, 1, 90),
    (2, 1, 85),
    (3, 2, 92)
    ON CONFLICT DO NOTHING;

-- Insert dummy data into SystemAdministrator table
INSERT INTO "SystemAdministrator" ("adminId", "firstName", "lastName", "email", "password")
VALUES (1, 'Admin', 'User', 'admin@example.com', 'adminpassword')
    ON CONFLICT DO NOTHING;

-- Insert dummy data into Assignment table
INSERT INTO "Assignment" ("assignmentId", "courseId", "dueDate", "assignmentKey", "maxObtainableGrade", "assignmentDescription")
VALUES (1, 1, '2022-01-15', 'assignment1', 100, 'Write a program to calculate the factorial of a number'),
    (2, 2, '2022-02-10', 'assignment2', 100, 'Solve the following calculus problems'),
    (3, 3, '2022-03-05', 'assignment3', 100, 'Perform experiments to verify Newton''s laws of motion')
    ON CONFLICT DO NOTHING;

-- Insert dummy data into CourseNotification table
INSERT INTO "CourseNotification" ("senderId", "receiverId", "courseId", "notificationMessage", "isRead")
VALUES (1, 2, 1, 'Reminder: Assignment 1 ''is'' due tomorrow', false),
    (2, 1, 2, 'New lecture notes uploaded "for Calculus I', true),
    (3, 1, 3, 'Physics lab scheduled happening next week', false)
    ON CONFLICT DO NOTHING;

-- Insert dummy data into AssignmentSubmission table
INSERT INTO "AssignmentSubmission" ("assignmentSubmissionId", "studentId", "courseId", "assignmentId", "submittedAt", "submissionFile", "isSubmitted", "updatedAt", "isGraded")
VALUES (1, 1, 1, 1, '2022-01-14', 'submission1.zip', true, '2022-01-14', true),
    (2, 2, 1, 1, '2022-01-15', 'submission2.zip', true, '2022-01-15', true),
    (3, 3, 2, 2, '2022-02-10', 'submission3.zip', true, '2022-02-10', false)
    ON CONFLICT DO NOTHING;

-- Insert dummy data into AssignmentGrade table
INSERT INTO "AssignmentGrade" ("assignmentSubmissionId", "assignmentId", "maxObtainableGrade", "AIassignedGrade", "InstructorAssignedFinalGrade", "isGraded")
VALUES (1, 1, 100, 95, 0, true),
    (2, 1, 100, 90, 0, true),
    (3, 2, 100, 0, 0, false)
    ON CONFLICT DO NOTHING;

-- Insert dummy data into StudentFeedback table
INSERT INTO "StudentFeedback" ("studentFeedbackId", "studentId", "assignmentId", "courseId", "AIFeedbackText", "InstructorFeedbackText")
VALUES (1, 1, 1, 1, 'Great job!', 'Good effort, but could be improved'),
    (2, 2, 1, 1, 'Well done!', 'Excellent work'),
    (3, 3, 2, 2, 'Needs improvement', 'Good attempt')
    ON CONFLICT DO NOTHING;

-- Insert dummy data into StudentFeedbackReport table
INSERT INTO "StudentFeedbackReport" ("studentFeedbackReportId", "studentFeedbackReportText", "isResolved", "studentId", "assignmentId", "courseId", "AIFeedbackText", "InstructorFeedbackText")
VALUES (1, 'Reported issue regarding assignment grading', false, 1, 1, 1, 'N/A', 'N/A'),
    (2, 'Reported missing lecture materials', true, 2, 1, 1, 'N/A', 'N/A'),
    (3, 'Reported incorrect answer keys', false, 3, 2, 2, 'N/A', 'N/A')
    ON CONFLICT DO NOTHING;

-- Insert dummy data into AssignmentRubric table
INSERT INTO "AssignmentRubric" ("assignmentRubricId", "assignmentId", "courseId", "criteria")
VALUES (1, 1, 1, 'Correctness, Efficiency, Documentation'),
    (2, 2, 2, 'Problem Solving, Mathematical Reasoning'),
    (3, 3, 3, 'Experimental Design, Analysis')
    ON CONFLICT DO NOTHING;