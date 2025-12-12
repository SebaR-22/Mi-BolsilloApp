/**
 * Improved Gemini Model Testing Script
 * Tests various Gemini models and configurations
 */

const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require('dotenv');

dotenv.config();

const testGeminiModels = async () => {
    console.log("🔄 Testing Gemini Models...\n");
    
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
        console.error("❌ GEMINI_API_KEY not configured");
        process.exit(1);
    }

    console.log(`✓ API Key configured (ends with ${apiKey.slice(-4)})\n`);

    const models = [
        "gemini-pro",
        "gemini-1.5-flash",
        "gemini-1.5-pro",
        "gemini-1.5-flash-latest",
        "gemini-1.5-pro-latest"
    ];

    const genAI = new GoogleGenerativeAI(apiKey);
    let successCount = 0;
    let failureCount = 0;

    for (const modelName of models) {
        try {
            console.log(`Testing ${modelName}...`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Say 'Hello from Gemini'");
            const response = result.response;
            
            if (response.candidates && response.candidates.length > 0) {
                const candidate = response.candidates[0];
                if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
                    console.log(`✓ SUCCESS with ${modelName}`);
                    console.log(`  Response: ${candidate.content.parts[0].text.substring(0, 100)}...\n`);
                    successCount++;
                } else {
                    console.log(`⚠ ${modelName}: No content in response\n`);
                    failureCount++;
                }
            } else {
                console.log(`⚠ ${modelName}: No candidates in response\n`);
                failureCount++;
            }
        } catch (error) {
            console.log(`✗ FAILED ${modelName}: ${error.message}\n`);
            failureCount++;
        }
    }

    console.log("=" .repeat(50));
    console.log(`Results: ${successCount} passed, ${failureCount} failed`);
    console.log("=" .repeat(50));

    if (successCount === 0) {
        console.error("❌ No models working!");
        process.exit(1);
    } else {
        console.log("✓ Test completed successfully!");
        process.exit(0);
    }
};

testGeminiModels().catch(error => {
    console.error("Fatal error:", error);
    process.exit(1);
});
