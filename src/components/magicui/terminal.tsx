"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface TerminalProps {
  children: React.ReactNode;
  className?: string;
}

export function Terminal({ children, className }: TerminalProps) {
  return (
    <div
      className={cn(
        "w-full rounded-lg border border-gray-800 bg-gray-950/90 font-mono text-sm text-gray-100 backdrop-blur shadow-lg",
        className
      )}
    >
      <div className="flex items-center border-b border-gray-800 px-4 py-2">
        <div className="flex space-x-2">
          <div className="h-3 w-3 rounded-full bg-red-500"></div>
          <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
          <div className="h-3 w-3 rounded-full bg-green-500"></div>
        </div>
        <div className="ml-auto mr-auto text-xs text-gray-400">AI Terminal</div>
      </div>
      <div className="p-4 space-y-2 overflow-auto max-h-[80vh]">{children}</div>
    </div>
  );
}

interface AnimatedSpanProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export function AnimatedSpan({
  children,
  delay = 0,
  className,
}: AnimatedSpanProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  if (!visible) return null;

  return <div className={cn("py-1", className)}>{children}</div>;
}

interface TypingAnimationProps {
  children: string;
  delay?: number;
  className?: string;
  typingSpeed?: number;
}

export function TypingAnimation({
  children,
  delay = 0,
  className,
  typingSpeed = 50,
}: TypingAnimationProps) {
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [startTyping, setStartTyping] = useState(false);

  // Handle the initial delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setStartTyping(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  // Handle the typing animation
  useEffect(() => {
    if (!startTyping) return;

    if (currentIndex < children.length) {
      const timer = setTimeout(() => {
        setDisplayText((prev) => prev + children[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, typingSpeed);

      return () => clearTimeout(timer);
    }
  }, [children, currentIndex, startTyping, typingSpeed]);

  if (!startTyping) return null;

  return (
    <div className={cn("py-1", className)}>
      {displayText}
      <span className="inline-block h-4 w-2 animate-blink bg-indigo-400 align-middle"></span>
    </div>
  );
}
