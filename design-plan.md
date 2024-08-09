# System Design Plan - Team 8 (AI-powered web-development course platform)
# AIValuate

## Introduction

The goal of our project is to produce dependable, robust, and user-friendly software capable of effectively and efficiently grading students HTML, CSS, and JavaScript files that they submit for evaluation with the assistance of AI. This will be done using prompts provided by the professor where in return, insightful and accurate grading feedback will be provided to both the student and the instructor allowing both the students and instructors to engage with our web-based application in a dynamic manner, allowing for students to understand problem areas within their submissions and work on them and allow for instructors to spend less time grading, and more time helping students and developing the course to be the best it can possibly be.

## System Architecture Design

### System Architecture Diagram
![Screenshot 2024-06-05 123506](https://github.com/UBCO-COSC499-Summer-2024/team-8-capstone-team-8/assets/123427375/a2d6dbbf-eae3-4273-a6ef-ad3fe66dbea1)

### System Architecture pattern
#### Microservice architecture 
We aim to put every backend system component in its own containers to remove dependencies. This will also help us isolate, test, and deploy individual parts of our system without needing to run the system as a whole. In our case, the database, the frontend, the AI model, the reverse proxy, and each group of the backend service will be dockerized separately.


### System Components
- Reverse Proxy/Frontend: This acts as an intermediary between the user and the system; it forwards the client’s request to the web server and will decide which user portal will be displayed. The frontend will consist of three different user portals: the instructor portal, the student portal, and the administrator portal. The frontend requests will be sent to the backend, where they are handled; then, after the requests are processed, data will be returned from the backend to the frontend, allowing users to view it.
  
- Backend: The backend receives frontend user requests and processes them by accessing the database or the chatGPT AI component through an API. It will consist of five main services, the assignment grading service, the course management service, the notification service, the status monitoring service and the file uploading service. Each service will be put in a separate container to remove dependencies. These services communicate with the front end, the database, the AI component and the file storage component. Once the request is received from the front-end components, the backend will handle the request by accessing either the AI component or the file storage component or reading/writing data from the database; finally, backend services will reflect the result and show it on the front end. 
- AI Model: The AI component talks directly with the backend. The backend sends prompts, rubrics, and student assignments to the AI component through the OpenAI API. The AI model then utilizes the prompts and uploaded files to create feedback and a mark, which the backend will receive.
  
- Database: The database will store important relational data such as classes, students, professors, admins, assignments, etc. It will not, however, save the file submissions sent in by the students. The data will be created, accessed, updated or deleted by the backend services.
  
- Amazon Simple Storage Service (S3): Because file submissions can be quite large, we will be using Amazon S3 to store all student file submissions. This will be connected to the backend file uploading service. It stores the actual files students and instructors upload. Then, the reference to such files will be stored in the database.


## Use Case Models

Our AI-powered web-development course platform has a multitude of use cases for the 4 defined user groups (students, instructors, teaching assistants (TAs), and system administrators). The use cases are how the product will be used by each type of user from the user groups. The use case diagram and its justification below it will explain this deeply, and similarly, the UML diagram will detail the attributes (functionalities) of each class showing how these classes for different types of users and functionalities within the system will operate in relation to each other, leading to our product working. The usage scenarios will describe in further detail what the use case diagram depicts, and the journey lines will detail the user's satisfiability with our software using an X-axis representing the actions that user will take with the system as well as the system's own actions and time, wherreas the Y-axis will represent user satisfiability, with anything above the X-axis meaning that the user is satisfied, and anything below it would mean that the user is not satisfied with the result of the current action.

## Use Case Diagram & Use Case Descriptions

<img width="1392" alt="Use Case Diagram (1)" src="https://github.com/UBCO-COSC499-Summer-2024/team-8-capstone-team-8/assets/144177741/221facc9-64c1-4777-98d7-d44b86e8f732">

(If the image is too small, either right click the image and open in new tab to zoom in, or click the following link: https://github.com/UBCO-COSC499-Summer-2024/team-8-capstone-team-8/tree/design-plan/docs/design/System%20Design and click on the Use Case diagram)

**Use case 1: Login/Logout**

Primary actor: Instructors, Students

Description: An instructor or student should have the ability to login and log out of the system in a timely and efficient manner.

Precondition: A student or instructor should have created an account or have one created for them by the system administrator resectively.

Postcondition: If an instructor or student has successfully created an account, then they will be able to login and logout of the course platform.

Main scenario:

1. Student/Instructor is directed to the login page.

2. They can enter in their login details, and press the log in button.

3. On successful login, the student/instructor will be directed to the dashboard where they can see the courses they are involved with.



**Use case 2: Invite to course**

Primary actor: Instructors

Description: An instructor should have the ability to invite students to a course that they created.

Precondition: An instructor should be logged in and have created a course.

Postcondition: If an instructor or student has successfully logged in, created a course, and sent out invites to students to join their course, this will allow for the students to be able to join the course and access the material within the course.

Main scenario:

1. Instructor logs into their dashboard.

2. They create a course, or click one of the courses they already have created.

3. On going into the course of their choice (either the created one or one they have already created), they can send invites to students to join their course.



**Use case 3: Create account**

Primary actor: Students 

Description: A student should have the ability to create an account in a simple and efficient manner.

Precondition: A student has been invited to join a course via email by an instructor, and needs to create an account to join the course and access the material in the course.

Postcondition: If a student is able to successfully create their account, they will be able to join the course that the instructor invited them to, and access the material within the course.

Main scenario:

1. Student receives email to join the course that the instructor invited them to join.

2. Student enters the sign up page.

3. Student will need to create an account under their name.

4. The student will then be given the option to join the course.



**Use case 4: Modify, delete account**

Primary actor: Students, Instructors

Description: A student/instructor should have the ability to modify their account or delete their account in a simple and efficient manner.

Precondition: A student/instructor have created their account or have their account created for them by the system administrator.

Postcondition: If a student/instructor is able to successfully modify or delete their account, they will be able to leave the platform with their data deleted from our database, and they will lose access to the courses they were involved with, and any other data from the courses they were involved in.

Main scenario:

1. Students and instructors log into their accounts.

2. Students and instructors can modify personal details related to their account and see their data.

3. Students and instructors will navigate to the delete account page.

4. The students and instructors will then be able to delete their account, leading them to lose access to our platform, and all their data on the platform.


**Use case 5: Create, edit, delete course**

Primary actor: Instructors

Description: An instructor should have the ability to create, edit, and delete courses in a simple and efficient manner.

Precondition: An instructor has their account created for them by the system administrator, and have created a course or multiple courses.

Postcondition: If an instructor is able to successfully delete a course they taught, they will lose access to all rubrics, answer keys, grades, and other data within the course permanently.

Main scenario:

1. Instructor logs into their account.

2. Instructor can navigate to the course of their choice that they teach from the dashboard.

3. Instructor will be redirected to the course's main page and navigate to the delete course page.

4. The instructors will then be able to delete the course they are teaching, and once they delete the course, they will lose access to all rubrics, answer keys, grades, and other data within the course permanently.



**Use case 6: Release assignment grades and feedbacke**

Primary actor: Instructors

Description: An instructor should have the ability to override, and release assignment grades and feedback on top of the AI-generated feedback and grades produced.

Precondition: An instructor has their account created for them by the system administrator, and have created a course or multiple courses, and assigned assignments to students which have been graded by the AI.

Postcondition: If an instructor is able to successfully release grades from the AI, themself, and the feedback from the AI as well as the instructor, then the students can view their grades and feedback.

Main scenario:

1. Instructor logs into their account.

2. Instructor can navigate to the course of their choice that they teach from the dashboard.

3. Instructor will create an assignment and assign it to students, the students will submit their assignments before the due date.

4. The instructors will then be able to receive AI-generated grades, and feedback, which they can add to with their own feedback and will be able to assign a final grade to the assignment for each student.

Extensions:

6a. Instructors should be able to review and/or override the grades and feedback generated by the AI.
	- Our platform will give the instructors the chance to accept or override the AI-generated grades and feedback.

6b. Instructors should be able to provide additional feedback on top of the feedback already generated as well as a final grade.
	- Our platform will give the instructors the chance to provide additional feedback and a final grade on top of the AI-generated grades and feedback.


**Use case 7: Upload rubrics and answer keys**

Primary actor: Instructors

Description: An instructor should have the ability to upload rubrics, and answer keys to an assignment.

Precondition: An instructor has their account created for them by the system administrator, and have created a course or multiple courses, and assigned assignments to students which have been graded by the AI.

Postcondition: If an instructor is able to successfully upload rubrics and answer keys to an assignment, then the student will be able to view it after the assignment due date has passed to check where their skills are lacking.

Main scenario:

1. Instructor logs into their account.

2. Instructor can navigate to the course of their choice that they teach from the dashboard.

3. Instructor will create an assignment, upload a rubric and answer key and assign it to students, the students will submit their assignments before the due date.

4. The instructors will then be able to receive AI-generated grades, and feedback, which they can add to with their own feedback and will be able to assign a final grade to the assignment for each student.



**Use case 8: View all individual grades**

Primary actor: Students, Instructors

Description: A student should have the ability to view all their individual grades and an instructor should have the ability to view all students' individual grades.

Precondition: A student and instructor have created their account or have their account created for them by the system administrator respectively, and instructors have created a course or multiple courses, and assigned assignments to students which have been graded by the AI and themselves, resulting in a grade history being stored for each student.

Postcondition: If instructors are able to successfully view a student's grade history, and student's are able to view their grade history, then they can advise the student to focus on certain topics and assist the student in their problem areas.

Main scenario:

1. Students and Instructors log into their accounts.

2. Instructors can navigate to the course of their choice that they teach from the dashboard, and students can navigate to the courses that they are enrolled in.

3. Instructors acan view a student's grade history, and students can view their individual grade history to assess their progress in the course.



**Use case 9: View all students' overall grades**

Primary actor: Instructors

Description: An instructor should have the ability to view all overall grades of all students.

Precondition: An instructor who has their account created for them by the system administrator, and have created a course or multiple courses, assigned assignments to students which have been graded by the AI and themselves, resulting in a grade history being stored for each student as well as an overall grade.

Postcondition: If instructors are able to successfully view a student's overall grade, then they can decide whether to pass or fail a student.

Main scenario:

1. Instructors log into their accounts.

2. Instructors can navigate to the course of their choice that they teach from the dashboard.

3. Instructors can view all students' overall grades from the instructor dashboard.



**Use case 10: Submit Assignment**

Primary actor: Students

Description: A student should have the ability to submit an assignment as HTML, CSS, JS files or as a link.

Precondition: A student creates their account and logs in, and selects a course and an assignment in that course to submit.

Postcondition: If students are able to successfully submit their assignments, then they can await feedback from the AI as well as the instructor and teaching assistants.

Main scenario:

1. Students log into their accounts or create accounts if they do not have one.

2. Students can navigate to the course of their choice that they are enrolled in from the dashboard.

3. Students can then navigate to the assignments tab, and click on an assignment.

4. Students can then submit their assignment as a file or a link.

Extensions:

10a. Students should be able to view all feedback and grades.
	- Our platform will give the students the chance to view the grade and feedback from instructor and AI.




**Use case 11: View assignment grades and feedback**

Primary actor: Students, Instructors

Description: Students and instructors should have the ability to view individual assignments' grades and the feedback given along with the grades.

Precondition: A student and instructor have created their account or have their account created for them by the system administrator respectively, and instructors have created a course or multiple courses, and assigned assignments to students which have been graded by the AI and themselves, resulting in grades being stored for each assignment individually for each student.

Postcondition: If instructors and students are able to successfully view assignment grades for all submissions and for their individual submissions respectively along with feedback, then instructors can advise the student to focus on certain topics and assist the student in their problem areas.

Main scenario:

1. Students and Instructors log into their accounts.

2. Instructors can navigate to the course of their choice that they teach from the dashboard, and students can navigate to the courses that they are enrolled in.

3. Instructors can view a student's grade for an assignment along with all the feedback for that particular assignment, and students can view their individual grade for an assignment with the feedback from the AI and the instructor.




**Use case 12: Join Course**

Primary actor: Students

Description: A student should have the ability to join a course given an email sent to them from our platform with an invite to a course and provided the student makes an account or can log into an existing account.

Precondition: A student has created their account and instructors have created a course or multiple courses.

Postcondition: If students are able to successfully log in and join a course that they were invited to by the course instructor, they will have access to course material in the form of assignments, and can view their grades.

Main scenario:
1. Students click on a link sent to them via email that invites them to a course.

2. Students log into their accounts or create accounts if they do not have one.

3. Students are then added to the course, and can view assignments, and grades.



**Use case 13: Create, edit, delete, and assign assignments**

Primary actor: Instructors

Description: An instructor should have the ability to create, edit, delete assignments, and assign assignments to students.

Precondition: An instructor has their account created for them by the system administrator, and instructors have created a course or multiple courses.

Postcondition: If instructors are able to successfully create, edit, delete assignments, and assign assignments to students, then they can effectively run their course in the way they see fit to assist students in learning the course material.

Main scenario:

1. Instructors log into their accounts.

2. Instructors can navigate to the course of their choice that they teach from the dashboard.

3. Instructors can create an assignment, edit an existing assignment, delete an assignment and also assign assignments to students (sends a notification of the assignment being assigned).



**Use case 14: View analytics**

Primary actor: Instructors

Description: An instructor should have the ability to view analytics on overall grades for assignments and overall course grades from students.

Precondition: Instructors have their account created for them by the system administrator, and have created a course or multiple courses, and assigned assignments to students which have been graded by the AI and themselves.

Postcondition: If instructors are able to view analytics like mean, median, etc. of students' overall grades and assignment grades, they can use that to assist the students with material where the assignment grades were low.

Main scenario:

1. Instructors log into their accounts.

2. Instructors can navigate to the course of their choice that they teach from the dashboard.

3. Instructors can assignment grades and all overall grades from students, and the analytics for the overall grades and the assignment grades for each assignment, which will help them assist the students with the material where the assignment performance was low.



**Use case 15: Report inaccurate feedback**

Primary actor: Students

Description: A student should have the ability to report inaccurate AI-generated feedback.

Precondition: A student has created their account, and students join course that are created by instructors, and assigned assignments to students which have been graded by the AI and instructors.

Postcondition: If students are able to successfully report inaccurate feedback from the AI, then they can help guide and train the AI to become better over time and generate better feedback for future versions and future assignments of the current course.

Main scenario:

1. Students log into their accounts.

2. Students can navigate to the course of their choice that they are enrolled in from the dashboard.

3. Students can view their assignment grades.

4. Students can then click on a specific assignment to review the feedback from the AI.

5. If the student feels that the feedback was inaccurate, they can report the feeback for being inaccurate, helping train the AI to become better at generating feedback on similar assignments in the future. 

## UML Class Diagram

![UML Diagram](https://github.com/UBCO-COSC499-Summer-2024/team-8-capstone-team-8/assets/123427375/4817210f-5735-4c75-8d06-2096e703c8dd)

(If the image is too small, either right click the image and open in new tab to zoom in, or click the following link: https://github.com/UBCO-COSC499-Summer-2024/team-8-capstone-team-8/tree/design-plan/docs/design/System%20Design and click on the UML Class diagram)

As shown above, the UML diagram consists of 11 classes. A description of each class and attribute can be found below in the ER diagram section. The main changes from the ER diagram to the above UML diagram were including aggregation relationships for entities like students -> courses, with courses being the whole entity, and the students being the part, and having attributes with their data types as well as methods to get and set those attributes. The above UML diagram gives clarity on how we can go about modelling classes within our web application.

## Journey Lines

<img width="1134" alt="Journey Line 1_ Instructor assignment supervision" src="https://github.com/UBCO-COSC499-Summer-2024/team-8-capstone-team-8/assets/144177741/63f29a9b-2eb4-443a-9385-e53db0566b5e">

In the above journey line, we depict a progression of an instructor's satisfication throughout the assignment supervision (creation) process, all the way from logging into our application, to including what could potentially go wrong, to creating an assignment and modifying its details according to an instructor's wish up until the student being able to access the assignment successfully via our platform.

<img width="1238" alt="Journey Line 2_ Instructor grading and feedback" src="https://github.com/UBCO-COSC499-Summer-2024/team-8-capstone-team-8/assets/144177741/681fbc12-afd5-426a-aa20-9d66705d720a">

In the above journey line, we depict a progression of an instructor's satisfication throughout the assignment grading and feedback process, all the way from logging into our application, to including what could potentially go wrong, to creating an assignment and students submitting their assignments and waiting on instructor and AI-generated feedback, which is delivered to the students with their grades via our platform.

<img width="1391" alt="Journey Line 3_ Student submissions and feedback" src="https://github.com/UBCO-COSC499-Summer-2024/team-8-capstone-team-8/assets/144177741/ef3f265c-f6ca-4ef5-aae5-0327a97a7d2e">

In the above journey line, we depict a progression of a student's satisfication throughout the assignment submission and feedback process, all the way from logging into our application, to including what could potentially go wrong, to receiving submissions from the student, to receiving feedback and a grade from the AI and the instructor for their submission, helping the students to learn from the feedback via our platform.

<img width="1458" alt="Journey Line 4_ System Administrator course supervision   permissions" src="https://github.com/UBCO-COSC499-Summer-2024/team-8-capstone-team-8/assets/144177741/cd19fefe-143d-44b8-8a80-64de403126f8">

In the above journey line, we depict a progression of a system administrator's satisfication throughout the course supervision and permission granting process, all the way from giving instructors their access to our platform, to including what could potentially go wrong, and even giving teaching assistants restricted access within the instructor role, and allowing for students to receive feedback and grades from the TAs, instructors and the AI  via our platform.

(If the images are too small, either right click the image and open in new tab to zoom in, or click the following link: https://github.com/UBCO-COSC499-Summer-2024/team-8-capstone-team-8/tree/design-plan/docs/design/System%20Design and click on the Journey Lines 1 - 4)

## Database Design

## ER Diagram

The following ER (Entity Relationship) diagram details our how the data within our database is modelled via the creation of tables to support differnet entities interacting with eachother to make the system function efficiently and effectively:

![ER Diagram](https://github.com/UBCO-COSC499-Summer-2024/team-8-capstone-team-8/assets/123427375/a44937e1-ac75-431b-b191-20b97fbfa88e)

(If the image is too small, either right click the image and open in new tab to zoom in, or click the following link: https://github.com/UBCO-COSC499-Summer-2024/team-8-capstone-team-8/tree/design-plan/docs/design/System%20Design and click on the ER diagram)

## Database Design Justification

### List of Entities
#### Student
###### Purpose
The Student entity keeps track of basic student information and login credentials.
###### Attributes
- studentId: the primary key that identifies student
- firstName: student's first name
- lastName: student's last name
- email: student account log in email
- password: password of a student account
- grade: the average GPA of a student

#### SystemAdministrator

###### Purpose
The SystemAdministrator table stores admin user groups name and log in credentials.
###### Attributes
- adminId: the primary key that uniquely identifies each system administrator
- firstName: system administrator's first name
- lastName: system administrator's last name
- email: system administrator log in email
- password: system password of a system administrator's account
#### Course
###### Purpose
The course table stores basic info of a course, and various stats of student grades of that course.
###### Attributes
- couseId: The primary key that identifies each course
- description: a brief introduction of what the course offers
- studentGrade
	- Mean: the average grade of the course
	- Median: the median grade of the course
	- UpperQuartile: the upper quartile of student grades of the course
	- LowerQuartile: the lower quartile of student grades of the course

#### CourseNotification
###### Purpose
The CourseNotification table stores data related to posted notifications.
###### Attributes
- senderId: the primary key that indicates the sender's identification
- receiverId: the primary key that indicates the receiver's identification
- message: stores the actual message of a notification
- isRead: stores the status of whether the notification has been read by the receiver
#### EnrolledIn
###### Purpose
The EntrolledIn table stores data on students' course enrollment status.
###### Attributes
- enrollmentId: a primary key that identifies each student's enrollment status
- enrolledInCourseCode: a list of courses a student is currently enrolled in
#### Instructor
###### Purpose
The Instructor entity stores basic information of an instructor and their login credentials
###### Attributes
- instructorId: the primary key which uniquely identifies an instructor
- firstName: an instructor's first name
- lastName: an instructor's last name
- email: an instructor's login email address
- password: an instructor's login password
- department: the department an instructor belongs to
- hasFullAccess: determines whether a user has full access to the system; this attribute differentiates T.A. user roles from instructor roles
#### Assignment
###### Purpose
The Assignment entity stores data on assignments created by instructors
###### Attribute
- assignmentId: the primary key that identifies each assignment
- dueDate: the due date of an assignment
- assignmentKey: the correct answers to an assignment
- maxObtainableGrade: the max number grade one can obtain
- description: specifies the requirement or the content of the assignment
#### StudentFeedback
###### Purpose
The StudentFeedback table stores data on AI's feedback and the instructor's feedback in regard to the student's assignment submission.
###### Attributes
- studentFeedbackId: a primary key that uniquely identifies the feedback of a student's assignment submission
- AifeedbackText: stores the AI feedback of a student's assignment submission
- InstructorTAfeedbackText: stores the instructor's or the TA's feedback on a student's assignment submission
#### Rubric
###### Purpose 
The Rubric entity stores data on the rubric of a specific assignment. The rubrics also serve the purpose of providing prompts to the AI marking components.
###### Attributes
- rubricId: the primary key that uniquely identifies each rubric
- criteria: specific description of contents of a rubric

#### Submission
###### Purpose
The Submission entity stores all data relates to an assignment submission, including the grades, submission status, feedback and course info.
###### Attributes
- submissionId: this is the primary key that identifies each submission
- submittedAt: a timestamp of when the submission is made
- updatedAt: a timestamp that shows when the submission is updated by the student
- isGraded: a status indicating whether or not the submission has been graded

#### StudentFeedbackReport
###### Purpose
The StudentFeedbackReport entity stores data on the review and adjustments the instructor made in regard to AI feedback.
###### Attributes
- studentFeedbackReportId: this is the primary key that uniquely identifies each feedback report
- reportText: the content  of a feedback report
- isResolved: tracks whether or not the feedback has been resolved

#### Grade
###### Purpose
The grade entity keeps track of the AI and instructor grade assigned to one submission attempt
###### Attributes
- submissionId: this is a partial key borrowed from the submission table
- assignmentId: this is a partial key borrowed from the assignment table
- numberAssignmentGradeAI: the number grade provided by the AI
- numberAssignmentGradeFinal: the final number grade assigned by the instructor
- percentageAssignmentGrade: a percentage grade assigned to the assignment
  - isGraded: a status that indicates whether one submission has been graded
### Table Relationships

| Entity #1           | Cardinality #1 | Cardinality #2 | Entity #2             | Description                                                                                                                                                        |
| ------------------- | -------------- | -------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| CourseNotification  | 0...*          | 0...*          | Student               | A course notification can be sent to zero to many students, and a student can receive zero to many notifications                                                   |
| Student             | 1...*          | 1...*          | Course                | A student enrolls in at least one course, and each course has at least one student                                                                                 |
| SystemAdministrator | 1...*          | 1...*          | Course                | System Administrator manages at least one course, and each course is managed by at least one system administrator                                                  |
| Instructor          | 1...*          | 1...*          | Course                | An instructor teaches at least one course, and one course is taught by at least one instructor (note that the instructor and teaching assistant share one entity) |
| Course              | 1...1          | 0...*          | Assignment            | A course has zero to many assignments, and an assignment can be assigned to one and only one class                                                                 |
| Assignment          | 1...1          | 1...*          | StudentFeedback       | One assignment can have one to many feedbacks, and each feedback will be attached to exactly one assignment                                                        |
| Assignment          | 1...1          | 0...1          | Rubric                | One assignment can have zero or one rubric, and each rubric will be attached to exactly one assignment                                                             |
| Assignment          | 1...1          | 0...*          | Submission            | An assignment can be submitted zero to many times, and each submission applies to one assignment only                                                              |
| Assignment          | 1...1          | 0...*          | CourseNotification    | Each assignment can have zero to many notifications, and each notification applies to only one assignment only                                                    |
| StudentFeedback     | 1...1          | 0...*          | StudentFeedbackReport | Each student feedback report is associated with one and only one student feedback and each feedback can have zero to many feedback reports                          |
| Student             | 1...1          | 0...*          | Submission            | Each submission is made by one and only one student, one student can submit zero to many times                                                                     |
| Assignment          | 1...1          | 0...*          | Grade                 | An assignment can have zero to many graded submissions, but each graded submission can only belong to one assignment                                                |









## Data Flow Diagram (Level 0/Level 1)

DFD Level 0

<img width="939" alt="Screenshot 2024-06-05 at 4 43 36 PM" src="https://github.com/UBCO-COSC499-Summer-2024/team-8-capstone-team-8/assets/97553042/3e36477a-e838-4c57-aa85-451df74630af">




DFD Level 1 

<img width="967" alt="Screenshot 2024-06-05 at 4 41 37 PM" src="https://github.com/UBCO-COSC499-Summer-2024/team-8-capstone-team-8/assets/97553042/16cc7cbb-3c16-4f81-a42c-3f835c45162f">


This diagram illustrates the primary external entities and how they interact with the system:

- **Instructor**: Oversees courses, assignments, and the grading process.
- **Student**: Completes and submits assignments, and retrieves grades and feedback.
- **Admin**: Administers the overall system configurations and manages user permissions.

  

  ### Detailed Level 1 DFD
Below is an expanded flow based on the detailed DFD you have provided:

#### Login (Process 1)
- **Participants**: Users (including instructors, students, and admins)
- **Action**: Go through a login procedure for authentication.
- **Validation**: User credentials are validated against the User Account Database.

#### Course Management (Process 2)
- **Participants**: Instructors
- **Action**: Input new or updated course information.
- **Storage**: Information is stored in the Courses Database.

#### Assignment Creation and Modification (Process 3)
- **Participants**: Instructors and teaching assi
- **Action**: Develop or modify assignments along with associated rubrics.
- **Storage**: Assignment details are cataloged in the Assignments Database.

#### Assignment Submission (Process 4)
- **Participants**: Students
- **Action**: Upload their assignments (either documents or links).
- **Storage**: Submissions are recorded in the Student Work Database.

#### Automated Grading (Process 5)
- **Tools**: AI tools (like OpenAI’s ChatGPT or Ollama)
- **Action**: Automatically evaluate assignments.
- **Storage**: Initial grades are temporarily logged in the Grades Database.

#### Grade Validation and Oversight (Process 6)
- **Participants**: Instructors
- **Action**: Scrutinize the AI-produced grades for precision and authorize them.
- **Update**: Any modifications are recorded in the Grades Database.

#### Feedback and Improvement (Process 7)
- **Participants**: Students
- **Action**: Review their finalized grades and feedback.




## User Interface (UI) Design

UI mock-ups (minimal, but need to know interaction flow of the application, diagram to explain the navigation flow for the MVP prototype (and any alternate flows)).  Think about usability, accessibility, desktop and mobile uses.

### Student Interface
**When a student enters the url to the AIvaluate website they will be met with the login/sign up page. Students can login if they already have an existing account or sign up if it is their first time visiting the site.**
![Signup](/docs/ui-design/1.png)
![Login](/docs/ui-design/2.png)
**If a student forgets their password they can submit their email and they will be emailed a link to change there password if a user exists with that email.**
![Forgot Password](/docs/ui-design/3.png)
![Change password from forgot pass request](/docs/ui-design/4.png)
**Upon login students will be shown their dashboard/homepage. Here they can select a course, or via the drop down menu, visit account page, join a course, get help, or log out.**
![Student dashboard](/docs/ui-design/5.png)
![Join Course](/docs/ui-design/6.png)
![student drop down menu](/docs/ui-design/7.png)
![Evaluator drop down menu](/docs/ui-design/8.png)
![Account](/docs/ui-design/9.png)
**Students can visit the help page for instructions of how to use the website.**
![Get help](/docs/ui-design/11.png)
**After clicking on a course the student can view their grades for the course in the grades tab.**
![Grade: student view](/docs/ui-design/12.png)
**When clicking on the assignments tab students can view all complete assignments. Each assignment can be clicked on to view more information such as assignment descriptions or grade/AI and professor feedback.**
![Assignments: student view](/docs/ui-design/13.png)
![Single assignment feedback: student view](/docs/ui-design/14.png)
![Single assignment submission: student view](/docs/ui-design/15.png)
**Student can click on the people tab to see a list of all other students enrolled in the class.**
![People: student view](/docs/ui-design/16.png)
**Student can click on the Submissions tab and see all of their submissions for this course.**
![Submissions: student view](/docs/ui-design/17.png)

### Evaluator Interface.
**The login page for T.A. and professor look different then the login page for the students because they cannot create an account themselves. Instead the Admin must create an account for them. Note: The admin page login will also look the same as this.**
![Evaluator/admin login](/docs/ui-design/login.png)
**The professor dashboard looks very similar to a student dashboard but gives them the ability to create a course.**
![Create Course](/docs/ui-design/10.png)
**Professors can visit the help page for instructions of how to use the website.**
![Get help](/docs/ui-design/11.png)
**Upon clicking on the assignments the evaluator can see specific assignments. They can click on these to view all of the students submissions. Or to view or edit assignment criteria. From here they can also browse assignments of create a new assignment.**
![All submissions: prof view](/docs/ui-design/20.png)
![All specific submissions: prof view](/docs/ui-design/19.png)
**The professor can create an assignment by creating a new rubric or reusing a past one.**
![Create assignment: prof view](/docs/ui-design/24.png)
**Professor or T.A. can click to view a students submission of an assignment and can view the AI feedback. The evaluator must confirm the students score before it is considered marked. The Evaluator may also edit the due date for this specific student. Finally the evaluator can write their own comments on the assignment submission and mark the evaluation as complete.**
![Submitted assignment: prof view](/docs/ui-design/18.png)
**Professors can see whether or not an assignment is published or not and edit everything on an assignment such as due date, name, and description/rubric. they can also publish or unpublish an assignment.**
![Assignment Unpublished: prof view](/docs/ui-design/21.png)
![Assignment published: student view](/docs/ui-design/22.png)
**Once all assignments submissions are marked for a specific assignment, the professor can publish the grades to the students or hide the grades from the students.**
![Assignment submissions and publish grades: prof view](/docs/ui-design/23.png)
**Professor can view the averages of student grades from assignments so they know how their students are doing in the course.**
![Student grades: prof view](/docs/ui-design/25.png)
**Professor can review all past rubrics from this any course as they are all saved.**
![Selected rubricc: prof view](/docs/ui-design/26.png)
![All past rubrics: prof view](/docs/ui-design/27.png)

### Admin Interface
**The admin can view or search the list of students that have an account at AIvaluate. These users can be selected to allow the admin to view more information**
![Student manager, all students view: Admin view](/docs/ui-design/28.png)
**A selected student profile contains their course information and the Admin can drop them from a course. The admin can also delete a user.**
![Student manager, single students view: Admin view](/docs/ui-design/29.png)
**The admin can view or search the list of T.A.'s and Instructors that have an account at AIvaluate. These users can be selected to allow the admin to view more information. Admin can user sign a evaluator up for an account.**
![Evaluator manager: all evaluators: Admin view](/docs/ui-design/30.png)
**A selected evaluator profile contains their course access information and the Admin can remove the professor from a course. The admin can also delete an evaluator or select whether or not they are a teaching assistant.**
![Evaluator signup: Admin view](/docs/ui-design/32.png)
![Evaluator manager: Single evaluator: Admin view](/docs/ui-design/31.png)
