const express = require('express');
const bodyParser = require('body-parser');
const { log } = require('console');
const router = express.Router();
const { pool } = require('./dbConfig');
const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');
const cors = require('cors');
const parseSafe = require('json-parse-safe');
const baseDirSubmissions = path.resolve('/app/aivaluate/backend/assignmentSubmissions');
const baseDirKeys = path.resolve('/app/aivaluate/backend-eval/assignmentKeys');
const { chromium } = require('playwright');
const fetch = require('node-fetch');

router.use(bodyParser.json());
const openaiApiKey = process.env.OPENAI_API_KEY;

const openai = new OpenAI({ apiKey: openaiApiKey });

router.post('/ai/assignments/:assignmentId/test', (req, res) => {
    res.send('AI service endpoint is working');
});

router.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));

// Retry with exponential backoff and max retries
async function retryRequest(fn, retries = 3, delay = 1000) {
    let attempt = 0;
    const delayPromise = (delay) => new Promise(resolve => setTimeout(resolve, delay));

    while (attempt < retries) {
        try {
            const result = await fn();
            return result;
        } catch (error) {
            attempt++;
            console.error(`Attempt ${attempt} failed: ${error.message}`);
            if (attempt >= retries) {
                throw new Error("Maximum retries reached. The AI server doesn't seem to be responding.");
            }
            await delayPromise(delay);
            delay *= 2;
        }
    }
}

async function loadPageWithRetry(page, submissionLink, retries = 3, delay = 1000) {
    let attempt = 0;
    const delayPromise = (delay) => new Promise(resolve => setTimeout(resolve, delay));
    while (attempt < retries) {
        try {
            await page.goto(submissionLink, { waitUntil: 'domcontentloaded', timeout: 60000 });
            const gistContent = await page.textContent('body');
            if (gistContent && gistContent.trim().length > 0) {
                console.log(`Successfully loaded content from ${submissionLink}`);
                return true;
            } else {
                throw new Error('Failed to load Gist content or content is empty');
            }
        } catch (error) {
            attempt++;
            console.error(`Attempt ${attempt} failed: ${error.message}`);
            if (attempt >= retries) {
                throw new Error(`Failed to load page after ${retries} attempts: ${submissionLink}`);
            }
            await delayPromise(delay);
            delay *= 2;
        }
    }
}


async function fetchAndProcessSubmissionLink(submissionLink) {
    console.log('Processing submission link:', submissionLink);
    const gistRegex = /^https:\/\/gist\.github\.com\/.+$/;
    if (!gistRegex.test(submissionLink)) {
        console.error('The submission link is not a GitHub Gist link:', submissionLink);
        return null;
    }

    const rawGistUrl = submissionLink.replace('gist.github.com', 'gist.githubusercontent.com') + '/raw';

    try {
        const response = await fetch(rawGistUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch the Gist content: ${response.statusText}`);
        }

        const textContent = await response.text();
        console.log('Extracted text content:', textContent.slice(0, 500));

        return textContent;
    } catch (error) {
        console.error(`Direct fetch failed: ${error.message}. Falling back to loadPageWithRetry.`);
        try {
            const browser = await chromium.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox'],
            });

            const context = await browser.newContext({
                javaScriptEnabled: false,
                timeout: 60000
            });

            const page = await context.newPage();

            const pageLoaded = await loadPageWithRetry(page, rawGistUrl);

            if (!pageLoaded) {
                throw new Error('Failed to load the Gist content after retries');
            }

            const textContent = await page.textContent('body');
            console.log('Extracted text content (fallback):', textContent.slice(0, 500));

            await browser.close();
            return textContent;
        } catch (retryError) {
            console.error(`Error fetching or processing the submission link ${submissionLink} using Playwright:`, retryError);
            return null;
        }
    }
}

router.post('/ai/assignments/:assignmentId/process-submissions', async (req, res) => {
    const { assignmentId } = req.params;
    const { instructorId, courseId } = req.body;

    console.log(`Received request to process submissions for assignment ${assignmentId}, course ${courseId}, instructor ${instructorId}`);

    if (!instructorId || !courseId) {
        console.error('Instructor ID and Course ID are required');
        return res.status(400).json({ error: 'Instructor ID and Course ID are required' });
    }

    try {
        console.log('Starting submission processing...');
        const result = await processSubmissions(assignmentId, instructorId, courseId);
        console.log('Submission processing completed');
        return res.status(result.status).json({ message: result.message });
    } catch (error) {
        console.error(`Error processing submissions: ${error.message}`);
        return res.status(500).json({ error: 'Failed to process submissions' });
    }
});

router.post('/gpt/completions', async (req, res) => {
    const { prompt } = req.body;
    log(`Received prompt: ${prompt}`);
  
  
    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 100
        });
  
        res.json({ response: response.choices[0].message.content.trim() });
    } catch (error) {
        console.error(`Error: ${error.message}`);
        if (error.response) {
            console.error(`Status: ${error.response.status}`);
            console.error(`Data: ${JSON.stringify(error.response.data)}`);
            res.status(error.response.status).json({ error: error.response.data });
        } else {
            res.status(500).json({ error: 'Failed to communicate with AI model' });
        }
    }
});

// OpenAI Assistant, Thread, and Message creation endpoint
router.post('/gpt/assistants', async (req, res) => {
    const { promptText, fileNames } = req.body;
    log(`Received promptText: ${promptText}`);
    log(`Received fileNames: ${fileNames}`);

    try {
        const assistantResponse = await openai.beta.assistants.create({
            name: "AIValuate Grading Assistant",
            instructions: `You are a web development expert. Your task is to grade student assignments based on the provided rubric and additional instructions. Provide constructive feedback for each submission, and a grade based on the maximum points available. 
            Provide your response in the following JSON format:
            {
                "feedback": "Your detailed feedback here",
                "grade": "Your grade here"
            }. Please make 100% sure that you provide your response in the following JSON format: { "feedback": "Your detailed feedback here", "grade": "Your grade here"}`,
            model: "gpt-4o",
            tools: [{ type: "code_interpreter" }, { type: "file_search" }]
        });

        const assistant = assistantResponse;
        log(`Assistant created: ${JSON.stringify(assistant)}`);
        const threadResponse = await openai.beta.threads.create();

        const thread = threadResponse;
        log(`Thread created: ${JSON.stringify(thread)}`);
        const messageContent = "Grade the student assignments.";

        const messageResponse = await openai.beta.threads.messages.create(thread.id, {
            role: "user",
            content: messageContent
        });

        log(`Message sent to thread: ${JSON.stringify(messageResponse)}`);
        const runResponse = await openai.beta.threads.runs.create(thread.id, {
            assistant_id: assistant.id
        });

        log(`Run created: ${JSON.stringify(runResponse)}`);
        let response = await openai.beta.threads.runs.retrieve(thread.id, runResponse.id);
        while (response.status === "in_progress" || response.status === "queued") {
            console.log("Waiting for assistant's response...");
            await new Promise(resolve => setTimeout(resolve, 5000));
            response = await openai.beta.threads.runs.retrieve(thread.id, runResponse.id);
        }

        const threadMessagesResponse = await openai.beta.threads.messages.list(thread.id);
        const messages = threadMessagesResponse.data || [];
        log(`Messages received: ${JSON.stringify(messages)}`);
        const latestAssistantMessage = messages.filter(message => message.role === 'assistant').pop();

        if (latestAssistantMessage) {
            log(`Assistant's response received: ${JSON.stringify(latestAssistantMessage.content)}`);
            res.json({ response: latestAssistantMessage.content });
        } else {
            res.status(500).json({ error: 'Failed to get assistant response' });
        }
    } catch (error) {
        console.error(`Error: ${error.message}`);
        if (error.response) {
            console.error(`Status: ${error.response.status}`);
            console.error(`Data: ${JSON.stringify(error.response.data)}`);
            res.status(error.response.status).json({ error: error.response.data });
        } else {
            res.status(500).json({ error: 'Failed to communicate with AI model' });
        }
    }
});

router.post('/gpt/assistants', async (req, res) => {
    const { promptText } = req.body;
    log(`Received promptText: ${promptText}`);

    try {
        const assistantResponse = await openai.beta.assistants.create({
            name: "AIValuate Grading Assistant",
            instructions: `You are a web development expert. Your task is to grade student assignments based on the provided rubric and additional instructions. Provide constructive feedback for each submission, and a grade based on the maximum points available. 
            Provide your response in the following JSON format:
            {
                "feedback": "Your detailed feedback here",
                "grade": "Your grade here"
            }. Please make 100% sure that you provide your response in the following JSON format: { "feedback": "Your detailed feedback here", "grade": "Your grade here"}`,
            model: "gpt-4o",
            tools: [{ type: "code_interpreter" }, { type: "file_search" }]
        });              

        const assistant = assistantResponse;
        log(`Assistant created: ${JSON.stringify(assistant)}`);
        const threadResponse = await openai.beta.threads.create();

        const thread = threadResponse;
        log(`Thread created: ${JSON.stringify(thread)}`);
        const messageContent = "Grade the student assignments.";

        const messageResponse = await openai.beta.threads.messages.create(thread.id, {
            role: "user",
            content: messageContent
        });

        log(`Message sent to thread: ${JSON.stringify(messageResponse)}`);
        const runResponse = await openai.beta.threads.runs.create(thread.id, {
            assistant_id: assistant.id
        });

        log(`Run created: ${JSON.stringify(runResponse)}`);
        let response = await openai.beta.threads.runs.retrieve(thread.id, runResponse.id);
        while (response.status === "in_progress" || response.status === "queued") {
            console.log("Waiting for assistant's response...");
            await new Promise(resolve => setTimeout(resolve, 5000));
            response = await openai.beta.threads.runs.retrieve(thread.id, runResponse.id);
        }

        const threadMessagesResponse = await openai.beta.threads.messages.list(thread.id);

        const messages = threadMessagesResponse.data || [];
        log(`Messages received: ${JSON.stringify(messages)}`);
        const latestAssistantMessage = messages.filter(message => message.role === 'assistant').pop();

        if (latestAssistantMessage) {
            log(`Assistant's response received: ${JSON.stringify(latestAssistantMessage.content)}`);
            res.json({ response: latestAssistantMessage.content });
        } else {
            res.status(500).json({ error: 'Failed to get assistant response' });
        }
    } catch (error) {
        console.error(`Error: ${error.message}`);
        if (error.response) {
            console.error(`Status: ${error.response.status}`);
            console.error(`Data: ${JSON.stringify(error.response.data)}`);
            res.status(error.response.status).json({ error: error.response.data });
        } else {
            res.status(500).json({ error: 'Failed to communicate with AI model' });
        }
    }
});

const getSelectedPrompt = async (instructorId) => {
    try {
        const result = await pool.query('SELECT "promptText" FROM "Prompt" WHERE "instructorId" = $1 AND "isSelected" = true', [instructorId]);
        return result.rows.length > 0 ? result.rows[0].promptText : ''; 
    } catch (error) {
        console.error('Error fetching selected prompt:', error);
        return '';
    }
};

const getAssignmentRubric = async (assignmentId) => {
    try {
        const result = await pool.query('SELECT "criteria" FROM "AssignmentRubric" ar JOIN "useRubric" ur ON ar."assignmentRubricId" = ur."assignmentRubricId" WHERE ur."assignmentId" = $1', [assignmentId]);
        return result.rows.length > 0 ? result.rows[0].criteria : '';
    } catch (error) {
        console.error('Error fetching assignment rubric:', error);
        return '';
    }
};

const getMaxPoints = async (assignmentId) => {
    try {
        const result = await pool.query('SELECT "maxObtainableGrade" FROM "Assignment" WHERE "assignmentId" = $1', [assignmentId]);
        return result.rows.length > 0 ? result.rows[0].maxObtainableGrade : 100;
    } catch (error) {
        console.error('Error fetching max points:', error);
        return 100;
    }
};

const getAssignmentKey = async (assignmentId) => {
    try {
        const result = await pool.query('SELECT "assignmentKey" FROM "Assignment" WHERE "assignmentId" = $1', [assignmentId]);
        if (result.rows.length > 0) {
            const assignmentKey = result.rows[0].assignmentKey;
            console.log(`Original assignmentKey from DB: ${assignmentKey}`);
            if (assignmentKey) {
                const keyPath = path.resolve(baseDirKeys, assignmentKey);
                console.log(`Resolved assignment key path: ${keyPath}`);
                if (fs.existsSync(keyPath)) {
                    console.log(`Assignment key found at path: ${keyPath}`);
                    return keyPath;
                } else {
                    console.error(`Assignment key file not found: ${keyPath}`);
                    return null;
                }
            }
        }
        console.error(`Assignment key not found in database for assignmentId: ${assignmentId}`);
        return null;        
    } catch (error) {
        console.error('Error fetching assignment key:', error);
        return null;
    }
};

const uploadFileToOpenAI = async (filePath, purpose, label) => {
    try {
        const fileStream = fs.createReadStream(filePath);
        const response = await openai.files.create({
            file: fileStream,
            purpose: purpose
        });
        return response.id;
    } catch (error) {
        console.error(`Error uploading file to OpenAI: ${error.message}`);
        throw error;
    }
};

const parseAIResponse = async (aiResponse) => {
    const response = {
        grade: 0,
        feedback: 'The AI was unable to provide a grade for the submission(s) of this student. Please manually enter a grade and provide feedback.'
    };

    let aiResponseString = '';
    const maxRetries = 10;
    let attempt = 0;

    while (attempt < maxRetries) {
        try {
            aiResponseString = typeof aiResponse === 'string' ? aiResponse : JSON.stringify(aiResponse);
            console.log("AI Response String:", aiResponseString);

            const feedbackIndex = aiResponseString.indexOf('feedback:');
            const gradeIndex = aiResponseString.indexOf('grade:');

            if (feedbackIndex !== -1 && gradeIndex !== -1) {
                const feedbackEndIndex = aiResponseString.indexOf('\n', feedbackIndex);
                const gradeEndIndex = aiResponseString.indexOf('\n', gradeIndex);
                response.feedback = aiResponseString.substring(feedbackIndex + 9, feedbackEndIndex).trim();
                response.grade = parseFloat(aiResponseString.substring(gradeIndex + 6, gradeEndIndex).trim());
                if (!isNaN(response.grade) && response.grade > 0) {
                    return response;
                }
            }

            const jsonStringMatch = aiResponseString.match(/```json\s*([\s\S]+?)\s*```/m) ||
                        aiResponseString.match(/"(\{[\s\S]+?\})"/) || 
                        aiResponseString.match(/(\{[\s\S]+?\})/);
            if (!jsonStringMatch) {
                throw new Error('Invalid AI response format');
            }

            let jsonString = jsonStringMatch[1];
            jsonString = jsonString.replace(/\\n/g, ' ')
                                   .replace(/\\'/g, "'")
                                   .replace(/\\"/g, '"')
                                   .replace(/\\t/g, ' ')
                                   .replace(/\\r/g, ' ')
                                   .replace(/\s+/g, ' ')
                                   .trim();

            const parsed = parseSafe(jsonString);
            if (parsed.error) {
                throw new Error('Error parsing AI response JSON');
            }

            const feedbackMatch = parsed.value.feedback || parsed.value.Feedback;
            const gradeMatch = parsed.value.grade || parsed.value.Grade;

            if (typeof feedbackMatch === 'string') {
                response.feedback = feedbackMatch.substring(0, 20000);
            } else {
                const plainFeedbackMatch = aiResponseString.match(/feedback":\s*"([^"]+)"/i) ||
                                           aiResponseString.match(/Feedback":\s*"([^"]+)"/i) ||
                                           aiResponseString.match(/"feedback":\s*"([^"]+)"/i);

                if (plainFeedbackMatch) {
                    response.feedback = plainFeedbackMatch[1].substring(0, 20000);
                } else {
                    const feedbackStart = aiResponseString.toLowerCase().indexOf('feedback');
                    const gradeStart = aiResponseString.toLowerCase().indexOf('grade');
                    if (feedbackStart !== -1) {
                        const feedbackEnd = gradeStart !== -1 ? gradeStart : aiResponseString.length;
                        response.feedback = aiResponseString.substring(feedbackStart + 9, feedbackEnd).trim();
                    }
                }
            }

            if (typeof gradeMatch === 'string') {
                const gradeValue = gradeMatch.match(/[\d.]+/);
                if (gradeValue) {
                    response.grade = parseFloat(gradeValue[0]);
                }
            } else {
                const plainGradeMatch = aiResponseString.match(/grade":\s*"([^"]+)"/i) ||
                                        aiResponseString.match(/Grade":\s*"([^"]+)"/i) ||
                                        aiResponseString.match(/"grade":\s*"([^"]+)"/i);

                if (plainGradeMatch) {
                    const gradeValue = plainGradeMatch[1].match(/[\d.]+/);
                    if (gradeValue) {
                        response.grade = parseFloat(gradeValue[0]);
                    }
                } else {
                    const gradeStart = aiResponseString.toLowerCase().indexOf('grade');
                    if (gradeStart !== -1) {
                        const gradeSubstring = aiResponseString.substring(gradeStart + 6).match(/[\d.]+/);
                        if (gradeSubstring) {
                            response.grade = parseFloat(gradeSubstring[0]);
                        }
                    }
                }
            }

            if (!isNaN(response.grade) && response.grade > 0) {
                break;
            } else {
                throw new Error('Parsed grade is NaN or zero');
            }
        } catch (error) {
            console.error(`Error parsing AI response on attempt ${attempt + 1}:`, error);
            attempt++;
            if (attempt >= maxRetries) {
                console.error('Max retries reached. Unable to parse AI response.');
                break;
            }
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }

    console.log("Parsed Response:", response);
    return response;
};


// Processes student submissions as a whole and creates the setup for the individual students' submissions to be processed
const processStudentSubmissions = async (studentId, submissions, assistantId, instructorPrompt, assignmentRubric, maxPoints, assignmentKeyPath) => {
    console.log('Processing student submissions for student:', studentId);
    console.log('Submissions:', submissions);
    console.log('Instructor Prompt:', instructorPrompt);
    console.log('Assignment Rubric:', assignmentRubric);
    console.log('Max Points:', maxPoints);
    console.log('Assignment Key Path:', assignmentKeyPath);

    try {
        let assignmentKeyFileId = null;
        if (assignmentKeyPath && fs.existsSync(assignmentKeyPath)) {
            console.log('Uploading assignment key to OpenAI...');
            assignmentKeyFileId = await uploadFileToOpenAI(assignmentKeyPath, 'assistants');
            console.log('Assignment key file ID created:', assignmentKeyFileId);
        } else {
            console.log('No assignment key provided.');
        }

        const submissionFileIds = [];
        let submissionTextContent = '';
        let allFilesFailed = true;
        let allLinksFailed = true; 
        let parsedResponse = null;
        for (const file of submissions) {
            if (file.submissionFile) {
                try {
                    const filePath = path.resolve(baseDirSubmissions, file.submissionFile.replace('assignmentSubmissions/', ''));
                    console.log('Resolved file path:', filePath);
                    if (!fs.existsSync(filePath)) {
                        throw new Error(`File not found: ${filePath}`);
                    }
                    const fileId = await uploadFileToOpenAI(filePath, 'assistants');
                    submissionFileIds.push(fileId);
                    allFilesFailed = false;
                } catch (error) {
                    console.error(`Error processing file ${file.submissionFile}:`, error);
                }
            }
        
            if (file.submissionLink) {
                try {
                    const textContent = await fetchAndProcessSubmissionLink(file.submissionLink);
                    if (textContent) {
                        const tempFilePath = path.join(baseDirSubmissions, `${path.basename(file.submissionLink)}.txt`);
                        fs.writeFileSync(tempFilePath, textContent);
                        const fileId = await uploadFileToOpenAI(tempFilePath, 'assistants');
                        submissionFileIds.push(fileId);
                        fs.unlinkSync(tempFilePath);
                        allLinksFailed = false;
                    }
                } catch (error) {
                    console.error(`Error fetching or processing the submission link ${file.submissionLink}:`, error);
                }
            }
        }
      console.log('Submission file IDs created:', submissionFileIds);
      if (allFilesFailed && allLinksFailed) {
        console.error(`All submissions failed for student: ${studentId}. Assigning default grade and feedback.`);
        parsedResponse = {
            grade: 0,
            feedback: 'The AI was unable to process any submissions. Please manually enter a grade and provide feedback.'
        };
    } else {
        let retryCount = 0;
        const maxRetries = 10;

        while (retryCount < maxRetries) {
            const threadResponse = await retryRequest(() => openai.beta.threads.create());
            console.log('Thread created:', threadResponse.id);
            const thread = threadResponse.id;

            let messageContent = `Grade the student's assignment submissions for accuracy using the following rubric: ${assignmentRubric}. The maximum points available for this assignment is ${maxPoints}. Please make 100% sure that you do not assign a grade higher than ${maxPoints}. Provide your response in the following JSON format:
            {
                "feedback": "Your detailed feedback here",
                "grade": "Your grade here"
            }. Please make 100% sure that you provide your response in the following JSON format: { "feedback": "Your detailed feedback here", "grade": "Your grade here"} and please make 100% sure that you do not assign a grade higher than ${maxPoints}.`;

            if (assignmentKeyFileId) {
                messageContent += ` The file with ID ${assignmentKeyFileId} is the assignment key to be used to grade the students' submissions.`;
            }
            messageContent += ` The following files are the student's submissions: ${submissionFileIds.join(', ')}.`;
            if (submissionTextContent) {
              messageContent += `\n\nThis is content extracted from submission links, which could be the student's submission in case of no submissions being provided:\n${submissionTextContent}`;
          }
            if (instructorPrompt) {
                messageContent += ` Additional Instructions: ${instructorPrompt}`;
            }

            const attachments = submissionFileIds.map(file_id => ({ file_id, tools: [{ type: 'file_search' }] }));
            if (assignmentKeyFileId) {
                attachments.unshift({ file_id: assignmentKeyFileId, tools: [{ type: 'file_search' }] });
            }

            try {
                const messageResponse = await retryRequest(() => openai.beta.threads.messages.create(thread, {
                    role: "user",
                    content: messageContent,
                    attachments: attachments
                }));
                console.log('Message posted to thread:', messageResponse.id);
            } catch (error) {
                console.error(`Error posting message to thread: ${error.message}`);
                throw error;
            }

            const runResponse = await retryRequest(() => openai.beta.threads.runs.create(thread, {
                assistant_id: assistantId,
            }));
            console.log('Run created:', runResponse.id);

            let response;
            while (true) {
                response = await retryRequest(() => openai.beta.threads.runs.retrieve(thread, runResponse.id));
                if (response.status === "in_progress" || response.status === "queued") {
                    console.log("Waiting for assistant's response...");
                    await new Promise(resolve => setTimeout(resolve, 5000));
                } else {
                    break;
                }
            }

            const threadMessagesResponse = await retryRequest(() => openai.beta.threads.messages.list(thread));
            const messages = threadMessagesResponse.data || [];
            const latestAssistantMessage = messages.filter(message => message.role === 'assistant').pop();

            if (latestAssistantMessage) {
                parsedResponse = await parseAIResponse(latestAssistantMessage.content);
                if (parsedResponse.grade > 0) {
                    break;
                }
            }

            retryCount++;
            console.log(`Retrying... Attempt ${retryCount + 1}/${maxRetries}`);
        }

        if (parsedResponse && parsedResponse.grade > 0) {
            try {
                await pool.query(
                    'INSERT INTO "AssignmentGrade" ("assignmentSubmissionId", "assignmentId", "maxObtainableGrade", "AIassignedGrade", "isGraded") VALUES ($1, $2, $3, $4, true) ON CONFLICT ("assignmentSubmissionId", "assignmentId") DO UPDATE SET "AIassignedGrade" = EXCLUDED."AIassignedGrade","isGraded" = EXCLUDED."isGraded";',
                    [submissions[0].assignmentSubmissionId, submissions[0].assignmentId, maxPoints, parsedResponse.grade]
                );
                console.log(`Grade recorded for student: ${studentId}`);
            } catch (error) {
                console.error(`Error recording grade for student ${studentId}:`, error);
            }
        } else {
            console.error(`Parsed grade is 0 for student: ${studentId}. Response: ${JSON.stringify(parsedResponse)}`);
        }

        if (parsedResponse && parsedResponse.feedback) {
            try {
                await pool.query(
                    'INSERT INTO "StudentFeedback" ("studentId", "assignmentId", "courseId", "AIFeedbackText") VALUES ($1, $2, $3, $4) ON CONFLICT ("studentId", "assignmentId", "courseId") DO UPDATE SET "AIFeedbackText" = EXCLUDED."AIFeedbackText"',
                    [studentId, submissions[0].assignmentId, submissions[0].courseId, parsedResponse.feedback]
                );
                console.log(`Feedback recorded for student: ${studentId}`);
            } catch (error) {
                console.error(`Error recording feedback for student ${studentId}:`, error);
            }
        } else {
            console.error(`Parsed feedback is empty for student: ${studentId}. Response: ${JSON.stringify(parsedResponse)}`);
        }
    }
    } catch (error) {
        console.error('Error in processStudentSubmissions:', error);
        throw error;
    }
};

// Process individual student's submissions (submissions for a single student before moving to the next student's submissions)
const processSubmissions = async (assignmentId, instructorId, courseId) => {
    console.log('Processing submissions for assignment:', assignmentId);
    console.log('Instructor ID:', instructorId);
    console.log('Course ID:', courseId);

    try {
          const submissions = await pool.query(
            'SELECT "assignmentSubmissionId", "studentId", "courseId", "assignmentId", "submissionFile", "submissionLink", "isSubmitted" FROM "AssignmentSubmission" WHERE "assignmentId" = $1 AND "isSubmitted" = true',
            [assignmentId]
        );
        console.log('Submissions fetched:', submissions.rows.length);

        if (submissions.rows.length === 0) {
            console.log('No submissions found for this assignment.');
            return { status: 404, message: 'No submissions found for this assignment.' };
        }

        const selectedPrompt = await getSelectedPrompt(instructorId) || '';
        const assignmentRubric = await getAssignmentRubric(assignmentId);
        const maxPoints = await getMaxPoints(assignmentId);
        const assignmentKeyResult = await getAssignmentKey(assignmentId);
        const assignmentKeyPath = assignmentKeyResult ? path.resolve(baseDirKeys, assignmentKeyResult) : null;
        const assistantResponse = await openai.beta.assistants.create({
            name: "AIValuate Grading Assistant",
            instructions: `You are a web development expert. Your task is to grade student assignments based on the provided rubric and additional instructions. Provide constructive feedback for each submission, and a grade based on the maximum points available. 
            Provide your response in the following JSON format:
            {
                "feedback": "Your detailed feedback here",
                "grade": "Your grade here"
            }. Please make 100% sure that you provide your response in the following JSON format: { "feedback": "Your detailed feedback here", "grade": "Your grade here"} and please make 100% sure that you do not assign a grade higher than ${maxPoints}.`,
            model: "gpt-4o",
            tools: [{ type: "code_interpreter" }, { type: "file_search" }]
        });                          
        console.log('Assistant created:', assistantResponse.id);

        const assistant = assistantResponse;
        const assistantId = assistant.id;
        const studentSubmissions = submissions.rows.reduce((acc, submission) => {
            if (!acc[submission.studentId]) {
                acc[submission.studentId] = [];
            }
            acc[submission.studentId].push(submission);
            return acc;
        }, {});

        for (const studentId in studentSubmissions) {
            console.log(`Processing submissions for student: ${studentId}`);
            await processStudentSubmissions(studentId, studentSubmissions[studentId], assistantId, selectedPrompt, assignmentRubric, maxPoints, assignmentKeyPath);
        }

        console.log('All submissions processed successfully.');
        return { status: 200, message: 'Submissions processed successfully' };
    } catch (error) {
        console.error('Error processing submissions:', error);
        return { status: 500, message: 'Server error' };
    }
};

module.exports = router;