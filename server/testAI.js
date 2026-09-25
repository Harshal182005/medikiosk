require("dotenv").config();

const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

async function testAI() {
    try {
        console.log("Testing Gemini API...");

        const interaction = await ai.interactions.create({
            model: "gemini-3.6-flash",
            input: "Say hello to MediKiosk in one short sentence."
        });

        console.log("\nGemini Response:");
        console.log(interaction.output_text);

    } catch (error) {
        console.error("\nGemini API Test Failed:");
        console.error(error.message);
    }
}

testAI();
