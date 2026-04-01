require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.use(cors({ origin: '*' })); 
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/api/chat', async (req, res) => {
  const { message, chatHistory } = req.body;
  
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: `You are the Lead Business Consultant for nepalbusiness.org. 
      Help users with entrepreneurship in Nepal. Keep answers concise.
      CRITICAL RULE: When asked about company registration or taxes, provide factual steps AND direct URLs to official resources (e.g., https://ocr.gov.np for registration, https://ird.gov.np for PAN/VAT).`
    });

    const formattedHistory = chatHistory ? chatHistory.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    })) : [];

    const chat = model.startChat({ history: formattedHistory });
    const result = await chat.sendMessage(message);
    
    res.json({ reply: result.response.text() });
    
  } catch (error) {
    console.error("Gemini API Error:", error.message);
    res.status(500).json({ error: 'Our AI advisor is currently thinking too hard. Please try again.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Gemini Server running on port ${PORT}`));
