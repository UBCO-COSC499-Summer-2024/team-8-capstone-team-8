const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const logger = require('../evallogger'); // Ensure this path is correct

jest.mock('pg', () => ({
    Pool: jest.fn(() => ({
        query: jest.fn()
    }))
}));

const pool = new Pool();

const app = express();
app.use(bodyParser.json());

// Define the route to fetch selected prompt by instructor ID
app.get('/prompt/:instructorId', async (req, res) => {
    try {
        const { instructorId } = req.params;
        const prompt = await pool.query(
            'SELECT * FROM "Prompt" WHERE "instructorId" = $1 AND "isSelected" = true',
            [instructorId]
        );
        if (prompt.rows.length === 0) {
            return res.status(404).json({ message: 'No prompt selected' });
        }
        res.json(prompt.rows[0]);
    } catch (error) {
        logger.error(error.message);
        res.status(500).json({ message: 'Server error' });
    }
});


// Define the route to fetch all prompts by instructor ID
app.get('/prompts/:instructorId', async (req, res) => {
    try {
        const { instructorId } = req.params;
        const prompts = await pool.query(
            'SELECT * FROM "Prompt" WHERE "instructorId" = $1',
            [instructorId]
        );
        res.json(prompts.rows);
    } catch (error) {
        logger.error(error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// Define the route to create a prompt
app.post('/prompt', async (req, res) => {
    try {
        const { promptName, promptText, instructorId } = req.body;
        const newPrompt = await pool.query(
            'INSERT INTO "Prompt" ("promptName", "promptText", "instructorId") VALUES($1, $2, $3) RETURNING *',
            [promptName, promptText, instructorId]
        );
        res.json(newPrompt.rows[0]);
    } catch (error) {
        logger.error(error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// Define the route to delete a prompt
app.delete('/prompt/:promptId', async (req, res) => {
    try {
        const { promptId } = req.params;
        await pool.query(
            'DELETE FROM "Prompt" WHERE "promptId" = $1',
            [promptId]
        );
        res.json({ message: 'Prompt was deleted' });
    } catch (error) {
        logger.error(error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// Define the route to update a prompt name
app.put('/prompt/name/:promptId', async (req, res) => {
    try {
        const { promptId } = req.params;
        const { promptName } = req.body;
        const updatePrompt = await pool.query(
            'UPDATE "Prompt" SET "promptName" = $1 WHERE "promptId" = $2 RETURNING *',
            [promptName, promptId]
        );
        res.json(updatePrompt.rows[0]);
    } catch (error) {
        logger.error(error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// Define the route to update a prompt text
app.put('/prompt/text/:promptId', async (req, res) => {
    try {
        const { promptId } = req.params;
        const { promptText } = req.body;
        const updatePrompt = await pool.query(
            'UPDATE "Prompt" SET "promptText" = $1 WHERE "promptId" = $2 RETURNING *',
            [promptText, promptId]
        );
        res.json(updatePrompt.rows[0]);
    } catch (error) {
        logger.error(error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// Define the route to update isSelected for a prompt and set all others to false
app.put('/prompt/select/:promptId', async (req, res) => {
    try {
        const { promptId } = req.params;
        const { instructorId } = req.body;
        
        await pool.query(
            'UPDATE "Prompt" SET "isSelected" = false WHERE "instructorId" = $1',
            [instructorId]
        );

        const updatePrompt = await pool.query(
            'UPDATE "Prompt" SET "isSelected" = true WHERE "promptId" = $1 RETURNING *',
            [promptId]
        );
        
        res.json(updatePrompt.rows[0]);
    } catch (error) {
        logger.error(error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// Define the route to clear isSelected for all prompts of an instructor
app.put('/prompt/clear/:instructorId', async (req, res) => {
    try {
        const { instructorId } = req.params;
        
        await pool.query(
            'UPDATE "Prompt" SET "isSelected" = false WHERE "instructorId" = $1',
            [instructorId]
        );
        
        res.json({ message: 'All prompts cleared' });
    } catch (error) {
        logger.error(error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// Tests for Fetching Selected Prompt by Instructor ID Route
describe('GET /prompt/:instructorId', () => {
    it('should fetch the selected prompt successfully', async () => {
        const instructorId = '123';
        const mockPrompt = { promptId: '1', promptText: 'What is AI?' };

        pool.query.mockResolvedValue({ rows: [mockPrompt], rowCount: 1 });

        const response = await request(app).get(`/prompt/${instructorId}`);

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockPrompt);
    });

    it('should return a 404 if no prompt is selected', async () => {
        const instructorId = '456';
        pool.query.mockResolvedValue({ rows: [], rowCount: 0 });

        const response = await request(app).get(`/prompt/${instructorId}`);

        expect(response.status).toBe(404);
        expect(response.body).toEqual({ message: 'No prompt selected' });
    });

    it('should handle database errors', async () => {
        const instructorId = '789';
        pool.query.mockRejectedValue(new Error('Database error'));

        const response = await request(app).get(`/prompt/${instructorId}`);

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ message: 'Server error' });
    });

    // Tests for Fetching All Prompts by Instructor ID Route
describe('GET /prompts/:instructorId', () => {
    it('should fetch all prompts for a given instructor successfully', async () => {
        const instructorId = '123';
        const mockPrompts = [
            { promptId: '1', promptText: 'What is AI?' },
            { promptId: '2', promptText: 'Describe machine learning.' }
        ];

        pool.query.mockResolvedValue({ rows: mockPrompts, rowCount: mockPrompts.length });

        const response = await request(app).get(`/prompts/${instructorId}`);

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockPrompts);
    });

    it('should handle database errors', async () => {
        const instructorId = '456';
        pool.query.mockRejectedValue(new Error('Database error'));

        const response = await request(app).get(`/prompts/${instructorId}`);

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ message: 'Server error' });
    });
});

// Tests for Creating a Prompt
describe('POST /prompt', () => {
    it('should create a new prompt successfully', async () => {
        const mockPrompt = {
            promptId: '1',
            promptName: 'Introduction to AI',
            promptText: 'What is AI?',
            instructorId: '10'
        };

        pool.query.mockResolvedValue({ rows: [mockPrompt], rowCount: 1 });

        const response = await request(app)
            .post('/prompt')
            .send({
                promptName: 'Introduction to AI',
                promptText: 'What is AI?',
                instructorId: '10'
            });

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockPrompt);
    });

    it('should handle database errors during prompt creation', async () => {
        pool.query.mockRejectedValue(new Error('Database error'));

        const response = await request(app)
            .post('/prompt')
            .send({
                promptName: 'Introduction to AI',
                promptText: 'What is AI?',
                instructorId: '10'
            });

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ message: 'Server error' });
    });
});

// Tests for Deleting a Prompt
describe('DELETE /prompt/:promptId', () => {
    it('should delete a prompt successfully', async () => {
        pool.query.mockResolvedValue({ rowCount: 1 });

        const response = await request(app)
            .delete('/prompt/1');

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: 'Prompt was deleted' });
    });

    it('should handle database errors during prompt deletion', async () => {
        pool.query.mockRejectedValue(new Error('Database error'));

        const response = await request(app)
            .delete('/prompt/1');

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ message: 'Server error' });
    });
});

// Tests for Updating a Prompt Name
describe('PUT /prompt/name/:promptId', () => {
    it('should update a prompt name successfully', async () => {
        const mockUpdatedPrompt = {
            promptId: 1,
            promptName: 'Updated Prompt Name',
            promptText: 'Sample Prompt Text',
            instructorId: 1
        };

        pool.query.mockResolvedValue({ rows: [mockUpdatedPrompt] });

        const response = await request(app)
            .put('/prompt/name/1')
            .send({ promptName: 'Updated Prompt Name' });

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockUpdatedPrompt);
    });

    it('should handle database errors during prompt name update', async () => {
        pool.query.mockRejectedValue(new Error('Database error'));

        const response = await request(app)
            .put('/prompt/name/1')
            .send({ promptName: 'Updated Prompt Name' });

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ message: 'Server error' });
    });
});
// Tests for Updating a Prompt Text
describe('PUT /prompt/text/:promptId', () => {
    it('should update a prompt text successfully', async () => {
        const mockUpdatedPrompt = {
            promptId: 1,
            promptName: 'Sample Prompt Name',
            promptText: 'Updated Prompt Text',
            instructorId: 1
        };

        pool.query.mockResolvedValue({ rows: [mockUpdatedPrompt] });

        const response = await request(app)
            .put('/prompt/text/1')
            .send({ promptText: 'Updated Prompt Text' });

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockUpdatedPrompt);
    });

    it('should handle database errors during prompt text update', async () => {
        pool.query.mockRejectedValue(new Error('Database error'));

        const response = await request(app)
            .put('/prompt/text/1')
            .send({ promptText: 'Updated Prompt Text' });

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ message: 'Server error' });
    });
});

// Tests for Updating isSelected for a Prompt
describe('PUT /prompt/select/:promptId', () => {
    it('should update isSelected for a prompt successfully', async () => {
        const mockUpdatedPrompt = {
            promptId: 1,
            promptName: 'Sample Prompt Name',
            promptText: 'Sample Prompt Text',
            instructorId: 1,
            isSelected: true
        };

        pool.query.mockResolvedValueOnce({ rows: [] }); // For setting all other prompts to false
        pool.query.mockResolvedValueOnce({ rows: [mockUpdatedPrompt] }); // For updating the selected prompt

        const response = await request(app)
            .put('/prompt/select/1')
            .send({ instructorId: 1 });

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockUpdatedPrompt);
    });

    it('should handle database errors during prompt selection update', async () => {
        pool.query.mockRejectedValue(new Error('Database error'));

        const response = await request(app)
            .put('/prompt/select/1')
            .send({ instructorId: 1 });

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ message: 'Server error' });
    });
});

// Tests for Clearing isSelected for All Prompts of an Instructor
describe('PUT /prompt/clear/:instructorId', () => {
    it('should clear isSelected for all prompts successfully', async () => {
        pool.query.mockResolvedValueOnce({ rows: [] }); // Mock response for clearing all prompts

        const response = await request(app)
            .put('/prompt/clear/1');

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: 'All prompts cleared' });
    });

    it('should handle database errors during prompt clearance', async () => {
        pool.query.mockRejectedValue(new Error('Database error'));

        const response = await request(app)
            .put('/prompt/clear/1');

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ message: 'Server error' });
    });
});


});

module.exports = app; // Exporting for testing purposes
