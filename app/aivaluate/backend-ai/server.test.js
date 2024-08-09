const request = require('supertest');
const axios = require('axios');
const MockAdapter = require('axios-mock-adapter');
const app = require('./server'); // Adjust the path if necessary

// This sets the mock adapter on the default instance
const mock = new MockAdapter(axios);

describe('POST /ai-api/api/gpt', () => {
  afterEach(() => {
    mock.reset();
  });

  it('should return a response from the AI model', async () => {
    // Mock the OpenAI API response
    mock.onPost('https://api.openai.com/v1/chat/completions').reply(200, {
      choices: [{ message: { content: 'Hello, this is a test response' } }]
    });

    const res = await request(app)
      .post('/ai-api/api/gpt')
      .send({ prompt: 'Hello' });

    expect(res.status).toBe(200);
    expect(res.body.response).toBe('Hello, this is a test response');
  });
});
