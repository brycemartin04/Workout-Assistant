// server.js
const express = require('express');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());

app.post('/chat', async (req, res) => {
  const { message, history } = req.body;
  console.log('Received message:', message);

  try {
    // Include a system message to set the tone as an experienced personal trainer
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.CHATBOT_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini-2024-07-18",
        messages: [
          {
            role: "system",
            content: "You are an virtual personal trainer. Provide fitness advice, workout tips, and nutrition guidance using clear, concise, and supportive language."
          },
          ...history,
          {
            role: "user",
            content: message
          }
        ]
      }),
    });

    const data = await response.json();
    console.log(data);
    // Extract the reply from the first choice in the response
    const reply = data.choices && data.choices.length > 0 
      ? data.choices[0].message.content 
      : "No reply received.";

    res.json({ reply });
  } catch (error) {
    console.error('Error in /chat endpoint:', error);
    res.status(500).json({ error: 'An error occurred while processing your request.' });
  }
});

app.get('/', (req, res) => {
  res.send('Chat backend is running!');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
