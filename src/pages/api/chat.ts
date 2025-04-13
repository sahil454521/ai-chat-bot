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
    const { userPrompt, url } = req.body;

    if (!userPrompt) {
      return res.status(400).json({ error: "Missing userPrompt in request body" });
    }

    // If a URL is provided, modify the prompt to include it
    const finalPrompt = url 
      ? `Context URL: ${url}\n\nUser query: ${userPrompt}` 
      : userPrompt;

    // Log the prompt for debugging
    console.log("Processing prompt:", finalPrompt);

    const chatCompletion = await client.chat.completions.create({
      model: "deepseek-ai/DeepSeek-V3-0324-fast",
      messages: [
        {
          role: "system",
          content: url 
            ? `You are analyzing content from the URL: ${url}. Provide helpful, accurate information about this content.`
            : "You are a helpful AI assistant.",
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