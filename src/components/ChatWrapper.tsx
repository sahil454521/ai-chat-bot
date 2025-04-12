"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import WelcomeTerminal from "./WelcomeTerminal";

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

// Define special prompt types
enum PromptType {
  TEXT = "text",
  URL = "url",
  COMMAND = "command",
  IMAGE = "image"
}

// Helper to detect prompt type
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

type ChatWrapperProps = {
  sessionId: string;
  initialUrl: string;
  initialPrompt?: string;
  initialHistory?: string[];
};

const ChatWrapper = ({ sessionId, initialUrl, initialPrompt, initialHistory }: ChatWrapperProps) => {
    const [messages, setMessages] = useState<{ role: string; content: string; type?: PromptType }[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const [isTyping, setIsTyping] = useState(false);
    const [terminalReady, setTerminalReady] = useState(false); // Make sure this is false initially
    const [showWelcome, setShowWelcome] = useState(true);
    const [promptHistory, setPromptHistory] = useState<string[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    
    // Debug logger
    useEffect(() => {
        console.log("Terminal ready:", terminalReady);
        console.log("Show welcome:", showWelcome);
    }, [terminalReady, showWelcome]);
    
    // For testing purposes, let's make the terminal ready immediately
    // Comment this out after debugging
    useEffect(() => {
        const quickDebugTimer = setTimeout(() => {
            setShowWelcome(false);
            setTerminalReady(true);
        }, 5000); // Changed from 1000ms to 5000ms (5 seconds)
        
        return () => clearTimeout(quickDebugTimer);
    }, []);
    
    // Use WelcomeTerminal first, then transition to the chat interface
    useEffect(() => {
        // Show the welcome terminal for a few seconds
        const welcomeTimer = setTimeout(() => {
            setShowWelcome(false);
            // Start the boot sequence after welcome screen
            startBootSequence();
        }, 10000); // Changed from 5000ms to 10000ms (10 seconds)
        
        return () => clearTimeout(welcomeTimer);
    }, []);
    
    // Separate function to start boot sequence
    const startBootSequence = () => {
        // Simulate terminal boot sequence
        const timer1 = setTimeout(() => {
            setMessages([{ role: "system", content: "Initializing AI Terminal..." }]);
        }, 300);
        
        const timer2 = setTimeout(() => {
            setMessages(prev => [...prev, { role: "system", content: "Loading neural networks..." }]);
        }, 800);
        
        const timer3 = setTimeout(() => {
            setMessages(prev => [...prev, { role: "system", content: "Establishing secure connection..." }]);
        }, 1200);
        
        const timer4 = setTimeout(() => {
            setMessages(prev => [...prev, { role: "system", content: "System ready." }]);
            setTerminalReady(true);
        }, 1600);
        
        const timer5 = setTimeout(() => {
            if (initialPrompt) {
                setMessages(prev => [...prev, { role: "assistant", content: initialPrompt }]);
            } else {
                setMessages(prev => [...prev, { 
                    role: "assistant", 
                    content: "Welcome to AI Terminal. How can I assist you today? You can use regular text, URLs, or commands starting with /." 
                }]);
            }
        }, 2000);
        
        return { timer1, timer2, timer3, timer4, timer5 };
    };

    // Add effect to handle initialUrl
    useEffect(() => {
        if (initialUrl) {
            // When a URL is provided, automatically create a URL analysis prompt
            const prompt = `Analyze this webpage: ${initialUrl}`;
            setMessages(prev => [
                ...prev,
                { role: "system", content: `Analyzing content from: ${initialUrl}` },
                { role: "user", content: prompt, type: PromptType.URL }
            ]);
            
            // Auto-submit this prompt
            handlePromptSubmission(prompt);
        }
    }, [initialUrl]);

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
    };

    // Handle keyboard shortcuts for command history
    const handleKeyDown = (e: React.KeyboardEvent) => {
        // Up arrow for previous command
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (historyIndex < promptHistory.length - 1) {
                const newIndex = historyIndex + 1;
                setHistoryIndex(newIndex);
                setInput(promptHistory[promptHistory.length - 1 - newIndex]);
            }
        }
        // Down arrow for next command
        else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (historyIndex > 0) {
                const newIndex = historyIndex - 1;
                setHistoryIndex(newIndex);
                setInput(promptHistory[promptHistory.length - 1 - newIndex]);
            } else if (historyIndex === 0) {
                setHistoryIndex(-1);
                setInput('');
            }
        }
        // Tab completion (basic implementation)
        else if (e.key === 'Tab') {
            e.preventDefault();
            if (input.startsWith('/')) {
                // Simple command suggestions
                const commands = ['/help', '/clear', '/image', '/url', '/code', '/weather'];
                const matching = commands.find(cmd => cmd.startsWith(input));
                if (matching) {
                    setInput(matching + ' ');
                }
            }
        }
    };

    // Process special commands
    const processCommand = (command: string): { content: string; endConversation: boolean } => {
        const cmd = command.split(' ')[0].toLowerCase();
        const args = command.slice(cmd.length).trim();
        
        switch (cmd) {
            case 'help':
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
                    endConversation: false 
                };
            case 'clear':
                setMessages([{ role: "system", content: "Conversation cleared." }]);
                return { content: "Conversation history cleared.", endConversation: true };
            // Add more commands as needed
            default:
                return { 
                    content: `Unknown command: /${cmd}. Type /help to see available commands.`, 
                    endConversation: false 
                };
        }
    };

    // Handle prompt submission based on type
    const handlePromptSubmission = async (userPrompt: string) => {
        // Add to history
        setPromptHistory(prev => [...prev, userPrompt]);
        setHistoryIndex(-1);
        
        // Detect prompt type
        const { type, content } = detectPromptType(userPrompt);
        
        // Add user message to chat
        const userMessage = { role: "user", content: userPrompt, type };
        setMessages(prev => [...prev, userMessage]);
        
        setIsLoading(true);
        
        try {
            // Handle different prompt types
            if (type === PromptType.COMMAND) {
                // Process command locally
                const commandResult = processCommand(content);
                
                if (commandResult.endConversation) {
                    setIsLoading(false);
                    return;
                }
                
                // Display system message for command response
                setTimeout(() => {
                    setMessages(prev => [...prev, { role: "system", content: commandResult.content }]);
                    setIsLoading(false);
                }, 300);
                return;
            } 
            
            // For all non-command inputs, send to API
            let apiEndpoint, requestBody;
            
            if (type === PromptType.URL) {
                // This handles URLs like http://example.com
                apiEndpoint = "/api/chat";
                requestBody = {
                    sessionId,
                    prompt: `Analyze the content of this URL: ${content}`,
                    history: messages.filter(msg => msg.role !== "system"),
                };
            } else if (type === PromptType.IMAGE) {
                // This handles image links
                apiEndpoint = "/api/chat";
                requestBody = {
                    sessionId,
                    prompt: `Analyze this image: ${content}`,
                    history: messages.filter(msg => msg.role !== "system"),
                };
            } else {
                // Regular text input
                apiEndpoint = "/api/chat";
                requestBody = {
                    sessionId,
                    prompt: userPrompt,
                    history: messages.filter(msg => msg.role !== "system"),
                };
            }
            
            // Send the query to your API
            const response = await fetch("/api/chat", {
              method: "POST", // Make sure this is "POST"
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch response: ${response.status}`);
            }

            // Process the model's response
            const data = await response.json();
            
            // Simulate typing effect for the AI response
            setIsTyping(true);
            setTimeout(() => {
                const assistantMessage = { role: "assistant", content: data.response || "Sorry, I couldn't process that request.", type: PromptType.TEXT };
                setMessages(prev => [...prev, assistantMessage]);
                setIsTyping(false);
                setIsLoading(false);
            }, 500 + Math.min((data.response?.length || 0) * 10, 2000)); // Typing time based on response length
            
        } catch (error) {
            console.error("Error fetching response:", error);
            setMessages(prev => [
                ...prev,
                { role: "system", content: "Error: Connection interrupted." },
                { role: "assistant", content: "I encountered an error. Please try again." },
            ]);
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;
        
        const userPrompt = input;
        setInput("");
        
        await handlePromptSubmission(userPrompt);
    };

    // Render message based on type
    const renderMessage = (message: { role: string; content: string; type?: PromptType }, index: number) => {
        if (message.role === "system") {
            return (
                <div className="flex items-center">
                    <span className="text-gray-500 mr-2">$</span>
                    <span>{message.content}</span>
                </div>
            );
        }
        
        // For user and assistant messages
        return (
            <div 
                className={`inline-block px-4 py-2 rounded-lg ${
                    message.role === "user"
                        ? "bg-indigo-600/70 text-white border border-indigo-500/50"
                        : "bg-gray-800/70 text-gray-100 border border-gray-700/50"
                }`}
            >
                {message.role === "assistant" && (
                    <div className="mb-1 text-xs text-indigo-400 flex items-center">
                        <span className="mr-1 h-2 w-2 rounded-full bg-indigo-500 inline-block animate-pulse"></span> AI
                    </div>
                )}
                
                {message.type === PromptType.URL && message.role === "user" ? (
                    <div className="text-sm">
                        Analyzing URL: <a href={message.content} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">{message.content}</a>
                    </div>
                ) : message.type === PromptType.IMAGE && message.role === "user" ? (
                    <div className="text-sm">
                        Analyzing image: <br />
                        <img src={message.content} alt="User provided" className="max-w-[200px] mt-2 rounded" />
                    </div>
                ) : (
                    <div className="text-sm leading-relaxed">
                        {message.content}
                    </div>
                )}
            </div>
        );
    };

    // Render the component
    if (showWelcome) {
        // Show welcome screen for longer duration
        return (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.0 }}
                className="min-h-screen bg-black"
            >
                <WelcomeTerminal />
                
                {/* Debug info overlay */}
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
                                {message.role !== "system" ? renderMessage(message, index) : (
                                    <div className="flex items-center">
                                        <span className="text-gray-500 mr-2">$</span>
                                        <span>{message.content}</span>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                        
                        {isTyping && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-left"
                            >
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

            {/* Command Suggestion Chips - Show when relevant */}
            {terminalReady && input.startsWith('/') && (
                <div className="flex flex-wrap gap-2 px-4 py-2 bg-black/90 border-t border-gray-800/30">
                    {['/help', '/clear', '/image', '/url', '/code', '/weather']
                        .filter(cmd => cmd.startsWith(input))
                        .map((cmd, i) => (
                            <button
                                key={i}
                                onClick={() => setInput(cmd + ' ')}
                                className="px-2 py-1 text-xs bg-gray-800 text-gray-300 rounded border border-gray-700/50 hover:bg-gray-700 transition-colors"
                            >
                                {cmd}
                            </button>
                        ))
                    }
                </div>
            )}

            {/* Terminal Input - ALWAYS VISIBLE FOR DEBUGGING */}
            <div
                className="border-t border-gray-800/50 bg-black/90 backdrop-blur-md p-4 shadow-lg shadow-indigo-900/5"
            >
                {/* Debug info */}
                <div className="mb-2 text-yellow-500 text-xs">
                    Debug: Terminal Ready: {terminalReady ? "Yes" : "No"}, 
                    Show Welcome: {showWelcome ? "Yes" : "No"}
                </div>
                
                <form onSubmit={handleSubmit} className="flex items-center space-x-3 bg-gray-950 rounded-lg border border-gray-800/50 px-4 py-2">
                    <div className="font-mono text-indigo-400 text-sm">~/</div>
                    <input
                        ref={inputRef}
                        value={input}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        placeholder="Type your query, URL, or /command..."
                        className="flex-1 bg-transparent border-none px-2 py-1.5 text-gray-100 placeholder-gray-500 focus:outline-none text-sm"
                        // ALLOW INPUT DURING DEBUGGING:
                        // disabled={isLoading || !terminalReady}
                        autoComplete="off"
                    />
                    <button 
                        type="submit" 
                        // ALLOW SUBMISSION DURING DEBUGGING:
                        // disabled={isLoading || !input.trim() || !terminalReady}
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