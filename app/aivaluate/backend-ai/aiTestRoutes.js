const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const { log } = require('console');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const FormData = require('form-data');

router.use(bodyParser.json());

const openaiApiKey = process.env.OPENAI_API_KEY;

// OpenAI Completions endpoint
router.post('/gpt/completions', async (req, res) => {
    const { prompt } = req.body;
    log(`Received prompt: ${prompt}`);
  
    try {
      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 100
      }, {
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json'
        }
      });
  
      res.json({ response: response.data.choices[0].message.content.trim() });
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

// Endpoint to read file and return its content as a text string
router.get('/test/get-file-content', async (req, res) => {
    const { filePath } = req.query;
    log(`Received filePath: ${filePath}`);

    try {
        if (!fs.existsSync(filePath)) {
            log(`File not found: ${filePath}`);
            return res.status(404).json({ error: 'File not found.' });
        }

        const fileContent = fs.readFileSync(filePath, 'utf8');
        log(`File content: ${fileContent}`);
        res.json({ fileContent });
    } catch (error) {
        console.error(`Error: ${error.message}`);
        res.status(500).json({ error: 'Failed to read and return file content' });
    }
});



// OpenAI Assistant, Thread, and Message creation endpoint
router.post('/test/assistants', async (req, res) => {
    const { promptText, fileNames } = req.body;
    log(`Received promptText: ${promptText}`);
    log(`Received fileNames: ${fileNames}`);

    try {
        // Step 1: Create the assistant with file_search enabled
        const assistantResponse = await axios.post('https://api.openai.com/v1/assistants', {
            instructions: promptText, // Using the prompt text as the instruction
            name: "Grading Assistant",
            tools: [{ type: "code_interpreter" }, { type: "file_search" }],
            model: 'gpt-4o-mini',
        }, {
            headers: {
                'Authorization': `Bearer ${openaiApiKey}`,
                'Content-Type': 'application/json',
                'OpenAI-Beta': 'assistants=v2'
            }
        });

        const assistant = assistantResponse.data;
        log(`Assistant created: ${JSON.stringify(assistant)}`);

        // Define the base path for the mounted Docker volume
        const basePath = '/app/aivaluate/backend';

        // Step 2: Check if files exist and create file streams
        const existingFilePaths = fileNames.map((fileName) => {
            const filePath = path.join(basePath, fileName);
            const exists = fs.existsSync(filePath);
            if (!exists) {
                log(`File not found: ${filePath}`);
            }
            return exists ? filePath : null;
        }).filter(Boolean);

        if (existingFilePaths.length === 0) {
            return res.status(400).json({ error: 'No valid files found.' });
        }

        // Step 3: Upload the files to OpenAI API and get file IDs
        const uploadResponses = await Promise.all(existingFilePaths.map(async (filePath) => {
            const formData = new FormData();
            formData.append('file', fs.createReadStream(filePath));
            formData.append('purpose', 'assistants');
            const response = await axios.post('https://api.openai.com/v1/files', formData, {
                headers: {
                    'Authorization': `Bearer ${openaiApiKey}`,
                    ...formData.getHeaders(),
                    'OpenAI-Beta': 'assistants=v2'
                }
            });
            return response.data;
        }));

        const fileIds = uploadResponses.map(response => response.id);
        log(`Uploaded file IDs: ${fileIds}`);

        // Step 4: Create a vector store
        let vectorStoreResponse = await axios.post('https://api.openai.com/v1/vector_stores', {
            name: "Assignment Submissions",
        }, {
            headers: {
                'Authorization': `Bearer ${openaiApiKey}`,
                'Content-Type': 'application/json',
                'OpenAI-Beta': 'assistants=v2'
            }
        });

        const vectorStore = vectorStoreResponse.data;
        log(`Vector store created: ${JSON.stringify(vectorStore)}`);

        // Step 5: Create a vector store file batch using file IDs
        const fileBatchResponse = await axios.post(`https://api.openai.com/v1/vector_stores/${vectorStore.id}/file_batches`, {
            file_ids: fileIds,
        }, {
            headers: {
                'Authorization': `Bearer ${openaiApiKey}`,
                'Content-Type': 'application/json',
                'OpenAI-Beta': 'assistants=v2'
            }
        });

        log(`File batch created: ${JSON.stringify(fileBatchResponse.data)}`);

        // Step 6: Update the assistant to use the new vector store
        await axios.post(`https://api.openai.com/v1/assistants/${assistant.id}`, {
            tool_resources: { file_search: { vector_store_ids: [vectorStore.id] } }
        }, {
            headers: {
                'Authorization': `Bearer ${openaiApiKey}`,
                'Content-Type': 'application/json',
                'OpenAI-Beta': 'assistants=v2'
            }
        });

        // Step 7: Create the thread
        const threadResponse = await axios.post('https://api.openai.com/v1/threads', {}, {
            headers: {
                'Authorization': `Bearer ${openaiApiKey}`,
                'Content-Type': 'application/json',
                'OpenAI-Beta': 'assistants=v2'
            }
        });

        const thread = threadResponse.data;
        log(`Thread created: ${JSON.stringify(thread)}`);

        // Step 8: Send a message to the created thread
        const messageResponse = await axios.post(`https://api.openai.com/v1/threads/${thread.id}/messages`, {
            role: "user",
            content: "Grade the student assignments based on provided rubric and answer key. Start your reponse with 'AI Grade: ' followed by the grade / maxObtainableGrade.",
            attachments: fileIds.map((fileId) => ({
                file_id: fileId,
                tools: [{ type: "file_search" }]
            })),
        }, {
            headers: {
                'Authorization': `Bearer ${openaiApiKey}`,
                'Content-Type': 'application/json',
                'OpenAI-Beta': 'assistants=v2'
            }
        });

        log(`Message sent to thread: ${JSON.stringify(messageResponse.data)}`);

        // Step 9: Run the assistant to process the thread
        const runResponse = await axios.post(`https://api.openai.com/v1/threads/${thread.id}/runs`, {
            assistant_id: assistant.id,
        }, {
            headers: {
                'Authorization': `Bearer ${openaiApiKey}`,
                'Content-Type': 'application/json',
                'OpenAI-Beta': 'assistants=v2'
            }
        });

        log(`Run created: ${JSON.stringify(runResponse.data)}`);

        // Step 10: Wait for the assistant to generate a response
        let response = await axios.get(`https://api.openai.com/v1/threads/${thread.id}/runs/${runResponse.data.id}`, {
            headers: {
                'Authorization': `Bearer ${openaiApiKey}`,
                'Content-Type': 'application/json',
                'OpenAI-Beta': 'assistants=v2'
            },
            timeout: 300000 // 5 minutes
        });

        while (response.data.status === "in_progress" || response.data.status === "queued") {
            log("Waiting for assistant's response...");
            await new Promise(resolve => setTimeout(resolve, 5000)); // wait for 5 seconds
            response = await axios.get(`https://api.openai.com/v1/threads/${thread.id}/runs/${runResponse.data.id}`, {
                headers: {
                    'Authorization': `Bearer ${openaiApiKey}`,
                    'Content-Type': 'application/json',
                    'OpenAI-Beta': 'assistants=v2'
                },
                timeout: 300000 // 5 minutes
            });
        }

        // Step 11: Retrieve and return the assistant's response
        const threadMessagesResponse = await axios.get(`https://api.openai.com/v1/threads/${thread.id}/messages`, {
            headers: {
                'Authorization': `Bearer ${openaiApiKey}`,
                'Content-Type': 'application/json',
                'OpenAI-Beta': 'assistants=v2'
            }
        });

        const messages = threadMessagesResponse.data.data;
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

module.exports = router;