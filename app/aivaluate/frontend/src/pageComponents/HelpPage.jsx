import React, { useState } from 'react';
import '../HelpPage.css';
import AIvaluateNavBar from '../components/AIvaluateNavBar';
import '../GeneralStyling.css';


const aivaluatePurple = {
    color: '#4d24d4'
  }

const HelpPage = () => {

  return (
    <>
    <AIvaluateNavBar navBarText='Help Page'  />
      <div className='secondary-colorbg help-section'>
          <section>
            <div className="help-content">
              <h3>Step 1: Assignment Submission</h3>
                <p>Students can easily submit their assignments through our user-friendly interface. Simply drag and drop your assignment files into the submission area or upload them directly from your device.</p>
              <h3>Step 2: AI Analysis</h3>
                <p>Once an assignment is submitted, our advanced AI system begins its analysis. The AI uses sophisticated algorithms to evaluate the content, structure, and adherence to the provided guidelines and rubrics.</p>
              <h3>Step 3: Feedback Generation</h3>
                <p>After analyzing the assignment, the AI generates detailed feedback. This includes highlighting strengths, identifying areas for improvement, and providing specific comments on various aspects of the assignment.</p>
              </div>
         </section>
    </div>
    </>
  );
};

export default HelpPage;
