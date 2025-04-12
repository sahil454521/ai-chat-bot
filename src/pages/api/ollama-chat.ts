import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { sessionId, model, input } = req.body;

    try {
        const response = await fetch("http://localhost:11434/api/generate", { // Update this URL
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ sessionId, model, input }),
        });

        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        console.error("Error communicating with Ollama:", error);
        res.status(500).json({ error: "Failed to communicate with Ollama API" });
    }
}