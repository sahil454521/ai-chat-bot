"use client"

import { ReactNode } from "react"
import { AnimatedBeam } from "@/components/magicui/animated-beam"
import { cn } from "@/lib/utils"

interface TerminalChatContainerProps {
  children: ReactNode
  className?: string
}

export default function TerminalChatContainer({ 
  children,
  className
}: TerminalChatContainerProps) {
  return (
    <div className={cn(
      "relative rounded-lg border border-gray-800 bg-gray-900/90 backdrop-blur-sm", 
      className
    )}>
      {/* Terminal header */}
      <div className="flex items-center border-b border-gray-800 px-4 py-2">
        <div className="flex space-x-2">
          <div className="h-3 w-3 rounded-full bg-red-500"></div>
          <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
          <div className="h-3 w-3 rounded-full bg-green-500"></div>
        </div>
        <div className="ml-auto mr-auto font-mono text-xs text-gray-400">AI Chat Terminal</div>
      </div>
      
      {/* Terminal content */}
      <div className="p-4">
        {children}
      </div>
      
      {/* Animated glow effect at the bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500 to-transparent"></div>
    </div>
  )
}