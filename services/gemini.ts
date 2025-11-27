import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const textModelId = "gemini-2.5-flash";
const imageModelId = "gemini-2.5-flash-image";

export const generateRiddle = async (): Promise<{ question: string; hint: string }> => {
  try {
    const response = await ai.models.generateContent({
      model: textModelId,
      contents: "Generate a short, challenging riddle where the answer is explicitly 'shadow'. It should be mysterious and poetic.",
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
      question: "Only one color, but not one size, Stuck at the bottom, yet easily flies. Present in sun, but not in rain, Doing no harm, and feeling no pain. What am I?",
      hint: "I follow you around in the light."
    };
  }
};

export const validateRiddleAnswer = async (riddle: string, userAnswer: string): Promise<boolean> => {
  try {
    const response = await ai.models.generateContent({
      model: textModelId,
      contents: `
        Riddle: "${riddle}"
        User Answer: "${userAnswer}"
        
        The correct answer to this riddle is "shadow". Is the user's answer "shadow" or a very close synonym?
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
    return normalized.includes('shadow');
  }
};

export const analyzeTransmission = async (imageBase64: string): Promise<string> => {
  try {
    // Use textModelId (gemini-2.5-flash) because we want a text description of the image.
    // gemini-2.5-flash-image is for generating images, not analyzing them for text output.
    const response = await ai.models.generateContent({
      model: textModelId, 
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/png",
              data: imageBase64
            }
          },
          {
            text: "Analyze this image as if it were a frozen frame from a corrupted video transmission. Describe the person's expression and action in a technical, sci-fi 'status report' style. Keep it brief (under 30 words)."
          }
        ]
      }
    });
    return response.text || "STATUS: SIGNAL CORRUPTED. UNABLE TO ANALYZE FRAME.";
  } catch (error) {
    console.error("Gemini Image Analysis Error:", error);
    return "STATUS: OFFLINE. IMAGE RECOGNITION FAILED.";
  }
};