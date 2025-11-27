import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const modelId = "gemini-2.5-flash";

export const generateRiddle = async (): Promise<{ question: string; hint: string }> => {
  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: "Generate a short, challenging riddle related to mystery, detectives, or logical deduction. It should be solvable but tricky.",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            hint: { type: Type.STRING }
          },
          required: ["question", "hint"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Error:", error);
    return {
      question: "I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?",
      hint: "It's an echo."
    };
  }
};

export const validateRiddleAnswer = async (riddle: string, userAnswer: string): Promise<boolean> => {
  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: `
        Riddle: "${riddle}"
        User Answer: "${userAnswer}"
        
        Is this answer essentially correct? Ignore spelling mistakes or slight variations. 
        Respond with ONLY valid JSON: { "correct": boolean }
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            correct: { type: Type.BOOLEAN }
          }
        }
      }
    });
    
    const text = response.text;
    if (!text) return false;
    const result = JSON.parse(text);
    return result.correct;
  } catch (error) {
    console.error("Gemini Validation Error:", error);
    // Fallback simple validation if API fails
    const normalized = userAnswer.toLowerCase().trim();
    return normalized.includes('echo');
  }
};