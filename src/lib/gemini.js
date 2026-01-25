import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
if (!API_KEY) {
    console.error("Missing VITE_GEMINI_API_KEY in .env file");
}
const genAI = new GoogleGenerativeAI(API_KEY);

const safetySettings = [
    {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
    },
];

const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    safetySettings: safetySettings
});

export async function generateStudyMaterial(text, type) {
    let prompt = "";
    if (type === 'flashcards') {
        prompt = `
        You are a study assistant analyzing the text provided.
        Create a set of 10-15 flashcards covering the key concepts.
        Output MUST be a valid JSON array of objects with "front" and "back" keys.
        Example: [{"front": "Concept", "back": "Definition"}]
        Do not include markdown code blocks or additional text. Just the JSON.
        
        Text:
        ${text.substring(0, 30000)}
        `;
    } else {
        prompt = `
        You are a study assistant analyzing the text provided.
        Create a multiple choice quiz with 10 questions.
        Output MUST be a valid JSON array of objects with "question", "options" (array of 4 strings), and "answer" (string).
        Example: [{"question": "Q?", "options": ["A","B"], "answer": "A"}]
        Do not include markdown code blocks or additional text. Just the JSON.
        
        Text:
        ${text.substring(0, 30000)}
        `;
    }

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        // Cleanup potential markdown formatting for the pro model
        const cleanerText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanerText);
    } catch (error) {
        console.error("Gemini Gen Error:", error);
        // Throw the ACTUAL error message so we can see it in the UI
        throw new Error(error.message || error.toString());
    }
}
