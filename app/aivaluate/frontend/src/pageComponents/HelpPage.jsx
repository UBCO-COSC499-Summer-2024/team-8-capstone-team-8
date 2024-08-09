import React from 'react';
import '../HelpPage.css';
import AIvaluateNavBar from '../components/AIvaluateNavBar';


const HelpPage = () => {
  return (
    <>
      <AIvaluateNavBar navBarText='Help Page' />
      <div className='secondary-colorbg help-section'>
        <section>
          <div className="help-content">
            <h3 className="heading-dd">Dashboard</h3>
            <p><strong>Accessing the Dashboard:</strong> Log in to view the main dashboard. Here, you can see all courses and notifications at a glance.</p>
            
            <h3 className="heading-join-course">Join a Course</h3>
            <p><strong>How to Join a Course:</strong> To join a course, navigate to 'Join a Course' from the dashboard using the navbar. Select the course you wish to join from the list provided.</p>
            
            <h3 className="heading-manage-coursee">Specific Course Options</h3>

            <h3 className="heading-gg">Grades</h3>
            <p><strong>Viewing Your Grades:</strong> Navigate to 'Grades' to view your grade summary. Click on an assignment name to view the submissions and grades for that particular assignment.</p>

            <h3 className="heading-assignmentsss">Assignments</h3>
            <p><strong>Submitting Assignments:</strong> Access the 'Assignments' section to view and submit assignments.</p>

            <h3 className="heading-pp">People</h3>
            <p><strong>Viewing the Student List:</strong> Select 'People' from the menu to see a list of all students enrolled in the course.</p>

            <h3 className="heading-submissions">Submissions</h3>
            <p><strong>Reviewing Submissions:</strong> Click on 'Submissions' to review all assignments submitted. This feature allows you to track your submissions and any feedback provided.</p>

            <h3 className="heading-assistanceee">Need Further Assistance?</h3>
                    <p>If you require additional support or have any questions, please don’t hesitate to contact us at <a href="mailto:aivaluateoffical@gmail.com">aivaluateoffical@gmail.com</a>. Our team is ready to assist you with any issues or queries you might have.</p>
              


          </div>
        </section>
      </div>
    </>
  );
};

export default HelpPage;
