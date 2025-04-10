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

const ChatWrapper = ({ sessionId = "anonymous", response = "" }: { sessionId?: string, response?: string }) => {
    const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const [isTyping, setIsTyping] = useState(false);
    const [terminalReady, setTerminalReady] = useState(false);
    const [showWelcome, setShowWelcome] = useState(true);
    
    // Use WelcomeTerminal first, then transition to the chat interface
    useEffect(() => {
        // Show the welcome terminal for a few seconds
        const welcomeTimer = setTimeout(() => {
            setShowWelcome(false);
            // Start the boot sequence after welcome screen
            startBootSequence();
        }, 5000); // Show welcome screen for 5 seconds
        
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
            if (response) {
                setMessages(prev => [...prev, { role: "assistant", content: response }]);
            } else {
                setMessages(prev => [...prev, { 
                    role: "assistant", 
                    content: "Welcome to AI Terminal. How can I assist you today?" 
                }]);
            }
        }, 2000);
        
        return { timer1, timer2, timer3, timer4, timer5 };
    };

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = { role: "user", content: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    sessionId,
                    prompt: input,
                    history: messages.filter(msg => msg.role !== "system"), // Pass the conversation history but filter out system messages
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to fetch response from the model.");
            }

            const data = await response.json();
            
            // Simulate typing effect for the AI response
            setIsTyping(true);
            setTimeout(() => {
                const assistantMessage = { role: "assistant", content: data.response };
                setMessages((prev) => [...prev, assistantMessage]);
                setIsTyping(false);
                setIsLoading(false);
            }, 500 + Math.min(data.response.length * 10, 2000)); // Typing time based on response length
        } catch (error) {
            console.error("Error fetching response:", error);
            setMessages((prev) => [
                ...prev,
                { role: "system", content: "Error: Connection interrupted." },
                { role: "assistant", content: "I encountered an error. Please try again." },
            ]);
            setIsLoading(false);
        }
    };

    if (showWelcome) {
        return <WelcomeTerminal />;
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
                                {message.role !== "system" && (
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
                                        <div className={`${message.role === "assistant" ? "text-sm leading-relaxed" : "text-sm"}`}>
                                            {message.content}
                                        </div>
                                    </div>
                                )}
                                
                                {message.role === "system" && (
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

            {/* Terminal Input */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
                className="border-t border-gray-800/50 bg-black/90 backdrop-blur-md p-4 shadow-lg shadow-indigo-900/5"
            >
                <form onSubmit={handleSubmit} className="flex items-center space-x-3 bg-gray-950 rounded-lg border border-gray-800/50 px-4 py-2">
                    <div className="font-mono text-indigo-400 text-sm">~/</div>
                    <input
                        ref={inputRef}
                        value={input}
                        onChange={handleInputChange}
                        placeholder="Type your query..."
                        className="flex-1 bg-transparent border-none px-2 py-1.5 text-gray-100 placeholder-gray-500 focus:outline-none text-sm"
                        disabled={isLoading || !terminalReady}
                        autoComplete="off"
                    />
                    <button 
                        type="submit" 
                        disabled={isLoading || !input.trim() || !terminalReady}
                        className="rounded-md px-4 py-1.5 bg-indigo-600/80 hover:bg-indigo-700 text-white transition-all disabled:opacity-50 text-sm border border-indigo-500/50 flex items-center"
                    >
                        {isLoading ? (
                            <span className="flex items-center">
                                <span className="h-2 w-2 bg-white rounded-full mr-2 animate-pulse"></span>
                                Executing
                            </span>
                        ) : (
                            <>Execute</>
                        )}
                    </button>
                </form>
                <div className="mt-2 text-center text-xs text-gray-600">
                    {terminalReady ? "Terminal ready. Type your query and press Enter or click Execute." : "Terminal initializing..."}
                </div>
            </motion.div>
        </motion.div>
    );
};

export default ChatWrapper;