# Team 8 Project Plan: AI-Powered Web Development Course Platform

**Team Number:** 8

**Team Members:** Colton Palfrey | Jerry Fan | Aayush Chaudhary | Chinmay Arvind | Omar Hemed

## Overview:
 - Scope

- Clarity

- Cohesiveness

- Measurable Objectives

- Success Criteria

- Usage Scenario

## Scope
The goal of this project is to produce a viable, robust, and user-friendly software solution capable of efficiently and effectively grading students HTML, CSS, and JavaScript documents. This will be done using a set of instructions provided by the professor where in return, insightful and accurate grading (relative to human grading) feedback will be provided to both the student and the instructor allowing both users to engage with the web app in a dynamic manner, allowing for students to understand problem areas and work on them and instructors to spend less time grading and more time helping students and developing the course to be the best it can be. 

## Deliverables
Over the course of this project, we will be delivering the following: 
- AI-powered web development course platform
- Project Plan (high-level, and will include descriptions of the features of the project, user requirements, functional requirements, usage scenarios, technical requirements, non-functional requirements, system requirements, project goals, Unique Value Proposition, Minimum Viable Product description, Change management plan, Communications plan, Quality Assurance plan, milestone schedule, and the teamwork planning schedule)
- Design plan (lower-level, and will include details about how the system is designed, how components of the system will interact to produce the required outcome in different scenarios as described in the usage scenarios)
- Presentations for the Project Plan, Design Plan, and the Minimum Viable Product (MVP)
- Final individual project reports (from each team member detailing components they worked on, as well as how their component works with the remaining components of the system and how the system will function as a whole successfully)

### Project purpose and justification i.e. Unique Value Proposition (UVP)
Our AI-Powered Web Development Course Platform will aim to streamline and automate the grading process of HTML, CSS, and JavaScript web development course assignments based on professor-defined criteria. Our solution will address inefficiencies and inconsistencies of manual grading by leveraging advanced AI techniques such as LLMs (Large Language Models) to provide accurate, detailed, and timely feedback. This will allow for dynamic engagement between students and instructors. Our platform will provide unique value due to its ability to deliver swift and comprehensive evaluations complemented by a user-friendly interface, and therefore, offering a superior, scalable, and customizable solution for students and instructors. By automating the grading process for instructors and providing immediate feedback that students can take action to, the platform will ensure a more valuable, efficient and insightful educational experience for students and instructors.

## Goals
### High-level project description and boundaries
The project goals for the AI-Powered Web Development Course Platform are to automate the grading of HTML, CSS, and JavaScript assignments with high accuracy and consistency, provide detailed and acurate feedback to enhance student learning, and reduce the grading workload for instructors. Additionally, the platform aims to ensure a user-friendly experience, support scalability for large classes, and to maintain instrustors' previous rubrics and grading criteria to make the resuse of assignments easy.

### MVP (Minimum Viable Product) Description
- Automated grading engine for HTML, CSS, and JavaScript assignments.
- Interface for instructors to define and save grading criteria and rubrics.
- Submission system for students to upload their code.
- Detailed feedback reports for students based on the automated grading.
- User-friendly interface for both students and instructors.
- Scalability to handle large numbers of students.

## Change management/Communications/QA plan
### Change Management
- **Change Request Submission**: Stakeholders can submit change requests which must include a detailed description, rationale, impact analysis, and urgency.
- **Change Evaluation**: As a team we will evaluate each change request based on its impact, benefits, risks, and requirements.
- **Approval or Rejection**: As a team we will decide whether to approve, defer, or reject the change request. Given that we approve changes they will immediatly be prioritized and scheduled for implementation via Continuous Integration.
- **Implementation Planning**: A detailed plan will be created for the implementation of approved changes, timeline, and risk mitigation strategies.
- **Change Implementation**: Changes will be implemented by following the implementation plan and adhering to best practices and guidelines.
- **Testing and Validation**: Changes will be throughly tested to ensure they function as intended and do not negatively impact the platform. Testing could include unit tests, integration tests, and user acceptance tests.
- **Documentation and Training**: All changes will be documented, including the rationale, implementation steps, and testing results. We will update stakeholders on new features or changes.
- **Review and Closure**: As a team we will review the implemented changes to ensure they meet the intended objectives and are functioning correctly. Once we cna guarenteed the change was  the change request is closed, and any lessons learned are documented for future references
### Communications
- We will communicate as a team through in-person meetings, as well as the popular social media platform, Discord.
- This is also where we will have occasional meetings related to the project, and discuss the project if not in person.
- The application maintains a history of our communications to hold each other accountable during the course of this project.
### QA plan
- In order to maintain quality in our code base, we will implement unit testing, code reviews, integration testing, as well as regression testing.
- We will also have meetings with the client and establish a feedback loop with them to iteratively improve our software product.

### Feature List
1. User authentication and user account management (modify, delete, grant permissions)
2. Course management (edit, delete, restore)
3. Assignment management (create, modify, delete assignments, upload rubrics and answer keys, AI-powered grading, human review of AI grading)
4. Assignment submission (submitting assignments, AI-powered feedback on assignment for student and instructor)
5. Security and privacy (anonymization of student data for storage and transfer)
6. Notifications (in-app notifications for assignment due dates, grades, and feedback)
7. Analytics (dashboard with class analytics for assignment to be viewed by admins and instructors for feedback on class performance, and AI grading accuracy)

### Measurable project objectives and related success criteria (scope of project)
**Feature 1: User authentication and user account management (modify, delete, grant permissions)**
- Objective: To accomodate for users of different roles (students, instructors, admins) to create, modify, and delete accounts, as well as giving the ability for instructors and admins to grant access to a course and assignment.
- Success Criteria:
  1. Should allow for users to login within 2 seconds
  2. Should allow users to reset passwords and have the changes reflected within 5 seconds
  3. Should allow for admins to grant access to instructors and students to their accounts and have the changes reflected within 5 seconds
  4. Should allow users to delete accounts and have the changes reflected within 5 seconds
  5. Should send an account deletion email and have the changes reflected within 5 seconds of deleting the account
  6. Should secure password with hashing after user registers, within 5 seconds
 
**Feature 2: Course management (edit, delete, restore)**
- Objective: To accomodate for users of different roles (students, instructors, admins) to join, modify, and delete courses (editing and deleting course permissions not given to students), as well as giving the ability for instructors and admins to restore course material from past courses to use for future courses.
- Success Criteria:
  1. Should allow for admins and instructors to create a course/delete a course and have the changes reflected within 5 seconds
  2. Should allow admins and instructors to restore old course material and have the changes reflected within 5 seconds
  3. Should allow for admins to grant access to instructors and students invites to courses and have the changes reflected within 5 seconds
  4. Should allow admins and users to modify a course and have the changes reflected within 5 seconds
  5. Should allow students to join courses and have the changes reflected within 5 seconds
 
**Feature 3: Assignment management (create, modify, and delete assignments, upload custom rubrics and answer keys, provide AI-powered grading, facilitate human review of AI grading)**
- Objective: To accomodate for users of different roles (students, instructors, TAs, admins) to create, delete, and modify assignments, and giving instructors and admins a way to upload rubrics with answer keys, generate AI-powered automated grades, and allow for human review in the form of giving instructors and admins a chance to review the grading.
- Success Criteria:
  1. Should allow for admins and instructors to create, modify and delete assignments and have changes reflected within 5 seconds
  2. Should allow admins, instructors, and TAs to upload rubrics and answer keys for an assignment within 5 seconds
  3. Should generate AI-powered automated grades within 15 seconds
  4. Should give admins, instructors, and TAs the opportunity to review the grading before approving as final grade within 10 seconds of the assignment being graded by the AI
 
**Feature 4: Assignment submission (submitting assignments, AI-powered feedback on assignment for student and instructor)**
- Objective: To accomodate for users of different roles (students, instructors, TAs, admins) to submit assignments, and receive AI-powered feedback.
- Success Criteria:
  1. Should allow for students to submit their assignments within 5 seconds
  2. Should generate AI-powered feedback on the students' submissions within 1 minute
  3. Should send generated feedback to instructors for reviewing and assessing class progress within 1 minute
  4. Should allow users to delete accounts within 30 seconds
 
**Feature 5: Security and privacy (anonymization of student data for storage and transfer)**
- Objective: To guarantee for users of different roles (students, instructors, TAs, admins) security on their data, and anonymizing their data.
- Success Criteria:
  1. Should allow for students' data to be anonymized within 5 seconds of being created
  2. Should have secure storage of students', admins', TAs', and instructors' data through hashing
 
**Feature 6: Notifications (email and in-app notifications for assignment due dates, AI-generated and instructor grades, and feedback)**
- Objective: To accomodate for users of different roles (students, instructors, TAs, admins) to receive timely and accurate notifications of due dates, grades, and feedback for upcoming/recently finished and graded assignments.
- Success Criteria:
  1. Should send students, instructors, and admins a notification of an assignment being due one week, and one day before it is due
  2. Should generate feedback and send a notification that directs students to the AI-generated feedback on the submission within 5 seconds 

**Feature 7: Analytics (dashboard with class analytics for assignment to be viewed by admins and instructors for feedback on class performance, and AI grading accuracy)**
- Objective: To accomodate for users of different roles (instructors, TAs, admins) to receive analytics on how the class is doing in learning the subject (web-development) via averages, learning objectives, and other metrics decided by the AI itself, and to compare with human grading.
- Success Criteria:
  1. Should generate analytics about student performance on the assignment for the admins and instructors to view within 10 minutes
  2. Should allow for manual review of grades before finalizing within 10 minutes of analytics being generated

## User Groups, Usage Scenarios and High Level Requirements 
### User Groups:
**1. Instructors**
- **Description**: Responsible for teaching web development courses, including HTML, CSS, and JavaScript. They create and manage assignments, set grading criteria, and review AO provided feedback to students.

- **High-Level Goals**: 
    - Efficiently create and manage assignments.
    - Automate the grading process to save time.
    - Provide detailed and constructive feedback to students.
    - Monitor student progress and performance.
    - Reuse and customize grading rubrics for different assignments.

- **Proto-Persona:**
    - **Name**: Dr. John Newman
    - **Age**: 45
    - **Occupation**: Professor of Computer Science
    - **Background**: Dr. Newman has over 20 years of experience teaching web development and enjoys integrating new technologies into his teaching methods.
    - **Needs**: Tools to streamline assignment creation and grading, insights into student performance, and the ability to customize grading criteria.
    - **Frustrations**: Time-consuming manual grading, inconsistent feedback, and managing large class sizes.

**2. Students**
- **Description**: Students are individuals enrolled in web development courses. They submit assignments, receive grades and feedback, and use the platform to improve their coding skills.

- **High-Level Goals**:
    - Easily submit assignments and receive prompt feedback.
    - Understand strengths and areas for improvement in their code.
    - Track their progress and grades throughout the course.
    - Access resources and feedback to enhance their learning experience.

- Proto-Persona:
    - **Name**: Alex Falangie
    - **Age**: 20
    - **Occupation**: Computer Science Student
    - **Background**: Alex is a second-year student passionate about web development and eager to learn and improve coding skills.
    - **Needs**: Clear instructions for assignments, timely and detailed feedback, and tools to track progress and grades.
    - **Frustrations**: Delayed feedback, unclear grading criteria, and difficulty understanding how to improve code.

**3. System Administrators**
- **Description**: System Administrators manage the technical aspects of the platform, ensuring its stability, security, and performance.

- **High-Level Goals**:
    - Maintain our platform’s uptime and performance efficiently as and when needed.
    - Ensure the security of the data we collect, and the compliance of the security of our data with data security regulations.
    - Implement updates and fixes promptly.
    - Provide technical support to users.

- **Proto-Persona**:
    - **Name**: Blandon Smith
    - **Age**: 35
    - **Occupation**: IT System Administrator
    - **Background**: Blandon has extensive experience managing educational software systems and is responsible for maintaining the technical infrastructure.
    - **Needs**: Reliable and secure system architecture, efficient tools for monitoring and maintaining the platform, and clear communication with users regarding technical issues.
    - **Frustrations**: Unexpected system downtimes, security vulnerabilities, and managing user support requests.

### Usage Scenarios
**1. Instructors**
- **Create and Manage Assignments**: Create new assignments with specific instructions and due dates. Upload and manage grading rubrics and criteria tailored to each assignment.

- **Automate Grading**: Use the platform’s AI implementation to automatically grade student submissions based on predefined criteria.

- **Provide Feedback**: Review automatically generated feedback and adjust or add personalized comments if necessary. Ensure students receive detailed and constructive feedback promptly.

- **Reuse and Customize Rubrics**: Save grading rubrics for reuse in future assignments. Customize rubrics for different assignments or course sections.

- **Communicate with Students**: Send announcements, reminders, and feedback through the platform. Engage with students via integrated messaging tools.

- **Example Scenario**: Dr. John Newman creates a new JavaScript assignment using the platform. He sets the grading criteria, assigns it to his class, and waits for submissions. Once students submit their work, the platform automatically grades the assignments, providing John with detailed reports. He reviews the feedback, adds personalized comments, and releases the grades to the students.

**2. Students**
- **Submit Assignments**: Upload HTML, CSS, and JavaScript files for assignments directly through the platform. Receive confirmation of  submissions.

- **Receive Feedback**: Access feedback on their submissions through a grade and comments on areas for improvement from the AI, and the teaching team. Students can use this feedback to determine strengths and weaknesses of their submission.

- **Track Progress**: View their grades and feedback history for all assignments in a centralized dashboard. Monitor their overall performance and identify areas where they need to improve.

- **Engage with Instructors**: Ask questions and seek clarifications on assignments and feedback through integrated messaging tools. Students can participate in discussion forums or group chats if available.

- **Access Resources**: Utilize any supplementary resources or materials provided by the instructor through the platform. Review past feedback to improve future submissions.

- **Example Scenario**: Alex Falangie submits her HTML assignment through the platform. After grading is completed by the AI engine, Alex receives detailed feedback, including comments on where she excelled and what she can improve. She checks her progress dashboard to see how this assignment affects her overall grade and identifies areas to focus on for future assignments.

**3. System Administrators**
- **Grant access to resources**: Allowing access to courses and assignments for students, TAs, instructors as and when required.

- **Communicate with Instructors & Students**: Send important faculty messages to instructors and TAs to aid them in teaching the course material to students and informing students of any major changes to the course.

- **Example Scenario**: The system administrator Blandon Smith gives access to courses and assignments for instructors, TAs, as well as students. If a student, Alex, drops the course, then the system administrator removes their access to the course materials and notifies the instructor and the TAs in the class of the student's departure from the course.

### Requirements:
In the following requirements section, we will clearly define and describe the functional, non-functional, user, and technical requirements for the project. These requirements will guide the development of detailed use cases in the design phase and form the basis for the feature list.

### System Requirements
#### Functional Requirements: 
**1 User Authentication and Authorization:**
- The system must allow users to create accounts and log in.
- The system must support multiple user roles such as student, professor, TA, and system admin.
- Access to certain features will be restricted depending on the user's role.

**2 Assignment Editing:**
- Users should be accomodated for by being allowed to create, edit, or delete assignments and rubrics.
- Instructors should be accomodated for by being allowed to assign assignments to specific groups of students.

**3 Managing Assignments:**
- Assignments must have attributes such as title, description, due date, and should relate to specific class. 
- AI grading must be done according to the rubric and instructor's teaching pattern. 
- AI feedback for student submissions on assignments.

#### Non-functional Requirements:
**1 Secure**
- Anonymization of student data.
- Secure data storage and transmission.

**2 Scalable**
- The system will handle a large number of concurrent users.
- The system can manage increasing data generated by users.

**3 High Performance**
- Quick submission evaluation.
- Consistency and accuracy in grading.

**4 Usable**
- The UI will be easy to understand and visually appealing.
- Each element of the system will perform exactly as the user expects.

**5 Maintainable**
- The system will be easy to update.
- Clear documentation for features and error codes will be provided.

#### User Requirements:
- **Assignment Creation and Management:**
    - Instructors should be accomodated for by being allowwed to create new assignments with detailed instructions and due dates.
    - Instructors should be accomodated for by being allowwed to upload, modify, and manage grading rubrics and criteria for assignments.

- **Automated Grading**:
    - Our platform must automate the process of grading, with the use of AI for HTML, CSS, and JavaScript assignments based on predefined criteria.
    - Instructors should be accomodated for by being allowwed to review and adjust AI-generated grades and feedback before releasing them to students.

- **Feedback Provision**:
    - Instructors must be able to add personalized comments to the automated feedback.
    - The platform must allow instructors to provide detailed and constructive feedback to students.

- **Rubric Reuse and Customization**:
    - Instructors should be accomodated for by being allowwed to save and reuse grading rubrics for future assignments.
    - Instructors should be accomodated for by being allowwed to customize grading criteria and rubrics for different assignments or course sections.

- **Communication Tools**:
    - The platform should provide tools for instructors and TAs to send announcements, reminders, feedback, and interact with students through integrated messaging for additional 
      support, clarification, and class discussions.
    - Both instructors and TAs must be able to manage class interactions, including responding to queries and facilitating discussions. 

- **Assignment Submission**:
    - Students must be able to upload HTML, CSS, and JavaScript files for assignments directly through the platform.
    - The platform must provide confirmation of successful submission.

- **Feedback Reception**:
    - Students should be accomodated for by being allowwed to access detailed feedback on their submissions, including scores and comments on areas for improvement.
    - The platform must provide timely feedback that facilitates learning.

- **Progress Tracking**:
    - Students must be able to view their grades and feedback history for all assignments in a centralized dashboard.
    - The platform must enable students to monitor their overall performance and identify areas for improvement.

-  **Communication and Support**:
    - The platform must provide tools for students to ask questions and seek clarifications on assignments and feedback.

- **Resource Access**:
    - The platform must enable students to review past feedback to improve future submissions.

- **Grading Assistance**:
    - TAs must be able to review and refine AI-generated grades and feedback.
    - The platform must allow TAs to provide additional comments or adjustments as needed.

- **System Performance Maintenance**:
    - System administrators should be accomodated for by being allowwed to monitor the platform’s performance to ensure it runs smoothly and efficiently.
    - The platform must provide alerts for potential issues or downtimes.

- **Security and Compliance**:
    - The platform must accomodate for system administrators by allowing them to implement ecurity measures to protect user data and ensure compliance with relevant regulations.
    - System administrators should be accomodated for by being allowwed to regularly update and fix the system as and when vulnerabilities present themselves or even otherwise, and improve security.

#### Technical Requirements:
**1. System Architecture**
- **Scalability**:
    - The system must be designed to scale to handle increasing numbers of users and assignments without performance problems.

- **Modular Design**:
    - Implement a modular architecture to allow independent development, testing, and deployment of different system components (e.g., user interface, database).

**2. Grading Engine**
- **AI Integration**:
    - Implement an AI-powered grading API capable of analyzing HTML, CSS, and JavaScript code against predefined rubrics and criteria.
    - Use AI learning to improve the accuracy and consistency of automated grading over time.

- **Rubric Management**:
    - Provide a system for instructors to create, save, and reuse grading rubrics.
    - Ensure rubrics can be customized for different assignments and course sections.

- **Feedback Generation**:
    - Develop a feedback generation module that provides detailed and constructive comments based on the grading criteria.
    - Allow for instructor and TA modifications to the AI-generated feedback.

**3. User Interface**
- **Responsive Design**:
    - Ensure the platform’s user interface is responsive and works seamlessly across different devices and screen sizes (desktop, tablet, mobile).

- **User-Friendly Interface**:
    - Design an intuitive and easy-to-navigate interface for instructors, students, and TAs.
    - Implement user-friendly dashboards for tracking assignments, grades, and feedback.

- **Communication Tools**:
    - Integrate messaging and discussion tools to facilitate communication between instructors, students, and TAs.
    - Ensure notifications and alerts are efficiently communicated through the interface.

**4. Data Management**
- **Database Design**:
    - Use a relational database management system (PostgreSQL) for structured data storage.
    - Ensure the database schema is optimized for performance and scalability.

- **Data Security**:
    - Implement strong encryption methods for data.
    - Use both client-side and server-side validation to protect system.

**5. Security**
- **Authentication and Authorization**:
    - Implement robust authentication mechanisms to ensure secure access to the platform.
    - Restrict access based on user roles (e.g., student, instructor, TA, admin).

**6. Integration**
- **API Development**:
    - Ensure APIs are well-documented and follow industry standards.

**7. Testing and Quality Assurance**
- **Automated Testing**:
    - Implement automated testing for unit tests and integration tests to ensure system reliability and quality.
    - Use testing frameworks and tools like Jest.

- **User Acceptance Testing (UAT)**:
    - Conduct UAT with actual end-users (other class mates, family, or friends) to validate the system’s functionality and usability before full deployment.

- **Continuous Integration/Continuous Deployment (CI/CD)**:
    - Set up a CI/CD pipeline to automate the build, test, and deployment processes, ensuring rapid and reliable updates to the system.
  
## Technology Stack
**Platform:**
- The app will be accessed via a web browser. The UI of the application will need to be adaptable to fit browsers on different devices, such as laptops/desktops, smartphones and tablets.

**Front-End:**
- **React.js:** The front end will be built using the React framework, as per the customer's request. 
  - **Justification:** React is the requested framework by the customer. It is a popular and widely used framework for building dynamic and responsive user interfaces. It provides a component-based architecture that enhances code reusability and maintainability. React also has strong community support and a rich ecosystem of libraries and tools.

**Back-End:**
- **Node.js:** The back-end will be built using the Node.js framework.
  - **Justification:** Node.js's non-blocking architecture is well-suited for handling numerous concurrent requests, which is essential for a platform expected to support a high volume of users. Also, the unified language of both front-end and back-end will enable easier maintainability.

**Database:**
- **PostgreSQL:** We plan to use PostgreSQL as our database language, which is hosted on Digital Ocean.
  - **Justification:** PostgreSQL is designed to handle large-scale applications with high concurrency and large datasets efficiently. Features like parallel query execution and table partitioning help optimize performance for high-load environments.

**API:**
- **OpenAI Assistants API:** We plan to use the Assistants API provided by OpenAI for AI-powered features such as automated grading.
  - **Justification:** The Assistants API offers advanced natural language processing and code interpretation capabilities, which are essential for implementing sophisticated grading algorithms. By leveraging prompt engineering, we can customize the AI responses to provide detailed and context-specific feedback on student submissions. Additionally, the API can handle various file types, allowing us to seamlessly process and grade assignments submitted in different formats. According to the API documentation, .js, .css, and .html files are all on their supported list.

**CI/CD:**
- **Drone CI:** We plan to use the Drone CI as our CI/CD pipeline.
  - **Justification:** DroneCI is built around a container-native architecture, meaning it uses Docker containers to execute pipelines. This approach ensures consistency across different environments (development, testing, and production) and simplifies the process of managing dependencies and runtime environments.
    
**Deployment Environment:**
- **Docker:** We plan to use Docker as our deployment environment.
  - **Justification:** Docker will provide a standardized environment for both deployment and development. Docker also makes it easy to scale applications horizontally by adding or removing containers as needed. This flexibility is crucial for handling varying loads, especially for our platform, which anticipates a high number of concurrent users.

**File Storage and Management:**
- **Digital Ocean Space:** For secure file storage.
  - **Justification:** Digital Ocean Space provides scalable and reliable storage for user-uploaded files, with built-in security features such as server-side encryption and access control.

**Testing Frameworks:**
- **Jest:** For testing JavaScript and React components.
  - **Justification:** Jest is a comprehensive testing framework that provides a simple API for writing tests, along with powerful features such as snapshot testing and parallel test execution, ensuring the reliability and robustness of the codebase.
- **SuperTest:** For integration testing of components in the frontend and backend as well as Database connections
   - **Justification:** SuperTest is a testing framework that is great for integration testing of features as and when new features are written, to ensure the reliability and robustness of the codebase.
- **DalekJS:** DalekJS is a regression testing framework based on JSON, that can ensure that the software is operational after changes have been made
   - **Justification:** DalekJS is JSON-based and will be easy to use as most web and JavaScript have great support for JSON-based frameworks.
- **Mocha:** For testing back-end logic in Node.js.
  - **Justification:** Mocha is a flexible testing framework for Node.js, it provides a robust environment for writing and running unit and integration tests for server-side code. This ensures the back-end logic works correctly under various scenarios, contributing to the overall stability and reliability of the application.

## High-level risks
**1 Data Security and Privacy Breaches:**
- Risk Description: The potential for unauthorized access, data breaches, or privacy violations compromising sensitive user information.
- Analysis: Data security breaches can result in legal consequences, loss of trust from users, and damage to the project's reputation. Adequate security measures and protocols must be implemented to mitigate this risk.

**2 Load Balancing:**
- Risk Description: Inadequate load balancing may lead to performance issues, slowdowns, or system crashes during periods of high user activity.
- Analysis: Insufficient load balancing can impact user experience, causing frustration and dissatisfaction. Proper load balancing strategies should be implemented to ensure system stability and scalability.

**3 System Level Failures:**
- Risk Description: Failures at the system level, including hardware malfunctions, software bugs, or compatibility issues, may disrupt system functionality.
- Analysis: System failures can result in downtime, data loss, and decreased productivity. Regular testing, monitoring, and maintenance are essential to identify and address potential system-level risks.

**4 Server Failures:**
- Risk Description: Server failures, such as hardware failures, network issues, or power outages, can impact system availability and performance.
- Analysis: Server failures can lead to service disruptions, affecting user access and functionality. Redundancy measures, backup systems, and disaster recovery plans should be in place to mitigate the impact of server failures.

**5 Bad Documentation for Error Codes:**
- Risk Description: Inadequate or unclear documentation for error codes may hinder troubleshooting efforts and delay problem resolution.
- Analysis: Poor documentation can lead to confusion, frustration, and inefficiencies in diagnosing and resolving issues. Comprehensive documentation practices should be adopted to facilitate effective error management and troubleshooting.

**6 Potential Inaccuracies in AI Grading:**
- Risk Description: Inaccuracies or biases in AI algorithms used for grading may lead to unfair evaluations and undermine the credibility of the system.
- Analysis: Inaccurate grading can result in dissatisfaction among users and erode trust in the system's capabilities. Rigorous testing, validation, and refinement of AI algorithms are necessary to minimize the risk of grading inaccuracies.

**7 Integration Challenges Between Different Technologies:**
- Risk Description: Difficulties in integrating various technologies, frameworks, or platforms may impede the development and deployment of the system.
- Analysis: Integration challenges can lead to delays, increased costs, and decreased system interoperability. Thorough planning, compatibility testing, and communication among development teams are crucial to address integration risks effectively.

## Assumptions and constraints
## Assumptions
- The application will be functional and understandable
- A users’ technological skill level should not effect there ability to comprehend how to navigate about the site.
- Code will be well documented, commented, and structured for future changes and additional implementation.

## Constraints
- Code must be secure and robust
- The application must follow standards set for LMSs and be accessible for all students
- The UI must be Intuitive and understandable to all users.
- Design should be simplistic and clutter free.
- AI training will be done using user data.
- Software will be documented in English.

## Summary milestone schedule
What will you have ready to present and/or submit for the following deadlines? **List the anticipated features** you will have for each milestone, and we will help you scope things out in advance and along the way. Use the table below and just fill in the appropriate text to describe what you expect to submit for each deliverable. 3-4 lines for each deliverable description.

|  Milestone  | Deliverable |
| :-------------: | ------------- |
|  May 29th  | Project Plan Submission & short video presentation describing the user groups and requirements for the project to be reviewed by client. |
| June 5th  | Design Plan Submission describing the system architecture, use case models, database design, data flow diagrams, as well as the UI design for the project. The general user interface design will be implemented by this deadline via mockups. Our user interface will have a consistent layout, color scheme, text fonts, and visual elements and will clearly describe how the user will interact with the system. The tests for our system will pass for our system up to this point. |
| June 5th  |  A short video presenation decribing the design plan for the project highlighting the details of the project's implementation as described above for the client to review and provide feedback on. |
| June 14th  | Mini-Presentation of the 3 features of our system's envisioned usage we plan to deliver for this milestone, without extra explanation beyond what was in our initial envisioned usage. Will have 3 of our 7 features working by this point along with being tested (Feature 1, Feature 2, Feature 3). |
| July 5th  | MVP Mini-Presentation of 6 out of our 7 features of our system's envisioned usage we plan to deliver for this milestone, without extra explanation beyond what was in our initial envisioned usage. Will have 6 of our 7 features working by this point along with being tested for our client to critique (Feature 1, Feature 2, Feature 3, Feature 4, Feature 5, Feature 6.|
| July 19th  | Peer testing and feedback: Will have all features tested and implemented **per** team member. We will plan our time to acccomodate for code reviews, integration, and regression testing.|
| August 2nd  | Test-O-Rama: Full-scale user testing and system testing with everyone |
| August 9th  |  Final project submission and group presentions |

## Teamwork Planning and Anticipated Hurdles (Completion Plan)
|  Category  | Colton Palfrey | Jerry Fan | Aayush Chaudhary | Chinmay Arvind | Omar Hemed | 
| ------------- | ------------- | ------------- | ------------- | ------------- | ------------- |
|  **Experience**  | Grocery Price Tracker, I-Clicker Clone | Event Ticket Selling Platform (React/Nodejs/Mysql), Farmer Market Finder (Java/AndroidStudio), First-year CS AI-Chatbot (Remix/PostgreSql) |Internet of Things, Pet-Community-Application  | Travel Recommendation System, Fire Fighter Communication and Fire Detection App, Discord Clone | Location sharing app, Online weather app using HTML and CSS  |
|  **Good At**  | PHP, DB Implemention, Cookies/Servers, Project Management | AI API implementation, Front-end UI Design | Front-end UI Design, Python, Java, Planning, Project Management  | AI API implementation, Python, DB implementation, Java, Backend implementation, Planning, Project Management | Front-end UI design, Project Management, Java and Python |
|  **Expected to learn**  | React, AI API-implementations | Nodejs, Database Setup | React, Postgres | React, Postgres | React, AI Implementation, Nodejs and Postgres   |


|  Category of Work/Features  | Colton Palfrey | Jerry Fan | Aayush Chaudhary | Chinmay Arvind | Omar Hemed | 
| ------------- | :-------------: | :-------------: | :-------------: | :-------------: | :-------------: |
|  **Project Management: Kanban Board Maintenance**  | :heavy_check_mark:  | :heavy_check_mark: | :heavy_check_mark:  | :heavy_check_mark: | :heavy_check_mark: | 
|  **System Architecture Design**  | :heavy_check_mark: | :heavy_check_mark:  | :heavy_check_mark:  | :heavy_check_mark:  | :heavy_check_mark: |
|  **User Interface Design**  | :heavy_check_mark:  | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: |
|  **CSS Development**  | :heavy_check_mark:  | :heavy_check_mark: | :heavy_check_mark: |  | :heavy_check_mark: |
|  **AJAX + JavaScript Development**  |   |  | :heavy_check_mark: |  | :heavy_check_mark: |
|  **Cookie/Server Implementation**  | :heavy_check_mark: | :heavy_check_mark: |  | :heavy_check_mark: |  |
|  **HTML Development**  |  | :heavy_check_mark: | :heavy_check_mark: |  | :heavy_check_mark: |
|  **API Intergration**  | :heavy_check_mark:  | :heavy_check_mark: |  | :heavy_check_mark: |  |
|  **Query Implemations**  | :heavy_check_mark:  | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: |
|  **Mock Database For testing**  | :heavy_check_mark: |  |  | :heavy_check_mark: |  |
|  **Client + Server Side Security**  | :heavy_check_mark: | :heavy_check_mark: |  | :heavy_check_mark: |  |
|  **Testing with Jest**  | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: |
|  **Database setup**  | :heavy_check_mark: |  |  | :heavy_check_mark:  |  |
|  **Presentation Preparation**  | :heavy_check_mark:  |  |  | :heavy_check_mark:  |  |
|  **Design Video Creation**  |  | :heavy_check_mark:  | :heavy_check_mark:  | :heavy_check_mark: | :heavy_check_mark: |
|  **Design Video Editing**  | :heavy_check_mark:  | :heavy_check_mark:  |  | :heavy_check_mark: |  |
|  **Design Report**  | :heavy_check_mark:  | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: |
|  **Final Video Creation**  | :heavy_check_mark:  | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: |
|  **Final Video Editing**  | :heavy_check_mark:  |  |  | :heavy_check_mark: |  |
|  **Final Team Report**  | :heavy_check_mark: | :heavy_check_mark:  | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: |
|  **Final Individual Report**  |  :heavy_check_mark: |  :heavy_check_mark: |  :heavy_check_mark: |  :heavy_check_mark: |  :heavy_check_mark: |

Rationale for assignment of work among team members:
Our decision to split team members up was based on everyones skills and preferences. Some of our team members felt more comfortable putting a stronger focus on front-end design while others wanted to focus on developing the back-end of the system. We want everyone to be equally involved in each development stage of this proejct so we workign on alot of these features as a team so make sure everyone has a say in whats going on.

## Documentation
This project will be documented using a shared Google Doc. This Document will keep track of our progress, implementions, and the problems we ran into along with their solutions.
