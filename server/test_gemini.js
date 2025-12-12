const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require('dotenv');
dotenv.config();

async function listModels() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    try {
        // For some reason the SDK might not expose listModels directly on the main class easily in all versions,
        // but let's try via the model manager if available or just a known endpoint.
        // Actually, in the Node SDK, getting a model is the main entry.
        // There isn't a direct "listModels" helper in the basic usage docs often shown, 
        // but we can try to fetch a common model and see if it works, OR just use the error message recommendation.

        // Wait, the error explicitly says "Call ListModels".
        // In the REST API it's GET /v1beta/models.
        // in SDK:
        // const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        // It doesn't look like the SDK has a simple listModels function exposed in the main export?
        // Let's try to run a simple script that tries "gemini-pro" again but logging EVERYTHING.

        // Actually, let's try 'gemini-1.0-pro' vs 'gemini-pro'.

        console.log("Testing various model names...");
        const candidates = ["gemini-pro", "gemini-1.5-flash", "gemini-1.5-pro-latest", "gemini-1.0-pro"];

        for (const modelName of candidates) {
            console.log(`Trying ${modelName}...`);
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent("Test");
                console.log(`SUCCESS with ${modelName}`);
                return;
            } catch (e) {
                console.log(`Failed ${modelName}: ${e.message}`);
            }
        }

    } catch (error) {
        console.error("Error:", error);
    }
}

listModels();
