const { Configuration, OpenAIApi } = require("openai");

const mockChat = async (message) => {
    return `IA (Mock): Recibí tu mensaje: "${message}". Como no hay API Key configurada, respondo esto automáticamente.`;
};

const getChatResponse = async (message) => {
    // If no key, fast mock
    if (!process.env.OPENAI_API_KEY) {
        return mockChat(message);
    }

    try {
        const configuration = new Configuration({
            apiKey: process.env.OPENAI_API_KEY,
        });
        const openai = new OpenAIApi(configuration);

        const completion = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: message }],
        });

        return completion.data.choices[0].message.content;
    } catch (error) {
        console.error("OpenAI API Error:", error.response?.data || error.message);
        // Fallback to mock on error so user sees something
        return `(IA Offline): Hubo un error conectando con OpenAI. Respuesta simulada: "${message}"`;
    }
};

module.exports = { getChatResponse };
