const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require("@google/generative-ai");

const mockChat = async (message) => {
    return `IA (Mock): Recibí tu mensaje: "${message}". Como no hay GEMINI_API_KEY configurada, respondo esto.`;
};

const getChatResponse = async (message) => {
    const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;

    if (!apiKey) {
        return mockChat(message);
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        // Using "gemini-flash-latest" as implicitly supported alias if "gemini-1.5-flash" 404s
        const model = genAI.getGenerativeModel({
            model: "gemini-flash-latest",
            safetySettings: [
                {
                    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
                },
                {
                    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
                },
            ],
        });

        const result = await model.generateContent(message);
        const response = result.response;

        // Manually extraction to avoid .text() error
        if (response.candidates && response.candidates.length > 0) {
            const candidate = response.candidates[0];
            // Check if blocked
            if (candidate.finishReason === "SAFETY") {
                return "(IA): Respuesta bloqueada por seguridad.";
            }
            if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
                return candidate.content.parts[0].text;
            }
        }

        return "(IA): No se pudo generar una respuesta de texto.";

    } catch (error) {
        console.error("Gemini API Error details:", error);
        return `(IA Offline): Hubo un error con Gemini. Detalle: ${error.message}`;
    }
};

module.exports = { getChatResponse };
