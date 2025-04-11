"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [isHovering, setIsHovering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleEnterTerminal = () => {
    setIsLoading(true);
    // Navigate to the [...url] route which contains your ChatWrapper
    setTimeout(() => {
      router.push("/api/chat"); // Change this to the correct path
    }, 500);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white font-mono flex flex-col"
    >
      {/* Header */}
      <header className="px-6 py-4 border-b border-gray-800/50 bg-black/80 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="h-3 w-3 rounded-full bg-red-500/80"></div>
          <div className="h-3 w-3 rounded-full bg-yellow-500/80"></div>
          <div className="h-3 w-3 rounded-full bg-green-500/80"></div>
        </div>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="text-indigo-400 font-semibold"
        >
          AI TERMINAL SYSTEM
        </motion.div>
        <div className="text-xs text-gray-500">v1.0.0</div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col justify-center items-center px-4 py-16 relative overflow-hidden">
        {/* Background Grid */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10"></div>
        
        {/* Glowing Orb */}
        <motion.div 
          initial={{ scale: 0.8, opacity: 0.2 }}
          animate={{ scale: 1, opacity: 0.6 }}
          transition={{ 
            duration: 3,
            repeat: Infinity,
            repeatType: "reverse"
          }}
          className="absolute z-0 w-[500px] h-[500px] rounded-full bg-indigo-600/20 filter blur-3xl"
        ></motion.div>
        
        {/* Hero Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="relative z-10 max-w-3xl text-center space-y-6"
        >
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-indigo-600 mb-4">
            AI Terminal Interface
          </h1>
          
          <p className="text-gray-300 text-lg max-w-xl mx-auto">
            Experience next-generation AI interaction through an advanced terminal interface.
            Chat, analyze, and explore with cutting-edge language models.
          </p>
          
          <div className="pt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
            <motion.button
              onClick={handleEnterTerminal}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="group relative px-8 py-4 bg-indigo-600/60 hover:bg-indigo-600/80 rounded-lg border border-indigo-500/50 text-white font-medium transition-all duration-300 overflow-hidden"
              disabled={isLoading}
            >
              <span className="relative z-10 flex items-center justify-center">
                {isLoading ? (
                  <>
                    <span className="mr-2">Initializing</span>
                    <div className="flex space-x-1">
                      <div className="h-2 w-2 bg-white rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                      <div className="h-2 w-2 bg-white rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                      <div className="h-2 w-2 bg-white rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                    </div>
                  </>
                ) : (
                  <>Launch Terminal</>
                )}
              </span>
              <motion.div 
                className="absolute inset-0 bg-indigo-400/20"
                initial={{ x: "-100%" }}
                animate={{ x: isHovering ? "0%" : "-100%" }}
                transition={{ duration: 0.4 }}
              />
            </motion.button>
            
            <Link href="/about" className="text-indigo-400 hover:text-indigo-300 transition-colors duration-200 underline-offset-4 hover:underline">
              Learn more
            </Link>
          </div>
        </motion.div>
        
        {/* Features */}
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 max-w-4xl"
        >
          {[
            {
              title: "Natural Language",
              description: "Interact with AI through natural conversation",
              icon: "💬"
            },
            {
              title: "URL Analysis",
              description: "Analyze and discuss the content of any webpage",
              icon: "🔗"
            },
            {
              title: "Terminal Commands",
              description: "Use custom commands for specialized actions",
              icon: "⌨️"
            }
          ].map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 + idx * 0.2 }}
              className="bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 rounded-lg p-6 hover:border-indigo-500/30 hover:bg-gray-800/30 transition-colors"
            >
              <div className="text-3xl mb-3">{feature.icon}</div>
              <h3 className="text-lg font-semibold text-indigo-300 mb-2">{feature.title}</h3>
              <p className="text-gray-400 text-sm">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </main>
      
      {/* Terminal Preview */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="relative mx-auto max-w-4xl w-full px-4 -mt-16 mb-16"
      >
        <div className="relative bg-gray-900 border border-gray-800/80 rounded-lg shadow-2xl overflow-hidden">
          <div className="bg-black px-4 py-2 border-b border-gray-800/80 flex items-center">
            <div className="flex space-x-2">
              <div className="h-3 w-3 rounded-full bg-red-500/80"></div>
              <div className="h-3 w-3 rounded-full bg-yellow-500/80"></div>
              <div className="h-3 w-3 rounded-full bg-green-500/80"></div>
            </div>
            <div className="mx-auto text-sm text-gray-400">Terminal Preview</div>
          </div>
          <div className="p-4 h-32 overflow-hidden font-mono text-sm">
            <div className="text-green-500">$ ./start-terminal.sh</div>
            <div className="text-gray-400 mt-1">{'>'} Welcome to AI Terminal v1.0</div>
            <div className="text-gray-400 mt-1">{'>'} All systems operational</div>
            <div className="text-indigo-400 mt-1">
              <span className="mr-2">AI:</span>
              <span className="text-gray-300">How can I assist you today?</span>
            </div>
            <div className="flex items-center mt-2 text-gray-400">
              <span className="mr-2">~/</span>
              <span className="animate-pulse">_</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Footer */}
      <footer className="border-t border-gray-800/50 bg-black/80 backdrop-blur-md p-4 text-center text-xs text-gray-500">
        <p>© {new Date().getFullYear()} AI Terminal System | Neural Networks Initialized | All Rights Reserved</p>
      </footer>
    </motion.div>
  );
}
