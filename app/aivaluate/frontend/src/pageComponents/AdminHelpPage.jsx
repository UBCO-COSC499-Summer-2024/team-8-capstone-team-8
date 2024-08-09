import React from 'react';
import '../HelpPage.css';
import AIvaluateNavBarAdmin from '../components/AIvaluateNavBarAdmin';

const AdminHelpPage = () => {

  return (
    <>
    <AIvaluateNavBarAdmin navBarText='Help Page' />
      <div className='secondary-colorbg help-section'>
          <section>
            <div className="help-content">
            <h3 className="heading-evaluatorss">Managing Evaluators</h3>
                <p><strong>Adding a New Evaluator:</strong> Navigate to the Evaluator Manager in the Admin Home Portal. Click on 'Add Evaluator', fill out the evaluator's profile details, and submit.</p>
                <p><strong>Searching for an Evaluator:</strong> Use the search bar at the top of the Evaluator Manager to quickly find evaluators by name. Simply enter the name of the evaluator you wish to manage and press enter.</p>
                <p><strong>Updating Evaluator Profiles:</strong> Select an evaluator from the list, click 'Edit', make any necessary changes to their profile, and save your updates.</p>
                <p><strong>Assigning a TA Role:</strong> To assign an evaluator as a TA, use the 'Prof' slider button located below their name. Click and confirm this selection.</p>
                <p><strong>Removing an Evaluator:</strong> Click the 'Delete user' button next to the evaluators details and confirm the deletion to remove them from the system.</p>
              
              <h3 className="heading-studentss">Managing Students</h3>
              <p><strong>Searching for a Student:</strong> Use the search bar at the top of the Student Manager to quickly locate students by name. Type the student's name into the search bar and press enter to find their profile.</p>
              <p><strong>Updating Student Profiles:</strong> Select an student from the list, click 'Edit', make any necessary changes to their profile, and save your updates.</p>
              <p><strong>Dropping Courses:</strong> In the student's profile, use the 'Drop' button in fornt each course to manage their Courses.</p>
              <p><strong>Deleting a Student Account:</strong> To remove a student completely, click the 'Delete user' button at the botton of their profile and confirm the deletion.</p>

                <h3 className="heading-assistance">Need Further Assistance?</h3>
                <p>If you require additional support or have any questions, please don’t hesitate to contact us at <a href="mailto:aivaluateoffical@gmail.com">aivaluateoffical@gmail.com</a>. Our team is ready to assist you with any issues or queries you might have.</p>
              
              </div>
         </section>
    </div>
    </>
  );
};

export default AdminHelpPage;
