const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

/**
 * Summarizes long text into a single concise sentence.
 */
async function summarizeText(text) {
    if (!process.env.GEMINI_API_KEY) return "API key missing.";

    try {
        const prompt = `Summarize the following text into a very short, engaging single sentence:
        
        Text: ${text}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text().trim();
    } catch (error) {
        console.error("Summarization Error:", error.message);
        return "Could not summarize text.";
    }
}

/**
 * Suggests a one-word community name based on the content.
 */
async function suggestCommunity(title, text) {
    if (!process.env.GEMINI_API_KEY) return "general";
    try {
        const prompt = `Suggest a single-word category name for the following post content. 
        Examples: tech, gaming, sports, news, food. Respond with ONLY one word.
        Title: ${title} Content: ${text}`;
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text().trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    } catch (error) {
        return "general";
    }
}

module.exports = {
    summarizeText,
    suggestCommunity
};