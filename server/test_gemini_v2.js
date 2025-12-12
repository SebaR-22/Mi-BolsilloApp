const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require('dotenv');
dotenv.config();

async function testModel() {
    console.log("Testing gemini-pro with key ending in " + process.env.GEMINI_API_KEY.slice(-4));
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent("Say Hello");
        const response = result.response;
        console.log("RESPONSE:", response.text());
        console.log("SUCCESS");
    } catch (e) {
        console.log("FAILURE:", e.message);
    }
}

testModel();
