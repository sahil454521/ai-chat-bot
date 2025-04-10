"use client"

import { Terminal, AnimatedSpan, TypingAnimation } from "@/components/magicui/terminal"

export default function WelcomeTerminal() {
  return (
    <Terminal>
      <TypingAnimation>&gt; ai-assistant --init</TypingAnimation>

      <AnimatedSpan delay={1500} className="text-green-500">
        <span>✓ Loading AI systems</span>
      </AnimatedSpan>

      <AnimatedSpan delay={2000} className="text-green-500">
        <span>✓ Establishing secure connection</span>
      </AnimatedSpan>

      <AnimatedSpan delay={2500} className="text-green-500">
        <span>✓ Initializing language models</span>
      </AnimatedSpan>

      <AnimatedSpan delay={3000} className="text-indigo-400">
        <span>⚡ Neural networks activated</span>
      </AnimatedSpan>

      <AnimatedSpan delay={3500} className="text-indigo-400">
        <span>⚡ Knowledge base connected</span>
      </AnimatedSpan>

      <AnimatedSpan delay={4000} className="text-blue-500">
        <span>ℹ AI Assistant ready to help with:</span>
      </AnimatedSpan>
      
      <AnimatedSpan delay={4500} className="pl-4 text-gray-400">
        <span>- Answering questions about this page</span>
      </AnimatedSpan>
      
      <AnimatedSpan delay={5000} className="pl-4 text-gray-400">
        <span>- Providing relevant information</span>
      </AnimatedSpan>
      
      <AnimatedSpan delay={5500} className="pl-4 text-gray-400">
        <span>- Assisting with your queries</span>
      </AnimatedSpan>

      <TypingAnimation delay={6000} className="text-indigo-400 pt-2">
        How can I help you today?
      </TypingAnimation>

      <TypingAnimation delay={7000} className="text-gray-500 text-xs">
        Type your question below to get started...
      </TypingAnimation>
    </Terminal>
  )
}