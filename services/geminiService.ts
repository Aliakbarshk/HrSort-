// Import the GoogleGenAI class and Type enum from the official SDK
import { GoogleGenAI, Type } from "@google/genai";
// Import the AIAnalysisResult type definition for type safety
import { AIAnalysisResult } from "../types";

// Define an asynchronous function to categorize titles using the Gemini API
// Takes an array of titles (strings) and the user's API key (string)
export const categorizeTitles = async (titles: string[], apiKey: string): Promise<AIAnalysisResult> => {
  
  // Check if the API key is provided
  if (!apiKey) {
    // If no key, throw an error to be caught by the UI
    throw new Error("API Key is missing. Please configure it in the settings.");
  }

  // Initialize the Gemini AI client with the provided API Key
  const ai = new GoogleGenAI({ apiKey });

  // Check if the input titles array is empty
  if (titles.length === 0) {
    // Return an empty category structure if there is no input
    return { categories: [] };
  }

  // Slice the input array to the first 500 items to prevent token overflow
  // This is a safety measure for the demo environment
  const processedTitles = titles.slice(0, 500);

  // Construct the prompt string to send to the AI model
  const prompt = `
    You are an expert content organizer. 
    Analyze the following list of titles and group them into distinct, logical topics or categories.
    
    Titles to categorize:
    ${JSON.stringify(processedTitles)}
  `;

  // Start a try-catch block to handle potential API errors
  try {
    // Call the generateContent method on the 'gemini-2.5-flash' model
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash', // Specify the model version
      contents: prompt,          // Pass the prompt constructed above
      config: {
        responseMimeType: "application/json", // Request JSON output format
        responseSchema: {
          type: Type.OBJECT, // The root response must be an object
          properties: {
            categories: {
              type: Type.ARRAY, // It should contain an array named 'categories'
              items: {
                type: Type.OBJECT, // Each item in the array is an object
                properties: {
                  name: { type: Type.STRING, description: "The name of the category/topic" }, // Category name
                  items: { 
                    type: Type.ARRAY, // Category items list
                    items: { type: Type.STRING }, // Items are strings
                    description: "The list of titles belonging to this category" 
                  }
                },
                required: ["name", "items"] // Both fields are mandatory
              }
            }
          },
          required: ["categories"] // The 'categories' field is mandatory
        }
      }
    });

    // Extract the text content from the API response
    const text = response.text;
    
    // Check if the text is empty or undefined
    if (!text) {
      // Throw an error if no text was returned
      throw new Error("No response from AI");
    }

    // Parse the JSON string into a JavaScript object cast to AIAnalysisResult
    const result = JSON.parse(text) as AIAnalysisResult;
    
    // Return the parsed result object
    return result;

  } catch (error) {
    // Log the error to the console for debugging purposes
    console.error("Error calling Gemini API:", error);
    // Re-throw the error so the UI component can handle it and show a message
    throw error;
  }
};