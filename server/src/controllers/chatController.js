const { getChatResponse } = require('../services/geminiService');

const chat = async (req, res) => {
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ message: 'Message is required' });
    }

    try {
        const response = await getChatResponse(message);
        res.json({ response });
    } catch (error) {
        console.error("Chat Controller Error:", error);
        res.status(500).json({ message: 'Error processing chat', error: error.message });
    }
};

module.exports = { chat };
