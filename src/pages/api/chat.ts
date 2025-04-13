import { NextApiRequest, NextApiResponse } from "next";
import { OpenAI } from "openai";

const client = new OpenAI({
  baseURL: "https://router.huggingface.co/nebius/v1",
  apiKey: process.env.HUGGING_FACE_API_KEY|| "missing_api_key", // Use the server-side environment variable
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { userPrompt } = req.body;

    if (!userPrompt) {
      return res.status(400).json({ error: "Missing userPrompt in request body" });
    }

    const chatCompletion = await client.chat.completions.create({
      model: "deepseek-ai/DeepSeek-V3-0324-fast",
      messages: [
        {
          role: "user",
          content: userPrompt,
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