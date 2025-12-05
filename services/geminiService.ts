import { GoogleGenAI, Type } from "@google/genai";
import { ResumeData } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const enhanceText = async (text: string, context: string): Promise<string> => {
  if (!text) return "";
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `You are a professional resume writer. Rewrite the following resume text to be more impactful, using active verbs and quantifiable results where possible. Keep it concise.
      
      Context: ${context}
      
      Original Text:
      "${text}"
      
      Return ONLY the rewritten text as a bulleted list using hyphens. Do not add quotes or markdown blocks.`,
    });

    return response.text?.trim() || text;
  } catch (error) {
    console.error("Gemini Enhancement Error:", error);
    return text;
  }
};

export const parseResumeFromText = async (rawText: string): Promise<Partial<ResumeData>> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Extract resume information from the following text into a JSON object.
      
      Text to parse:
      ${rawText}
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: getResumeSchema()
      }
    });

    const jsonText = response.text || "{}";
    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Gemini Parse Error:", error);
    throw new Error("Failed to parse resume text.");
  }
};

export const generateTailoredResume = async (
  currentResume: string, 
  linkedinData: string, 
  jobDescription: string, 
  location: string
): Promise<Partial<ResumeData>> => {
  try {
    const prompt = `
      Act as an expert resume writer and career coach. 
      I need you to generate a tailored resume JSON object based on the following inputs.

      1. **Current Resume**: ${currentResume}
      2. **LinkedIn Profile Data**: ${linkedinData}
      3. **Target Job Description**: ${jobDescription}
      4. **Target Location**: ${location}

      **Instructions**:
      - MERGE the Current Resume and LinkedIn Profile data to create a comprehensive history.
      - FILTER and PRIORITIZE experiences, skills, and summary to match the keywords and requirements of the **Target Job Description**.
      - REWRITE bullet points to highlight achievements relevant to the target role.
      - Set the location in personalInfo to "${location}".
      - Ensure the output fits the JSON schema provided.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: getResumeSchema()
      }
    });

    const jsonText = response.text || "{}";
    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Gemini Tailoring Error:", error);
    throw new Error("Failed to generate tailored resume.");
  }
};

export const generateSummary = async (resumeData: ResumeData): Promise<string> => {
    try {
        const context = JSON.stringify(resumeData.experience.map(e => ({ role: e.role, company: e.company })));
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Write a professional 3-sentence resume summary for a candidate with the following experience history: ${context}. Focus on expertise and career goals.`,
        });
        return response.text?.trim() || "";
    } catch (e) {
        return "";
    }
}

// Helper to keep schema consistent
function getResumeSchema() {
  return {
    type: Type.OBJECT,
    properties: {
      personalInfo: {
        type: Type.OBJECT,
        properties: {
          fullName: { type: Type.STRING },
          email: { type: Type.STRING },
          phone: { type: Type.STRING },
          location: { type: Type.STRING },
          linkedin: { type: Type.STRING },
          website: { type: Type.STRING }
        }
      },
      summary: { type: Type.STRING },
      experience: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            company: { type: Type.STRING },
            role: { type: Type.STRING },
            startDate: { type: Type.STRING },
            endDate: { type: Type.STRING },
            current: { type: Type.BOOLEAN },
            description: { type: Type.STRING }
          }
        }
      },
      education: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            institution: { type: Type.STRING },
            degree: { type: Type.STRING },
            startDate: { type: Type.STRING },
            endDate: { type: Type.STRING },
            current: { type: Type.BOOLEAN },
            description: { type: Type.STRING }
          }
        }
      },
      skills: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      },
      references: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
              name: { type: Type.STRING },
              role: { type: Type.STRING },
              company: { type: Type.STRING },
              email: { type: Type.STRING },
              phone: { type: Type.STRING }
          }
        }
      }
    }
  };
}