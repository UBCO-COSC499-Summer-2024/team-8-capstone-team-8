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
                <h3>Home </h3>
                    <p>The main dashboard where the professor can get an overview of the course, including announcements, upcoming deadlines </p>
                    <h3>Student Grades </h3>
                    <p>This Fuction is for viewing and managing student grades. Professors can enter, update, and review grades for various assignments </p>
                    <h3>Assignments </h3>
                    <p>In this fuction professors can create, manage, and distribute assignments to students. This includes setting due dates, uploading relevant materials, and providing instructions. </p>
                    <h3>Students </h3>
                    <p>This provides a list of all enrolled students. </p>
                    <h3>All Submissions </h3>
                    <p>This Function is to view and evaluate all student submissions for assignments and exams. Professors can provide feedback, mark assignments, and ensure all submissions are accounted for. </p>
                    <h3>Rubrics </h3>
                    <p>This fuction contains the  rubrics for various assignments and projects. Professors can create, modify, and apply rubrics to ensure consistent and transparent grading criteria. </p>
                
                </div>
            </section>
        </div>
    </div>
  );
};

export default EvalHelpPage;
