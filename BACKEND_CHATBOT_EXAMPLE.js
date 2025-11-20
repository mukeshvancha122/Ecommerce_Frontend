/**
 * Backend Chatbot Proxy Example
 * 
 * This is an example backend endpoint that proxies requests to OpenAI API.
 * Use this as a reference when implementing your backend chatbot endpoint.
 * 
 * Expected endpoint: POST /api/v1/chatbot
 * 
 * Request body:
 * {
 *   "message": "User's message",
 *   "conversation_history": [...],
 *   "system_prompt": "..."
 * }
 * 
 * Response:
 * {
 *   "response": "AI generated response"
 * }
 */

// Example using Express.js and OpenAI SDK
const express = require('express');
const { OpenAI } = require('openai');
const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Store securely in environment variables
});

router.post('/chatbot', async (req, res) => {
  try {
    const { message, conversation_history = [], system_prompt } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Prepare messages for OpenAI
    const messages = [
      { role: 'system', content: system_prompt || 'You are a helpful customer service assistant.' },
      ...conversation_history,
      { role: 'user', content: message },
    ];

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: messages,
      temperature: 0.7,
      max_tokens: 300,
    });

    const aiResponse = completion.choices[0].message.content;

    res.json({
      response: aiResponse,
    });
  } catch (error) {
    console.error('OpenAI API error:', error);
    res.status(500).json({
      error: 'Failed to get AI response',
      message: error.message,
    });
  }
});

module.exports = router;

/**
 * Installation:
 * 
 * npm install openai express
 * 
 * Environment Variables:
 * OPENAI_API_KEY=sk-your-openai-api-key
 * 
 * Security Notes:
 * - Never expose your OpenAI API key to the frontend
 * - Use environment variables for API keys
 * - Implement rate limiting
 * - Add authentication/authorization
 * - Consider caching responses for common queries
 * - Monitor API usage and costs
 */

