const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require('dotenv');
dotenv.config();

async function listModels() {
    console.log("Listing models with key ending in " + process.env.GEMINI_API_KEY.slice(-4));
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    // To list models, we use the model manager via the client indirectly or just try to fetch.
    // Actually, the JS SDK (0.24.1) doesn't always expose listModels simply in the main export.
    // However, we can use the REST API via fetch to be sure if the SDK is hiding it.

    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.models) {
            console.log("AVAILABLE MODELS:");
            data.models.forEach(m => console.log(` - ${m.name}`));
        } else {
            console.log("ERROR LISTING MODELS:", JSON.stringify(data, null, 2));
        }
    } catch (e) {
        console.log("FETCH ERROR:", e.message);
    }
}

listModels();
