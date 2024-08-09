import React from 'react';
import '../HelpPage.css';
import AIvaluateNavBarEval from '../components/AIvaluateNavBarEval';

const EvalHelpPage = () => {

  return (
    <div>
        <AIvaluateNavBarEval navBarText='Help Page'  />
        <div className='secondary-colorbg help-section'>
            <section>
                <div className="help-content">
                <h3 className="heading-dashboardd">Dashboard</h3>
                    <p><strong>Accessing the Dashboard:</strong> Log in to view the main dashboard. Here, you can see all courses and notifications at a glance.</p>
                    <h3 className="heading-create-course">Create a Course </h3>
                    <p><strong>Creating a Course:</strong> To create a new course, navigate to 'Create a Course' from the dashboard. Provide the necessary course details and assign any teaching assistants as needed. Once complete, click 'Create Course' to add the new course.</p>
                    
                    <h3 className="heading-manage-coursee"> Specific Courses Options</h3>

                    <h3 className="heading-managementt">Management</h3>
                    <p><strong>Edit Course:</strong> Modify and update the course information as required.</p>
                    <p><strong>Assign TA:</strong> Allocate Teaching Assistants to the course to assist with administrative and grading duties.</p>
                    <p><strong>Archive Course:</strong> Temporarily disable the course from the active list without deleting historical data or student records.</p>
                    <p><strong>Delete Course:</strong> Permanently remove the course and all its associated data from the system. This action is irreversible.</p>
                    <p><strong>AI Test:</strong> Provide feedback on a sample assignment submission to test prompt setting for clarity and accuracy</p>

                    <h3 className="heading-ss">AI Setting</h3>
                    <p><strong>Manage Prompts:</strong> Create, delete, or modify the prompt message to be sent to the AI grading bot.</p>

                    <h3 className="heading-gradess">Student Grades</h3>
                    <p><strong>Managing Grades:</strong> Navigate to 'Student Grades' to view  grade summary. Click on a Assignment name to view the submissions and grades for that particular assignment.</p>

                    <h3 className="heading-assignments">Assignments</h3>
                    <p><strong>Creating and Managing Assignments:</strong> Go to the 'Assignments' section to create new assignments. Fill out the form with the assignment name, assignment rubric, max points and upload the solution.</p>

                    <h3 className="heading-ss">Students</h3>
                    <p><strong>Viewing the Student List:</strong> Select 'Students' from the menu to see a list of all enrolled students.</p>

                    <h3 className="heading-rubrics">Using Rubrics</h3>
                    <p><strong>Using Rubrics:</strong> Under 'Rubrics', create and modify scoring criteria for assignments. Select an assignment to apply a rubric and ensure grading consistency and transparency.</p>

                    <h3 className="heading-assistt">Need Further Assistance?</h3>
                    <p>If you require additional support or have any questions, please don’t hesitate to contact us at <a href="mailto:aivaluateoffical@gmail.com">aivaluateoffical@gmail.com</a>. Our team is ready to assist you with any issues or queries you might have.</p>
                </div>
            </section>
        </div>
    </div>
  );
};

export default EvalHelpPage;
