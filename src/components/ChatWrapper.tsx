"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import WelcomeTerminal from "./WelcomeTerminal";
import { OpenAI } from "openai";
import chat from "@/pages/api/chat";

const TypingAnimation = ({ isVisible }: { isVisible: boolean }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="inline-block h-4 w-2 bg-indigo-400 animate-pulse"
        ></motion.span>
      )}
    </AnimatePresence>
  );
};

enum PromptType {
  TEXT = "text",
  URL = "url",
  COMMAND = "command",
  IMAGE = "image",
}

const detectPromptType = (input: string): { type: PromptType; content: string } => {
  if (input.startsWith("/")) {
    return { type: PromptType.COMMAND, content: input.slice(1) };
  } else if (input.startsWith("http://") || input.startsWith("https://")) {
    return { type: PromptType.URL, content: input };
  } else if (input.startsWith("![") && (input.includes(".jpg") || input.includes(".png") || input.includes(".gif"))) {
    return { type: PromptType.IMAGE, content: input.replace(/!\[(.*?)\]\((.*?)\)/, "$2") };
  } else {
    return { type: PromptType.TEXT, content: input };
  }
};

const fetchWithRetry = async (
  url: string,
  options: RequestInit,
  retries = 3,
  baseDelay = 1000
): Promise<Response> => {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await fetch(url, options);

      // Successful response
      if (response.ok) return response;

      // Rate limited - implement backoff
      if (response.status === 429) {
        const retryAfter = response.headers.get("Retry-After")
          ? parseInt(response.headers.get("Retry-After")!) * 1000
          : Math.min(baseDelay * Math.pow(2, attempt), 30000); // Max 30s delay

        console.warn(`Rate limited. Attempt ${attempt + 1}/${retries}. Retrying in ${retryAfter}ms...`);
        await new Promise((resolve) => setTimeout(resolve, retryAfter));
        continue;
      }

      // Other errors
      throw new Error(`HTTP error! status: ${response.status}`);
    } catch (error) {
      // Last attempt
      if (attempt === retries - 1) throw error;

      // Exponential backoff
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw new Error("Max retries reached");
};

type ChatMessage = {
  role: string;
  content: string;
  type?: PromptType;
};

// Add skipAutoPrompt to your props interface
interface ChatWrapperProps {
  sessionId: string;
  initialUrl?: string;
  initialPrompt?: string | null;
  initialHistory?: string[];
  skipAutoPrompt?: boolean;
}

const ChatWrapper = ({
  sessionId,
  initialUrl,
  initialPrompt,
  initialHistory,
  skipAutoPrompt = false,
}: ChatWrapperProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRequestInProgress, setIsRequestInProgress] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [terminalReady, setTerminalReady] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [promptHistory, setPromptHistory] = useState<string[]>(initialHistory || []);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [usage, setUsage] = useState({ count: 0, lastUsed: 0 });
  const [apiError, setApiError] = useState<string | null>(null);
  const [lastRequestTime, setLastRequestTime] = useState(0);
  const REQUEST_INTERVAL = 1000; // 1 second between requests

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const cache = useRef(new Map<string, ChatMessage>());

  const getCacheKey = (messages: ChatMessage[]) => {
    return JSON.stringify(messages);
  };

  // Debug logger
  useEffect(() => {
    console.log("Terminal ready:", terminalReady);
    console.log("Show welcome:", showWelcome);
  }, [terminalReady, showWelcome]);

  // For testing purposes
  useEffect(() => {
    const quickDebugTimer = setTimeout(() => {
      setShowWelcome(false);
      setTerminalReady(true);
    }, 5000);

    return () => clearTimeout(quickDebugTimer);
  }, []);

  // Show welcome screen then start boot sequence
  useEffect(() => {
    const welcomeTimer = setTimeout(() => {
      setShowWelcome(false);
      startBootSequence();
    }, 10000);

    return () => clearTimeout(welcomeTimer);
  }, []);

  const startBootSequence = () => {
    const timer1 = setTimeout(() => {
      setMessages([{ role: "system", content: "Initializing AI Terminal..." }]);
    }, 300);

    const timer2 = setTimeout(() => {
      setMessages((prev) => [...prev, { role: "system", content: "Loading neural networks..." }]);
    }, 800);

    const timer3 = setTimeout(() => {
      setMessages((prev) => [...prev, { role: "system", content: "Establishing secure connection..." }]);
    }, 1200);

    const timer4 = setTimeout(() => {
      setMessages((prev) => [...prev, { role: "system", content: "System ready." }]);
      setTerminalReady(true);
    }, 1600);

    const timer5 = setTimeout(() => {
      if (initialPrompt) {
        setMessages((prev) => [...prev, { role: "assistant", content: initialPrompt }]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "Welcome to AI Terminal. How can I assist you today? You can use regular text, URLs, or commands starting with /.",
          },
        ]);
      }
    }, 2000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timer5);
    };
  };

  // Handle initial URL analysis
  useEffect(() => {
    // Show welcome message when opened from extension with skipAutoPrompt
    if (initialUrl && skipAutoPrompt) {
      setMessages((prev) => [
        ...prev,
        {
          role: "system",
          content: `Welcome to AI Chat! This chat is connected to: ${initialUrl}`,
          type: PromptType.TEXT,
        },
      ]);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Hi there! I'm ready to help you analyze content from ${initialUrl}. What would you like to know about this page?`,
          type: PromptType.TEXT,
        },
      ]);
    } else if (initialUrl && initialPrompt && !skipAutoPrompt) {
      // If we have an initialUrl prop and are not skipping auto-prompt
      setTimeout(() => {
        // Add a system message explaining we're working with a URL
        setMessages((prev) => [
          ...prev,
          {
            role: "system",
            content: `Processing URL: ${initialUrl}`,
            type: PromptType.TEXT,
          },
        ]);

        // Add the user message
        setMessages((prev) => [
          ...prev,
          {
            role: "user",
            content: initialPrompt,
            type: PromptType.TEXT,
          },
        ]);

        // Process the prompt
        handlePromptSubmission(initialPrompt);
      }, 500);
    } else if (initialUrl && !skipAutoPrompt) {
      // If we have a URL but no prompt, just add a system message about the URL
      setMessages((prev) => [
        ...prev,
        {
          role: "system",
          content: `URL context: ${initialUrl}`,
          type: PromptType.TEXT,
        },
      ]);
    }
  }, [initialUrl, initialPrompt, skipAutoPrompt]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when terminal is ready
  useEffect(() => {
    if (terminalReady && inputRef.current) {
      inputRef.current.focus();
    }
  }, [terminalReady]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    setApiError(null); // Clear error on new input
  };

  // Handle keyboard shortcuts for command history
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (historyIndex < promptHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setInput(promptHistory[promptHistory.length - 1 - newIndex]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(promptHistory[promptHistory.length - 1 - newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput("");
      }
    } else if (e.key === "Tab") {
      e.preventDefault();
      if (input.startsWith("/")) {
        const commands = ["/help", "/clear", "/image", "/url", "/code", "/weather"];
        const matching = commands.find((cmd) => cmd.startsWith(input));
        if (matching) {
          setInput(matching + " ");
        }
      }
    }
  };

  // Process special commands
  const processCommand = (command: string): { content: string; endConversation: boolean } => {
    const cmd = command.split(" ")[0].toLowerCase();
    const args = command.slice(cmd.length).trim();

    switch (cmd) {
      case "help":
        return {
          content: `
Available commands:
/help - Show this help message
/clear - Clear conversation history
/image [url] - Analyze an image
/url [url] - Analyze a webpage
/code [language] - Get code snippet in specified language
/weather [location] - Get current weather
          `,
          endConversation: false,
        };
      case "clear":
        setMessages([{ role: "system", content: "Conversation cleared." }]);
        return { content: "Conversation history cleared.", endConversation: true };
      default:
        return {
          content: `Unknown command: /${cmd}. Type /help to see available commands.`,
          endConversation: false,
        };
    }
  };

  // Handle prompt submission with rate limiting
  const handlePromptSubmission = async (userPrompt: string) => {
    setIsLoading(true);
    setIsTyping(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userPrompt,
          url: initialUrl, // Include the initialUrl if available
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: result.choices[0].message.content || "Sorry, I couldn't process that request.",
        type: PromptType.TEXT,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error fetching response:", error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Error: Unable to process your request. Please try again later." },
      ]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userPrompt = input;
    setInput("");

    // Add user message to state with its type
    const { type } = detectPromptType(userPrompt);
    setMessages((prev) => [...prev, { role: "user", content: userPrompt, type }]);

    await handlePromptSubmission(userPrompt);
  };

  // Render message based on type
  const renderMessage = (message: ChatMessage, index: number) => {
    if (message.role === "system") {
      return (
        <div className="flex items-center">
          <span className="text-white-500 mr-2">$</span>
          <span>{message.content}</span>
        </div>
      );
    }

    return (
      <div
        className={`inline-block px-4 py-3 rounded-lg ${
          message.role === "user"
            ? "bg-indigo-600/80 text-white border border-indigo-500/80 shadow-md shadow-indigo-600/20"
            : "bg-gray-800/70 text-gray-100 border border-gray-700/50"
        } max-w-[80%]`} // Added max-width to prevent messages from being too wide
      >
        {message.role === "user" && (
          <div className="mb-1 text-xs text-indigo-200 flex items-center justify-end">
            <span>You</span>
            <span className="ml-1 h-2 w-2 rounded-full bg-indigo-300 inline-block"></span>
          </div>
        )}
        <div className="text-sm leading-relaxed">{message.content}</div>
        <div className={`text-xs text-${message.role === "user" ? "indigo-200/50" : "gray-500"} mt-1 text-right`}>
          {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </div>
      </div>
    );
  };

  if (showWelcome) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.0 }}
        className="min-h-screen bg-black"
      >
        <WelcomeTerminal />
        <div className="fixed bottom-4 right-4 text-xs text-gray-500 bg-black/50 p-2 rounded">
          Welcome screen active. Loading terminal in {10}s...
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="relative flex min-h-screen flex-col bg-black text-gray-100 font-mono"
    >
      {/* Terminal Header */}
      <div className="sticky top-0 z-10 border-b border-gray-800/50 bg-black/90 backdrop-blur-md p-4 flex items-center">
        <div className="flex space-x-3 mr-4">
          <div className="h-3 w-3 rounded-full bg-red-500/80"></div>
          <div className="h-3 w-3 rounded-full bg-yellow-500/80"></div>
          <div className="h-3 w-3 rounded-full bg-green-500/80"></div>
        </div>
        <h1 className="text-xl font-semibold text-indigo-400 flex items-center">
          <span className="mr-2">■</span> AI Terminal
        </h1>
        <div className="ml-auto text-xs text-gray-500">
          {sessionId ? sessionId.substring(0, 8) : "local"} | {new Date().toLocaleDateString()}
        </div>
      </div>

      {/* Terminal Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-black to-gray-900">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="rounded-lg border border-gray-800/50 bg-black shadow-xl shadow-indigo-500/5 backdrop-blur-sm overflow-hidden"
        >
          <div className="p-5 space-y-4">
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
                className={`${
                  message.role === "system"
                    ? "text-gray-500 text-xs"
                    : message.role === "user"
                    ? "text-right"
                    : "text-left"
                }`}
              >
                {message.role !== "system" ? (
                  renderMessage(message, index)
                ) : (
                  <div className="flex items-center">
                    <span className="text-gray-500 mr-2">$</span>
                    <span>{message.content}</span>
                  </div>
                )}
              </motion.div>
            ))}

            {isTyping && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-left">
                <div className="inline-block px-4 py-2 rounded-lg bg-gray-800/70 text-gray-100 border border-gray-700/50">
                  <div className="mb-1 text-xs text-indigo-400 flex items-center">
                    <span className="mr-1 h-2 w-2 rounded-full bg-indigo-500 inline-block animate-pulse"></span> AI
                  </div>
                  <div className="text-sm leading-relaxed">
                    <TypingAnimation isVisible={true} />
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </motion.div>
      </div>

      {/* Error Display */}
      {apiError && (
        <div className="px-4 py-2 bg-red-900/50 text-red-200 text-sm">Error: {apiError}</div>
      )}

      {/* Usage Warning */}
      {usage.count > 5 && (
        <div className="px-4 py-2 bg-yellow-900/50 text-yellow-200 text-sm">
          High usage detected: {usage.count} requests in last minute
        </div>
      )}

      {/* Command Suggestion Chips */}
      {terminalReady && input.startsWith("/") && (
        <div className="flex flex-wrap gap-2 px-4 py-2 bg-black/90 border-t border-gray-800/30">
          {["/help", "/clear", "/image", "/url", "/code", "/weather"]
            .filter((cmd) => cmd.startsWith(input))
            .map((cmd, i) => (
              <button
                key={i}
                onClick={() => setInput(cmd + " ")}
                className="px-2 py-1 text-xs bg-gray-800 text-gray-300 rounded border border-gray-700/50 hover:bg-gray-700 transition-colors"
              >
                {cmd}
              </button>
            ))}
        </div>
      )}

      {/* Terminal Input */}
      <div className="border-t border-gray-800/50 bg-black/90 backdrop-blur-md p-4 shadow-lg shadow-indigo-900/5">
        <form
          onSubmit={handleSubmit}
          className="flex items-center space-x-3 bg-gray-950 rounded-lg border border-gray-800/50 px-4 py-2"
        >
          <div className="font-mono text-indigo-400 text-sm">~/</div>
          <input
            ref={inputRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type your query, URL, or /command..."
            className="flex-1 bg-transparent border-none px-2 py-1.5 text-gray-100 placeholder-gray-500 focus:outline-none text-sm"
            disabled={isLoading}
            autoComplete="off"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="rounded-md px-4 py-1.5 bg-indigo-600/80 hover:bg-indigo-700 text-white transition-all disabled:opacity-50 text-sm border border-indigo-500/50 flex items-center"
          >
            {isLoading ? "Executing..." : "Execute"}
          </button>
        </form>
      </div>
    </motion.div>
  );
};

export default ChatWrapper;