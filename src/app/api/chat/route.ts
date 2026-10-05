import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message } = body;

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    if (!apiKey) {
      // Fallback if no API key is provided
      return NextResponse.json({ 
        response: `[Mock AI] That's an interesting point about "${message}". As an AI, I highly recommend looking for products with high biodegradability and a low carbon footprint! (Please set GEMINI_API_KEY in .env to enable real AI responses)` 
      });
    }

    const ai = new GoogleGenAI({ apiKey: apiKey });
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [{ text: `You are an AI Sustainability Assistant for a platform called EcoShop. Answer this user query concisely and helpfully regarding sustainable products, eco-friendly habits, or environmental impact: "${message}"` }]
        }
      ]
    });

    return NextResponse.json({ response: response.text });
  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
