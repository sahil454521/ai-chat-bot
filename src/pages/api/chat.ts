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

  // Set a timeout for the API request
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('API request timed out')), 8000); // 8 seconds timeout
  });

  try {
    const { userPrompt, url, urlContent } = req.body;

    if (!userPrompt) {
      return res.status(400).json({ error: "Missing userPrompt in request body" });
    }

    // Prepare system prompt and user prompt
    let systemPrompt = "You are a helpful AI assistant.";
    let finalPrompt = userPrompt;

    if (url) {
      systemPrompt = `You are analyzing content from the URL: ${url}. Provide helpful information.`;
      finalPrompt = `Context URL: ${url}\n\nUser query: ${userPrompt}`;
    }

    // Limit the amount of content passed to the API to prevent timeouts
    if (urlContent && typeof urlContent === 'string') {
      // Truncate urlContent to a reasonable size (e.g., 5000 chars)
      const truncatedContent = urlContent.substring(0, 5000);
      finalPrompt = `URL Content (excerpt): ${truncatedContent}\n\nUser Query: ${userPrompt}`;
    }

    // Use Promise.race to implement a timeout
    const chatCompletionPromise = client.chat.completions.create({
      model: "deepseek-ai/DeepSeek-V3-0324-fast",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: finalPrompt },
      ],
      max_tokens: 512,
    });

    // Race between the API call and the timeout
    const chatCompletion = await Promise.race([
      chatCompletionPromise,
      timeoutPromise
    ]);

    res.status(200).json(chatCompletion);
  } catch (error: any) {
    console.error("Error in API handler:", error);
    
    // Return a more specific error
    if (error.message === 'API request timed out') {
      return res.status(504).json({ 
        error: "Gateway Timeout", 
        message: "The request took too long to process. Please try again with a simpler query." 
      });
    }
    
    res.status(500).json({ 
      error: "Internal Server Error",
      message: error.message || "An unknown error occurred"
    });
  }
}