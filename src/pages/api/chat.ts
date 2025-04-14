import { NextApiRequest, NextApiResponse } from "next";
import { OpenAI } from "openai";

const client = new OpenAI({
  baseURL: "https://router.huggingface.co/nebius/v1",
  apiKey: process.env.HUGGING_FACE_API_KEY || "missing_api_key", // Use the server-side environment variable
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { userPrompt, url, urlContent } = req.body;

    if (!userPrompt) {
      return res.status(400).json({ error: "Missing userPrompt in request body" });
    }

    // If URL content was provided, include it in the prompt
    let finalPrompt = userPrompt;
    let systemPrompt = "You are a helpful AI assistant.";

    if (url && urlContent) {
      // We have both URL and content, create a better context
      systemPrompt = `You are analyzing content from the URL: ${url}. 
Below is the content extracted from this URL. When answering questions,
use this content as context and provide accurate information based on it.`;
      
      finalPrompt = `URL Content:\n${urlContent}\n\nUser Query: ${userPrompt}`;
    } 
    else if (url) {
      // We have only URL but no content
      systemPrompt = `You are analyzing content from the URL: ${url}.
Provide helpful, accurate information about this content.`;
      
      finalPrompt = `Context URL: ${url}\n\nUser query: ${userPrompt}`;
    }

    // Log the prompt for debugging
    console.log("Processing prompt:", finalPrompt.substring(0, 200) + "...");

    const chatCompletion = await client.chat.completions.create({
      model: "deepseek-ai/DeepSeek-V3-0324-fast",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: finalPrompt,
        },
      ],
      max_tokens: 512,
    });

    res.status(200).json(chatCompletion);
  } catch (error) {
    console.error("Error fetching response:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}