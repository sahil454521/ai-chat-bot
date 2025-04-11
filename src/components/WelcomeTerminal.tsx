import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const WelcomeTerminal = () => {
  const [lines, setLines] = useState<string[]>([]);
  const [currentLine, setCurrentLine] = useState(0);
  const [completed, setCompleted] = useState(false);
  
  const welcomeText = [
    "Welcome to AI Terminal v1.0",
    "Copyright © 2025 AI Research Labs",
    "All systems operational",
    "Neural networks initialized",
    "Ready to assist with your queries",
    "Type a message to begin..."
  ];

  useEffect(() => {
    if (currentLine < welcomeText.length) {
      const timer = setTimeout(() => {
        setLines(prev => [...prev, welcomeText[currentLine]]);
        setCurrentLine(currentLine + 1);
      }, 800); // Slower text display (800ms per line)
      
      return () => clearTimeout(timer);
    } else if (!completed && currentLine === welcomeText.length) {
      // Mark as completed after all lines are shown
      const completionTimer = setTimeout(() => {
        setCompleted(true);
      }, 1500);
      
      return () => clearTimeout(completionTimer);
    }
  }, [currentLine, completed]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      className="w-full h-screen p-6 font-mono text-sm flex flex-col justify-center items-center bg-black"
    >
      <div className="w-full max-w-2xl bg-black border border-gray-800 rounded-lg p-8 shadow-2xl shadow-indigo-500/10">
        <div className="text-green-400 mb-4">$ ./start-terminal.sh</div>
        
        {lines.map((line, index) => (
          <motion.div 
            key={index}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2 }}
            className={`my-2 ${index === 0 ? "text-indigo-400 font-bold text-lg" : "text-gray-300"}`}
          >
            {index === 0 ? line : `> ${line}`}
          </motion.div>
        ))}
        
        {currentLine < welcomeText.length && (
          <motion.span
            animate={{ opacity: [0, 1, 0] }}
            transition={{ repeat: Infinity, duration: 1 }}
            className="inline-block h-4 w-2 bg-indigo-400"
          />
        )}
        
        {completed && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 p-3 border border-indigo-500/30 rounded bg-indigo-900/20 text-indigo-300 text-center"
          >
            <div className="text-lg mb-2">AI Terminal is ready for your commands</div>
            <div className="text-xs text-indigo-400/70">Initializing interface...</div>
            
            {/* Loading animation */}
            <div className="flex justify-center mt-4">
              <div className="h-1 w-1 bg-indigo-400 rounded-full mx-1 animate-ping" style={{ animationDelay: "0ms" }}></div>
              <div className="h-1 w-1 bg-indigo-400 rounded-full mx-1 animate-ping" style={{ animationDelay: "300ms" }}></div>
              <div className="h-1 w-1 bg-indigo-400 rounded-full mx-1 animate-ping" style={{ animationDelay: "600ms" }}></div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default WelcomeTerminal;