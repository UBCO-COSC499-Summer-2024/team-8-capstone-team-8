import CircumIcon from "@klarr-agency/circum-icons-react";
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../GeneralStyling.css';

const AITest = () => {
  const navigate = useNavigate();
  const [AIResponse, setAIResponse] = useState('');
  const [profPromptText, setProfPromptText] = useState(''); // For prof prompt text without rubric
  const [fullPromptText, setFullPromptText] = useState(''); // For prompt text with rubric
  const [instructorId, setInstructorId] = useState('');
  const [assignmentId, setAssignmentId] = useState('');
  const [rubricId, setRubricId] = useState('');
  const [rubricText, setRubricText] = useState('');
  const [maxGrade, setMaxGrade] = useState('');
  const [submissionFile, setSubmissionFile] = useState('');
  const [assignmentKey, setAssignmentKey] = useState('');

  // Fetch instructorId
  useEffect(() => {
    const fetchInstructorData = async () => {
      try {
        const response = await axios.get('http://localhost:5173/eval-api/instructor/me', {
          withCredentials: true
        });
        setInstructorId(response.data.instructorId);
      } catch (error) {
        console.error('There was an error fetching the instructor data:', error);
      }
    };

    fetchInstructorData();
  }, []);

  // Fetch prompt data
  useEffect(() => {
    const fetchPromptData = async () => {
      if (instructorId) { // Ensure instructorId is set
        try {
          const response = await axios.get(`http://localhost:5173/eval-api/prompt/${instructorId}`, {
            withCredentials: true
          });
          if (response.data.promptId) {
            setProfPromptText(response.data.promptText || '');
          } else {
            setProfPromptText('No Prompt Selected');
          }
        } catch (error) {
          if (error.response && error.response.status === 404) {
            // Handle 404 error gracefully
            setProfPromptText('No Prompt Selected');
          } else {
            console.error('There was an error fetching the prompt data:', error);
          }
        }
      }
    };
    fetchPromptData();
  }, [instructorId]);

  // Hardcoded submissionId
  // This should be passed in as a prop
  const submissionId = '31';
  console.log("submissionId:", submissionId);

  // Fetch AssignmentID based on submissionId
  useEffect(() => {
    const fetchAssignmentId = async () => {
      try {
        const response = await axios.get(`http://localhost:5173/eval-api/submission/${submissionId}`, {
          withCredentials: true
        });
        if (response.data.length > 0) {
          setAssignmentId(response.data[0].assignmentId);
        } else {
          console.error('No submission found for the given submissionId');
        }
      } catch (error) {
        console.error('There was an error fetching the assignment data:', error);
      }
    };

    fetchAssignmentId();
  }, [submissionId]);

  console.log("assignmentId:", assignmentId);

  //Fetch submissionFile based on submissionId
  useEffect(() => {
    const fetchSubmissionFile = async () => {
      try {
        const response = await axios.get(`http://localhost:5173/eval-api/submission/${submissionId}`, {
          withCredentials: true
        });
        if (response.data.length > 0) {
          setSubmissionFile(response.data[0].submissionFile);
        } else {
          console.error('No submission found for the given submissionId');
        }
      } catch (error) {
        console.error('There was an error fetching the assignment data:', error);
      }
    };

    fetchSubmissionFile();
  }, [submissionId]);

  //Fetch assignment Key based on assignmentId
  useEffect(() => {
    const fetchAssignmentKey = async () => {
      if (assignmentId) { // Ensure assignmentId is set
        try {
          const response = await axios.get(`http://localhost:5173/eval-api/assignment/${assignmentId}`, {
            withCredentials: true
          });
          const assignmentKey = response.data.assignmentKey;
          if (assignmentKey !== undefined && assignmentKey !== null) {
            setAssignmentKey(assignmentKey);
          } else {
            console.error('No assignment key found for the given assignmentId');
          }
        } catch (error) {
          console.error('There was an error fetching the assignment key data:', error);
        }
      }
    };

    fetchAssignmentKey();
  }, [assignmentId]);

  console.log("Assignment Key:", assignmentKey);

  // Fetch Max Grade based on assignmentId
  useEffect(() => {
    const fetchMaxGrade = async () => {
      if (assignmentId) { // Ensure assignmentId is set
        try {
          const response = await axios.get(`http://localhost:5173/eval-api/assignment/${assignmentId}`, {
            withCredentials: true
          });
          console.log('Assignment data:', response.data); // Log the entire response
          const maxGrade = response.data.maxObtainableGrade;
          if (maxGrade !== undefined && maxGrade !== null) {
            setMaxGrade(maxGrade);
          } else {
            console.error('No max grade found for the given assignmentId');
          }
        } catch (error) {
          console.error('There was an error fetching the max grade data:', error);
        }
      }
    };

    fetchMaxGrade();
  }, [assignmentId]);

  console.log("maxGrade:", maxGrade);

  // Fetch Rubric ID based on assignmentId
  useEffect(() => {
    const fetchRubricId = async () => {
      if (assignmentId) { // Ensure assignmentId is set
        try {
          const response = await axios.get(`http://localhost:5173/eval-api/assignments/${assignmentId}/rubric`, {
            withCredentials: true
          });
          if (response.data.assignmentRubricId) {
            setRubricId(response.data.assignmentRubricId);
          } else {
            console.error('No rubric found for the given assignmentId');
          }
        } catch (error) {
          console.error('There was an error fetching the rubric data:', error);
        }
      }
    };

    fetchRubricId();
  }, [assignmentId]);

  console.log("rubricId:", rubricId);

  // Fetch Rubric Text based on rubricId
  useEffect(() => {
    const fetchRubricText = async () => {
      if (rubricId) { // Ensure rubricId is set
        try {
          const response = await axios.get(`http://localhost:5173/eval-api/rubric/${rubricId}`, {
            withCredentials: true
          });
          console.log('Rubric text data:', response.data);
          if (response.data.length > 0 && response.data[0].criteria) {
            setRubricText(response.data[0].criteria);
          } else {
            console.error('No rubric text found for the given rubricId');
          }
        } catch (error) {
          console.error('There was an error fetching the rubric text:', error);
        }
      }
    };

    fetchRubricText();
  }, [rubricId]);

  console.log("rubricText:", rubricText);

  // Append rubricText and to profPromptText
  useEffect(() => {
    const createFullPrompt = async () => {
      const initialPrompt = `Professor's Prompt: ${profPromptText}\n\n--- End of Professor's Prompt ---\n\nAssignment Rubric: ${rubricText}\n\n--- End of Assignment Rubric ---\n\nMax Obtainable Grade: ${maxGrade}\n\n--- End of Max Obtainable Grade ---`;
      // Fetch assignment key content
      try {
        const response = await axios.get('http://localhost:5173/ai-api/test/get-file-content', {
          params: { filePath: assignmentKey },
        });
        const assignmentKeyContent = response.data.fileContent;
        // Append assignment key content to the full prompt text
        setFullPromptText(`${initialPrompt}\n\n${assignmentKeyContent}\n--- End of Answer Key ---`);
      } catch (error) {
        console.error('Error fetching assignment key content:', error);
      }
    };
    createFullPrompt();
  }, [profPromptText, rubricText, maxGrade, assignmentKey]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAIResponse('Typing...');

    console.log("Submitting with promptText:", fullPromptText);

    try {
      const response = await axios.post(`http://localhost:5173/ai-api/test/assistants`, { 
        promptText: fullPromptText,
        fileNames: [submissionFile],
      });
      console.log("Response from server:", response.data);
      setAIResponse(`${response.data.response.map(msg => msg.text.value).join('\n')}`);
    } catch (error) {
      console.error('Error communicating with AI backend:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
      }
      setAIResponse('Error communicating with AI backend');
    }
  };

  return (
    <div>
      <button className="main-back-button" onClick={() => navigate(-1)} style={{ margin: '20px' }}>
          <CircumIcon name="circle_chev_left" className="back-button-icon-size" />
      </button>
    <div style={{ maxWidth: '800px', margin: 'auto', fontFamily: 'Arial, sans-serif' }} class="third-color-text">
      
      <h2 style={{ textAlign: 'center' }}>AI Grading Testing Page</h2>
      <table style={{ border: '1px solid black', borderCollapse: 'collapse', width: '100%', marginBottom: '20px' }}>
        <tbody>
          <tr>
            <td style={{ border: '1px solid black', padding: '8px', fontWeight: 'bold' }}>Submission ID</td>
            <td style={{ border: '1px solid black', padding: '8px' }}>{submissionId}</td>
          </tr>
          <tr>
            <td style={{ border: '1px solid black', padding: '8px', fontWeight: 'bold' }}>Professor's Prompt</td>
            <td style={{ border: '1px solid black', padding: '8px' }}>{profPromptText}</td>
          </tr>
          <tr>
            <td style={{ border: '1px solid black', padding: '8px', fontWeight: 'bold' }}>Assignment Rubric</td>
            <td style={{ border: '1px solid black', padding: '8px' }}>{rubricText}</td>
          </tr>
          <tr>
            <td style={{ border: '1px solid black', padding: '8px', fontWeight: 'bold' }}>Assignment ID</td>
            <td style={{ border: '1px solid black', padding: '8px' }}>{assignmentId}</td>
          </tr>
          <tr>
            <td style={{ border: '1px solid black', padding: '8px', fontWeight: 'bold' }}>Rubric ID</td>
            <td style={{ border: '1px solid black', padding: '8px' }}>{rubricId}</td>
          </tr>
          <tr>
            <td style={{ border: '1px solid black', padding: '8px', fontWeight: 'bold' }}>Instructor ID</td>
            <td style={{ border: '1px solid black', padding: '8px' }}>{instructorId}</td>
          </tr>
          <tr>
            <td style={{ border: '1px solid black', padding: '8px', fontWeight: 'bold' }}>Max Obtainable Grade</td>
            <td style={{ border: '1px solid black', padding: '8px' }}>{maxGrade}</td>
          </tr>
          <tr>
            <td style={{ border: '1px solid black', padding: '8px', fontWeight: 'bold' }}>Full Prompt Text</td>
            <td style={{ border: '1px solid black', padding: '8px', whiteSpace: 'pre-wrap' }}>{fullPromptText}</td>
          </tr>
          <tr>
            <td style={{ border: '1px solid black', padding: '8px', fontWeight: 'bold' }}>Submission File</td>
            <td style={{ border: '1px solid black', padding: '8px' }}>{submissionFile}</td>
          </tr>
          <tr>
            <td style={{ border: '1px solid black', padding: '8px', fontWeight: 'bold' }}>Assignment Key</td>
            <td style={{ border: '1px solid black', padding: '8px' }}>{assignmentKey}</td>
          </tr>
          <tr>
            <td style={{ border: '1px solid black', padding: '8px', fontWeight: 'bold' }}>Message Sent to AI</td>
            <td style={{ border: '1px solid black', padding: '8px' }}>Grade the student assignments based on provided rubric and answer key. Start your reponse with 'AI Grade: ' followed by the grade / maxObtainableGrade.</td>
          </tr>
          <tr>
            <td style={{ border: '1px solid black', padding: '8px', fontWeight: 'bold' }}>AI Response</td>
            <td style={{ border: '1px solid black', padding: '8px' }}>
              <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word', fontSize: '14px', lineHeight: '1.5' }}>{AIResponse}</pre>
            </td>
          </tr>
        </tbody>
      </table>
      <form onSubmit={handleSubmit} style={{ textAlign: 'center' }}>
        <button type="submit" className="update-ai" style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}>Submit</button>
      </form>
    </div>
    </div>
  );
}

export default AITest;
