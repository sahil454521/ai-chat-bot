"use client"
import { useChat } from "ai/react"
import WelcomeTerminal from "./WelcomeTerminal"
import { TypingAnimation } from "@/components/magicui/terminal"
import { motion } from "motion/react"

const ChatWrapper = ({ sessionId = "anonymous" }: { sessionId?: string }) => {
    const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
        api: "/api/chat-stream",
        body: { sessionId: sessionId || "anonymous" }
    })

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="relative flex min-h-screen flex-col bg-black text-gray-100"
        >
            {/* Header - Sleeker design */}
            <div className="sticky top-0 z-10 border-b border-gray-800/50 bg-black/90 backdrop-blur-md p-4 flex items-center">
                <div className="flex space-x-3 mr-4">
                    <div className="h-3 w-3 rounded-full bg-red-500/80"></div>
                    <div className="h-3 w-3 rounded-full bg-yellow-500/80"></div>
                    <div className="h-3 w-3 rounded-full bg-green-500/80"></div>
                </div>
                <h1 className="text-xl font-mono font-semibold text-indigo-400 flex items-center">
                    <span className="mr-2">■</span> AI Terminal
                </h1>
                <div className="ml-auto text-xs text-gray-500 font-mono">
                    {sessionId ? sessionId.substring(0, 8) : "local"}
                </div>
            </div>

            {/* Messages container - Enhanced with better spacing and contrast */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 relative">
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="min-h-[calc(100vh-13rem)] rounded-lg border border-gray-800/50 bg-gray-950 shadow-xl shadow-indigo-500/5 backdrop-blur-sm overflow-hidden"
                >
                    {messages.length > 0 ? (
                        <div className="p-5 space-y-8">
                            {messages.map((message, index) => (
                                <motion.div 
                                    key={message.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1, duration: 0.3 }}
                                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div 
                                        className={`max-w-[85%] rounded-lg px-5 py-3 ${
                                            message.role === 'user' 
                                                ? 'bg-indigo-600/70 text-white border border-indigo-500/50' 
                                                : 'bg-black text-gray-100 border border-gray-800/70'
                                        }`}
                                    >
                                        {message.role === 'assistant' && (
                                            <div className="mb-2 font-mono text-xs text-indigo-400 flex items-center">
                                                <span className="mr-1 h-2 w-2 rounded-full bg-indigo-500 inline-block pulse-animation"></span> AI Terminal
                                            </div>
                                        )}
                                        <div className={`${message.role === 'assistant' ? 'font-mono text-sm leading-relaxed' : 'text-sm'}`}>
                                            {message.content}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                            
                            {isLoading && (
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex justify-start"
                                >
                                    <div className="max-w-[85%] rounded-lg border border-gray-800/70 bg-black px-5 py-3">
                                        <div className="mb-2 font-mono text-xs text-indigo-400 flex items-center">
                                            <span className="mr-1 h-2 w-2 rounded-full bg-indigo-500 inline-block pulse-animation"></span> AI Terminal
                                        </div>
                                        <div className="font-mono text-sm">
                                            <span className="inline-block h-4 w-2 animate-blink bg-indigo-400"></span>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    ) : (
                        <div className="flex h-full items-center justify-center p-4">
                            <WelcomeTerminal />
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Input form - Enhanced terminal style */}
            <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.3 }}
                className="border-t border-gray-800/50 bg-black/90 backdrop-blur-md p-4 shadow-lg shadow-indigo-900/5"
            >
                <form onSubmit={handleSubmit} className="flex items-center space-x-3 bg-gray-950 rounded-lg border border-gray-800/50 px-4 py-2">
                    <div className="font-mono text-indigo-400 text-sm">~/</div>
                    <input
                        value={input}
                        onChange={handleInputChange}
                        placeholder="Type your query..."
                        className="flex-1 bg-transparent border-none px-2 py-1.5 text-gray-100 placeholder-gray-500 focus:outline-none font-mono text-sm input-cursor"
                        disabled={isLoading}
                        data-cursor="input"
                    />
                    <button 
                        type="submit" 
                        disabled={isLoading || !input.trim()}
                        className="rounded-md px-4 py-1.5 bg-indigo-600/80 hover:bg-indigo-700 text-white transition-all disabled:opacity-50 font-mono text-sm border border-indigo-500/50 flex items-center"
                        data-cursor="button"
                    >
                        {isLoading ? (
                            <span className="flex items-center">
                                <span className="h-2 w-2 bg-white rounded-full mr-2 pulse-animation"></span>
                                Processing
                            </span>
                        ) : (
                            <>Execute</>
                        )}
                    </button>
                </form>
            </motion.div>
        </motion.div>
    )
}

export default ChatWrapper;