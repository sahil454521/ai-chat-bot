// src/app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log("API route called");
    const body = await request.json();
    const { sessionId, prompt, history } = body;
    
    console.log("Received prompt:", prompt);
    console.log("Session ID:", sessionId);
    
    // Call your model API (e.g., local LLM or external API)
    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sessionId,
        prompt,
        model: "Mistral", // Or whatever model you're using
        history
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error");
      console.error(`API error: ${response.status}`, errorText);
      throw new Error(`API error: ${response.status} - ${errorText}`);
    }

    // Process streamed response
    const responseData = await response.text();
    console.log("Raw response received:", responseData.substring(0, 100) + "..."); // Log first 100 chars
    
    // Parse the streamed response
    let result = "";
    
    try {
      const lines = responseData.trim().split('\n');
      for (const line of lines) {
        if (line.trim()) {
          const json = JSON.parse(line);
          if (json.response) {
            result += json.response;
          }
        }
      }
      console.log("Parsed response:", result.substring(0, 100) + "...");
    } catch (error) {
      console.error("Error parsing response:", error);
      return NextResponse.json({ error: "Failed to parse model response" }, { status: 500 });
    }

    return NextResponse.json({ response: result || "No response content was generated." });
  
  } catch (error) {
    console.error("API route error:", error);
    return NextResponse.json({ 
      error: "Internal server error", 
      details: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 });
  }
}