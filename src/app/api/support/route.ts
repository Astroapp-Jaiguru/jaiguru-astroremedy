import { NextResponse } from "next/server";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

const policy = "You are a support assistant for Jai Guru Astrology. Answer only about orders, shipments, returns, refunds, onboarding, business hours, and tenders. Never execute financial, refund, cancellation, or account actions. Redact bank, PAN, KYC, and payment secrets. If uncertain, recommend human support.";

export async function POST(request: Request) {
  const body = await request.json();
  const message = typeof body.message === "string" ? body.message.trim().slice(0, 1200) : "";
  if (!message) return NextResponse.json({ error: "Message is required" }, { status: 400 });
  if (!process.env.OPENAI_API_KEY) return NextResponse.json({ answer: "Support is temporarily unavailable. Please contact the team for help.", escalated: true });
  const result = await generateText({ model: openai("gpt-4o-mini"), system: policy, prompt: message });
  return NextResponse.json({ answer: result.text, escalated: result.text.toLowerCase().includes("human") });
}
