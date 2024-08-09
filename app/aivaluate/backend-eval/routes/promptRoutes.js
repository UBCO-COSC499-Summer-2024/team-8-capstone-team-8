const express = require('express');
const router = express.Router();
const { pool } = require('../dbConfig');
require('dotenv').config();

// Fetch selected prompt by instructor id
router.get('/prompt/:instructorId', async (req, res) => {
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
        console.error(error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// Fetch all prompts by instructor id
router.get('/prompts/:instructorId', async (req, res) => {
    try {
        const { instructorId } = req.params;
        const prompts = await pool.query(
            'SELECT * FROM "Prompt" WHERE "instructorId" = $1',
            [instructorId]
        );
        res.json(prompts.rows);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// Create a prompt
router.post('/prompt', async (req, res) => {
    try {
        const { promptName, promptText, instructorId } = req.body;
        const newPrompt = await pool.query(
            'INSERT INTO "Prompt" ( "promptName", "promptText", "instructorId") VALUES($1, $2, $3) RETURNING *',
            [promptName, promptText, instructorId]
        );
        res.json(newPrompt.rows[0]);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete a prompt
router.delete('/prompt/:promptId', async (req, res) => {
    try {
        const { promptId } = req.params;
        const deletePrompt = await pool.query(
            'DELETE FROM "Prompt" WHERE "promptId" = $1',
            [promptId]
        );
        res.json({ message: 'Prompt was deleted' });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update a prompt name
router.put('/prompt/name/:promptId', async (req, res) => {
    try {
        const { promptId } = req.params;
        const { promptName } = req.body;
        const updatePrompt = await pool.query(
            'UPDATE "Prompt" SET "promptName" = $1 WHERE "promptId" = $2 RETURNING *',
            [promptName, promptId]
        );
        res.json(updatePrompt.rows[0]);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update a prompt text
router.put('/prompt/text/:promptId', async (req, res) => {
    try {
        const { promptId } = req.params;
        const { promptText } = req.body;
        const updatePrompt = await pool.query(
            'UPDATE "Prompt" SET "promptText" = $1 WHERE "promptId" = $2 RETURNING *',
            [promptText, promptId]
        );
        res.json(updatePrompt.rows[0]);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update isSelected for a prompt and set all others to false
router.put('/prompt/select/:promptId', async (req, res) => {
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
        console.error(error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// Clear isSelected for all prompts of an instructor
router.put('/prompt/clear/:instructorId', async (req, res) => {
    try {
        const { instructorId } = req.params;
        
        await pool.query(
            'UPDATE "Prompt" SET "isSelected" = false WHERE "instructorId" = $1',
            [instructorId]
        );
        
        res.json({ message: 'All prompts cleared' });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
